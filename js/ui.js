import { getAgeDays, getGameOverReason } from "./pet.js";
import { getEvolutionStage } from "./evolution.js";
import { getAdultVariant, ADULT_VARIANTS } from "./adultVariants.js";
import {
  getEncyclopediaSlots,
  getCollectedCount,
  formatAchievedDate,
} from "./encyclopedia.js";
import {
  isSpritesEnabled,
  getEvolutionSpriteMeta,
  getMoodSpriteMeta,
  getVariantSpriteMeta,
  getUiSpriteMeta,
  getStageSpriteMeta,
  preloadSpritesForPet,
} from "./sprites.js";
import { playSfx } from "./audio.js";
import {
  playEvolutionTransition,
  playMoodTransition,
  applyIdleClasses,
} from "./effects.js";

const elements = {
  petName: document.getElementById("pet-name"),
  petAge: document.getElementById("pet-age"),
  petStage: document.getElementById("pet-stage"),
  petEvolution: document.getElementById("pet-evolution"),
  petMoodBubble: document.getElementById("pet-mood-bubble"),
  petMoodEmoji: document.getElementById("pet-mood-emoji"),
  petArea: document.getElementById("pet-area"),
  message: document.getElementById("message"),
  actions: document.getElementById("actions"),
  gameOverOverlay: document.getElementById("game-over-overlay"),
  gameOverGraphic: document.getElementById("game-over-graphic"),
  gameOverTitle: document.getElementById("game-over-title"),
  gameOverText: document.getElementById("game-over-text"),
  nameOverlay: document.getElementById("name-overlay"),
  nameInput: document.getElementById("name-input"),
  encyclopediaOverlay: document.getElementById("encyclopedia-overlay"),
  encyclopediaGrid: document.getElementById("encyclopedia-grid"),
  encyclopediaCount: document.getElementById("encyclopedia-count"),
  graduateOverlay: document.getElementById("graduate-overlay"),
  graduateGraphic: document.getElementById("graduate-graphic"),
  graduateText: document.getElementById("graduate-text"),
  newPetFab: document.getElementById("btn-new-pet-side"),
  bars: {
    hunger: document.getElementById("bar-hunger"),
    happiness: document.getElementById("bar-happiness"),
    cleanliness: document.getElementById("bar-cleanliness"),
    health: document.getElementById("bar-health"),
  },
  values: {
    hunger: document.getElementById("val-hunger"),
    happiness: document.getElementById("val-happiness"),
    cleanliness: document.getElementById("val-cleanliness"),
    health: document.getElementById("val-health"),
  },
  buttons: {
    feed: document.getElementById("btn-feed"),
    play: document.getElementById("btn-play"),
    clean: document.getElementById("btn-clean"),
    sleep: document.getElementById("btn-sleep"),
  },
};

let messageTimeout = null;
let gameOverSoundNotified = false;
let lastEvolutionKey = null;
let lastMoodKey = null;

function getStageLabel(pet) {
  const stage = getEvolutionStage(pet);
  if (stage.id === "adult" && pet.adultVariantId) {
    return getAdultVariant(pet.adultVariantId).label;
  }
  return stage.label;
}

function applyEmojiFallback(container, emoji, className = "pet-sprite-fallback") {
  container.innerHTML = "";
  const span = document.createElement("span");
  span.className = className;
  span.textContent = emoji;
  container.append(span);
  return emoji;
}

export function setPetGraphic(container, meta, { imgClass = "pet-evolution-img", sizeClass = "" } = {}) {
  if (!container || !meta) return null;

  if (!isSpritesEnabled()) {
    return applyEmojiFallback(container, meta.fallbackEmoji, imgClass.includes("mood") ? "pet-mood-fallback" : "pet-evolution-fallback");
  }

  const currentKey = container.dataset.spriteKey;
  const isNewKey = currentKey !== meta.key;

  const fallbackSelector = ".pet-sprite-fallback, .pet-mood-fallback, .pet-evolution-fallback";
  let img = container.querySelector("img.pet-sprite");
  let fallback = container.querySelector(fallbackSelector);

  if (!img) {
    container.innerHTML = "";
    img = document.createElement("img");
    img.className = `pet-sprite ${imgClass}${sizeClass ? ` ${sizeClass}` : ""}`;
    img.alt = meta.alt || "";
    fallback = document.createElement("span");
    fallback.className = imgClass.includes("mood") ? "pet-mood-fallback" : "pet-sprite-fallback";
    fallback.hidden = true;
    container.append(img, fallback);

    img.addEventListener("error", () => {
      img.hidden = true;
      if (fallback) {
        fallback.hidden = false;
        fallback.textContent = meta.fallbackEmoji;
      }
    });
  } else if (!fallback) {
    fallback = document.createElement("span");
    fallback.className = imgClass.includes("mood") ? "pet-mood-fallback" : "pet-sprite-fallback";
    fallback.hidden = true;
    container.append(fallback);
  }

  container.dataset.spriteKey = meta.key;

  if (isNewKey || !img.getAttribute("src")?.endsWith(meta.src)) {
    img.hidden = false;
    if (fallback) fallback.hidden = true;
    img.src = meta.src;
    img.alt = meta.alt || "";
  }

  return meta.key;
}

