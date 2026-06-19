import { getAgeDays, getPetEmoji } from "./pet.js";

const elements = {
  petName: document.getElementById("pet-name"),
  petAge: document.getElementById("pet-age"),
  petEmoji: document.getElementById("pet-emoji"),
  petArea: document.getElementById("pet-area"),
  message: document.getElementById("message"),
  actions: document.getElementById("actions"),
  gameOverOverlay: document.getElementById("game-over-overlay"),
  gameOverTitle: document.getElementById("game-over-title"),
  nameOverlay: document.getElementById("name-overlay"),
  nameInput: document.getElementById("name-input"),
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

export function renderPet(pet) {
  elements.petName.textContent = pet.name;
  elements.petAge.textContent = `${getAgeDays(pet)}일째`;

  const emoji = getPetEmoji(pet);
  if (elements.petEmoji.textContent !== emoji) {
    elements.petEmoji.textContent = emoji;
    elements.petEmoji.classList.remove("pet-emoji--bounce");
    void elements.petEmoji.offsetWidth;
    elements.petEmoji.classList.add("pet-emoji--bounce");
  }

  elements.petArea.classList.toggle("pet-area--sleeping", pet.isSleeping);

  updateStat("hunger", pet.hunger);
  updateStat("happiness", pet.happiness);
  updateStat("cleanliness", pet.cleanliness);
  updateStat("health", pet.health);

  updateButtons(pet);
  updateGameOver(pet);
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

function updateGameOver(pet) {
  if (pet.isAlive) {
    elements.gameOverOverlay.hidden = true;
    elements.actions.hidden = false;
    return;
  }

  elements.gameOverTitle.textContent = `${pet.name}가 떠났어요...`;
  elements.gameOverOverlay.hidden = false;
  elements.actions.hidden = true;
}

export function showMessage(text, durationMs = 4000) {
  elements.message.textContent = text;
  elements.message.hidden = false;

  if (messageTimeout) clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    elements.message.hidden = true;
  }, durationMs);
}

export function showNameModal() {
  elements.nameOverlay.hidden = false;
  elements.nameInput.value = "";
  elements.nameInput.focus();
}

export function hideNameModal() {
  elements.nameOverlay.hidden = true;
}

export function getEnteredName() {
  return elements.nameInput.value.trim();
}

export function getElements() {
  return elements;
}
