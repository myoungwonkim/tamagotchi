import { getAgeDays, getGameOverReason, getAverageCare } from "./pet.js";
import { getEvolutionStage } from "./evolution.js";
import { getAdultVariant, ADULT_VARIANTS } from "./adultVariants.js";
import {
  getStageLabelForTheme,
  getVariantLabelForTheme,
  normalizeSpeciesTheme,
} from "./speciesThemes.js";
import {
  getEncyclopediaSlots,
  getCollectedCount,
  getVariantDescription,
} from "./encyclopedia.js";
import {
  isSpritesEnabled,
  getEvolutionSpriteMeta,
  getMoodSpriteMeta,
  getVariantSpriteMeta,
  getUiSpriteMeta,
  getStageSpriteMeta,
  getPetSpeciesTheme,
  preloadSpritesForPet,
} from "./sprites.js";
import { playSfx } from "./audio.js";
import {
  playEvolutionTransition,
  playMoodTransition,
  applyIdleClasses,
  resyncAllEncyclopediaAdultDisplays,
  scheduleEncyclopediaAdultDisplay,
  stopEncyclopediaAdultFrames,
} from "./effects.js";
import { withSubjectParticle } from "./korean.js";
import { syncMessLayer, scheduleMessLayer, clearMessLayer } from "./mess.js";
import { AD_TUNING } from "./adConfig.js";
import { canOfferRevive } from "./ads.js";
import { getDeathSnapshot } from "./deathSnapshot.js";
import { pickGhostLine } from "./ghostDialogue.js";