function setOverlayGraphic(container, meta) {
  if (!container) return;
  setPetGraphic(container, meta, { imgClass: "overlay-graphic-img", sizeClass: "overlay-graphic-img--small" });
}

export function renderPet(pet) {
  elements.petName.textContent = pet.name;
  elements.petAge.textContent = `${getAgeDays(pet)}일째`;
  elements.petStage.textContent = getStageLabel(pet);

  const evolutionMeta = getEvolutionSpriteMeta(pet);
  const evolutionKey = setPetGraphic(elements.petEvolution, evolutionMeta, {
    imgClass: "pet-evolution-img",
  });

  if (evolutionKey && evolutionKey !== lastEvolutionKey) {
    playEvolutionTransition(elements.petEvolution);
    lastEvolutionKey = evolutionKey;
  }

  const moodMeta = getMoodSpriteMeta(pet);
  if (moodMeta && elements.petMoodBubble) {
    const moodChanged = moodMeta.key !== lastMoodKey;
    elements.petMoodBubble.hidden = false;
    setPetGraphic(elements.petMoodEmoji, moodMeta, { imgClass: "pet-mood-img" });
    if (moodChanged) {
      playMoodTransition(elements.petMoodBubble);
      lastMoodKey = moodMeta.key;
    }
  } else if (elements.petMoodBubble) {
    elements.petMoodBubble.hidden = true;
    elements.petMoodEmoji.innerHTML = "";
    delete elements.petMoodEmoji.dataset.spriteKey;
    lastMoodKey = null;
  }

  elements.petArea.classList.toggle("pet-area--sleeping", pet.isSleeping);
  applyIdleClasses(elements.petEvolution, pet);

  updateStat("hunger", pet.hunger);
  updateStat("happiness", pet.happiness);
  updateStat("cleanliness", pet.cleanliness);
  updateStat("health", pet.health);

  updateButtons(pet);
  updateGameOver(pet);
  updateNewPetFab(pet);
  preloadSpritesForPet(pet);
}

function updateStat(key, value) {
  const rounded = Math.round(value);
  elements.bars[key].style.width = `${rounded}%`;
  elements.values[key].textContent = String(rounded);
}

function updateButtons(pet) {
  const alive = pet.isAlive;
  const sleeping = pet.isSleeping;
  const blockCare = !alive || sleeping;

  for (const key of ["feed", "play", "clean"]) {
    const btn = elements.buttons[key];
    if (!btn) continue;
    btn.disabled = blockCare;
    btn.toggleAttribute("inert", blockCare);
  }

  if (elements.buttons.sleep) {
    elements.buttons.sleep.disabled = !alive;
    elements.buttons.sleep.removeAttribute("inert");
    const label = elements.buttons.sleep.querySelector("span:last-child");
    if (label) {
      label.textContent = sleeping ? "깨우기" : "재우기";
    }
  }

  if (elements.actions) {
    elements.actions.classList.toggle("actions--care-blocked", sleeping && alive);
  }
}

/** Sleep toggle 직후 버튼·배경만 즉시 반영 */
export function syncSleepControls(pet) {
  if (!pet) return;
  if (elements.petArea) {
    elements.petArea.classList.toggle("pet-area--sleeping", pet.isSleeping);
  }
  applyIdleClasses(elements.petEvolution, pet);
  updateButtons(pet);
}

function updateNewPetFab(pet) {
  if (!elements.newPetFab) return;
  const show =
    pet.isAlive &&
    getEvolutionStage(pet).id === "adult" &&
    Boolean(pet.adultVariantId);
  elements.newPetFab.hidden = !show;
}

function updateGameOver(pet) {
  if (pet.isAlive) {
    elements.gameOverOverlay.hidden = true;
    elements.actions.hidden = false;
    gameOverSoundNotified = false;
    return;
  }

  const age = getAgeDays(pet);
  elements.gameOverTitle.textContent = `${pet.name}가 떠났어요...`;

  if (age > 0) {
    elements.gameOverText.textContent = `${age}일 동안 함께했어요. 새 친구를 만나볼까요?`;
  } else if (getGameOverReason(pet) === "health") {
    elements.gameOverText.textContent = "건강이 너무 나빠졌어요. 다음엔 더 잘 돌봐줄 수 있을까요?";
  } else {
    elements.gameOverText.textContent = "너무 오래 방치했어요. 다음엔 더 잘 돌봐줄 수 있을까요?";
  }

  setOverlayGraphic(
    elements.gameOverGraphic,
    getUiSpriteMeta("heart-broken", "💔", "게임 오버"),
  );

  elements.gameOverOverlay.hidden = false;
  elements.actions.hidden = true;
  if (elements.newPetFab) elements.newPetFab.hidden = true;

  if (!gameOverSoundNotified) {
    gameOverSoundNotified = true;
    playSfx("gameover");
  }
}

