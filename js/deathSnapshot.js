const SNAPSHOT_KEY = "tamagotchi-death-snapshot";

let memorySnapshot = null;

const PET_FIELDS = [
  "name",
  "bornAt",
  "hunger",
  "happiness",
  "cleanliness",
  "health",
  "isSleeping",
  "lastUpdated",
  "neglectStartedAt",
  "lastEvolutionStage",
  "speciesTheme",
  "adultVariantId",
  "adultCareSnapshot",
];

function pickPetFields(pet) {
  const out = { isAlive: true };
  for (const key of PET_FIELDS) {
    if (pet[key] !== undefined) out[key] = pet[key];
  }
  return out;
}

export function captureDeathSnapshot(pet) {
  if (!pet) return null;
  const snapshot = {
    ...pickPetFields(pet),
    capturedAt: Date.now(),
    deathId: `${pet.bornAt}-${Date.now()}`,
  };
  memorySnapshot = snapshot;
  try {
    sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore
  }
  return snapshot;
}

export function getDeathSnapshot() {
  if (memorySnapshot) return memorySnapshot;
  try {
    const raw = sessionStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    memorySnapshot = JSON.parse(raw);
    return memorySnapshot;
  } catch {
    return null;
  }
}

export function clearDeathSnapshot() {
  memorySnapshot = null;
  try {
    sessionStorage.removeItem(SNAPSHOT_KEY);
  } catch {
    // ignore
  }
}

export function applyDeathSnapshotToPet(pet, snapshot) {
  if (!pet || !snapshot) return false;
  for (const key of PET_FIELDS) {
    if (snapshot[key] !== undefined) pet[key] = snapshot[key];
  }
  pet.isAlive = true;
  pet.isSleeping = false;
  pet.neglectStartedAt = null;
  pet.health = Math.max(pet.health, 25);
  pet.lastUpdated = Date.now();
  return true;
}
