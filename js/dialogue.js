import { getAdultTier, getAdultVariant } from "./adultVariants.js";
import { getEvolutionStage } from "./evolution.js";
import { getMoodKind } from "./pet.js";

const ADULT_DIALOGUE = {
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

const STAGE_DIALOGUE = {
  egg: {
    happy: ["…반짝…", "안에서… 뭔가 움직여…", "따뜻해…", "쿵… 쿵…"],
    neutral: ["…반짝…", "안에서… 뭔가 움직여…", "따뜻해…", "쿵… 쿵…"],
    sad: ["…춥다…", "…왜 조용해…", "…빛이 약해…"],
    snoozing: ["…", "…쿨…", "…포근…"],
  },
  baby: {
    happy: ["으갸!", "너 왔다!", "같이 놀자!", "심해 처음인데 재밌어!"],
    neutral: ["…", "뭐 하는 거야?", "작아서 헤엄치기 힘들어…"],
    sad: ["배고파…", "외로워…", "어디 갔어…", "흑…"],
    snoozing: ["쿨쿨…", "작은 거품…", "zzz…", "포근해…"],
  },
  child: {
    happy: ["저기 뭐야?", "따라와!", "숨바꼭질하자!", "심해는 신기해!", "오늘 뭐 발견할까?"],
    neutral: ["심심한데…", "별일 없어.", "그냥 헤엄치는 중."],
    sad: ["놀아줘…", "심심해…", "기분이 별로야…", "배고픈 것 같아…"],
    snoozing: ["꿈속에서 헤엄쳐…", "쿨쿨…", "좋은 꿈…", "zzz…"],
  },
  teen: {
    happy: ["요즘 바다 분위기 괜찮네.", "나 좀 컸다고.", "…고마워. 말 안 해도.", "오늘은 기분 좋아."],
    neutral: ["별로 안 배고픈데.", "혼자 있고 싶어… 아니 그냥.", "뭐.", "그냥 그래."],
    sad: ["아무것도 재미없어.", "신경 안 써도 돼.", "…피곤해.", "왜 자꾸 신경 써."],
    snoozing: ["…쿨쿨", "깨우지 마…", "5분만…", "…zzz"],
  },
};

const ADULT_IDLE_INTERVALS = {
  pretty: 90000,
  normal: 75000,
  defective: 45000,
};

const ADULT_SNOOZE_INTERVALS = {
  pretty: 80000,
  normal: 70000,
  defective: 55000,
};

const STAGE_IDLE_INTERVALS = {
  egg: 120000,
  baby: 70000,
  child: 75000,
  teen: 80000,
};

const STAGE_SNOOZE_INTERVALS = {
  egg: 100000,
  baby: 60000,
  child: 65000,
  teen: 70000,
};

let lastIdleAt = 0;
let lastLine = "";

function pickFromPool(pool) {
  if (!pool?.length) return null;

  let line = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length > 1 && line === lastLine) {
    line = pool[(pool.indexOf(line) + 1) % pool.length];
  }
  lastLine = line;
  return line;
}

/** @returns {"snoozing"|"happy"|"neutral"|"sad"|"idle"} */
export function getIdlePoolKey(pet) {
  if (pet.isSleeping) return "snoozing";

  const mood = getMoodKind(pet);
  if (mood === "sick" || mood === "sad") return "sad";
  if (mood === "happy") return "happy";
  if (mood === "neutral") return "neutral";
  return "neutral";
}

function getIdleInterval(pet, stageId) {
  if (stageId === "adult") {
    const tier = getAdultTier(pet) ?? "normal";
    const intervals = pet.isSleeping ? ADULT_SNOOZE_INTERVALS : ADULT_IDLE_INTERVALS;
    return intervals[tier] ?? intervals.normal;
  }

  const intervals = pet.isSleeping ? STAGE_SNOOZE_INTERVALS : STAGE_IDLE_INTERVALS;
  return intervals[stageId] ?? intervals.baby;
}

function pickAdultPool(pet, context) {
  const tier = getAdultTier(pet) ?? "normal";
  const tierDialogue = ADULT_DIALOGUE[tier] ?? ADULT_DIALOGUE.normal;

  if (context === "snoozing") return tierDialogue.snoozing;
  if (context === "idle") return tierDialogue.idle;
  return tierDialogue[context] ?? tierDialogue.idle;
}

function pickStagePool(stageId, poolKey) {
  const stage = STAGE_DIALOGUE[stageId];
  if (!stage) return null;
  return stage[poolKey] ?? stage.neutral ?? stage.happy;
}

export function pickIdleLine(pet) {
  if (!pet?.isAlive) return null;

  const stageId = getEvolutionStage(pet).id;
  const poolKey = getIdlePoolKey(pet);

  if (stageId === "adult") {
    if (!pet.adultVariantId) return null;
    const context = poolKey === "snoozing" ? "snoozing" : "idle";
    return pickFromPool(pickAdultPool(pet, context));
  }

  return pickFromPool(pickStagePool(stageId, poolKey));
}

/** @deprecated use pickIdleLine — kept for dev panel adult-only path */
export function pickAdultLine(pet, context = "idle") {
  const tier = getAdultTier(pet) ?? "normal";
  const pool = ADULT_DIALOGUE[tier]?.[context] ?? ADULT_DIALOGUE.normal.idle;
  return pickFromPool(pool);
}

export function getAdultActionMessage(pet, actionKey) {
  if (getEvolutionStage(pet).id !== "adult" || !pet.adultVariantId) return null;
  if (pet.isSleeping && actionKey !== "sleep") return null;

  if (actionKey === "sleep") {
    return pickFromPool(pickAdultPool(pet, pet.isSleeping ? "sleep" : "wake"));
  }
  return pickFromPool(pickAdultPool(pet, actionKey));
}

export function shouldShowIdleDialogue(pet, now = Date.now()) {
  if (!pet?.isAlive) return false;

  const stageId = getEvolutionStage(pet).id;
  if (stageId === "adult" && !pet.adultVariantId) return false;

  const interval = getIdleInterval(pet, stageId);
  if (now - lastIdleAt < interval) return false;

  lastIdleAt = now;
  return pickIdleLine(pet);
}

export function resetDialogueTimer() {
  lastIdleAt = 0;
  lastLine = "";
}

export function getVariantLabel(pet) {
  if (!pet.adultVariantId) return null;
  return getAdultVariant(pet.adultVariantId).label;
}
