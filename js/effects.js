import { getEvolutionStage } from "./evolution.js";
import { getAdultVariant } from "./adultVariants.js";

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

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
  } else {
    el.removeAttribute("data-variant");
    if (displayEl) displayEl.removeAttribute("data-variant");
  }
}

const CARE_PARTICLES = {
  feed: ["🍎", "🥕", "🍞"],
  play: ["⭐", "🎾", "✨"],
  clean: ["🧹", "✨", "💨"],
};

let activeCareFx = 0;
const MAX_CARE_FX = 5;

export function playCareEffect(actionKey, containerEl) {
  const layer =
    containerEl?.querySelector("#care-fx") ?? document.getElementById("care-fx");
  if (!layer || !CARE_PARTICLES[actionKey]) return;
  if (activeCareFx >= MAX_CARE_FX) return;

  const particles = CARE_PARTICLES[actionKey];
  const count = 3 + Math.floor(Math.random() * 2);

  for (let i = 0; i < count; i += 1) {
    activeCareFx += 1;
    const span = document.createElement("span");
    span.className = "care-fx__particle";
    span.textContent = particles[i % particles.length];
    span.style.left = `${35 + Math.random() * 30}%`;
    span.style.animationDelay = `${i * 0.08}s`;
    layer.append(span);

    const cleanup = () => {
      span.remove();
      activeCareFx = Math.max(0, activeCareFx - 1);
    };
    span.addEventListener("animationend", cleanup, { once: true });
    setTimeout(cleanup, prefersReducedMotion() ? 100 : 700);
  }
}
