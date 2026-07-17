import {
  EVOLUTION_STAGES,
  EVOLUTION_ADULT_MIN_AGE_MS,
  getStageIndex,
} from "./evolution.js";
import { addToEncyclopedia } from "./encyclopedia.js";
import { setMuted } from "./audio.js";

const MS_PER_DAY = 86400000;

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function isGracDemoMode() {
  return new URLSearchParams(window.location.search).has("gracDemo");
}

function evolveToStage(ctx, stageId) {
  const pet = ctx.getPet();
  if (!pet) return;

  const idx = getStageIndex(stageId);
  const target = EVOLUTION_STAGES[idx];
  pet.bornAt = Date.now() - target.minAgeMs - MS_PER_DAY * 0.1;
  if (idx > 0) {
    pet.lastEvolutionStage = EVOLUTION_STAGES[idx - 1].id;
  }
  pet.isAlive = true;
  pet.isSleeping = false;
  ctx.handleEvolution({ notify: true });
  ctx.renderAndSave();
}

function evolveToAdultPretty(ctx) {
  const pet = ctx.getPet();
  if (!pet) return;

  pet.hunger = 88;
  pet.happiness = 90;
  pet.cleanliness = 85;
  pet.health = 92;
  pet.bornAt = Date.now() - EVOLUTION_ADULT_MIN_AGE_MS - MS_PER_DAY;
  pet.lastEvolutionStage = "teen";
  pet.adultVariantId = null;
  pet.adultCareSnapshot = null;
  pet.neglectStartedAt = null;
  ctx.handleEvolution({ notify: true });
  ctx.renderAndSave();
}

function ensureEncyclopediaEntry(ctx) {
  const pet = ctx.getPet();
  if (!pet?.adultVariantId) return;
  addToEncyclopedia(pet);
}

export async function runGracDemo(ctx) {
  window.__GRAC_DEMO_STARTED__ = true;
  setMuted(true);

  const pause = async (ms) => {
    await wait(ms);
  };

  const act = async (key) => {
    ctx.performAction(key);
    await pause(900);
  };

  try {
    ctx.clearStorage();
    await pause(800);
    ctx.showMessage("어비스펫: 심해 가상 펫", 2800);
    await pause(2200);

    ctx.startNewPet("루미");
    await pause(1800);
    ctx.showMessage("불가사의한 알이 나타났어요!", 2500);
    await pause(2000);

    await act("feed");
    await act("play");
    await act("clean");

    ctx.showMessage("알에서 라바가 깨어났어요!", 2000);
    evolveToStage(ctx, "baby");
    await pause(3200);

    await act("feed");
    await act("play");

    evolveToStage(ctx, "child");
    await pause(3200);

    await act("clean");
    await act("feed");

    evolveToStage(ctx, "teen");
    await pause(3200);

    await act("play");
    await act("feed");

    ctx.showMessage("성체로 진화합니다…", 2000);
    evolveToAdultPretty(ctx);
    await pause(5500);

    ensureEncyclopediaEntry(ctx);
    ctx.showEncyclopedia(ctx.getPet());
    await pause(5500);
    ctx.hideEncyclopedia();
    await pause(1200);

    await act("sleep");
    await pause(2200);
    await act("wake");
    await pause(1500);

    const pet = ctx.getPet();
    if (pet?.isAlive) {
      pet.hunger = 35;
      pet.happiness = 38;
      pet.cleanliness = 42;
      pet.lastUpdated = Date.now();
      ctx.renderAndSave();
      ctx.showMessage("스탯이 위험해요. 돌봐 주세요!", 2500);
      await pause(2800);
      await act("feed");
      await act("clean");
    }

    ctx.showMessage("활성 플레이 중 상어가 습격할 수 있어요…", 2500);
    await pause(2000);

    ctx.triggerSharkAttack();
    await pause(4500);

    const reviveBtn = document.getElementById("btn-revive-ad");
    if (reviveBtn && !reviveBtn.hidden) {
      reviveBtn.click();
      await pause(2800);
    }

    ctx.showMessage("시연 종료 — 감사합니다", 3000);
    await pause(2800);
  } finally {
    window.__GRAC_DEMO_DONE__ = true;
  }
}
