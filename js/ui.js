import { getAgeDays, getEvolutionEmoji, getMoodEmoji, getGameOverReason } from "./pet.js";
import { getEvolutionStage } from "./evolution.js";
import { getEvolutionDisplayEmoji, getAdultVariant, ADULT_VARIANTS } from "./adultVariants.js";
import {
  getEncyclopediaSlots,
  getCollectedCount,
  formatAchievedDate,
} from "./encyclopedia.js";
import { playSfx } from "./audio.js";

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
  gameOverTitle: document.getElementById("game-over-title"),
  gameOverText: document.getElementById("game-over-text"),
  nameOverlay: document.getElementById("name-overlay"),
  nameInput: document.getElementById("name-input"),
  encyclopediaOverlay: document.getElementById("encyclopedia-overlay"),
  encyclopediaGrid: document.getElementById("encyclopedia-grid"),
  encyclopediaCount: document.getElementById("encyclopedia-count"),
  graduateOverlay: document.getElementById("graduate-overlay"),
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

function getDisplayEvolutionEmoji(pet) {
  if (!pet.isAlive) return "👻";
  const stage = getEvolutionStage(pet);
  if (stage.id === "adult") {
    return getEvolutionDisplayEmoji(pet);
  }
  return getEvolutionEmoji(pet);
}

function getStageLabel(pet) {
  const stage = getEvolutionStage(pet);
  if (stage.id === "adult" && pet.adultVariantId) {
    return getAdultVariant(pet.adultVariantId).label;
  }
  return stage.label;
}

export function renderPet(pet) {
  elements.petName.textContent = pet.name;
  elements.petAge.textContent = `${getAgeDays(pet)}일째`;
  elements.petStage.textContent = getStageLabel(pet);

  const evolutionEmoji = getDisplayEvolutionEmoji(pet);
  const domEvolution = elements.petEvolution.textContent;

  if (domEvolution !== evolutionEmoji) {
    elements.petEvolution.classList.remove("pet-evolution--bounce");
    void elements.petEvolution.offsetWidth;
    elements.petEvolution.classList.add("pet-evolution--bounce");
  }
  elements.petEvolution.textContent = evolutionEmoji;

  const moodEmoji = getMoodEmoji(pet);
  if (moodEmoji) {
    elements.petMoodBubble.hidden = false;
    elements.petMoodEmoji.textContent = moodEmoji;
  } else {
    elements.petMoodBubble.hidden = true;
  }

  elements.petArea.classList.toggle("pet-area--sleeping", pet.isSleeping);

  updateStat("hunger", pet.hunger);
  updateStat("happiness", pet.happiness);
  updateStat("cleanliness", pet.cleanliness);
  updateStat("health", pet.health);

  updateButtons(pet);
  updateGameOver(pet);
  updateNewPetFab(pet);
}

function updateStat(key, value) {
  const rounded = Math.round(value);
  elements.bars[key].style.width = `${rounded}%`;
  elements.values[key].textContent = String(rounded);
}

function updateButtons(pet) {
  const alive = pet.isAlive;
  const sleeping = pet.isSleeping;

  elements.buttons.feed.disabled = !alive || sleeping;
  elements.buttons.play.disabled = !alive || sleeping;
  elements.buttons.clean.disabled = !alive || sleeping;
  elements.buttons.sleep.disabled = !alive;

  elements.buttons.sleep.querySelector("span:last-child").textContent = sleeping
    ? "깨우기"
    : "재우기";
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
  elements.graduateOverlay.hidden = false;
}

export function hideGraduateModal() {
  elements.graduateOverlay.hidden = true;
}

export function renderEncyclopedia() {
  const slots = getEncyclopediaSlots();
  const collectedVariants = new Set(
    slots.filter((s) => s.collected).map((s) => s.variant.id)
  );

  elements.encyclopediaCount.textContent =
    `수집 ${collectedVariants.size} / ${ADULT_VARIANTS.length}`;

  elements.encyclopediaGrid.innerHTML = "";

  for (const slot of slots) {
    const card = document.createElement("div");
    card.className = `encyclopedia-card${slot.collected ? "" : " encyclopedia-card--locked"}`;

    const emoji = document.createElement("span");
    emoji.className = "encyclopedia-card__emoji";
    emoji.textContent = slot.collected ? slot.variant.emoji : "❓";

    const label = document.createElement("span");
    label.className = "encyclopedia-card__label";
    label.textContent = slot.collected ? slot.variant.label : "???";

    card.append(emoji, label);

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
    elements.petEvolution.textContent = "🥚";
    elements.petMoodBubble.hidden = true;
    elements.petName.textContent = "???";
    elements.petAge.textContent = "이름을 지어주세요";
    elements.petStage.textContent = "알";
    if (elements.newPetFab) elements.newPetFab.hidden = true;
    Object.keys(elements.buttons).forEach((key) => {
      elements.buttons[key].disabled = true;
    });
  }
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
