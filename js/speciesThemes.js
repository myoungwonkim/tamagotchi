export const SPECIES_THEMES = ["deepsea", "mermaid", "vent"];
export const DEFAULT_SPECIES_THEME = "deepsea";

export function pickRandomSpeciesTheme() {
  const r = Math.random();
  if (r < 1 / 3) return "mermaid";
  if (r < 2 / 3) return "vent";
  return "deepsea";
}

export function normalizeSpeciesTheme(value) {
  if (value === "mermaid") return "mermaid";
  if (value === "vent") return "vent";
  return DEFAULT_SPECIES_THEME;
}

export const STAGE_LABELS = {
  deepsea: {
    egg: "알",
    baby: "라바",
    child: "치어",
    teen: "청소년어",
    adult: "성체",
  },
  mermaid: {
    egg: "진주 알",
    baby: "꼬물 인어",
    child: "어린 인어",
    teen: "청소년 인어",
    adult: "인어",
  },
  vent: {
    egg: "열수 알",
    baby: "유충",
    child: "새우치",
    teen: "청년 새우",
    adult: "성체",
  },
};

const VARIANT_LABELS = {
  golden: { deepsea: "등불어", mermaid: "금비늘 어인", vent: "열수 해마" },
  fluffy: { deepsea: "달빛 해파리", mermaid: "소라 어인", vent: "눈없는 새우" },
  sparkle: { deepsea: "발광 오징어", mermaid: "별빛 인어", vent: "예티 게" },
  standard: { deepsea: "산호어", mermaid: "산호 인어", vent: "담수어" },
  farm: { deepsea: "해조어", mermaid: "해초 인어", vent: "벤트 게" },
  plain: { deepsea: "진흙어", mermaid: "늪 인어", vent: "황 새우" },
  scruffy: { deepsea: "썩은 아귀", mermaid: "능어", vent: "녹슨 새우" },
  grumpy: { deepsea: "송곳니어", mermaid: "핀백 어인", vent: "분홍 장어" },
  sickly: { deepsea: "기생어", mermaid: "반점 어인", vent: "기생 새우" },
};

const VARIANT_EMOJI = {
  golden: { deepsea: "🔆🐟", mermaid: "🐟⚔️", vent: "🐴🌋" },
  fluffy: { deepsea: "🪼", mermaid: "🐚🧜", vent: "🦐" },
  sparkle: { deepsea: "✨🦑", mermaid: "✨🧜", vent: "🦀" },
  standard: { deepsea: "🐟", mermaid: "🧜‍♀️", vent: "🐟" },
  farm: { deepsea: "🪸🐟", mermaid: "🧜‍♀️🌿", vent: "🦀" },
  plain: { deepsea: "🐟", mermaid: "🧜", vent: "🦐" },
  scruffy: { deepsea: "🪱🐟", mermaid: "🐟👖", vent: "🦐" },
  grumpy: { deepsea: "💢🐡", mermaid: "🐟🔺", vent: "🐍" },
  sickly: { deepsea: "🤢🐟", mermaid: "🐟🩹", vent: "🦠🦐" },
};

const STAGE_EMOJI = {
  deepsea: { egg: "🥚", baby: "🐠", child: "🐟", teen: "🐡", dead: "🦴" },
  mermaid: { egg: "🫧", baby: "🧜‍♀️", child: "🧜‍♀️", teen: "🧜‍♀️", dead: "💀" },
  vent: { egg: "🌋", baby: "🦐", child: "🦐", teen: "🦐", dead: "💀" },
};

export function getStageLabelForTheme(stageId, speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  return STAGE_LABELS[theme][stageId] ?? STAGE_LABELS.deepsea[stageId] ?? stageId;
}

export function getVariantLabelForTheme(variantId, speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  return VARIANT_LABELS[variantId]?.[theme] ?? VARIANT_LABELS.standard[theme];
}

export function getVariantEmojiForTheme(variantId, speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  return VARIANT_EMOJI[variantId]?.[theme] ?? VARIANT_EMOJI.standard[theme];
}

export function getDeadEmojiForTheme(speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  return STAGE_EMOJI[theme].dead;
}

export function getEvolutionStageEmojiForTheme(stageId, speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  return STAGE_EMOJI[theme][stageId] ?? STAGE_EMOJI.deepsea[stageId];
}