const elements = {
  petName: document.getElementById("pet-name"),
  petAge: document.getElementById("pet-age"),
  petStage: document.getElementById("pet-stage"),
  petEvolution: document.getElementById("pet-evolution"),
  petMoodBubble: document.getElementById("pet-mood-bubble"),
  petMoodEmoji: document.getElementById("pet-mood-emoji"),
  petArea: document.getElementById("pet-area"),
  messLayer: document.getElementById("mess-layer"),
  message: document.getElementById("message"),
  actions: document.getElementById("actions"),
  gameOverOverlay: document.getElementById("game-over-overlay"),
  gameOverGraphic: document.getElementById("game-over-graphic"),
  gameOverTitle: document.getElementById("game-over-title"),
  gameOverText: document.getElementById("game-over-text"),
  btnReviveAd: document.getElementById("btn-revive-ad"),
  btnNewPet: document.getElementById("btn-new-pet"),
  rewardPrompts: document.getElementById("reward-prompts"),
  btnRewardEmergency: document.getElementById("btn-reward-emergency"),
  btnRewardNeglect: document.getElementById("btn-reward-neglect"),
  nameOverlay: document.getElementById("name-overlay"),
  nameInput: document.getElementById("name-input"),
  encyclopediaOverlay: document.getElementById("encyclopedia-overlay"),
  encyclopediaPanel: document.querySelector(".encyclopedia-panel"),
  encyclopediaList: document.getElementById("encyclopedia-list"),
  encyclopediaGrid: document.getElementById("encyclopedia-grid"),
  encyclopediaSubtitle: document.getElementById("encyclopedia-subtitle"),
  encyclopediaTabDeepsea: document.getElementById("encyclopedia-tab-deepsea"),
  encyclopediaTabMermaid: document.getElementById("encyclopedia-tab-mermaid"),
  encyclopediaTabVent: document.getElementById("encyclopedia-tab-vent"),
  encyclopediaDetail: document.getElementById("encyclopedia-detail"),
  encyclopediaDetailGraphic: document.getElementById("encyclopedia-detail-graphic"),
  encyclopediaDetailName: document.getElementById("encyclopedia-detail-name"),
  encyclopediaDetailSpecies: document.getElementById("encyclopedia-detail-species"),
  encyclopediaDetailDesc: document.getElementById("encyclopedia-detail-desc"),
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
let deferGameOverOverlay = false;
let ghostPleaTimer = null;

const GHOST_PLEA_INTERVAL_MS = 3600;

/** 상어 습격 연출 중에는 게임오버 카드를 잠시 미뤘다가 연출 후 띄운다. */
export function setDeferGameOverOverlay(value) {
  deferGameOverOverlay = Boolean(value);
}

function startGhostPlea(pet) {
  if (ghostPleaTimer) return;
  elements.gameOverText.textContent = pet.ghostLine || pickGhostLine();
  ghostPleaTimer = window.setInterval(() => {
    elements.gameOverText.textContent = pickGhostLine();
    elements.gameOverText.classList.remove("overlay-text--plea-pop");
    void elements.gameOverText.offsetWidth;
    elements.gameOverText.classList.add("overlay-text--plea-pop");
  }, GHOST_PLEA_INTERVAL_MS);
}

function stopGhostPlea() {
  if (ghostPleaTimer) {
    window.clearInterval(ghostPleaTimer);
    ghostPleaTimer = null;
  }
  elements.gameOverText?.classList.remove("overlay-text--plea-pop");
}

function getStageLabel(pet) {
  const theme = getPetSpeciesTheme(pet);
  const stage = getEvolutionStage(pet);
  if (stage.id === "adult" && pet.adultVariantId) {
    return getAdultVariant(pet.adultVariantId, theme).label;
  }
  return getStageLabelForTheme(stage.id, theme);
}

function getFallbackClassName(imgClass = "") {
  if (imgClass.includes("mood")) return "pet-mood-fallback";
  if (imgClass.includes("encyclopedia")) return "encyclopedia-card__emoji";
  if (imgClass.includes("evolution")) return "pet-evolution-fallback";
  return "pet-sprite-fallback";
}

function applyEmojiFallback(container, emoji, className = "pet-sprite-fallback") {
  container.innerHTML = "";
  const span = document.createElement("span");
  span.className = className;
  span.textContent = emoji;
  container.append(span);
  return emoji;
}

function spriteSrcMatches(currentSrc, nextSrc) {
  if (!currentSrc || !nextSrc) return false;
  try {
    const base = typeof location !== "undefined" ? location.href : "http://localhost/";
    const a = new URL(currentSrc, base);
    const b = new URL(nextSrc, base);
    return a.pathname === b.pathname && a.search === b.search;
  } catch {
    return currentSrc === nextSrc;
  }
}

function bindSpriteImgHandlers(img, fallback, getMeta) {
  const onError = () => {
    const meta = getMeta();
    const inFrameAnim = Boolean(img.closest("[data-frame-variant]"));

    if (inFrameAnim && meta?.src && !img.dataset.pngRetry && /\.svg(\?|$)/i.test(meta.src)) {
      img.dataset.pngRetry = "1";
      img.src = meta.src.replace(/\.svg(\?)/i, ".png$1");
      return;
    }
    if (inFrameAnim) return;

    if (!img.dataset.retryBust && meta?.src) {
      img.dataset.retryBust = "1";
      const bust = `${meta.src}${meta.src.includes("?") ? "&" : "?"}_r=${Date.now()}`;
      img.src = bust;
      return;
    }
    img.removeAttribute("src");
    img.hidden = true;
    img.style.display = "none";
    if (fallback) {
      fallback.hidden = false;
      fallback.textContent = meta?.fallbackEmoji ?? "";
    }
  };

  const onLoad = () => {
    img.hidden = false;
    img.style.display = "";
    if (fallback) fallback.hidden = true;
  };

  img.onerror = onError;
  img.onload = onLoad;
  return { onLoad, onError };
}

function runAfterGraphicReady(img, callback) {
  if (!img || typeof callback !== "function") return;
  const run = () => requestAnimationFrame(callback);
  if (img.complete) {
    run();
    return;
  }
  img.addEventListener("load", run, { once: true });
  img.addEventListener("error", run, { once: true });
}

export function setPetGraphic(
  container,
  meta,
  { imgClass = "pet-evolution-img", sizeClass = "", afterGraphicReady = null } = {},
) {
  if (!container || !meta) return null;

  if (!isSpritesEnabled()) {
    return applyEmojiFallback(container, meta.fallbackEmoji, getFallbackClassName(imgClass));
  }

  const currentKey = container.dataset.spriteKey;
  const isNewKey = currentKey !== meta.key;

  const fallbackSelector = ".pet-sprite-fallback, .pet-mood-fallback, .pet-evolution-fallback, .encyclopedia-card__emoji";
  let img = container.querySelector("img.pet-sprite");
  let fallback = container.querySelector(fallbackSelector);
  const orphanImgs = container.querySelectorAll("img:not(.pet-sprite)");
  if (orphanImgs.length) {
    orphanImgs.forEach((el) => el.remove());
  }

  if (!img) {
    container.innerHTML = "";
    img = document.createElement("img");
    img.className = `pet-sprite ${imgClass}${sizeClass ? ` ${sizeClass}` : ""}`;
    img.alt = meta.alt || "";
    fallback = document.createElement("span");
    fallback.className = getFallbackClassName(imgClass);
    fallback.hidden = true;
    container.append(img, fallback);
  } else if (!fallback) {
    fallback = document.createElement("span");
    fallback.className = getFallbackClassName(imgClass);
    fallback.hidden = true;
    container.append(fallback);
  }

  const { onLoad, onError } = bindSpriteImgHandlers(img, fallback, () => meta);
  container.dataset.spriteKey = meta.key;

  const currentSrc = img.getAttribute("src");
  const needsUpdate = isNewKey || !spriteSrcMatches(currentSrc, meta.src);

  if (needsUpdate) {
    delete img.dataset.retryBust;
    img.hidden = false;
    img.style.display = "";
    if (fallback) fallback.hidden = true;
    img.src = meta.src;
    img.alt = meta.alt || "";
    if (img.complete) {
      if (img.naturalWidth > 0) onLoad();
      else onError();
    }
  } else if (img.complete) {
    if (img.naturalWidth > 0) onLoad();
    else onError();
  }

  runAfterGraphicReady(img, afterGraphicReady);

  return meta.key;
}

function setOverlayGraphic(container, meta) {
  if (!container) return;
  setPetGraphic(container, meta, { imgClass: "overlay-graphic-img", sizeClass: "overlay-graphic-img--small" });
}

export function renderPet(pet) {
  const evolutionMeta = getEvolutionSpriteMeta(pet);
  elements.petName.textContent = pet.name;
  elements.petAge.textContent = `${getAgeDays(pet)}일째`;
  elements.petStage.textContent = getStageLabel(pet);

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

  if (pet.isAlive) {
    scheduleMessLayer(elements.messLayer, pet.cleanliness, elements.petEvolution);
  } else {
    clearMessLayer(elements.messLayer);
  }

  updateStat("hunger", pet.hunger);
  updateStat("happiness", pet.happiness);
  updateStat("cleanliness", pet.cleanliness);
  updateStat("health", pet.health);

  updateButtons(pet);
  updateGameOver(pet);
  updateRewardPrompts(pet);
  updateNewPetFab(pet);
  preloadSpritesForPet(pet);
}

function updateStat(key, value) {
  const rounded = Math.round(value);
  elements.bars[key].style.width = `${rounded}%`;
  elements.values[key].textContent = String(rounded);
}

const ACTION_ICON_META = {
  feed: ["feed", "🍎", "먹이"],
  play: ["play", "🎾", "놀이"],
  clean: ["clean", "🧹", "청소"],
};

function setActionButtonIcon(btn, spriteId, fallbackEmoji, alt) {
  if (!btn) return;
  const icon = btn.querySelector(".action-icon");
  if (!icon) return;
  const meta = getUiSpriteMeta(spriteId, fallbackEmoji, alt);
  if (!spriteSrcMatches(icon.src, meta.src)) {
    icon.src = meta.src;
    icon.alt = meta.alt;
  }
}

function updateActionIcons(pet) {
  const sleeping = pet.isSleeping;
  for (const [key, [id, emoji, alt]] of Object.entries(ACTION_ICON_META)) {
    setActionButtonIcon(elements.buttons[key], id, emoji, alt);
  }
  if (elements.buttons.sleep) {
    setActionButtonIcon(
      elements.buttons.sleep,
      sleeping ? "wake" : "sleep",
      sleeping ? "☀️" : "🌙",
      sleeping ? "깨우기" : "재우기",
    );
  }
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
    const label = elements.buttons.sleep.querySelector(".action-label");
    if (label) {
      label.textContent = sleeping ? "깨우기" : "재우기";
    }
  }

  updateActionIcons(pet);

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
    stopGhostPlea();
    return;
  }

  // 상어 습격 연출이 재생되는 동안에는 카드를 잠시 감춰 둔다.
  if (deferGameOverOverlay) {
    elements.gameOverOverlay.hidden = true;
    elements.actions.hidden = true;
    if (elements.newPetFab) elements.newPetFab.hidden = true;
    return;
  }

  const isShark = pet.deathCause === "shark";
  const age = getAgeDays(pet);

  if (isShark) {
    elements.gameOverTitle.textContent = `${withSubjectParticle(pet.name)} 유령이 되었어요...`;
    startGhostPlea(pet);
    setOverlayGraphic(elements.gameOverGraphic, getEvolutionSpriteMeta(pet));
  } else {
    stopGhostPlea();
    elements.gameOverTitle.textContent = `${withSubjectParticle(pet.name)} 떠났어요...`;

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
  }

  elements.gameOverOverlay.hidden = false;
  elements.actions.hidden = true;
  if (elements.newPetFab) elements.newPetFab.hidden = true;

  if (!gameOverSoundNotified) {
    gameOverSoundNotified = true;
    playSfx("gameover");
  }

  const snapshot = getDeathSnapshot();
  const captureScene = new URLSearchParams(window.location.search).get("capture");
  const showRevive =
    snapshot &&
    (canOfferRevive(snapshot.deathId) || captureScene === "gameover");
  if (elements.btnReviveAd) {
    elements.btnReviveAd.hidden = !showRevive;
    elements.btnReviveAd.disabled = !showRevive;
  }
}

