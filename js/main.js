import { applyTimeDelta, checkGameOver, createNewPet, tickPet } from "./pet.js";
import { feed, play, clean, toggleSleep, resetActionCooldown } from "./actions.js";
import { savePet, loadPet, clearPet } from "./storage.js";
import {
  renderPet,
  showMessage,
  showNameModal,
  hideNameModal,
  getEnteredName,
  getElements,
} from "./ui.js";

const OFFLINE_MESSAGE_MS = 30 * 60 * 1000;
const TICK_MS = 1000;

let pet = null;

function init() {
  const saved = loadPet();

  if (saved) {
    pet = saved;
    if (saved.isAlive !== false) {
      applyOfflineTime();
    }
    renderPet(pet);
    savePet(pet);
  } else {
    showNameModal();
  }

  bindEvents();
  setInterval(gameTick, TICK_MS);
}

function applyOfflineTime() {
  const elapsed = Date.now() - pet.lastUpdated;
  if (elapsed <= 0) return;

  applyTimeDelta(pet, elapsed);
  pet.lastUpdated = Date.now();

  if (elapsed >= OFFLINE_MESSAGE_MS) {
    showMessage(`${pet.name}가 당신을 기다렸어요!`);
  }

  checkGameOver(pet);
}

function gameTick() {
  if (!pet || !pet.isAlive) return;

  tickPet(pet, TICK_MS);
  renderPet(pet);
  savePet(pet);
}

const ACTION_MESSAGES = {
  feed: () => "맛있게 먹었어요!",
  play: () => "재미있게 놀았어요!",
  clean: () => "깨끗해졌어요!",
  sleep: (p) => (p.isSleeping ? "잠들었어요..." : "깨어났어요!"),
};

function handleAction(actionFn, messageKey) {
  if (!pet || !pet.isAlive) return;

  const changed = actionFn(pet);
  if (!changed) return;

  checkGameOver(pet);
  pet.lastUpdated = Date.now();
  renderPet(pet);
  savePet(pet);

  const getMessage = ACTION_MESSAGES[messageKey];
  if (getMessage) showMessage(getMessage(pet));
}

function startNewPet(name) {
  clearPet();
  resetActionCooldown();
  pet = createNewPet(name);
  renderPet(pet);
  savePet(pet);
}

function bindEvents() {
  const { buttons } = getElements();

  buttons.feed.addEventListener("click", () => handleAction(feed, "feed"));
  buttons.play.addEventListener("click", () => handleAction(play, "play"));
  buttons.clean.addEventListener("click", () => handleAction(clean, "clean"));
  buttons.sleep.addEventListener("click", () => handleAction(toggleSleep, "sleep"));

  document.getElementById("btn-new-pet").addEventListener("click", () => {
    showNameModal();
  });

  document.getElementById("btn-start-pet").addEventListener("click", () => {
    const name = getEnteredName() || "치치";
    hideNameModal();
    startNewPet(name);
  });

  document.getElementById("name-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("btn-start-pet").click();
    }
  });
}

init();
