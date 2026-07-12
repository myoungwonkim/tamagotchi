import { normalizeSpeciesTheme } from "./speciesThemes.js";

/**
 * Adult idle frame animation registry.
 * 새 성체를 도감/펫에 3프레임 idle로 넣을 때 variantId + theme 항목을 추가하면
 * preload·도감 상세·도감 그리드·펫 idle이 같은 ids를 사용합니다.
 */
export const ADULT_SPRITE_FRAME_CONFIG = {
  golden: {
    mermaid: { ids: ["golden-frame-1", "golden", "golden-frame-3"], frameMs: 533 },
  },
  fluffy: {
    mermaid: { ids: ["fluffy-frame-1", "fluffy", "fluffy-frame-3"], frameMs: 933 },
  },
  sparkle: {
    mermaid: { ids: ["sparkle-frame-1", "sparkle", "sparkle-frame-3"], frameMs: 700 },
    deepsea: {
      ids: ["sparkle-frame-1", "sparkle", "sparkle-frame-3"],
      frameMs: 711,
      floatBob: true,
      floatBobSec: 2.13,
    },
  },
  standard: {
    deepsea: {
      ids: ["standard-frame-1", "standard", "standard-frame-3"],
      frameMs: 1067,
    },
  },
  scruffy: {
    deepsea: {
      ids: ["scruffy-frame-1", "scruffy", "scruffy-frame-3"],
      frameMs: 1067,
    },
  },
  plain: {
    deepsea: {
      ids: ["plain-frame-1", "plain", "plain-frame-3"],
      frameMs: 1067,
    },
  },
  sickly: {
    deepsea: {
      ids: ["sickly-frame-1", "sickly", "sickly-frame-3"],
      frameMs: 800,
    },
  },
};

export function getAdultSpriteFrameConfig(variantId, speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  return ADULT_SPRITE_FRAME_CONFIG[variantId]?.[theme] ?? null;
}

export function hasAdultSpriteFrameAnimation(variantId, speciesTheme) {
  return Boolean(getAdultSpriteFrameConfig(variantId, speciesTheme));
}

export function getAdultSpriteFrameIds(variantId, speciesTheme) {
  return getAdultSpriteFrameConfig(variantId, speciesTheme)?.ids ?? null;
}
