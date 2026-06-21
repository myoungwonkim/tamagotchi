import { getAdultTier, getAdultVariant } from "./adultVariants.js";
import { getEvolutionStage } from "./evolution.js";

const DIALOGUE = {
  pretty: {
    idle: [
      "심해가 반짝반짝!",
      "너랑 있으면 기분이 좋아.",
      "바다 밑에서 제일 행복해!",
      "고마워, 최고야!",
    ],
    feed: ["맛있어! 네가 챙겨줘서 더 맛있어.", "고마워, 배가 든든해!"],
    play: ["재밌다! 또 놀자!", "너랑 노는 게 제일 좋아!"],
    clean: ["상쾌해! 기분 최고!", "깨끗해서 헤엄치기 좋아!"],
    sleep: ["좋은 꿈 꿀게, 고마워.", "포근하게 재워줘서 고마워."],
    wake: ["좋은 아침! 오늘도 잘 부탁해!"],
    snoozing: ["쿨쿨…", "행복하게 잠든다…", "좋은 꿈 꾸는 중…", "zzz…"],
  },
  normal: {
    idle: ["배는 안 고파.", "그냥 그래.", "오늘 날씨 괜찮네.", "별일 없어."],
    feed: ["먹었어.", "그래, 고마워."],
    play: ["조금 재밌었어.", "그만해도 돼."],
    clean: ["깨끗해졌네.", "나쁘지 않아."],
    sleep: ["잘 자.", "..."],
    wake: ["깼어.", "아침이구나."],
    snoozing: ["쿨쿨.", "…", "zzz", "…쿨쿨"],
  },
  defective: {
    idle: [
      "왜 키운 거야…",
      "귀찮게 하지 마.",
      "날 좀 내버려 둬.",
      "별로야. 다 별로야.",
      "후회할 거야, 키운 거.",
    ],
    feed: ["이걸로 만족하라고?", "맛없어.", "그냥 먹을게, 시끄러워."],
    play: ["놀 시간 없어.", "재미없어. 그만해.", "싫어, 하지 마."],
    clean: ["더러워도 상관없어.", "굳이?", "어차피 금방 더러워져."],
    sleep: ["방해하지 마.", "..."],
    wake: ["왜 깨운 거야.", "피곤해, 조용히 해."],
    snoozing: ["…쿨쿨", "시끄러워…", "그만…", "…zzz"],
  },
};

const IDLE_INTERVALS = {
  pretty: 90000,
  normal: 75000,
  defective: 45000,
};

const SNOOZE_INTERVALS = {
  pretty: 80000,
  normal: 70000,
  defective: 55000,
};

let lastIdleAt = 0;
let lastLine = "";

export function pickAdultLine(pet, context = "idle") {
  const tier = getAdultTier(pet) ?? "normal";
  const pool = DIALOGUE[tier]?.[context] ?? DIALOGUE.normal.idle;
  if (!pool.length) return null;

  let line = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length > 1 && line === lastLine) {
    line = pool[(pool.indexOf(line) + 1) % pool.length];
  }
  lastLine = line;
  return line;
}

export function getAdultActionMessage(pet, actionKey) {
  if (getEvolutionStage(pet).id !== "adult" || !pet.adultVariantId) return null;
  if (pet.isSleeping && actionKey !== "sleep") return null;

  if (actionKey === "sleep") {
    return pickAdultLine(pet, pet.isSleeping ? "sleep" : "wake");
  }
  return pickAdultLine(pet, actionKey);
}

export function shouldShowIdleDialogue(pet, now = Date.now()) {
  if (!pet?.isAlive || !pet.adultVariantId) return false;
  if (getEvolutionStage(pet).id !== "adult") return false;

  const tier = getAdultTier(pet) ?? "normal";
  const context = pet.isSleeping ? "snoozing" : "idle";
  const intervals = pet.isSleeping ? SNOOZE_INTERVALS : IDLE_INTERVALS;
  const interval = intervals[tier] ?? intervals.normal;

  if (now - lastIdleAt < interval) return false;
  lastIdleAt = now;
  return pickAdultLine(pet, context);
}

export function resetDialogueTimer() {
  lastIdleAt = 0;
  lastLine = "";
}

export function getVariantLabel(pet) {
  if (!pet.adultVariantId) return null;
  return getAdultVariant(pet.adultVariantId).label;
}
