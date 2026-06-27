export const SPECIES_THEMES = ["deepsea", "mermaid"];
export const DEFAULT_SPECIES_THEME = "deepsea";

export function pickRandomSpeciesTheme() {
  return Math.random() < 0.5 ? "mermaid" : "deepsea";
}

export function normalizeSpeciesTheme(value) {
  return value === "mermaid" ? "mermaid" : DEFAULT_SPECIES_THEME;
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
};

const VARIANT_LABELS = {
  golden: { deepsea: "등불어", mermaid: "진주 인어" },
  fluffy: { deepsea: "달빛 해파리", mermaid: "달빛 실크 인어" },
  sparkle: { deepsea: "발광 오징어", mermaid: "별빛 인어" },
  standard: { deepsea: "산호어", mermaid: "산호 인어" },
  farm: { deepsea: "해조어", mermaid: "해초 인어" },
  plain: { deepsea: "진흙어", mermaid: "늪 인어" },
  scruffy: { deepsea: "썩은 아귀", mermaid: "저주받은 인어" },
  grumpy: { deepsea: "송곳니어", mermaid: "송곳니 인어" },
  sickly: { deepsea: "기생어", mermaid: "기생 인어" },
};

const VARIANT_EMOJI = {
  golden: { deepsea: "🔆🐟", mermaid: "🧜‍♀️✨" },
  fluffy: { deepsea: "🪼", mermaid: "🧜‍♀️🌙" },
  sparkle: { deepsea: "✨🦑", mermaid: "✨🧜" },
  standard: { deepsea: "🐟", mermaid: "🧜‍♀️" },
  farm: { deepsea: "🪸🐟", mermaid: "🧜‍♀️🌿" },
  plain: { deepsea: "🐟", mermaid: "🧜" },
  scruffy: { deepsea: "🪱🐟", mermaid: "🧟‍♀️🧜" },
  grumpy: { deepsea: "💢🐡", mermaid: "💢🧜" },
  sickly: { deepsea: "🤢🐟", mermaid: "🤢🧜" },
};

const STAGE_EMOJI = {
  deepsea: { egg: "🥚", baby: "🐠", child: "🐟", teen: "🐡", dead: "🦴" },
  mermaid: { egg: "🫧", baby: "🧜‍♀️", child: "🧜‍♀️", teen: "🧜‍♀️", dead: "💀" },
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
