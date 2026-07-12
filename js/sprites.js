import { getEvolutionEmoji, getMoodEmoji, getMoodKind } from "./pet.js";
import { getEvolutionStage, EVOLUTION_STAGES, getStageIndex } from "./evolution.js";
import { getEvolutionDisplayEmoji, getAdultVariant, ADULT_VARIANTS } from "./adultVariants.js";
import {
  DEFAULT_SPECIES_THEME,
  getDeadEmojiForTheme,
  getEvolutionStageEmojiForTheme,
  getStageLabelForTheme,
  normalizeSpeciesTheme,
} from "./speciesThemes.js";

export const SPRITE_BASE = "assets/sprites";
const SETTINGS_KEY = "tamagotchi-settings";

const preloaded = new Set();

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSettings(patch) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), ...patch }));
  } catch {
    // ignore
  }
}

export function isSpritesEnabled() {
  return readSettings().useSprites !== false;
}

export function setSpritesEnabled(enabled) {
  writeSettings({ useSprites: Boolean(enabled) });
  return isSpritesEnabled();
}

export function toggleSpritesEnabled() {
  return setSpritesEnabled(!isSpritesEnabled());
}

export function getSpriteFormat() {
  const fmt = readSettings().spriteFormat;
  if (fmt === "svg") return "svg";
  return "png";
}

export function setSpriteFormat(format) {
  writeSettings({ spriteFormat: format === "png" ? "png" : "svg" });
  clearPreloadCache();
  return getSpriteFormat();
}

export function toggleSpriteFormat() {
  return setSpriteFormat(getSpriteFormat() === "png" ? "svg" : "png");
}

export function clearPreloadCache() {
  preloaded.clear();
}

function getAppVersion() {
  if (typeof document === "undefined") return "";
  return document.querySelector('meta[name="app-version"]')?.content || "";
}

export function getPetSpeciesTheme(pet) {
  return normalizeSpeciesTheme(pet?.speciesTheme);
}

export function getSpriteUrl(
  category,
  id,
  speciesTheme = DEFAULT_SPECIES_THEME,
  format,
) {
  const ext = format ?? getSpriteFormat();
  const theme = normalizeSpeciesTheme(speciesTheme);
  let base;
  if (category === "ui") {
    base = `${SPRITE_BASE}/ui/${id}.${ext}`;
  } else if (theme === "mermaid") {
    base = `${SPRITE_BASE}/mermaid/${category}/${id}.${ext}`;
  } else if (theme === "vent") {
    base = `${SPRITE_BASE}/vent/${category}/${id}.${ext}`;
  } else {
    base = `${SPRITE_BASE}/${category}/${id}.${ext}`;
  }
  const v = getAppVersion();
  return v ? `${base}?v=${v}` : base;
}

/** Multi-frame·신규 성체 스프라이트는 PNG만 존재 — spriteFormat(svg)와 무관 */
export function getSpriteUrlPng(category, id, speciesTheme = DEFAULT_SPECIES_THEME) {
  return getSpriteUrl(category, id, speciesTheme, "png");
}

export function getEvolutionSpriteMeta(pet) {
  const theme = getPetSpeciesTheme(pet);

  if (!pet.isAlive) {
    if (pet.deathCause === "shark") {
      return {
        key: `${theme}-ghost`,
        src: getSpriteUrl("evolution", "ghost", theme),
        alt: "유령",
        fallbackEmoji: "👻",
      };
    }
    return {
      key: `${theme}-dead`,
      src: getSpriteUrl("evolution", "dead", theme),
      alt: "게임 오버",
      fallbackEmoji: getDeadEmojiForTheme(theme),
    };
  }

  const stage = getEvolutionStage(pet);
  if (stage.id === "adult") {
    const variant = pet.adultVariantId
      ? getAdultVariant(pet.adultVariantId, theme)
      : { spriteId: "standard", emoji: "🐟", label: getStageLabelForTheme("adult", theme) };
    return {
      key: `${theme}-adult-${variant.spriteId ?? variant.id}`,
      src: getSpriteUrlPng("adult", variant.spriteId ?? variant.id ?? "standard", theme),
      alt: variant.label,
      fallbackEmoji: variant.emoji,
    };
  }

  return {
    key: `${theme}-${stage.spriteId}`,
    src: getSpriteUrl("evolution", stage.spriteId, theme),
    alt: getStageLabelForTheme(stage.id, theme),
    fallbackEmoji: getEvolutionStageEmojiForTheme(stage.id, theme),
  };
}

