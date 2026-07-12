import { getEvolutionStage } from "./evolution.js";
import { getAdultVariant } from "./adultVariants.js";
import {
  getAdultSpriteFrameConfig,
  hasAdultSpriteFrameAnimation,
} from "./adultSpriteFrames.js";
import { getSpriteUrlPng, getUiSpriteMeta, preloadSpriteMeta } from "./sprites.js";
import { normalizeSpeciesTheme } from "./speciesThemes.js";

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const spriteFrameTimers = new WeakMap();

function getSpriteFrameConfig(variantId, speciesTheme) {
  return getAdultSpriteFrameConfig(variantId, speciesTheme);
}

function getSpriteFrameSrcs(variantId, speciesTheme) {
  const config = getSpriteFrameConfig(variantId, speciesTheme);
  if (!config) return null;
  const theme = normalizeSpeciesTheme(speciesTheme);
  return config.ids.map((id) => getSpriteUrlPng("adult", id, theme));
}

function getFrameAnimImg(el) {
  return (
    el?.querySelector(
      "img.pet-evolution-img, img.pet-sprite, img.encyclopedia-detail__img, img.encyclopedia-card__img",
    ) ?? null
  );
}

function stopSpriteFrames(el) {
  const id = spriteFrameTimers.get(el);
  if (id != null) {
    clearInterval(id);
    spriteFrameTimers.delete(el);
  }

  const variantId = el?.dataset.frameVariant;
  const frames = variantId && getSpriteFrameSrcs(variantId, el?.dataset.frameTheme);
  const img = getFrameAnimImg(el);
  if (img && frames) {
    img.src = frames[1] ?? frames[0];
    img.style.removeProperty("--float-dur");
  }
  if (el) {
    el.classList.remove("encyclopedia-detail__graphic--float");
    delete el.dataset.frameVariant;
    delete el.dataset.frameTheme;
  }
}

function shouldAnimateSpriteFrames(pet) {
  if (!pet?.isAlive || pet.isSleeping) return false;
  if (prefersReducedMotion()) return false;
  if (typeof document !== "undefined" && document.body.classList.contains("capture-mode")) return false;
  if (getEvolutionStage(pet).id !== "adult") return false;
  return Boolean(getAdultSpriteFrameConfig(pet.adultVariantId, pet.speciesTheme));
}

function syncSpriteFrames(el, pet) {
  stopSpriteFrames(el);
  if (!el || !shouldAnimateSpriteFrames(pet)) return;

  const config = getSpriteFrameConfig(pet.adultVariantId, pet.speciesTheme);
  const frames = getSpriteFrameSrcs(pet.adultVariantId, pet.speciesTheme);
  const img = el.querySelector("img.pet-evolution-img");
  if (!img || !frames || !config) return;

  img.onerror = null;
  img.onload = null;
  img.hidden = false;
  img.style.display = "";
  delete img.dataset.retryBust;
  const fallback = el.querySelector(".pet-evolution-fallback, .pet-sprite-fallback");
  if (fallback) fallback.hidden = true;

  if (config.floatBob && config.floatBobSec) {
    img.style.setProperty("--float-dur", `${config.floatBobSec}s`);
  }

  el.dataset.frameVariant = pet.adultVariantId;
  el.dataset.frameTheme = normalizeSpeciesTheme(pet.speciesTheme);
  let frame = 0;
  const tick = () => {
    img.src = frames[frame % frames.length];
    frame += 1;
  };
  tick();
  spriteFrameTimers.set(el, setInterval(tick, config.frameMs));
}

/** 도감 성체 상세 — 3프레임 idle (테마별 frame config) */
function startEncyclopediaFrameLoop(container, variantId, speciesTheme) {
  const config = getSpriteFrameConfig(variantId, speciesTheme);
  const frames = getSpriteFrameSrcs(variantId, speciesTheme);
  const img = getFrameAnimImg(container);
  if (!config || !frames || !img) return false;

  for (const src of frames) {
    preloadSpriteMeta({ src });
  }

  img.onerror = null;
  img.onload = null;
  img.hidden = false;
  img.style.display = "";
  delete img.dataset.retryBust;
  const fallback = container.querySelector(".encyclopedia-card__emoji");
  if (fallback) fallback.hidden = true;

  container.dataset.frameVariant = variantId;
  container.dataset.frameTheme = normalizeSpeciesTheme(speciesTheme);
  let frame = 0;
  const tick = () => {
    img.src = frames[frame % frames.length];
    frame += 1;
  };
  tick();
  spriteFrameTimers.set(container, setInterval(tick, config.frameMs));
  return true;
}

