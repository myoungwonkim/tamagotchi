import { getEvolutionStage, getStageIndex } from "./evolution.js";

/**
 * 돌발 상어 습격 시스템.
 * - 활성(포그라운드) 틱에서만 낮은 확률로 발생 (오프라인/방치로는 발생하지 않음).
 * - 알 단계·수면 중·부활 직후·탄생 직후에는 안전.
 * - 발생 시 펫은 즉사하고 "유령"이 되며, 광고로 되살릴 수 있습니다.
 */
export const SHARK_CONFIG = {
  minStageIndex: 1, // baby 이상 (알은 안전)
  graceAfterBirthMs: 3 * 60 * 1000,
  graceAfterReviveMs: 3 * 60 * 1000,
  meanActiveSeconds: 1200, // 평균 약 20분(활성)마다 1회 기대
  maxElapsedSeconds: 3, // 백그라운드 복귀 시 확률 급증 방지
};

export function maybeSharkAttack(pet, elapsedMs, now = Date.now()) {
  if (!pet || !pet.isAlive || pet.isSleeping) return false;

  const stage = getEvolutionStage(pet);
  if (getStageIndex(stage.id) < SHARK_CONFIG.minStageIndex) return false;

  if (now - pet.bornAt < SHARK_CONFIG.graceAfterBirthMs) return false;
  if (pet.lastReviveAt && now - pet.lastReviveAt < SHARK_CONFIG.graceAfterReviveMs) {
    return false;
  }

  const seconds = Math.min(Math.max(elapsedMs, 0), SHARK_CONFIG.maxElapsedSeconds * 1000) / 1000;
  if (seconds <= 0) return false;

  const probability = seconds / SHARK_CONFIG.meanActiveSeconds;
  return Math.random() < probability;
}

export function applySharkDeath(pet) {
  if (!pet) return false;
  pet.isAlive = false;
  pet.isSleeping = false;
  pet.deathCause = "shark";
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
