import { getAverageCare } from "./pet.js";

import {
  DEFAULT_SPECIES_THEME,
  getVariantEmojiForTheme,
  getVariantLabelForTheme,
  normalizeSpeciesTheme,
} from "./speciesThemes.js";

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
  { id: "fluffy", tier: "pretty", emoji: "🪼", spriteId: "fluffy", label: "독성 해파리" },
  { id: "sparkle", tier: "pretty", emoji: "🐙", spriteId: "sparkle", label: "심해 문어" },
  { id: "standard", tier: "normal", emoji: "🐌", spriteId: "standard", label: "갯민숭달팽이" },
  { id: "farm", tier: "normal", emoji: "🪸🐟", spriteId: "farm", label: "해조어" },
  { id: "plain", tier: "normal", emoji: "😶🐟", spriteId: "plain", label: "인면어" },
  { id: "scruffy", tier: "defective", emoji: "🐟💡", spriteId: "scruffy", label: "심해아귀" },
  { id: "grumpy", tier: "defective", emoji: "🪸💚", spriteId: "grumpy", label: "백골 말미" },
  { id: "sickly", tier: "defective", emoji: "💚🐟", spriteId: "sickly", label: "녹면어" },
];

const variantById = Object.fromEntries(ADULT_VARIANTS.map((v) => [v.id, v]));

/** 테마별 진화·도감 비활성 슬롯 (등불어·해조어·산호 인어·늪 인어·반점 어인) */
const DISABLED_EVOLUTION_VARIANT_IDS = {
  deepsea: new Set(["golden", "farm"]),
  mermaid: new Set(["golden", "standard", "plain", "sickly"]),
  vent: new Set(["golden", "farm", "standard", "plain", "sickly"]),
};

export function isEvolutionVariantEnabled(variantId, speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  return !DISABLED_EVOLUTION_VARIANT_IDS[theme]?.has(variantId);
}

export function getPlayableVariants(speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  return ADULT_VARIANTS.filter((v) => isEvolutionVariantEnabled(v.id, theme));
}

export function getPlayableVariantCount(speciesTheme) {
  return getPlayableVariants(speciesTheme).length;
}

function getDefaultPlayableVariant(speciesTheme) {
  const playable = getPlayableVariants(speciesTheme);
  return playable[0] ?? ADULT_VARIANTS[0];
}

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

function pickVariantForTier(tier, speciesTheme) {
  const pool = getPlayableVariants(speciesTheme).filter((v) => v.tier === tier);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickVariantForPet(pet) {
  const theme = normalizeSpeciesTheme(pet.speciesTheme);
  const tier = determineTier(pet);
  const tiers = ["pretty", "normal", "defective"];
  const startIdx = Math.max(0, tiers.indexOf(tier));
  for (let i = startIdx; i < tiers.length; i++) {
    const variant = pickVariantForTier(tiers[i], theme);
    if (variant) return variant;
  }
  const playable = getPlayableVariants(theme);
  return playable[Math.floor(Math.random() * playable.length)];
}

export function getAdultVariant(variantId, speciesTheme) {
  const theme = speciesTheme == null ? DEFAULT_SPECIES_THEME : normalizeSpeciesTheme(speciesTheme);
  const base =
    variantById[variantId] && isEvolutionVariantEnabled(variantId, theme)
      ? variantById[variantId]
      : getDefaultPlayableVariant(theme);
  if (speciesTheme == null) return base;
  return {
    ...base,
    label: getVariantLabelForTheme(base.id, theme),
    emoji: getVariantEmojiForTheme(base.id, theme),
  };
}

export function resolveAdultVariant(pet) {
  const theme = normalizeSpeciesTheme(pet.speciesTheme);
  if (
    pet.adultVariantId &&
    isEvolutionVariantEnabled(pet.adultVariantId, theme)
  ) {
    return getAdultVariant(pet.adultVariantId, pet.speciesTheme);
  }

  if (pet.adultVariantId) {
    pet.adultVariantId = null;
    pet.adultCareSnapshot = null;
  }

  const variant = pickVariantForPet(pet);
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

export function getAllVariantIds(speciesTheme) {
  if (speciesTheme == null) return ADULT_VARIANTS.map((v) => v.id);
  return getPlayableVariants(speciesTheme).map((v) => v.id);
}