function updateRewardPrompts(pet) {
  const wrap = elements.rewardPrompts;
  if (!wrap) return;

  if (!pet?.isAlive || pet.isSleeping) {
    wrap.hidden = true;
    if (elements.btnRewardEmergency) elements.btnRewardEmergency.hidden = true;
    if (elements.btnRewardNeglect) elements.btnRewardNeglect.hidden = true;
    return;
  }

  const minStat = Math.min(pet.hunger, pet.happiness, pet.cleanliness);
  const avg = getAverageCare(pet);

  const showEmergency =
    adsPromptApi?.canOfferEmergencyCare?.() &&
    minStat < AD_TUNING.emergencyCareStatThreshold;
  const showNeglect =
    adsPromptApi?.canOfferNeglectReset?.() &&
    avg < AD_TUNING.neglectPromptAvgThreshold &&
    pet.neglectStartedAt !== null;

  wrap.hidden = !(showEmergency || showNeglect);
  if (elements.btnRewardEmergency) elements.btnRewardEmergency.hidden = !showEmergency;
  if (elements.btnRewardNeglect) elements.btnRewardNeglect.hidden = !showNeglect;
}

let adsPromptApi = null;

export function setAdsPromptApi(api) {
  adsPromptApi = api;
}

export function refreshRewardPrompts(pet) {
  updateRewardPrompts(pet);
}

