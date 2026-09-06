import { getEvolutionStage } from "./evolution.js";

import { pickRandomSpeciesTheme } from "./speciesThemes.js";

export const MS_PER_DAY = 86400000;
const NEGLECT_THRESHOLD = 10;
const NEGLECT_DURATION_MS = 10 * 60 * 1000;

// Day 7 balance: ~10분 방치 시 상태가 서서히 나빠지되, 즉시 위험하지 않도록 조정
// Play 보호 패치: 감쇠는 당시 값의 1/2
export const DECAY_RATES = {
  hunger: 0.02,
  happiness: 0.012,
  cleanliness: 0.008,
};

export const HEALTH_DECAY_RATE = 0.008;

/** Play 보상 광고: 시청 시 이 시간으로 리셋 (합산·연장 없음). */
export const STAT_PROTECT_MS = 8 * 60 * 60 * 1000;
/** Play 보상 광고: 시청 시각부터 24시간 동안 재시청 불가. */
export const STAT_PROTECT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function createNewPet(name = "치치") {
  const now = Date.now();
  return {
    name,
    bornAt: now,
    hunger: 80,
    happiness: 70,
    cleanliness: 60,
    health: 100,
    isSleeping: false,
    isAlive: true,
    lastUpdated: now,
    neglectStartedAt: null,
    protectedUntil: 0,
    protectUsedAt: 0,
    lastEvolutionStage: null,
    speciesTheme: pickRandomSpeciesTheme(),
    adultVariantId: null,
    adultCareSnapshot: null,
    deathCause: null,
  };
}

export function getAgeDays(pet) {
  return Math.floor((Date.now() - pet.bornAt) / MS_PER_DAY);
}

export function getAverageCare(pet) {
  return (pet.hunger + pet.happiness + pet.cleanliness) / 3;
}

export function getMoodKind(pet) {
  if (!pet.isAlive) return null;
  if (pet.isSleeping) return "sleep";
  if (pet.health < 30) return "sick";

  const avg = getAverageCare(pet);
  const minStat = Math.min(pet.hunger, pet.happiness, pet.cleanliness);
  if (minStat < 35 || avg < 40) return "sad";
  if (minStat < 55 || avg < 70) return "neutral";
  return "happy";
}

export function getMoodEmoji(pet) {
  const kind = getMoodKind(pet);
  if (!kind) return null;

  const map = {
    sleep: "😴",
    sick: "🤒",
    sad: "😢",
    neutral: "😐",
    happy: "😊",
  };
  return map[kind];
}

export function getEvolutionEmoji(pet) {
  if (!pet.isAlive) return "🦴";
  return getEvolutionStage(pet).baseEmoji;
}

/** @deprecated Phase 3: use getEvolutionEmoji + getMoodEmoji */
export function getPetEmoji(pet) {
  const mood = getMoodEmoji(pet);
  if (!pet.isAlive) return "🦴";
  if (mood === "😢") return "😢";
  return getEvolutionEmoji(pet);
}

export function isStatProtected(pet, now = Date.now()) {
  return Boolean(pet?.isAlive) && (pet.protectedUntil || 0) > now;
}

export function getProtectUsedAt(pet) {
  return Math.max(pet?.protectUsedAt || 0, 0);
}

export function getProtectNextAvailableAt(pet) {
  const usedAt = getProtectUsedAt(pet);
  return usedAt > 0 ? usedAt + STAT_PROTECT_COOLDOWN_MS : 0;
}

/** Play 보호 버튼: available | protecting | cooldown */
export function getProtectAdUiState(pet, now = Date.now()) {
  const protectedUntil = pet?.protectedUntil || 0;
  const nextAvailableAt = getProtectNextAvailableAt(pet);
  if (pet?.isAlive && protectedUntil > now) {
    return { kind: "protecting", remainMs: protectedUntil - now, canWatch: false };
  }
  if (nextAvailableAt > now) {
    return { kind: "cooldown", remainMs: nextAvailableAt - now, canWatch: false };
  }
  return { kind: "available", remainMs: 0, canWatch: Boolean(pet?.isAlive) };
}

/** 시청 시 8시간 보호 + 24시간 쿨다운 시작. 연장은 없다. */
export function applyStatProtection(pet, now = Date.now()) {
  if (!pet?.isAlive) return false;
  pet.protectUsedAt = now;
  pet.protectedUntil = now + STAT_PROTECT_MS;
  pet.neglectStartedAt = null;
  pet.lastUpdated = now;
  return true;
}

