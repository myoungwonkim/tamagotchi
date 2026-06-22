import { getEvolutionEmoji, getMoodEmoji, getMoodKind } from "./pet.js";
import { getEvolutionStage, EVOLUTION_STAGES, getStageIndex } from "./evolution.js";
import { getEvolutionDisplayEmoji, getAdultVariant, ADULT_VARIANTS } from "./adultVariants.js";

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

export function getSpriteUrl(category, id) {
  const ext = getSpriteFormat();
  const base = `${SPRITE_BASE}/${category}/${id}.${ext}`;
  const v = getAppVersion();
  return v ? `${base}?v=${v}` : base;
}

export function getEvolutionSpriteMeta(pet) {
  if (!pet.isAlive) {
    return {
      key: "dead",
      src: getSpriteUrl("evolution", "dead"),
      alt: "게임 오버",
      fallbackEmoji: "🦴",
    };
  }

  const stage = getEvolutionStage(pet);
  if (stage.id === "adult") {
    const variant = pet.adultVariantId
      ? getAdultVariant(pet.adultVariantId)
      : { spriteId: "standard", emoji: "🐟", label: "성체" };
    return {
      key: `adult-${variant.spriteId ?? variant.id}`,
      src: getSpriteUrl("adult", variant.spriteId ?? variant.id ?? "standard"),
      alt: variant.label,
      fallbackEmoji: variant.emoji,
    };
  }

  return {
    key: stage.spriteId,
    src: getSpriteUrl("evolution", stage.spriteId),
    alt: stage.label,
    fallbackEmoji: stage.baseEmoji,
  };
}

export function getMoodSpriteMeta(pet) {
  const kind = getMoodKind(pet);
  if (!kind) return null;

  const fallbackEmoji = getMoodEmoji(pet);
  return {
    key: kind,
    src: getSpriteUrl("mood", kind),
    alt: kind,
    fallbackEmoji,
  };
}

export function getVariantSpriteMeta(variant) {
  return {
    key: variant.id,
    src: getSpriteUrl("adult", variant.spriteId),
    alt: variant.label,
    fallbackEmoji: variant.emoji,
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

export function getStageSpriteMeta(spriteId, fallbackEmoji, alt) {
  return {
    key: spriteId,
    src: getSpriteUrl("evolution", spriteId),
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

  preloadSpriteMeta(getEvolutionSpriteMeta(pet));
  preloadSpriteMeta(getMoodSpriteMeta(pet));

  const stage = getEvolutionStage(pet);
  const idx = getStageIndex(stage.id);
  if (idx >= 0 && idx < EVOLUTION_STAGES.length - 1) {
    const next = EVOLUTION_STAGES[idx + 1];
    preloadSpriteMeta({
      src: getSpriteUrl("evolution", next.spriteId),
    });
  }

  for (const kind of ["happy", "neutral", "sad", "sleep", "sick"]) {
    preloadSpriteMeta({ src: getSpriteUrl("mood", kind) });
  }

  for (const id of ["poop", "fly"]) {
    const base = `${SPRITE_BASE}/ui/${id}.png`;
    const v = getAppVersion();
    preloadSpriteMeta({ src: v ? `${base}?v=${v}` : base });
  }
}

export function getFallbackEvolutionEmoji(pet) {
  if (!pet.isAlive) return "🦴";
  const stage = getEvolutionStage(pet);
  if (stage.id === "adult") return getEvolutionDisplayEmoji(pet);
  return getEvolutionEmoji(pet);
}
