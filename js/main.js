import { applyTimeDelta, checkGameOver, createNewPet, tickPet, applyEmergencyCare, resetNeglectTimer } from "./pet.js";
import { feed, play, clean, toggleSleep, resetActionCooldown } from "./actions.js";
import { savePet, loadPet, clearPet } from "./storage.js";
import {
  checkEvolution,
  getEvolutionStage,
  getStageIndex,
  EVOLUTION_STAGES,
  EVOLUTION_ADULT_MIN_AGE_MS,
} from "./evolution.js";
import { resolveAdultVariant } from "./adultVariants.js";
import { addToEncyclopedia } from "./encyclopedia.js";
import {
  getAdultActionMessage,
  shouldShowIdleDialogue,
  resetDialogueTimer,
} from "./dialogue.js";
import { initAudio, playSfx, toggleMuted, updateMuteButton } from "./audio.js";
import { toggleSpritesEnabled, toggleSpriteFormat } from "./sprites.js";
import { playCareEffect } from "./effects.js";
import { withSubjectParticle } from "./korean.js";
import {
  initAds,
  tryShowInterstitial,
  showRewardedRevive,
  showRewardedEmergencyCare,
  showRewardedNeglectReset,
  canOfferRevive,
  markReviveUsed,
  canOfferEmergencyCare,
  canOfferNeglectReset,
  INTERSTITIAL_TRIGGERS,
} from "./ads.js";
import {
  captureDeathSnapshot,
  getDeathSnapshot,
  applyDeathSnapshotToPet,
  clearDeathSnapshot,
} from "./deathSnapshot.js";
import {
  renderPet,
  showMessage,
  showNameModal,
  hideNameModal,
  showGraduateModal,
  hideGraduateModal,
  showEncyclopedia,
  hideEncyclopedia,
  backToEncyclopediaList,
  isMessageVisible,
  refreshAllGraphics,
  resetGraphicAnimationState,
  getEnteredName,
  getElements,
  setGameActive,
  syncSleepControls,
  setAdsPromptApi,
} from "./ui.js";
import { getStoreCaptureScene, isStoreCaptureMode, setupStoreCapture } from "./storeCapture.js";

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
    return `${withSubjectParticle(name)} ${formatAwayTime(elapsed)} 동안 당신을 기다렸어요!`;
  }
  if (elapsed >= OFFLINE_NOTICE_MS) {
    return `${formatAwayTime(elapsed)} 동안 다녀오셨네요.`;
  }
  return null;
}

function runGameOverCheck() {
  if (!pet?.isAlive) return false;
  const died = checkGameOver(pet);
  if (died) {
    captureDeathSnapshot(pet);
  }
  return died;
}

function noteDeathIfNeeded(wasAlive) {
  if (wasAlive && pet && !pet.isAlive) {
    captureDeathSnapshot(pet);
  }
}

