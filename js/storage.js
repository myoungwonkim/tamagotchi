import { createNewPet, STAT_PROTECT_MS } from "./pet.js";
import { getEvolutionStage } from "./evolution.js";
import { resolveAdultVariant } from "./adultVariants.js";
import { DEFAULT_SPECIES_THEME, normalizeSpeciesTheme } from "./speciesThemes.js";

const STORAGE_KEY = "tamagotchi-pet";
const PROTECT_AD_KEY = "tamagotchi-protect-ad";

export function readProtectUsedAt() {
  try {
    const raw = localStorage.getItem(PROTECT_AD_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return typeof parsed?.usedAt === "number" && parsed.usedAt > 0 ? parsed.usedAt : 0;
  } catch {
    return 0;
  }
}

export function writeProtectUsedAt(usedAt) {
  if (typeof usedAt !== "number" || usedAt <= 0) return 0;
  try {
    const next = Math.max(readProtectUsedAt(), usedAt);
    localStorage.setItem(PROTECT_AD_KEY, JSON.stringify({ usedAt: next }));
    return next;
  } catch {
    return usedAt;
  }
}

export function normalizePet(raw) {
  if (!raw || typeof raw !== "object") return null;

  const defaults = createNewPet(raw.name || "치치");
  const pet = {
    ...defaults,
    ...raw,
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : defaults.name,
    bornAt: typeof raw.bornAt === "number" ? raw.bornAt : defaults.bornAt,
    hunger: clampStat(raw.hunger, defaults.hunger),
    happiness: clampStat(raw.happiness, defaults.happiness),
    cleanliness: clampStat(raw.cleanliness, defaults.cleanliness),
    health: clampStat(raw.health, defaults.health),
    isSleeping: Boolean(raw.isSleeping),
    isAlive: raw.isAlive !== false,
    lastUpdated: typeof raw.lastUpdated === "number" ? raw.lastUpdated : defaults.lastUpdated,
    neglectStartedAt:
      raw.neglectStartedAt === null || typeof raw.neglectStartedAt === "number"
        ? raw.neglectStartedAt
        : null,
    protectUsedAt: Math.max(
      typeof raw.protectUsedAt === "number" ? raw.protectUsedAt : 0,
      readProtectUsedAt(),
    ),
    protectedUntil: 0,
    lastEvolutionStage:
      typeof raw.lastEvolutionStage === "string" ? raw.lastEvolutionStage : null,
    speciesTheme:
      typeof raw.speciesTheme === "string"
        ? normalizeSpeciesTheme(raw.speciesTheme)
        : DEFAULT_SPECIES_THEME,
    adultVariantId:
      typeof raw.adultVariantId === "string" ? raw.adultVariantId : null,
    adultCareSnapshot:
      raw.adultCareSnapshot && typeof raw.adultCareSnapshot === "object"
        ? raw.adultCareSnapshot
        : null,
  };

  const fromWatch = pet.protectUsedAt > 0 ? pet.protectUsedAt + STAT_PROTECT_MS : 0;
  pet.protectedUntil = Math.max(
    typeof raw.protectedUntil === "number" ? raw.protectedUntil : 0,
    fromWatch,
  );

  if (pet.isAlive && pet.lastEvolutionStage === null) {
    pet.lastEvolutionStage = getEvolutionStage(pet).id;
  }

  if (getEvolutionStage(pet).id === "adult") {
    resolveAdultVariant(pet);
  }

  return pet;
}

function clampStat(value, fallback) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(100, Math.max(0, value));
}

export function savePet(pet) {
  if (!pet) return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
    if (typeof pet.protectUsedAt === "number" && pet.protectUsedAt > 0) {
      writeProtectUsedAt(pet.protectUsedAt);
    }
    return true;
  } catch {
    return false;
  }
}

export function loadPet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    return normalizePet(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearPet() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function loadOrCreatePet() {
  return loadPet() ?? normalizePet(createNewPet());
}