function shouldEncyclopediaNeungeoWalk(variantId, speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  return theme === "mermaid" && (variantId === "scruffy" || variantId === "grumpy");
}

export function hasEncyclopediaAdultDisplay(variantId, speciesTheme) {
  return (
    hasAdultSpriteFrameAnimation(variantId, speciesTheme) ||
    shouldEncyclopediaNeungeoWalk(variantId, speciesTheme)
  );
}

function applyEncyclopediaNeungeoWalkPresentation(container, variantId) {
  container.classList.add("encyclopedia-detail__graphic--neungeo-walk");
  if (variantId === "scruffy") {
    container.classList.add(
      "encyclopedia-detail__graphic--neungeo-scruffy",
      "encyclopedia-card__graphic--neungeo-scruffy",
    );
  }
}

function applyEncyclopediaFramePresentation(container, variantId, speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  container.classList.remove(
    "encyclopedia-detail__graphic--float",
    "encyclopedia-detail__graphic--jinju-yeoin",
    "encyclopedia-card__graphic--jinju-yeoin",
    "encyclopedia-detail__graphic--cheongryeong-yeoin",
    "encyclopedia-card__graphic--cheongryeong-yeoin",
  );

  const config = getSpriteFrameConfig(variantId, theme);
  if (!config) return;

  if (config.floatBob && config.floatBobSec) {
    container.classList.add("encyclopedia-detail__graphic--float");
    const img = getFrameAnimImg(container);
    img?.style.setProperty("--float-dur", `${config.floatBobSec}s`);
  }
  if (theme === "mermaid" && variantId === "golden") {
    container.classList.add(
      "encyclopedia-detail__graphic--jinju-yeoin",
      "encyclopedia-card__graphic--jinju-yeoin",
    );
  }
  if (theme === "mermaid" && variantId === "sparkle") {
    container.classList.add(
      "encyclopedia-detail__graphic--cheongryeong-yeoin",
      "encyclopedia-card__graphic--cheongryeong-yeoin",
    );
  }
}

/** 도감 성체 상세 — 3프레임 idle 또는 인어 걷기 */
export function syncEncyclopediaAdultDisplay(container, variantId, speciesTheme) {
  stopEncyclopediaAdultFrames(container);
  if (!container || prefersReducedMotion()) return;
  if (typeof document !== "undefined" && document.body.classList.contains("capture-mode")) return;

  const theme = normalizeSpeciesTheme(speciesTheme);
  if (startEncyclopediaFrameLoop(container, variantId, theme)) {
    applyEncyclopediaFramePresentation(container, variantId, theme);
    return;
  }

  if (shouldEncyclopediaNeungeoWalk(variantId, theme)) {
    applyEncyclopediaNeungeoWalkPresentation(container, variantId);
  }
}

/** DOM 페인트 후 도감 액션 시작 (3프레임 idle·능어/핀백 걷기, 상세·그리드 공통) */
export function scheduleEncyclopediaAdultDisplay(container, variantId, speciesTheme) {
  if (!container || !hasEncyclopediaAdultDisplay(variantId, speciesTheme)) return;
  requestAnimationFrame(() => {
    syncEncyclopediaAdultDisplay(container, variantId, speciesTheme);
  });
}

/** @deprecated use syncEncyclopediaAdultDisplay */
export function syncEncyclopediaAdultFrames(container, variantId, speciesTheme) {
  syncEncyclopediaAdultDisplay(container, variantId, speciesTheme);
}

export function stopEncyclopediaAdultFrames(container) {
  stopSpriteFrames(container);
  container?.classList.remove(
    "encyclopedia-detail__graphic--neungeo-walk",
    "encyclopedia-detail__graphic--neungeo-scruffy",
    "encyclopedia-card__graphic--neungeo-scruffy",
    "encyclopedia-detail__graphic--jinju-yeoin",
    "encyclopedia-card__graphic--jinju-yeoin",
    "encyclopedia-detail__graphic--cheongryeong-yeoin",
    "encyclopedia-card__graphic--cheongryeong-yeoin",
  );
}

export function prefersReducedMotion() {
  return reducedMotionQuery.matches;
}

export function playEvolutionTransition(el) {
  if (!el) return;

  el.classList.remove("pet-evolution--evolving", "pet-evolution--bounce");
  void el.offsetWidth;

  if (prefersReducedMotion()) {
    el.classList.add("pet-evolution--bounce");
    return;
  }

  el.classList.add("pet-evolution--evolving");
  const onEnd = () => {
    el.classList.remove("pet-evolution--evolving");
    el.removeEventListener("animationend", onEnd);
  };
  el.addEventListener("animationend", onEnd);
}

