import { getEvolutionStage } from "./evolution.js";

const MS_PER_DAY = 86400000;
const NEGLECT_THRESHOLD = 10;
const NEGLECT_DURATION_MS = 10 * 60 * 1000;

// Day 7 balance: ~10분 방치 시 상태가 서서히 나빠지되, 즉시 위험하지 않도록 조정
export const DECAY_RATES = {
  hunger: 0.04,
  happiness: 0.024,
  cleanliness: 0.016,
};

export const HEALTH_DECAY_RATE = 0.016;

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
    lastEvolutionStage: null,
  };
}

export function getAgeDays(pet) {
  return Math.floor((Date.now() - pet.bornAt) / MS_PER_DAY);
}

export function getAverageCare(pet) {
  return (pet.hunger + pet.happiness + pet.cleanliness) / 3;
}

export function getPetEmoji(pet) {
  if (!pet.isAlive) return "👻";
  if (pet.isSleeping) return "😴";
  if (pet.health < 30) return "🤒";

  const avg = getAverageCare(pet);
  const minStat = Math.min(pet.hunger, pet.happiness, pet.cleanliness);
  const mood =
    minStat < 35 || avg < 40 ? "😢" :
    minStat < 55 || avg < 70 ? "😐" :
    "😊";

  const { baseEmoji } = getEvolutionStage(pet);
  if (mood === "😢") return "😢";

  return baseEmoji;
}

export function applyTimeDelta(pet, elapsedMs) {
  if (!pet.isAlive || elapsedMs <= 0) return;

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

  updateNeglectTracking(pet, elapsedMs);
  checkGameOver(pet);
}

function updateNeglectTracking(pet, elapsedMs = 0) {
  const avg = getAverageCare(pet);
  if (avg < NEGLECT_THRESHOLD) {
    if (pet.neglectStartedAt === null) {
      pet.neglectStartedAt = Date.now() - elapsedMs;
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

export function checkGameOver(pet) {
  if (!pet.isAlive) return false;

  const neglectedTooLong =
    pet.neglectStartedAt !== null &&
    Date.now() - pet.neglectStartedAt >= NEGLECT_DURATION_MS;

  if (pet.health <= 0 || neglectedTooLong) {
    pet.isAlive = false;
    pet.isSleeping = false;
    return true;
  }

  return false;
}

export function tickPet(pet, elapsedMs = 1000) {
  applyTimeDelta(pet, elapsedMs);
  pet.lastUpdated = Date.now();
}