export function showMessage(text, durationMs = 4000) {
  elements.message.textContent = text;
  elements.message.hidden = false;

  if (messageTimeout) clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    elements.message.hidden = true;
  }, durationMs);
}

export function isMessageVisible() {
  return !elements.message.hidden;
}

export function showNameModal() {
  elements.nameOverlay.hidden = false;
  elements.gameOverOverlay.hidden = true;
  elements.graduateOverlay.hidden = true;
  elements.nameInput.value = "";
  elements.nameInput.focus();
  setGameActive(false);
}

export function hideNameModal() {
  elements.nameOverlay.hidden = true;
}

export function showGraduateModal(pet) {
  elements.graduateText.textContent =
    `지금 키우는 ${pet.name}은 도감에 남고, 새 알부터 시작할까요?`;
  setOverlayGraphic(
    elements.graduateGraphic,
    getStageSpriteMeta("baby", "🐠", "새 펫"),
  );
  elements.graduateOverlay.hidden = false;
}

export function hideGraduateModal() {
  elements.graduateOverlay.hidden = true;
}

function createEncyclopediaGraphic(meta, locked = false) {
  const wrap = document.createElement("div");
  wrap.className = "encyclopedia-card__graphic";

  if (locked) {
    setPetGraphic(wrap, getUiSpriteMeta("locked", "❓", "미수집"), {
      imgClass: "encyclopedia-card__img",
    });
    return wrap;
  }

  setPetGraphic(wrap, meta, { imgClass: "encyclopedia-card__img" });
  return wrap;
}

export function renderEncyclopedia() {
  const slots = getEncyclopediaSlots();
  const collectedVariants = new Set(
    slots.filter((s) => s.collected).map((s) => s.variant.id),
  );

  elements.encyclopediaCount.textContent =
    `수집 ${collectedVariants.size} / ${ADULT_VARIANTS.length}`;

  elements.encyclopediaGrid.innerHTML = "";

  for (const slot of slots) {
    const card = document.createElement("div");
    card.className = `encyclopedia-card${slot.collected ? "" : " encyclopedia-card--locked"}`;

    const graphic = slot.collected
      ? createEncyclopediaGraphic(getVariantSpriteMeta(slot.variant))
      : createEncyclopediaGraphic(null, true);

    const label = document.createElement("span");
    label.className = "encyclopedia-card__label";
    label.textContent = slot.collected ? slot.variant.label : "???";

    card.append(graphic, label);

    if (slot.collected && slot.entries[0]) {
      const entry = slot.entries[0];

      const name = document.createElement("span");
      name.className = "encyclopedia-card__name";
      name.textContent = entry.petName || "이름 없음";

      const tier = document.createElement("span");
      tier.className = "encyclopedia-card__tier";
      tier.textContent =
        slot.variant.tier === "pretty"
          ? "예쁜"
          : slot.variant.tier === "defective"
            ? "불량"
            : "보통";

      const date = document.createElement("span");
      date.className = "encyclopedia-card__date";
      date.textContent = formatAchievedDate(entry.achievedAt);

      card.append(name, tier, date);
    }

    elements.encyclopediaGrid.append(card);
  }
}

export function showEncyclopedia() {
  renderEncyclopedia();
  elements.encyclopediaOverlay.hidden = false;
}

export function hideEncyclopedia() {
  elements.encyclopediaOverlay.hidden = true;
}

export function setGameActive(active) {
  elements.actions.hidden = !active;
  if (!active) {
    lastEvolutionKey = null;
    setPetGraphic(
      elements.petEvolution,
      getStageSpriteMeta("egg", "🥚", "알"),
      { imgClass: "pet-evolution-img" },
    );
    elements.petMoodBubble.hidden = true;
    elements.petMoodEmoji.innerHTML = "";
    elements.petName.textContent = "???";
    elements.petAge.textContent = "이름을 지어주세요";
    elements.petStage.textContent = "알";
    if (elements.newPetFab) elements.newPetFab.hidden = true;
    Object.keys(elements.buttons).forEach((key) => {
      elements.buttons[key].disabled = true;
    });
  }
}

export function resetGraphicAnimationState() {
  lastEvolutionKey = null;
  lastMoodKey = null;
}

export function refreshAllGraphics(pet) {
  if (pet) renderPet(pet);
  renderEncyclopedia();
}

export function getEnteredName() {
  return elements.nameInput.value.trim();
}

export function getElements() {
  return elements;
}

export function getCollectedCountForDisplay() {
  return getCollectedCount();
}
