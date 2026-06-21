import { ADULT_VARIANTS, getAdultVariant } from "./adultVariants.js";
import { getEvolutionStage } from "./evolution.js";

const STORAGE_KEY = "tamagotchi-encyclopedia";

function createEntryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadEncyclopedia() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries)) return { entries: [] };
    return { entries: parsed.entries.filter((e) => e && typeof e.id === "string") };
  } catch {
    return { entries: [] };
  }
}

function saveEncyclopedia(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getCollectedCount() {
  return loadEncyclopedia().entries.length;
}

export function getCollectedVariantIds() {
  return new Set(loadEncyclopedia().entries.map((e) => e.variantId));
}

export function addToEncyclopedia(pet) {
  if (!pet?.adultVariantId) return null;
  if (getEvolutionStage(pet).id !== "adult") return null;

  const variant = getAdultVariant(pet.adultVariantId);
  const data = loadEncyclopedia();

  const duplicate = data.entries.find(
    (e) => e.petBornAt === pet.bornAt && e.variantId === pet.adultVariantId
  );
  if (duplicate) return duplicate;

  const entry = {
    id: createEntryId(),
    petName: pet.name,
    petBornAt: pet.bornAt,
    variantId: variant.id,
    tier: variant.tier,
    emoji: variant.emoji,
    spriteId: variant.spriteId,
    label: variant.label,
    achievedAt: Date.now(),
    careSnapshot: pet.adultCareSnapshot ?? null,
  };

  data.entries.unshift(entry);
  saveEncyclopedia(data);
  return entry;
}

export function clearEncyclopedia() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getEncyclopediaSlots() {
  const collected = getCollectedVariantIds();
  return ADULT_VARIANTS.map((variant) => ({
    variant,
    collected: collected.has(variant.id),
    entries: loadEncyclopedia().entries.filter((e) => e.variantId === variant.id),
  }));
}

export function formatAchievedDate(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}