export function showMessage(text, durationMs = 4000) {
  elements.message.textContent = text;
  elements.message.hidden = false;
  elements.petArea?.classList.add("pet-area--message");

  if (messageTimeout) clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    elements.message.hidden = true;
    elements.petArea?.classList.remove("pet-area--message");
  }, durationMs);
}

export function isMessageVisible() {
  return !elements.message.hidden;
}

export function showNameModal() {
  stopGhostPlea();
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
    `지금 키우는 ${pet.name}은 탐사 일지에 남고, 새 알부터 시작할까요?`;
  setOverlayGraphic(
    elements.graduateGraphic,
    getStageSpriteMeta("baby", "🐠", "새 펫"),
  );
  elements.graduateOverlay.hidden = false;
}

export function hideGraduateModal() {
  elements.graduateOverlay.hidden = true;
}

function createEncyclopediaGraphic(meta, locked = false, variantId = null, spriteTheme = null) {
  const wrap = document.createElement("div");
  wrap.className = "encyclopedia-card__graphic";

  if (locked || !meta) {
    setPetGraphic(
      wrap,
      meta ?? getUiSpriteMeta("locked", "❓", "미수집"),
      { imgClass: "encyclopedia-card__img" },
    );
    return wrap;
  }

  setPetGraphic(wrap, meta, {
    imgClass: "encyclopedia-card__img",
    afterGraphicReady:
      variantId && spriteTheme
        ? () => scheduleEncyclopediaAdultDisplay(wrap, variantId, spriteTheme)
        : null,
  });
  return wrap;
}

