import { applyTimeDelta, checkGameOver, createNewPet, tickPet } from "./pet.js";
import { feed, play, clean, toggleSleep, resetActionCooldown } from "./actions.js";
import { savePet, loadPet, clearPet } from "./storage.js";
import { checkEvolution, getEvolutionStage, getStageIndex, EVOLUTION_STAGES } from "./evolution.js";
import { initAudio, playSfx, toggleMuted, updateMuteButton } from "./audio.js";
import {
  renderPet,
  showMessage,
  showNameModal,
  hideNameModal,
  getEnteredName,
  getElements,
  setGameActive,
} from "./ui.js";

const OFFLINE_MESSAGE_MS = 30 * 60 * 1000;
const OFFLINE_NOTICE_MS = 5 * 60 * 1000;
const TICK_MS = 1000;

let pet = null;
let lastTickAt = Date.now();

function persistPet() {
  if (pet) savePet(pet);
}

function unlockAudioOnce() {
  initAudio();
}

function formatAwayTime(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return "잠깐";
  if (totalMinutes < 60) return `${totalMinutes}분`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
}

function getAwayMessage(elapsed, name) {
  if (elapsed >= OFFLINE_MESSAGE_MS) {
    return `${name}가 ${formatAwayTime(elapsed)} 동안 당신을 기다렸어요!`;
  }
  if (elapsed >= OFFLINE_NOTICE_MS) {
    return `${formatAwayTime(elapsed)} 동안 다녀오셨네요.`;
  }
  return null;
}

function handleEvolution({ notify = true } = {}) {
  if (!pet?.isAlive) return false;

  const result = checkEvolution(pet);
  if (result.evolved && notify) {
    showMessage(`${pet.name}가 ${result.stage.label}(으)로 진화했어요!`, 5000);
    playSfx("evolve");
  }

  return result.evolved;
}

function applyAwayTime(elapsed, { notify = false } = {}) {
  if (!pet || !pet.isAlive || elapsed <= 0) return;

  applyTimeDelta(pet, elapsed);
  pet.lastUpdated = Date.now();
  lastTickAt = Date.now();

  if (notify) {
    const message = getAwayMessage(elapsed, pet.name);
    if (message) {
      showMessage(message);
      playSfx("message");
    }
  }

  checkGameOver(pet);
  handleEvolution();
  renderPet(pet);
  savePet(pet);
}

function init() {
  const saved = loadPet();

  if (saved) {
    pet = saved;
    setGameActive(true);
    if (saved.isAlive !== false) {
      applyOfflineTime();
    } else {
      lastTickAt = Date.now();
    }
    handleEvolution({ notify: false });
    renderPet(pet);
    savePet(pet);
  } else {
    showNameModal();
  }

  bindEvents();
  setupMuteButton();
  setInterval(gameTick, TICK_MS);

  window.addEventListener("pagehide", persistPet);
  window.addEventListener("beforeunload", persistPet);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      persistPet();
      return;
    }
    if (!pet?.isAlive) return;
    const elapsed = Date.now() - pet.lastUpdated;
    if (elapsed > TICK_MS) {
      applyElapsedTime(elapsed);
    }
  });
}

function applyElapsedTime(elapsed) {
  if (!pet || !pet.isAlive || elapsed <= 0) return;
  applyAwayTime(elapsed, { notify: elapsed >= OFFLINE_NOTICE_MS });
}

function applyOfflineTime() {
  const elapsed = Date.now() - pet.lastUpdated;
  applyAwayTime(elapsed, { notify: true });
}

function gameTick() {
  if (!pet || !pet.isAlive) return;

  const now = Date.now();
  const elapsed = now - lastTickAt;
  lastTickAt = now;

  if (elapsed <= 0) return;

  tickPet(pet, elapsed);
  handleEvolution();
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

  unlockAudioOnce();

  const changed = actionFn(pet);
  if (!changed) return;

  checkGameOver(pet);
  pet.lastUpdated = Date.now();
  renderPet(pet);
  savePet(pet);

  if (messageKey === "sleep") {
    playSfx(pet.isSleeping ? "sleep" : "wake");
  } else {
    playSfx(messageKey);
  }

  const getMessage = ACTION_MESSAGES[messageKey];
  if (getMessage) showMessage(getMessage(pet));
}

function startNewPet(name) {
  clearPet();
  resetActionCooldown();
  pet = createNewPet(name);
  lastTickAt = Date.now();
  handleEvolution({ notify: false });
  setGameActive(true);
  renderPet(pet);
  savePet(pet);
}

function setupMuteButton() {
  const muteButton = document.getElementById("btn-mute");
  if (!muteButton) return;

  updateMuteButton(muteButton);
  muteButton.addEventListener("click", () => {
    toggleMuted();
    updateMuteButton(muteButton);
  });
}

function bindEvents() {
  const { buttons } = getElements();

  const withAudio = (handler) => () => {
    unlockAudioOnce();
    handler();
  };

  buttons.feed.addEventListener("click", withAudio(() => handleAction(feed, "feed")));
  buttons.play.addEventListener("click", withAudio(() => handleAction(play, "play")));
  buttons.clean.addEventListener("click", withAudio(() => handleAction(clean, "clean")));
  buttons.sleep.addEventListener("click", withAudio(() => handleAction(toggleSleep, "sleep")));

  document.getElementById("btn-new-pet").addEventListener("click", withAudio(() => {
    showNameModal();
  }));

  document.getElementById("btn-start-pet").addEventListener("click", withAudio(() => {
    const name = getEnteredName() || "치치";
    hideNameModal();
    startNewPet(name);
  }));

  document.getElementById("name-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("btn-start-pet").click();
    }
  });
}

function mountDevToolsIfEnabled() {
  if (!new URLSearchParams(location.search).has("dev")) return;

  import("./dev.js").then(({ mountDevPanel }) => {
    mountDevPanel({
      simulateHealthGameOver() {
        if (!pet) return;
        pet.health = 0;
        checkGameOver(pet);
        renderPet(pet);
        savePet(pet);
      },

      simulateNeglectGameOver() {
        if (!pet) return;
        pet.hunger = 5;
        pet.happiness = 5;
        pet.cleanliness = 5;
        applyAwayTime(11 * 60 * 1000, { notify: false });
      },

      simulateOffline(minutes) {
        if (!pet?.isAlive) return;
        const elapsed = minutes * 60 * 1000;
        pet.lastUpdated = Date.now() - elapsed;
        applyAwayTime(elapsed, { notify: true });
      },

      simulateAgePlusOne() {
        if (!pet) return;
        pet.bornAt -= 86400000;
        handleEvolution();
        renderPet(pet);
        savePet(pet);
      },

      simulateEvolution() {
        if (!pet) return;
        const stage = getEvolutionStage(pet);
        const idx = getStageIndex(stage.id);
        if (idx <= 0) return;
        pet.lastEvolutionStage = EVOLUTION_STAGES[idx - 1].id;
        handleEvolution();
        renderPet(pet);
        savePet(pet);
      },
    });
  });
}

init();
mountDevToolsIfEnabled();
