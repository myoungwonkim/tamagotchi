import { isPlayEnv } from "./platformEnv.js";
import { isStatProtected } from "./pet.js";
import { EVOLUTION_STAGES, getEvolutionStage, getStageIndex } from "./evolution.js";

/**
 * 돌발 상어 습격 시스템.
 * - 활성(포그라운드) 틱에서만 확률 발생 (오프라인/방치 틱으로는 발생하지 않음).
 * - 알 단계·수면 중·부활 직후·탄생 직후에는 안전.
 * - Toss/웹: 활성 기대 간격 약 6분, 세션(탭)당 최대 1회.
 * - Play: 기대 약 30분, 부화 후 15분 유예, 세션·날짜·펫당 각 1회.
 * - 발생 시 펫은 즉사하고 "유령"이 된다.
 * - Play 8시간 보호 중에는 발생하지 않는다.
 */
export const SHARK_CONFIG = {
  minStageIndex: 1, // baby 이상 (알은 안전)
  graceAfterBirthMs: 3 * 60 * 1000,
  graceAfterReviveMs: 3 * 60 * 1000,
  graceAfterHatchMs: 0,
  /** 활성 플레이 기대 간격 ≈ 6분 (Toss/웹) */
  meanActiveSeconds: 360,
  maxElapsedSeconds: 3, // 백그라운드 복귀 시 확률 급증 방지
  maxPerSession: 1,
  maxPerCalendarDay: 0,
  maxPerPet: 0,
};

/** Play only — rarer, survives app kill, hatch grace (egg time eats birth grace). */
export const PLAY_SHARK_CONFIG = {
  minStageIndex: 1,
  graceAfterBirthMs: 3 * 60 * 1000,
  graceAfterReviveMs: 3 * 60 * 1000,
  graceAfterHatchMs: 15 * 60 * 1000,
  meanActiveSeconds: 1800,
  maxElapsedSeconds: 3,
  maxPerSession: 1,
  maxPerCalendarDay: 1,
  maxPerPet: 1,
};

const SESSION_KEY = "tamagotchi-shark-session";
const PLAY_STORE_KEY = "tamagotchi-shark-play";

export function getSharkConfig() {
  return isPlayEnv() ? PLAY_SHARK_CONFIG : SHARK_CONFIG;
}

function babyMinAgeMs() {
  const baby = EVOLUTION_STAGES.find((stage) => stage.id === "baby");
  return baby?.minAgeMs ?? 0;
}

function hatchAt(pet) {
  return pet.bornAt + babyMinAgeMs();
}

function petSharkKey(pet) {
  return String(pet.bornAt);
}

function localDateKey(now) {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readSharkSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { count: 0 };
    const parsed = JSON.parse(raw);
    return { count: typeof parsed.count === "number" ? parsed.count : 0 };
  } catch {
    return { count: 0 };
  }
}

function recordSharkAttackInSession() {
  const next = { count: readSharkSession().count + 1 };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

function isSessionCapReached(cfg) {
  return readSharkSession().count >= cfg.maxPerSession;
}

function readPlaySharkStore() {
  try {
    const raw = localStorage.getItem(PLAY_STORE_KEY);
    if (!raw) return { day: "", count: 0, pets: [] };
    const parsed = JSON.parse(raw);
    return {
      day: typeof parsed.day === "string" ? parsed.day : "",
      count: typeof parsed.count === "number" ? parsed.count : 0,
      pets: Array.isArray(parsed.pets) ? parsed.pets.filter((id) => typeof id === "string") : [],
    };
  } catch {
    return { day: "", count: 0, pets: [] };
  }
}

function playDurableCapsReached(pet, now, cfg) {
  if (!cfg.maxPerCalendarDay && !cfg.maxPerPet) return false;
  const store = readPlaySharkStore();
  if (cfg.maxPerPet && store.pets.includes(petSharkKey(pet))) return true;
  if (cfg.maxPerCalendarDay) {
    const day = localDateKey(now);
    if (store.day === day && store.count >= cfg.maxPerCalendarDay) return true;
  }
  return false;
}

function recordPlayShark(pet, now) {
  const cfg = getSharkConfig();
  if (!cfg.maxPerCalendarDay && !cfg.maxPerPet) return;
  const day = localDateKey(now);
  const store = readPlaySharkStore();
  const count = store.day === day ? store.count + 1 : 1;
  const pets = store.pets.includes(petSharkKey(pet))
    ? store.pets
    : [...store.pets, petSharkKey(pet)].slice(-20);
  try {
    localStorage.setItem(PLAY_STORE_KEY, JSON.stringify({ day, count, pets }));
  } catch {
    // ignore
  }
}

export function maybeSharkAttack(pet, elapsedMs, now = Date.now()) {
  if (!pet || !pet.isAlive || pet.isSleeping) return false;
  if (isStatProtected(pet, now)) return false;

  const cfg = getSharkConfig();
  if (isSessionCapReached(cfg)) return false;
  if (playDurableCapsReached(pet, now, cfg)) return false;

  const stage = getEvolutionStage(pet);
  if (getStageIndex(stage.id) < cfg.minStageIndex) return false;

  if (now - pet.bornAt < cfg.graceAfterBirthMs) return false;
  if (cfg.graceAfterHatchMs && now - hatchAt(pet) < cfg.graceAfterHatchMs) return false;
  if (pet.lastReviveAt && now - pet.lastReviveAt < cfg.graceAfterReviveMs) {
    return false;
  }

  const seconds = Math.min(Math.max(elapsedMs, 0), cfg.maxElapsedSeconds * 1000) / 1000;
  if (seconds <= 0) return false;

  const probability = seconds / cfg.meanActiveSeconds;
  return Math.random() < probability;
}

export function applySharkDeath(pet) {
  if (!pet) return false;
  pet.isAlive = false;
  pet.isSleeping = false;
  pet.deathCause = "shark";
  recordSharkAttackInSession();
  recordPlayShark(pet, Date.now());
  return true;
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/**
 * 펫 뷰포트에서 상어 습격 연출을 재생합니다.
 * onChomp: 물리는 순간(플래시 정점) — 스프라이트를 유령으로 교체하기 좋은 시점.
 * onComplete: 연출 종료 — 게임오버 카드를 띄우기 좋은 시점.
 */
export function runSharkAttackAnimation(petArea, { onChomp, onComplete } = {}) {
  if (!petArea || prefersReducedMotion()) {
    onChomp?.();
    onComplete?.();
    return () => {};
  }

  petArea.classList.add("pet-area--shark");
  requestAnimationFrame(() => petArea.classList.add("pet-area--shark-run"));

  const chompTimer = window.setTimeout(() => {
    petArea.classList.add("pet-area--shark-chomp");
    onChomp?.();
  }, 950);

  const doneTimer = window.setTimeout(() => {
    petArea.classList.remove(
      "pet-area--shark",
      "pet-area--shark-run",
      "pet-area--shark-chomp",
    );
    onComplete?.();
  }, 1650);

  return () => {
    window.clearTimeout(chompTimer);
    window.clearTimeout(doneTimer);
    petArea.classList.remove(
      "pet-area--shark",
      "pet-area--shark-run",
      "pet-area--shark-chomp",
    );
  };
}
