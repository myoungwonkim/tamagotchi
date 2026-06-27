import { MS_PER_DAY } from "./pet.js";

/** 알 → 성체 총 누적 시간 (일) */
export const EVOLUTION_TOTAL_DAYS = 5;
const ORIGINAL_TOTAL_DAYS = 14;

function minAgeMs(originalMinDays) {
  return Math.floor((originalMinDays * EVOLUTION_TOTAL_DAYS * MS_PER_DAY) / ORIGINAL_TOTAL_DAYS);
}

export const EVOLUTION_ADULT_MIN_AGE_MS = EVOLUTION_TOTAL_DAYS * MS_PER_DAY;

export const EVOLUTION_STAGES = [
  { id: "egg", minAgeMs: 0, label: "알", baseEmoji: "🥚", spriteId: "egg" },
  { id: "baby", minAgeMs: minAgeMs(1), label: "라바", baseEmoji: "🐠", spriteId: "baby" },
  { id: "child", minAgeMs: minAgeMs(3), label: "치어", baseEmoji: "🐟", spriteId: "child" },
  { id: "teen", minAgeMs: minAgeMs(7), label: "청소년어", baseEmoji: "🐡", spriteId: "teen" },
  { id: "adult", minAgeMs: EVOLUTION_ADULT_MIN_AGE_MS, label: "성체", baseEmoji: "🦑", spriteId: "adult" },
];

export function getEvolutionStage(pet) {
  const ageMs = Date.now() - pet.bornAt;
  let stage = EVOLUTION_STAGES[0];

  for (const candidate of EVOLUTION_STAGES) {
    if (ageMs >= candidate.minAgeMs) stage = candidate;
  }

  return { ...stage };
}

export function getStageIndex(stageId) {
  return EVOLUTION_STAGES.findIndex((stage) => stage.id === stageId);
}

export function checkEvolution(pet) {
  const stage = getEvolutionStage(pet);
  const currentId = stage.id;

  if (pet.lastEvolutionStage === null) {
    pet.lastEvolutionStage = currentId;
    return { evolved: false, stage };
  }

  if (pet.lastEvolutionStage === currentId) {
    return { evolved: false, stage };
  }

  const previousIndex = getStageIndex(pet.lastEvolutionStage);
  const currentIndex = getStageIndex(currentId);
  pet.lastEvolutionStage = currentId;

  if (currentIndex > previousIndex) {
    return { evolved: true, stage };
  }

  return { evolved: false, stage };
}