function hideEncyclopediaDetail() {
  stopEncyclopediaAdultFrames(elements.encyclopediaDetailGraphic);
  elements.encyclopediaPanel?.classList.remove("encyclopedia-panel--detail");
  elements.encyclopediaList.hidden = false;
  elements.encyclopediaDetail.hidden = true;
}

/** 도감 탭 — vent(업데이트 예정)는 비활성 */
const ENCYCLOPEDIA_SPECIES_THEMES = ["deepsea", "mermaid"];

function normalizeEncyclopediaTabTheme(theme) {
  const normalized = normalizeSpeciesTheme(theme);
  return normalized === "mermaid" ? "mermaid" : "deepsea";
}

const ENCYCLOPEDIA_THEME_LABEL = {
  deepsea: "심해어",
  mermaid: "심해인어",
  vent: "업데이트 예정",
};

const ENCYCLOPEDIA_TAB_ELEMENTS = {
  deepsea: () => elements.encyclopediaTabDeepsea,
  mermaid: () => elements.encyclopediaTabMermaid,
  vent: () => elements.encyclopediaTabVent,
};

let encyclopediaActiveTheme = "deepsea";
let encyclopediaTabsBound = false;

function updateEncyclopediaSubtitle(theme) {
  const normalized = normalizeSpeciesTheme(theme);
  const count = getCollectedCount(normalized);
  elements.encyclopediaSubtitle.textContent =
    `${ENCYCLOPEDIA_THEME_LABEL[normalized]} · 수집 ${count} / ${ADULT_VARIANTS.length}`;
}

function selectEncyclopediaTheme(theme) {
  encyclopediaActiveTheme = normalizeEncyclopediaTabTheme(theme);
  for (const speciesTheme of ENCYCLOPEDIA_SPECIES_THEMES) {
    const tab = ENCYCLOPEDIA_TAB_ELEMENTS[speciesTheme]?.();
    tab?.setAttribute(
      "aria-selected",
      encyclopediaActiveTheme === speciesTheme ? "true" : "false",
    );
  }
  elements.encyclopediaTabVent?.setAttribute("aria-selected", "false");
  updateEncyclopediaSubtitle(encyclopediaActiveTheme);
  renderEncyclopediaGrid(encyclopediaActiveTheme);
}

function bindEncyclopediaTabs() {
  if (encyclopediaTabsBound) return;
  encyclopediaTabsBound = true;
  elements.encyclopediaTabVent?.setAttribute("disabled", "");
  for (const speciesTheme of ENCYCLOPEDIA_SPECIES_THEMES) {
    ENCYCLOPEDIA_TAB_ELEMENTS[speciesTheme]?.()?.addEventListener("click", () => {
      selectEncyclopediaTheme(speciesTheme);
    });
  }
}

