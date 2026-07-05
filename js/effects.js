import { getEvolutionStage } from "./evolution.js";
import { getAdultVariant } from "./adultVariants.js";
import { getUiSpriteMeta } from "./sprites.js";
import { normalizeSpeciesTheme } from "./speciesThemes.js";

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const MERMAID_SPRITE_FRAMES = {
  sickly: [
    "assets/sprites/mermaid/adult/sickly-frame-1.png",
    "assets/sprites/mermaid/adult/sickly.png",
    "assets/sprites/mermaid/adult/sickly-frame-3.png",
  ],
  sparkle: [
    "assets/sprites/mermaid/adult/sparkle-frame-1.png",
    "assets/sprites/mermaid/adult/sparkle.png",
    "assets/sprites/mermaid/adult/sparkle-frame-3.png",
  ],
};
const MERMAID_FRAME_MS = 700;
const mermaidFrameTimers = new WeakMap();

function mermaidFrameSrc(path) {
  if (typeof document === "undefined") return path;
  const v = document.querySelector('meta[name="app-version"]')?.content || "";
  return v ? `${path}?v=${encodeURIComponent(v)}` : path;
}

function stopMermaidSpriteFrames(el) {
  const id = mermaidFrameTimers.get(el);
  if (id == null) return;
  clearInterval(id);
  mermaidFrameTimers.delete(el);
  const variantId = el?.dataset.frameVariant;
  const frames = variantId && MERMAID_SPRITE_FRAMES[variantId];
  const img = el?.querySelector("img.pet-evolution-img:not([hidden])");
  if (img && frames) img.src = mermaidFrameSrc(frames[1]);
  if (el) delete el.dataset.frameVariant;
}

function shouldAnimateMermaidFrames(pet) {
  if (!pet?.isAlive || pet.isSleeping) return false;
  if (prefersReducedMotion()) return false;
  if (typeof document !== "undefined" && document.body.classList.contains("capture-mode")) return false;
  const theme = normalizeSpeciesTheme(pet.speciesTheme);
  return (
    theme === "mermaid" &&
    getEvolutionStage(pet).id === "adult" &&
    Boolean(MERMAID_SPRITE_FRAMES[pet.adultVariantId])
  );
}

function syncMermaidSpriteFrames(el, pet) {
  stopMermaidSpriteFrames(el);
  if (!el || !shouldAnimateMermaidFrames(pet)) return;

  const frames = MERMAID_SPRITE_FRAMES[pet.adultVariantId];
  const img = el.querySelector("img.pet-evolution-img:not([hidden])");
  if (!img) return;

  el.dataset.frameVariant = pet.adultVariantId;
  let frame = 0;
  const tick = () => {
    img.src = mermaidFrameSrc(frames[frame % frames.length]);
    frame += 1;
  };
  tick();
  mermaidFrameTimers.set(el, setInterval(tick, MERMAID_FRAME_MS));
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

  stopMermaidSpriteFrames(el);

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
    "pet-evolution--mermaid-frames",
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
    }

    // 3프레임 idle: 겹얼굴(sickly)·청령(sparkle) 등
    if (
      theme === "mermaid" &&
      !pet.isSleeping &&
      MERMAID_SPRITE_FRAMES[pet.adultVariantId]
    ) {
      el.classList.add("pet-evolution--mermaid-frames");
    }
  } else {
    el.removeAttribute("data-variant");
    if (displayEl) displayEl.removeAttribute("data-variant");
  }

  syncMermaidSpriteFrames(el, pet);
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
