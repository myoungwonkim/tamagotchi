import { getAverageCare } from "./pet.js";

import { getVariantEmojiForTheme, getVariantLabelForTheme, normalizeSpeciesTheme } from "./speciesThemes.js";

export const ADULT_TIERS = {
  pretty: {
    id: "pretty",
    label: "빛나는 심해어",
    minStat: 65,
    minAvg: 72,
  },
  normal: {
    id: "normal",
    label: "보통 심해어",
    minStat: 40,
    minAvg: 50,
  },
  defective: {
    id: "defective",
    label: "불량 심해어",
  },
};

export const ADULT_VARIANTS = [
  { id: "golden", tier: "pretty", emoji: "🔆🐟", spriteId: "golden", label: "등불어" },
  { id: "fluffy", tier: "pretty", emoji: "🪼", spriteId: "fluffy", label: "달빛 해파리" },
  { id: "sparkle", tier: "pretty", emoji: "✨🦑", spriteId: "sparkle", label: "주머니귀오징어" },
  { id: "standard", tier: "normal", emoji: "🐟", spriteId: "standard", label: "산호어" },
  { id: "farm", tier: "normal", emoji: "🪸🐟", spriteId: "farm", label: "해조어" },
  { id: "plain", tier: "normal", emoji: "🐟", spriteId: "plain", label: "진흙어" },
  { id: "scruffy", tier: "defective", emoji: "🪱🐟", spriteId: "scruffy", label: "썩은 아귀" },
  { id: "grumpy", tier: "defective", emoji: "💢🐡", spriteId: "grumpy", label: "송곳니어" },
  { id: "sickly", tier: "defective", emoji: "🤢🐟", spriteId: "sickly", label: "기생어" },
];

const variantById = Object.fromEntries(ADULT_VARIANTS.map((v) => [v.id, v]));

export function getCareSnapshot(pet) {
  const avg = (pet.hunger + pet.happiness + pet.cleanliness + pet.health) / 4;
  return {
    hunger: pet.hunger,
    happiness: pet.happiness,
    cleanliness: pet.cleanliness,
    health: pet.health,
    avg,
  };
}

export function determineTier(pet) {
  const minStat = Math.min(pet.hunger, pet.happiness, pet.cleanliness, pet.health);
  const avg = getAverageCare(pet);
  const healthAvg = (pet.hunger + pet.happiness + pet.cleanliness + pet.health) / 4;

  if (minStat >= ADULT_TIERS.pretty.minStat && healthAvg >= ADULT_TIERS.pretty.minAvg) {
    return "pretty";
  }
  if (minStat >= ADULT_TIERS.normal.minStat && avg >= ADULT_TIERS.normal.minAvg) {
    return "normal";
  }
  return "defective";
}

function pickVariantForTier(tier) {
  const pool = ADULT_VARIANTS.filter((v) => v.tier === tier);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getAdultVariant(variantId, speciesTheme) {
  const base = variantById[variantId] ?? ADULT_VARIANTS.find((v) => v.id === "standard");
  if (speciesTheme == null) return base;
  const theme = normalizeSpeciesTheme(speciesTheme);
  return {
    ...base,
    label: getVariantLabelForTheme(base.id, theme),
    emoji: getVariantEmojiForTheme(base.id, theme),
  };
}

export function resolveAdultVariant(pet) {
  if (pet.adultVariantId) {
    return getAdultVariant(pet.adultVariantId, pet.speciesTheme);
  }

  const tier = determineTier(pet);
  const variant = pickVariantForTier(tier);
  pet.adultVariantId = variant.id;
  pet.adultCareSnapshot = getCareSnapshot(pet);
  return getAdultVariant(variant.id, pet.speciesTheme);
}

export function getEvolutionDisplayEmoji(pet) {
  if (!pet.isAlive) return "🦴";
  if (pet.adultVariantId) {
    return getAdultVariant(pet.adultVariantId, pet.speciesTheme).emoji;
  }
  return "🦑";
}

export function getAdultTier(pet) {
  if (!pet.adultVariantId) return null;
  return getAdultVariant(pet.adultVariantId).tier;
}

export function getAllVariantIds() {
  return ADULT_VARIANTS.map((v) => v.id);
}
