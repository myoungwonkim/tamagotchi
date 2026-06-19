const MS_PER_DAY = 86400000;
const NEGLECT_THRESHOLD = 10;
const NEGLECT_DURATION_MS = 10 * 60 * 1000;

export const DECAY_RATES = {
  hunger: 0.05,
  happiness: 0.03,
  cleanliness: 0.02,
};

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
  if (avg >= 70) return "😊";
  if (avg >= 40) return "😐";
  return "😢";
}

export function applyTimeDelta(pet, elapsedMs) {
  if (!pet.isAlive || elapsedMs <= 0) return;

  const seconds = elapsedMs / 1000;
  const hungerRate = pet.isSleeping ? DECAY_RATES.hunger * 0.5 : DECAY_RATES.hunger;

  pet.hunger = clamp(pet.hunger - hungerRate * seconds);
  pet.happiness = clamp(pet.happiness - DECAY_RATES.happiness * seconds);
  pet.cleanliness = clamp(pet.cleanliness - DECAY_RATES.cleanliness * seconds);

  const allLow =
    pet.hunger <= 20 && pet.happiness <= 20 && pet.cleanliness <= 20;

  if (allLow) {
    pet.health = clamp(pet.health - 0.02 * seconds);
  }

  updateNeglectTracking(pet);
  checkGameOver(pet);
}

function updateNeglectTracking(pet) {
  const avg = getAverageCare(pet);
  if (avg < NEGLECT_THRESHOLD) {
    if (pet.neglectStartedAt === null) {
      pet.neglectStartedAt = Date.now();
    }
  } else {
    pet.neglectStartedAt = null;
  }
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