function renderEncyclopediaGrid(speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  const slots = getEncyclopediaSlots(theme);
  elements.encyclopediaGrid
    .querySelectorAll(".encyclopedia-card__graphic")
    .forEach((graphic) => stopEncyclopediaAdultFrames(graphic));
  elements.encyclopediaGrid.innerHTML = "";

  for (const slot of slots) {
    const card = document.createElement("div");
    card.className = `encyclopedia-card${slot.collected ? " encyclopedia-card--collected" : " encyclopedia-card--locked"}`;

    const entry = slot.entries[0];
    const displayTheme = theme;
    const speciesLabel = getVariantLabelForTheme(slot.variant.id, displayTheme);
    const graphic = createEncyclopediaGraphic(
      getVariantSpriteMeta(slot.variant, displayTheme),
      !slot.collected,
      slot.collected ? slot.variant.id : null,
      slot.collected ? displayTheme : null,
    );

    const name = document.createElement("span");
    name.className = "encyclopedia-card__name";
    name.textContent = slot.collected && entry
      ? entry.petName?.trim() || "이름 없음"
      : "???";

    const species = document.createElement("span");
    species.className = "encyclopedia-card__species";
    species.textContent = speciesLabel;

    card.append(graphic, name, species);

    if (slot.collected && entry) {
      card.setAttribute("role", "button");
      card.tabIndex = 0;
      card.setAttribute("aria-label", `${entry.petName || "이름 없음"} 탐사 일지 상세 보기`);

      const openDetail = () => showEncyclopediaDetail(slot.variant, entry);
      card.addEventListener("click", openDetail);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      });
    }

    elements.encyclopediaGrid.append(card);
  }
}

function showEncyclopediaDetail(variant, entry) {
  const displayTheme = normalizeSpeciesTheme(encyclopediaActiveTheme);
  stopEncyclopediaAdultFrames(elements.encyclopediaDetailGraphic);
  elements.encyclopediaDetailGraphic.innerHTML = "";
  setPetGraphic(
    elements.encyclopediaDetailGraphic,
    getVariantSpriteMeta(variant, displayTheme),
    {
      imgClass: "encyclopedia-detail__img encyclopedia-card__img",
      afterGraphicReady: () =>
        scheduleEncyclopediaAdultDisplay(
          elements.encyclopediaDetailGraphic,
          variant.id,
          displayTheme,
        ),
    },
  );

  const petName = entry.petName?.trim() || "이름 없음";
  elements.encyclopediaDetailName.textContent = petName;
  elements.encyclopediaDetailSpecies.textContent = getVariantLabelForTheme(
    variant.id,
    displayTheme,
  );
  elements.encyclopediaDetailDesc.textContent = getVariantDescription(
    variant.id,
    petName,
    displayTheme,
  );

  elements.encyclopediaList.hidden = true;
  elements.encyclopediaDetail.hidden = false;
  elements.encyclopediaPanel?.classList.add("encyclopedia-panel--detail");
}

export function renderEncyclopedia() {
  hideEncyclopediaDetail();
  bindEncyclopediaTabs();
  selectEncyclopediaTheme(encyclopediaActiveTheme);
}

export function showEncyclopedia(speciesThemeOrPet) {
  if (speciesThemeOrPet) {
    const theme =
      typeof speciesThemeOrPet === "object" && speciesThemeOrPet.speciesTheme != null
        ? speciesThemeOrPet.speciesTheme
        : speciesThemeOrPet;
    encyclopediaActiveTheme = normalizeEncyclopediaTabTheme(theme);
  }
  renderEncyclopedia();
  elements.encyclopediaOverlay.hidden = false;
  elements.encyclopediaPanel?.scrollTo(0, 0);
  elements.encyclopediaOverlay.scrollTo?.(0, 0);
  resyncAllEncyclopediaAdultDisplays(elements.encyclopediaOverlay);
}

export function hideEncyclopedia() {
  hideEncyclopediaDetail();
  elements.encyclopediaOverlay.hidden = true;
  elements.encyclopediaPanel?.classList.remove("encyclopedia-panel--detail");
}

export function backToEncyclopediaList() {
  hideEncyclopediaDetail();
  resyncAllEncyclopediaAdultDisplays(elements.encyclopediaGrid);
}

export function setGameActive(active) {
  elements.actions.hidden = !active;
  if (!active) {
    lastEvolutionKey = null;
    clearMessLayer(elements.messLayer);
    const displayEl = elements.petEvolution?.closest(".pet-display");
    elements.petEvolution?.setAttribute("data-stage", "egg");
    displayEl?.setAttribute("data-stage", "egg");
    displayEl?.removeAttribute("data-variant");
    elements.petEvolution?.removeAttribute("data-variant");
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

export function getCollectedCountForDisplay(speciesTheme) {
  return getCollectedCount(speciesTheme);
}