export function applyTimeDelta(pet, elapsedMs, now = Date.now()) {
  if (!pet.isAlive || elapsedMs <= 0) return;

  const windowStart = now - elapsedMs;
  const protectedUntil = pet.protectedUntil || 0;
  if (protectedUntil > windowStart) {
    const protectedMs = Math.min(elapsedMs, Math.max(0, protectedUntil - windowStart));
    if (pet.neglectStartedAt !== null) {
      pet.neglectStartedAt += protectedMs;
    }
    elapsedMs -= protectedMs;
    if (elapsedMs <= 0) return;
  }

  const seconds = elapsedMs / 1000;
  const hungerRate = pet.isSleeping ? DECAY_RATES.hunger * 0.5 : DECAY_RATES.hunger;

  pet.hunger = clamp(pet.hunger - hungerRate * seconds);
  pet.happiness = clamp(pet.happiness - DECAY_RATES.happiness * seconds);
  pet.cleanliness = clamp(pet.cleanliness - DECAY_RATES.cleanliness * seconds);

  const avg = getAverageCare(pet);
  const minStat = Math.min(pet.hunger, pet.happiness, pet.cleanliness);
  const allLow =
    pet.hunger <= 20 && pet.happiness <= 20 && pet.cleanliness <= 20;

  let healthRate = 0;
  if (allLow) {
    healthRate = HEALTH_DECAY_RATE;
  } else if (minStat < 30 || avg < 40) {
    healthRate = HEALTH_DECAY_RATE * 0.6;
  } else if (minStat < 50 || avg < 60) {
    healthRate = HEALTH_DECAY_RATE * 0.25;
  }

  if (healthRate > 0) {
    pet.health = clamp(pet.health - healthRate * seconds);
  }

  updateNeglectTracking(pet, elapsedMs, now);
  checkGameOver(pet, now);
}

function updateNeglectTracking(pet, elapsedMs = 0, now = Date.now()) {
  const avg = getAverageCare(pet);
  if (avg < NEGLECT_THRESHOLD) {
    if (pet.neglectStartedAt === null) {
      pet.neglectStartedAt = now - elapsedMs;
    }
  } else {
    pet.neglectStartedAt = null;
  }
}

export function getGameOverReason(pet) {
  if (pet.health <= 0) return "health";
  if (pet.neglectStartedAt !== null) return "neglect";
  return "unknown";
}

export function checkGameOver(pet, now = Date.now()) {
  if (!pet.isAlive) return false;
  if (isStatProtected(pet, now)) return false;

  const neglectedTooLong =
    pet.neglectStartedAt !== null &&
    now - pet.neglectStartedAt >= NEGLECT_DURATION_MS;

  if (pet.health <= 0 || neglectedTooLong) {
    pet.isAlive = false;
    pet.isSleeping = false;
    pet.deathCause = pet.health <= 0 ? "health" : "neglect";
    return true;
  }

  return false;
}

export function resetNeglectTimer(pet) {
  if (!pet?.isAlive) return false;
  pet.neglectStartedAt = null;
  pet.lastUpdated = Date.now();
  return true;
}

/** R2: 건강 제외 포만·행복·청결을 100. 평균 케어로 방치 타이머도 해제될 수 있음. */
export function applyEmergencyCare(pet) {
  if (!pet?.isAlive || pet.isSleeping) return null;
  pet.hunger = 100;
  pet.happiness = 100;
  pet.cleanliness = 100;
  if (getAverageCare(pet) >= NEGLECT_THRESHOLD) {
    pet.neglectStartedAt = null;
  }
  pet.lastUpdated = Date.now();
  return { hunger: 100, happiness: 100, cleanliness: 100 };
}

/** R3: 건강을 target%로 회복 (이미 더 높으면 유지). 방치 타이머도 초기화. */
export function applyHealthRecoveryAd(pet, target = 50) {
  if (!pet?.isAlive) return false;
  pet.health = clamp(Math.max(pet.health, target));
  pet.neglectStartedAt = null;
  pet.lastUpdated = Date.now();
  return true;
}

export function tickPet(pet, elapsedMs = 1000) {
  applyTimeDelta(pet, elapsedMs);
  pet.lastUpdated = Date.now();
}