export function playMoodTransition(bubbleEl) {
  if (!bubbleEl || prefersReducedMotion()) return;

  bubbleEl.classList.remove("pet-mood-bubble--changing");
  void bubbleEl.offsetWidth;
  bubbleEl.classList.add("pet-mood-bubble--changing");

  const onEnd = () => {
    bubbleEl.classList.remove("pet-mood-bubble--changing");
    bubbleEl.removeEventListener("animationend", onEnd);
  };
  bubbleEl.addEventListener("animationend", onEnd);
}

export function applyIdleClasses(el, pet) {
  if (!el || !pet) return;

  stopSpriteFrames(el);

  const displayEl = el.closest(".pet-display");
  const stageId = !pet.isAlive ? "dead" : getEvolutionStage(pet).id;

  el.setAttribute("data-stage", stageId);
  if (displayEl) displayEl.setAttribute("data-stage", stageId);

  el.classList.remove(
    "pet-evolution--idle",
    "pet-evolution--sleep-idle",
    "pet-evolution--variant-pretty",
    "pet-evolution--variant-normal",
    "pet-evolution--variant-defective",
    "pet-evolution--neungeo-walk",
    "pet-evolution--neungeo-scruffy",
    "pet-evolution--jinju-yeoin",
    "pet-evolution--cheongryeong-yeoin",
    "pet-evolution--sprite-frames",
    "pet-evolution--mermaid-frames",
    "pet-evolution--deepsea-float",
  );

  if (!pet.isAlive) {
    el.removeAttribute("data-variant");
    if (displayEl) displayEl.removeAttribute("data-variant");
    return;
  }

  if (pet.isSleeping) {
    el.classList.add("pet-evolution--sleep-idle");
  } else {
    el.classList.add("pet-evolution--idle");
  }

  const stage = getEvolutionStage(pet);
  if (stage.id === "adult" && pet.adultVariantId) {
    const variant = getAdultVariant(pet.adultVariantId);
    el.setAttribute("data-variant", variant.tier);
    if (displayEl) displayEl.setAttribute("data-variant", variant.tier);
    el.classList.add(`pet-evolution--variant-${variant.tier}`);

    // 능어·핀백 어인(인어 scruffy/grumpy) 전용: 좌우 왕복 + 오른쪽 이동 시 반전
    const theme = normalizeSpeciesTheme(pet.speciesTheme);
    if (
      theme === "mermaid" &&
      !pet.isSleeping &&
      (pet.adultVariantId === "scruffy" || pet.adultVariantId === "grumpy")
    ) {
      el.classList.add("pet-evolution--neungeo-walk");
      if (pet.adultVariantId === "scruffy") {
        el.classList.add("pet-evolution--neungeo-scruffy");
      }
    }

    if (theme === "mermaid" && !pet.isSleeping && pet.adultVariantId === "golden") {
      el.classList.add("pet-evolution--jinju-yeoin");
    }

    if (theme === "mermaid" && !pet.isSleeping && pet.adultVariantId === "sparkle") {
      el.classList.add("pet-evolution--cheongryeong-yeoin");
    }

    // 3프레임 idle: 진주 여인·청령·주머니귀오징어·갯민숭달팽이·심해아귀·인면어(plain)·녹면어(sickly) 등
    const frameConfig = getSpriteFrameConfig(pet.adultVariantId, theme);
    if (!pet.isSleeping && frameConfig) {
      el.classList.add("pet-evolution--sprite-frames", "pet-evolution--mermaid-frames");
      if (frameConfig.floatBob) {
        el.classList.add("pet-evolution--deepsea-float");
      }
    }
  } else {
    el.removeAttribute("data-variant");
    if (displayEl) displayEl.removeAttribute("data-variant");
  }

  syncSpriteFrames(el, pet);
}

const CARE_EDGE_GAP_CM = 0.45;
const CM_TO_PX_FALLBACK = 96 / 2.54;
const PARTICLE_HALF_FALLBACK_PX = 18;

let cmProbe;

const CARE_FALLBACK = {
  feed: "🍎",
  play: "🎾",
  clean: "🧹",
  sleep: "🌙",
  wake: "☀️",
};

/** Orbit angle (0° = right, clockwise; 90° = down) — pet 가장자리 밖 */
const CARE_ORBIT_ANGLE = {
  feed: 315,
  play: 350,
  clean: 200,
  sleep: 240,
  wake: 270,
};

let activeCareFx = 0;
const MAX_CARE_FX = 3;

