import { MS_PER_DAY } from "./pet.js";
import { EVOLUTION_ADULT_MIN_AGE_MS } from "./evolution.js";
import { ADULT_VARIANTS } from "./adultVariants.js";
import { clearEncyclopedia } from "./encyclopedia.js";
import { clearPet } from "./storage.js";
import { clearDeathSnapshot, captureDeathSnapshot } from "./deathSnapshot.js";
import { getVariantLabelForTheme } from "./speciesThemes.js";
import { renderPet, showMessage, showEncyclopedia, setGameActive } from "./ui.js";

const ENCYCLOPEDIA_KEY = "tamagotchi-encyclopedia";
const SETTINGS_KEY = "tamagotchi-settings";
const PET_KEY = "tamagotchi-pet";

const CAPTURE_ENCYCLOPEDIA_NAMES = {
  golden: "루미",
  fluffy: "달이",
  sparkle: "별이",
  standard: "산호",
  farm: "해초",
  plain: "진흙",
  scruffy: "아귀",
  grumpy: "뾰족",
  sickly: "균이",
};

function seedEncyclopedia() {
  clearEncyclopedia();
  const now = Date.now();
  const entries = ADULT_VARIANTS.map((variant, index) => ({
    id: `capture-${variant.id}`,
    petName: CAPTURE_ENCYCLOPEDIA_NAMES[variant.id] ?? `친구${index + 1}`,
    petBornAt: now - (index + 1) * MS_PER_DAY,
    variantId: variant.id,
    tier: variant.tier,
    emoji: variant.emoji,
    spriteId: variant.spriteId,
    speciesTheme: "deepsea",
    label: getVariantLabelForTheme(variant.id, "deepsea"),
    achievedAt: now - index * MS_PER_DAY,
  }));
  localStorage.setItem(ENCYCLOPEDIA_KEY, JSON.stringify({ entries }));
}

function basePet(name) {
  const now = Date.now();
  return {
    name,
    bornAt: now - 2 * MS_PER_DAY,
    hunger: 82,
    happiness: 91,
    cleanliness: 74,
    health: 95,
    isSleeping: false,
    isAlive: true,
    lastUpdated: now,
    neglectStartedAt: null,
    lastEvolutionStage: "child",
    speciesTheme: "deepsea",
    adultVariantId: null,
    adultCareSnapshot: null,
  };
}

function adultPet(name) {
  const now = Date.now();
  return {
    name,
    bornAt: now - EVOLUTION_ADULT_MIN_AGE_MS - 2 * MS_PER_DAY,
    hunger: 70,
    happiness: 88,
    cleanliness: 80,
    health: 92,
    isSleeping: false,
    isAlive: true,
    lastUpdated: now,
    neglectStartedAt: null,
    lastEvolutionStage: "teen",
    speciesTheme: "deepsea",
    adultVariantId: "golden",
    adultCareSnapshot: {
      hunger: 70,
      happiness: 88,
      cleanliness: 80,
      health: 92,
      avg: 82.5,
    },
  };
}

export function getStoreCaptureScene() {
  return new URLSearchParams(window.location.search).get("capture");
}

export function isStoreCaptureMode() {
  return Boolean(getStoreCaptureScene());
}

export function setupStoreCapture(scene) {
  document.body.classList.add("capture-mode");
  if (scene === "thumbnail") {
    document.body.classList.add("capture-thumbnail");
  }
  localStorage.removeItem(PET_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ useSprites: true }));
  clearDeathSnapshot();

  let pet;
  if (scene === "thumbnail") {
    pet = adultPet("루미");
    pet.hunger = 82;
    pet.happiness = 91;
    pet.cleanliness = 74;
    pet.health = 95;
    setGameActive(true);
    renderPet(pet);
    setupThumbnailShowcase();
    showMessage("루미와 친구들을 돌봐요!", 60000);
    return pet;
  }

  if (scene === "evolution") {
    pet = adultPet("루미");
    setGameActive(true);
    renderPet(pet);
    showMessage(`${pet.name}가 어른으로 진화했어요! 탐사 일지에 등록됐어요!`, 60000);
    return pet;
  }

  if (scene === "encyclopedia") {
    pet = adultPet("루미");
    seedEncyclopedia();
    setGameActive(true);
    renderPet(pet);
    document.getElementById("btn-new-pet-side")?.setAttribute("hidden", "");
    showEncyclopedia();
    return pet;
  }

  if (scene === "gameover") {
    pet = adultPet("치치");
    pet.isAlive = false;
    pet.bornAt = Date.now() - 5 * MS_PER_DAY;
    captureDeathSnapshot(pet);
    setGameActive(false);
    renderPet(pet);
    return pet;
  }

  pet = basePet("치치");
  setGameActive(true);
  renderPet(pet);
  showMessage("치치가 신나해요!", 60000);
  return pet;
}

const THUMBNAIL_SHOWCASE = [
  { variant: "golden", mood: "happy", hero: true },
  { variant: "standard", mood: "neutral", hero: false },
  { variant: "grumpy", mood: "sad", hero: false },
];

function setupThumbnailShowcase() {
  const petArea = document.getElementById("pet-area");
  const petDisplay = document.querySelector(".pet-display");
  if (petDisplay) {
    petDisplay.setAttribute("hidden", "");
  }

  const existing = document.getElementById("thumbnail-showcase");
  if (existing) existing.remove();

  const showcase = document.createElement("div");
  showcase.id = "thumbnail-showcase";
  showcase.className = "thumbnail-showcase";
  showcase.setAttribute("aria-hidden", "true");

  for (const slot of THUMBNAIL_SHOWCASE) {
    const item = document.createElement("div");
    item.className = `thumbnail-slot${slot.hero ? " thumbnail-slot--hero" : ""}`;

    const petWrap = document.createElement("div");
    petWrap.className = "thumbnail-pet-wrap";

    const petImg = document.createElement("img");
    petImg.className = "pet-evolution-img";
    petImg.src = `assets/sprites/adult/${slot.variant}.png`;
    petImg.alt = "";
    petImg.decoding = "async";
    petWrap.append(petImg);

    const moodBubble = document.createElement("div");
    moodBubble.className = "pet-mood-bubble";

    const moodWrap = document.createElement("div");
    moodWrap.className = "pet-mood-emoji";

    const moodImg = document.createElement("img");
    moodImg.className = "pet-mood-img";
    moodImg.src = `assets/sprites/mood/${slot.mood}.png`;
    moodImg.alt = "";
    moodWrap.append(moodImg);
    moodBubble.append(moodWrap);

    petWrap.append(moodBubble);
    item.append(petWrap);
    showcase.append(item);
  }

  petArea?.append(showcase);
}

export function resetStoreCaptureStorage() {
  clearPet();
  clearEncyclopedia();
  clearDeathSnapshot();
  localStorage.removeItem(SETTINGS_KEY);
}