async function handleAdultEvolution({ notify = true } = {}) {
  resolveAdultVariant(pet);
  addToEncyclopedia(pet);

  if (notify) {
    showMessage(`${withSubjectParticle(pet.name)} 어른으로 진화했어요! 탐사 일지에 등록됐어요!`, 5000);
    playSfx("evolve");
    window.setTimeout(() => {
      tryShowInterstitial(INTERSTITIAL_TRIGGERS.T2_ADULT_EVOLVE);
    }, 5200);
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
    showMessage(`${withSubjectParticle(pet.name)} ${result.stage.label}(으)로 진화했어요!`, 5000);
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

  const wasAlive = pet.isAlive;
  applyTimeDelta(pet, elapsed);
  noteDeathIfNeeded(wasAlive);
  pet.lastUpdated = Date.now();
  lastTickAt = Date.now();

  if (notify) {
    const message = getAwayMessage(elapsed, pet.name);
    if (message) {
      showMessage(message);
      playSfx("message");
      if (elapsed >= OFFLINE_MESSAGE_MS) {
        window.setTimeout(() => {
          tryShowInterstitial(INTERSTITIAL_TRIGGERS.T4_LONG_RETURN);
        }, 4500);
      }
    }
  }

  handleEvolution();
  maybeShowIdleDialogue();
  renderPet(pet);
  savePet(pet);
}

async function init() {
  const captureScene = getStoreCaptureScene();
  if (captureScene) {
    bindEvents();
    setupMuteButton();
    pet = setupStoreCapture(captureScene);
    await refreshAllGraphics(pet);
    window.__STORE_CAPTURE_READY__ = true;
    return;
  }

  setAdsPromptApi({
    canOfferEmergencyCare,
    canOfferNeglectReset,
  });
  await initAds();

  const saved = loadPet();

  if (saved) {
    pet = saved;
    setGameActive(true);
    if (saved.isAlive !== false) {
      applyOfflineTime();
    } else {
      lastTickAt = Date.now();
      if (!getDeathSnapshot()) {
        captureDeathSnapshot(pet);
      }
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

  const wasAlive = pet.isAlive;
  tickPet(pet, elapsed);
  noteDeathIfNeeded(wasAlive);
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

const EMERGENCY_LABELS = {
  hunger: "배고픔",
  happiness: "행복",
  cleanliness: "청결",
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

  runGameOverCheck();
  pet.lastUpdated = Date.now();
  renderPet(pet);
  savePet(pet);

  if (messageKey === "sleep") {
    playSfx(pet.isSleeping ? "sleep" : "wake");
    playCareEffect(pet.isSleeping ? "sleep" : "wake", document.getElementById("pet-area"));
    resetDialogueTimer();
  } else {
    playSfx(messageKey);
    if (["feed", "play", "clean"].includes(messageKey)) {
      playCareEffect(messageKey, document.getElementById("pet-area"));
    }
  }

  const message = getActionMessage(pet, messageKey);
  if (message) showMessage(message);
}

function startNewPet(name) {
  clearPet();
  clearDeathSnapshot();
  resetActionCooldown();
  resetDialogueTimer();
  pet = createNewPet(name);
  lastTickAt = Date.now();
  handleEvolution({ notify: false });
  setGameActive(true);
  renderPet(pet);
  savePet(pet);
}

async function graduateToNewPet() {
  if (!pet) return;
  addToEncyclopedia(pet);
  hideGraduateModal();
  await tryShowInterstitial(INTERSTITIAL_TRIGGERS.T3_GRADUATE);
  showNameModal();
}

async function openNewPetAfterGameOver() {
  await tryShowInterstitial(INTERSTITIAL_TRIGGERS.T1_GAME_OVER);
  showNameModal();
}

async function handleReviveAd() {
  if (!pet) return;
  const snapshot = getDeathSnapshot();
  if (!snapshot || !canOfferRevive(snapshot.deathId)) return;

  unlockAudioOnce();
  const rewarded = await showRewardedRevive();
  if (!rewarded) return;

  applyDeathSnapshotToPet(pet, snapshot);
  markReviveUsed(snapshot.deathId);
  lastTickAt = Date.now();
  renderPet(pet);
  savePet(pet);
  showMessage(`${withSubjectParticle(pet.name)} 다시 살아났어요!`, 4000);
}

async function handleEmergencyCareAd() {
  if (!pet?.isAlive || !canOfferEmergencyCare()) return;
  unlockAudioOnce();
  const rewarded = await showRewardedEmergencyCare();
  if (!rewarded) return;
  const applied = applyEmergencyCare(pet);
  if (!applied) return;
  pet.lastUpdated = Date.now();
  renderPet(pet);
  savePet(pet);
  showMessage(`응급 돌봄! ${EMERGENCY_LABELS[applied.key]}이(가) 올랐어요.`, 4000);
}

async function handleNeglectResetAd() {
  if (!pet?.isAlive || !canOfferNeglectReset()) return;
  unlockAudioOnce();
  const rewarded = await showRewardedNeglectReset();
  if (!rewarded) return;
  resetNeglectTimer(pet);
  renderPet(pet);
  savePet(pet);
  showMessage("방치 타이머가 초기화됐어요. 서둘러 돌봐 주세요!", 4000);
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

  const withAudioAsync = (handler) => async () => {
    unlockAudioOnce();
    await handler();
  };

  buttons.feed.addEventListener("click", withAudio(() => handleAction(feed, "feed")));
  buttons.play.addEventListener("click", withAudio(() => handleAction(play, "play")));
  buttons.clean.addEventListener("click", withAudio(() => handleAction(clean, "clean")));
  buttons.sleep.addEventListener("click", withAudio(() => handleAction(toggleSleep, "sleep")));

  document.getElementById("btn-new-pet")?.addEventListener("click", withAudioAsync(openNewPetAfterGameOver));

  document.getElementById("btn-revive-ad")?.addEventListener("click", withAudioAsync(handleReviveAd));

  document.getElementById("btn-reward-emergency")?.addEventListener("click", withAudioAsync(handleEmergencyCareAd));

  document.getElementById("btn-reward-neglect")?.addEventListener("click", withAudioAsync(handleNeglectResetAd));

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

  document.getElementById("btn-encyclopedia-detail-back")?.addEventListener("click", withAudio(() => {
    backToEncyclopediaList();
  }));

  document.getElementById("btn-new-pet-side")?.addEventListener("click", withAudio(() => {
    if (!pet) return;
    showGraduateModal(pet);
  }));

  document.getElementById("btn-graduate-confirm")?.addEventListener("click", withAudioAsync(graduateToNewPet));

  document.getElementById("btn-graduate-cancel")?.addEventListener("click", withAudio(() => {
    hideGraduateModal();
  }));
}

function mountDevToolsIfEnabled() {
  if (isStoreCaptureMode()) return;
  if (!new URLSearchParams(location.search).has("dev")) return;

  import("./dev.js").then(({ mountDevPanel }) => {
    mountDevPanel({
      simulateHealthGameOver() {
        if (!pet) return;
        pet.health = 0;
        runGameOverCheck();
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
        pet.bornAt = Date.now() - EVOLUTION_ADULT_MIN_AGE_MS;
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
        pet.bornAt = Date.now() - EVOLUTION_ADULT_MIN_AGE_MS;
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
        if (!pet?.isAlive) {
          showMessage("펫이 없어요.");
          return;
        }
        import("./dialogue.js").then(({ pickIdleLine }) => {
          const line = pickIdleLine(pet);
          if (line) showMessage(line, 5000);
          else showMessage("지금은 대사가 없어요.");
        });
      },

      toggleSprites() {
        const enabled = toggleSpritesEnabled();
        resetGraphicAnimationState();
        refreshAllGraphics(pet);
        showMessage(enabled ? "스프라이트 모드 켜짐" : "이모지 fallback 모드");
      },

      toggleSpriteFormat() {
        const format = toggleSpriteFormat();
        resetGraphicAnimationState();
        refreshAllGraphics(pet);
        showMessage(`스프라이트 포맷: ${format}`);
      },
    });
  });
}

init();
mountDevToolsIfEnabled();

export { pet, handleEvolution, startNewPet };
