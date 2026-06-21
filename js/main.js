import { applyTimeDelta, checkGameOver, createNewPet, tickPet } from "./pet.js";
import { feed, play, clean, toggleSleep, resetActionCooldown } from "./actions.js";
import { savePet, loadPet, clearPet } from "./storage.js";
import { checkEvolution, getEvolutionStage, getStageIndex, EVOLUTION_STAGES } from "./evolution.js";
import { resolveAdultVariant } from "./adultVariants.js";
import { addToEncyclopedia } from "./encyclopedia.js";
import {
  getAdultActionMessage,
  shouldShowIdleDialogue,
  resetDialogueTimer,
} from "./dialogue.js";
import { initAudio, playSfx, toggleMuted, updateMuteButton } from "./audio.js";
import { isSpritesEnabled, toggleSpritesEnabled } from "./sprites.js";
import {
  renderPet,
  showMessage,
  showNameModal,
  hideNameModal,
  showGraduateModal,
  hideGraduateModal,
  showEncyclopedia,
  hideEncyclopedia,
  isMessageVisible,
  refreshAllGraphics,
  getEnteredName,
  getElements,
  setGameActive,
  syncSleepControls,
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

function handleAdultEvolution({ notify = true } = {}) {
  resolveAdultVariant(pet);
  addToEncyclopedia(pet);

  if (notify) {
    showMessage(`${pet.name}가 어른으로 진화했어요! 도감에 등록됐어요!`, 5000);
    playSfx("evolve");
  }
}

function handleEvolution({ notify = true } = {}) {
  if (!pet?.isAlive) return false;

  const result = checkEvolution(pet);

  if (result.evolved && result.stage.id === "adult") {
    handleAdultEvolution({ notify });
    return true;
  }

  if (result.evolved && notify) {
    showMessage(`${pet.name}가 ${result.stage.label}(으)로 진화했어요!`, 5000);
    playSfx("evolve");
  }

  return result.evolved;
}

function ensureAdultRegistered() {
  if (!pet?.adultVariantId) return;
  if (getEvolutionStage(pet).id !== "adult") return;
  addToEncyclopedia(pet);
}

function maybeShowIdleDialogue() {
  if (isMessageVisible()) return;

  const line = shouldShowIdleDialogue(pet);
  if (line) showMessage(line, 5000);
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
  maybeShowIdleDialogue();
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
    if (getEvolutionStage(pet).id === "adult") {
      if (!pet.adultVariantId) {
        handleAdultEvolution({ notify: false });
      } else {
        ensureAdultRegistered();
      }
    }
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
  maybeShowIdleDialogue();
  renderPet(pet);
  savePet(pet);
}

const ACTION_MESSAGES = {
  feed: () => "맛있게 먹었어요!",
  play: () => "재미있게 놀았어요!",
  clean: () => "깨끗해졌어요!",
  sleep: (p) => (p.isSleeping ? "잠들었어요..." : "깨어났어요!"),
};

function getActionMessage(pet, messageKey) {
  const adultMessage = getAdultActionMessage(pet, messageKey);
  if (adultMessage) return adultMessage;

  const getMessage = ACTION_MESSAGES[messageKey];
  return getMessage ? getMessage(pet) : null;
}

function handleAction(actionFn, messageKey) {
  if (!pet || !pet.isAlive) return;

  unlockAudioOnce();

  const changed = actionFn(pet);
  if (!changed) return;

  if (messageKey === "sleep") {
    syncSleepControls(pet);
  }

  checkGameOver(pet);
  pet.lastUpdated = Date.now();
  renderPet(pet);
  savePet(pet);

  if (messageKey === "sleep") {
    playSfx(pet.isSleeping ? "sleep" : "wake");
    resetDialogueTimer();
  } else {
    playSfx(messageKey);
  }

  const message = getActionMessage(pet, messageKey);
  if (message) showMessage(message);
}

function startNewPet(name) {
  clearPet();
  resetActionCooldown();
  resetDialogueTimer();
  pet = createNewPet(name);
  lastTickAt = Date.now();
  handleEvolution({ notify: false });
  setGameActive(true);
  renderPet(pet);
  savePet(pet);
}

function graduateToNewPet() {
  if (!pet) return;
  addToEncyclopedia(pet);
  hideGraduateModal();
  showNameModal();
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

  document.getElementById("btn-encyclopedia")?.addEventListener("click", withAudio(() => {
    showEncyclopedia();
  }));

  document.getElementById("btn-close-encyclopedia")?.addEventListener("click", withAudio(() => {
    hideEncyclopedia();
  }));

  document.getElementById("btn-new-pet-side")?.addEventListener("click", withAudio(() => {
    if (!pet) return;
    showGraduateModal(pet);
  }));

  document.getElementById("btn-graduate-confirm")?.addEventListener("click", withAudio(() => {
    graduateToNewPet();
  }));

  document.getElementById("btn-graduate-cancel")?.addEventListener("click", withAudio(() => {
    hideGraduateModal();
  }));
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

      simulateAdultPretty() {
        if (!pet) return;
        pet.hunger = 90;
        pet.happiness = 90;
        pet.cleanliness = 90;
        pet.health = 90;
        pet.bornAt = Date.now() - 14 * 86400000;
        pet.lastEvolutionStage = "teen";
        pet.adultVariantId = null;
        pet.adultCareSnapshot = null;
        handleEvolution();
        renderPet(pet);
        savePet(pet);
      },

      simulateAdultDefective() {
        if (!pet) return;
        pet.hunger = 25;
        pet.happiness = 20;
        pet.cleanliness = 30;
        pet.health = 35;
        pet.bornAt = Date.now() - 14 * 86400000;
        pet.lastEvolutionStage = "teen";
        pet.adultVariantId = null;
        pet.adultCareSnapshot = null;
        handleEvolution();
        renderPet(pet);
        savePet(pet);
      },

      clearEncyclopedia() {
        import("./encyclopedia.js").then(({ clearEncyclopedia }) => {
          clearEncyclopedia();
          showMessage("도감을 초기화했어요.");
        });
      },

      forceIdleDialogue() {
        if (!pet?.adultVariantId) {
          showMessage("성체가 아니에요.");
          return;
        }
        import("./dialogue.js").then(({ pickAdultLine }) => {
          const context = pet.isSleeping ? "snoozing" : "idle";
          const line = pickAdultLine(pet, context);
          if (line) showMessage(line, 5000);
        });
      },

      toggleSprites() {
        const enabled = toggleSpritesEnabled();
        refreshAllGraphics(pet);
        showMessage(enabled ? "스프라이트 모드 켜짐" : "이모지 fallback 모드");
      },
    });
  });
}

init();
mountDevToolsIfEnabled();

export { pet, handleEvolution, startNewPet };
