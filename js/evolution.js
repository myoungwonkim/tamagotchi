import { getAgeDays } from "./pet.js";

export const EVOLUTION_STAGES = [
  { id: "egg", minDays: 0, label: "알", baseEmoji: "🥚", spriteId: "egg" },
  { id: "baby", minDays: 1, label: "라바", baseEmoji: "🐠", spriteId: "baby" },
  { id: "child", minDays: 3, label: "치어", baseEmoji: "🐟", spriteId: "child" },
  { id: "teen", minDays: 7, label: "청소년어", baseEmoji: "🐡", spriteId: "teen" },
  { id: "adult", minDays: 14, label: "성체", baseEmoji: "🦑", spriteId: "adult" },
];

export function getEvolutionStage(pet) {
  const age = getAgeDays(pet);
  let stage = EVOLUTION_STAGES[0];

  for (const candidate of EVOLUTION_STAGES) {
    if (age >= candidate.minDays) stage = candidate;
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