export function getMoodSpriteMeta(pet) {
  const kind = getMoodKind(pet);
  if (!kind) return null;

  const theme = getPetSpeciesTheme(pet);
  const fallbackEmoji = getMoodEmoji(pet);
  return {
    key: `${theme}-${kind}`,
    src: getSpriteUrl("mood", kind, theme),
    alt: kind,
    fallbackEmoji,
  };
}

export function getVariantSpriteMeta(variant, speciesTheme = DEFAULT_SPECIES_THEME) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  const themed = getAdultVariant(variant.id, theme);
  return {
    key: `${theme}-${variant.id}`,
    src: getSpriteUrlPng("adult", variant.spriteId, theme),
    alt: themed.label,
    fallbackEmoji: themed.emoji,
  };
}

export function getUiSpriteMeta(id, fallbackEmoji, alt = "") {
  return {
    key: `ui-${id}`,
    src: getSpriteUrl("ui", id),
    alt,
    fallbackEmoji,
  };
}

export function getStageSpriteMeta(spriteId, fallbackEmoji, alt, speciesTheme = DEFAULT_SPECIES_THEME) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  return {
    key: `${theme}-${spriteId}`,
    src: getSpriteUrl("evolution", spriteId, theme),
    alt,
    fallbackEmoji,
  };
}

export function preloadSpriteMeta(meta) {
  if (!meta?.src || preloaded.has(meta.src)) return;
  preloaded.add(meta.src);
  const img = new Image();
  img.src = meta.src;
}

export function preloadSpritesForPet(pet) {
  if (!pet || !isSpritesEnabled()) return;

  const theme = getPetSpeciesTheme(pet);

  preloadSpriteMeta(getEvolutionSpriteMeta(pet));
  preloadSpriteMeta(getMoodSpriteMeta(pet));

  const stage = getEvolutionStage(pet);
  const idx = getStageIndex(stage.id);
  if (idx >= 0 && idx < EVOLUTION_STAGES.length - 1) {
    const next = EVOLUTION_STAGES[idx + 1];
    preloadSpriteMeta({
      src: getSpriteUrl("evolution", next.spriteId, theme),
    });
  }

  for (const kind of ["happy", "neutral", "sad", "sleep", "sick"]) {
    preloadSpriteMeta({ src: getSpriteUrl("mood", kind, theme) });
  }

  for (const id of ["poop", "fly", "feed", "play", "clean", "sleep", "wake", "encyclopedia", "sound-on", "sound-off"]) {
    preloadSpriteMeta({ src: getSpriteUrl("ui", id) });
  }

  if (stage.id === "adult" && pet.adultVariantId) {
    const frameIdsByVariant = {
      sparkle: {
        deepsea: ["sparkle-frame-1", "sparkle", "sparkle-frame-3"],
        mermaid: ["sparkle-frame-1", "sparkle", "sparkle-frame-3"],
      },
      standard: {
        deepsea: ["standard-frame-1", "standard", "standard-frame-3"],
      },
      scruffy: {
        deepsea: ["scruffy-frame-1", "scruffy", "scruffy-frame-3"],
      },
      plain: {
        deepsea: ["plain-frame-1", "plain", "plain-frame-3"],
      },
      sickly: {
        deepsea: ["sickly-frame-1", "sickly", "sickly-frame-3"],
      },
    };
    const frameIds = frameIdsByVariant[pet.adultVariantId]?.[theme];
    if (frameIds) {
      for (const id of frameIds) {
        preloadSpriteMeta({ src: getSpriteUrlPng("adult", id, theme) });
      }
    }
  }
}

export function getFallbackEvolutionEmoji(pet) {
  if (!pet.isAlive) {
    if (pet.deathCause === "shark") return "👻";
    return getDeadEmojiForTheme(getPetSpeciesTheme(pet));
  }
  const stage = getEvolutionStage(pet);
  if (stage.id === "adult") return getEvolutionDisplayEmoji(pet);
  return getEvolutionStageEmojiForTheme(stage.id, getPetSpeciesTheme(pet));
}