function cmToPx(cm) {
  if (!cmProbe) {
    cmProbe = document.createElement("div");
    cmProbe.style.cssText =
      "position:absolute;visibility:hidden;width:1cm;height:1cm;pointer-events:none";
    document.body.append(cmProbe);
  }
  const unit = cmProbe.getBoundingClientRect().width;
  return (unit > 0 ? unit : CM_TO_PX_FALLBACK) * cm;
}

function resolvePetAnchor(petArea) {
  const root = petArea?.querySelector("#pet-evolution");
  if (!root) return null;

  const img = root.querySelector("img.pet-evolution-img:not([hidden])");
  if (img) {
    const rect = img.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) return img;
  }

  const fallback = root.querySelector(
    ".pet-evolution-fallback, .pet-sprite-fallback:not([hidden])",
  );
  if (fallback) {
    const rect = fallback.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) return fallback;
  }

  const rootRect = root.getBoundingClientRect();
  return rootRect.width > 1 && rootRect.height > 1 ? root : null;
}

function orbitPoint(angleDeg, anchorEl, layerEl, particleHalf) {
  const anchor = anchorEl.getBoundingClientRect();
  const layer = layerEl.getBoundingClientRect();
  if (anchor.width < 1 || layer.width < 1) return null;

  const cx = anchor.left + anchor.width / 2 - layer.left;
  const cy = anchor.top + anchor.height / 2 - layer.top;
  const anchorHalf = Math.max(anchor.width, anchor.height) / 2;
  const radius = anchorHalf + particleHalf + cmToPx(CARE_EDGE_GAP_CM);
  const rad = (angleDeg * Math.PI) / 180;

  const pad = particleHalf + 6;
  const x = Math.min(Math.max(cx + Math.cos(rad) * radius, pad), layer.width - pad);
  const y = Math.min(Math.max(cy + Math.sin(rad) * radius, pad), layer.height - pad);

  return { x, y, cx, cy };
}

function createCareParticle(actionKey, spriteId, angleDeg, anchorEl, layerEl) {
  const meta = getUiSpriteMeta(spriteId, CARE_FALLBACK[spriteId] ?? "✨", actionKey);
  const particle = document.createElement("span");
  particle.className = `care-fx__particle care-fx__particle--${actionKey}`;

  const img = document.createElement("img");
  img.className = "care-fx__img";
  img.alt = "";
  img.decoding = "async";
  img.src = meta.src;

  const fallback = document.createElement("span");
  fallback.className = "care-fx__fallback";
  fallback.textContent = meta.fallbackEmoji;
  fallback.hidden = true;

  img.onerror = () => {
    img.hidden = true;
    fallback.hidden = false;
  };
  img.onload = () => {
    img.hidden = false;
    fallback.hidden = true;
    positionParticle(particle, angleDeg, anchorEl, layerEl);
  };

  particle.append(img, fallback);
  layerEl.append(particle);

  if (img.complete && img.naturalWidth > 0) {
    img.onload();
  } else if (img.complete) {
    img.onerror();
  } else {
    positionParticle(particle, angleDeg, anchorEl, layerEl);
  }

  return particle;
}

function positionParticle(particle, angleDeg, anchorEl, layerEl) {
  const half = particle.getBoundingClientRect().width / 2 || PARTICLE_HALF_FALLBACK_PX;
  const point = orbitPoint(angleDeg, anchorEl, layerEl, half);
  if (!point) return;

  particle.style.left = `${point.x}px`;
  particle.style.top = `${point.y}px`;

  const driftX = point.x - point.cx;
  particle.style.setProperty("--care-drift-x", `${Math.max(-24, Math.min(24, driftX * 0.35))}px`);
  particle.style.setProperty("--care-bounce-dir", driftX < 0 ? "-1" : "1");
  particle.style.setProperty("--care-orbit-angle", `${angleDeg}deg`);
}

export function playCareEffect(actionKey, containerEl) {
  const petArea = containerEl ?? document.getElementById("pet-area");
  const layer = petArea?.querySelector("#care-fx") ?? document.getElementById("care-fx");
  const angle = CARE_ORBIT_ANGLE[actionKey];
  if (!layer || angle == null) return;
  if (activeCareFx >= MAX_CARE_FX) return;

  const anchor = resolvePetAnchor(petArea);
  if (!anchor) return;

  const reduced = prefersReducedMotion();
  activeCareFx += 1;
  const particle = createCareParticle(actionKey, actionKey, angle, anchor, layer);

  const cleanup = () => {
    particle.remove();
    activeCareFx = Math.max(0, activeCareFx - 1);
  };
  particle.addEventListener("animationend", cleanup, { once: true });
  setTimeout(cleanup, reduced ? 120 : 900);
}
