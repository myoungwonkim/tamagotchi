import { getAverageCare } from "./pet.js";

export const ADULT_TIERS = {
  pretty: {
    id: "pretty",
    label: "예쁜 닭",
    minStat: 65,
    minAvg: 72,
  },
  normal: {
    id: "normal",
    label: "보통 닭",
    minStat: 40,
    minAvg: 50,
  },
  defective: {
    id: "defective",
    label: "불량 닭",
  },
};

export const ADULT_VARIANTS = [
  { id: "golden", tier: "pretty", emoji: "🐓", spriteId: "golden", label: "황금 닭" },
  { id: "fluffy", tier: "pretty", emoji: "✨🐔", spriteId: "fluffy", label: "복슬 닭" },
  { id: "sparkle", tier: "pretty", emoji: "🌟🐔", spriteId: "sparkle", label: "반짝 닭" },
  { id: "standard", tier: "normal", emoji: "🐔", spriteId: "standard", label: "평범한 닭" },
  { id: "farm", tier: "normal", emoji: "🐔‍🌾", spriteId: "farm", label: "농장 닭" },
  { id: "plain", tier: "normal", emoji: "🐔💤", spriteId: "plain", label: "무난한 닭" },
  { id: "scruffy", tier: "defective", emoji: "🪶🐔", spriteId: "scruffy", label: "털 빠진 닭" },
  { id: "grumpy", tier: "defective", emoji: "💢🐔", spriteId: "grumpy", label: "심술 닭" },
  { id: "sickly", tier: "defective", emoji: "🤕🐔", spriteId: "sickly", label: "병든 닭" },
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

export function getAdultVariant(variantId) {
  return variantById[variantId] ?? ADULT_VARIANTS.find((v) => v.id === "standard");
}

export function resolveAdultVariant(pet) {
  if (pet.adultVariantId) {
    return getAdultVariant(pet.adultVariantId);
  }

  const tier = determineTier(pet);
  const variant = pickVariantForTier(tier);
  pet.adultVariantId = variant.id;
  pet.adultCareSnapshot = getCareSnapshot(pet);
  return variant;
}

export function getEvolutionDisplayEmoji(pet) {
  if (!pet.isAlive) return "👻";
  if (pet.adultVariantId) {
    return getAdultVariant(pet.adultVariantId).emoji;
  }
  return "🐔";
}

export function getAdultTier(pet) {
  if (!pet.adultVariantId) return null;
  return getAdultVariant(pet.adultVariantId).tier;
}

export function getAllVariantIds() {
  return ADULT_VARIANTS.map((v) => v.id);
}
