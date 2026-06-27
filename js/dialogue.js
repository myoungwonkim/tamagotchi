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
      "오늘 물결이 부드러워서 좋아.",
      "이런 날엔 천천히 헤엄치고 싶어.",
      "네 덕분에 매일이 특별해.",
      "심해에도 별빛 같은 게 있나 봐.",
      "웃음이 멈추질 않아!",
      "다음에도 같이 놀자, 약속!",
      "배도 든든하고 마음도 든든해.",
      "너는 나한테 최고의 친구야.",
    ],
    feed: [
      "맛있어! 네가 챙겨줘서 더 맛있어.",
      "고마워, 배가 든든해!",
      "오늘 먹이도 완벽해!",
      "한 입 더? …농담이야, 고마워!",
      "맛있어서 꼬리가 들썩들썩!",
      "이런 맛은 심해에서만 느낄 수 있어.",
    ],
    play: [
      "재밌다! 또 놀자!",
      "너랑 노는 게 제일 좋아!",
      "오늘은 누가 더 빨리 헤엄치나!",
      "하하, 또 졌다! 다음엔 내가 이길 거야.",
      "놀다 보니 시간이 금방 가.",
      "심심할 틈이 없어, 고마워!",
    ],
    clean: [
      "상쾌해! 기분 최고!",
      "깨끗해서 헤엄치기 좋아!",
      "비늘이 반짝반짝!",
      "청소해줘서 고마워, 몸이 가벼워!",
      "이제 어디든 자신 있게 갈 수 있어.",
      "깨끗한 물속 기분, 최고야!",
    ],
    sleep: [
      "좋은 꿈 꿀게, 고마워.",
      "포근하게 재워줘서 고마워.",
      "오늘도 수고했어, 잘 자.",
      "내일도 같이 놀자!",
      "…쿨쿨, 안녕…",
      "따뜻해서 금방 잠들 것 같아.",
    ],
    wake: [
      "좋은 아침! 오늘도 잘 부탁해!",
      "잘 잤어! 오늘 기분 최고!",
      "일어났다! 오늘 뭐 할까?",
    ],
    snoozing: [
      "쿨쿨…",
      "행복하게 잠든다…",
      "좋은 꿈 꾸는 중…",
      "zzz…",
      "…포근해…",
      "…응…? 아직 잠…",
      "…조금만 더…",
      "…꿈속에서 헤엄쳐…",
      "…고마워…",
      "…zzz…",
      "…안녕…",
      "…쿨…",
    ],
  },
  normal: {
    idle: [
      "배는 안 고파.",
      "그냥 그래.",
      "오늘 날씨 괜찮네.",
      "별일 없어.",
      "심해는 늘 비슷하지.",
      "딱히 할 말은 없어.",
      "그냥 헤엄치는 중.",
      "오늘도 평범한 하루.",
      "…응, 잘 지내.",
      "조용한 게 나쁘진 않아.",
      "시간은 잘 가네.",
      "뭐, 나쁘지 않아.",
    ],
    feed: [
      "먹었어.",
      "그래, 고마워.",
      "배 채웠어.",
      "맛은 그럭저럭.",
      "다음에도 부탁해.",
      "…고마워.",
    ],
    play: [
      "조금 재밌었어.",
      "그만해도 돼.",
      "나쁘지 않았어.",
      "다음엔 좀 더 천천히.",
      "…괜찮아.",
      "됐어, 충분해.",
    ],
    clean: [
      "깨끗해졌네.",
      "나쁘지 않아.",
      "시원하긴 하네.",
      "…고마워.",
      "이 정도면 됐어.",
      "덕분에 좀 나아졌어.",
    ],
    sleep: [
      "잘 자.",
      "...",
      "…쿨쿨.",
      "내일 봐.",
      "…응.",
      "…잘 자.",
    ],
    wake: [
      "깼어.",
      "아침이구나.",
      "…일어났어.",
      "…좋은 아침.",
      "…잘 잤어.",
      "…시작하자.",
    ],
    snoozing: [
      "쿨쿨.",
      "…",
      "zzz",
      "…쿨쿨",
      "…응…",
      "…조용히…",
      "…zzz…",
      "…아직…",
      "…5분…",
      "……",
      "…쿨…",
      "…잠…",
    ],
  },
  defective: {
    idle: [
      "왜 키운 거야…",
      "귀찮게 하지 마.",
      "날 좀 내버려 둬.",
      "별로야. 다 별로야.",
      "후회할 거야, 키운 거.",
      "심해는 원래 이렇게 시큰둥해.",
      "말 걸지 마.",
      "…또 왔네.",
      "기대하지 마.",
      "어차피 금방 싫어질 거야.",
      "난 잘 못 자란 거야.",
      "…그냥 봐.",
      "네가 없었으면 나았을지도.",
      "왜 자꾸 챙기는 거야.",
      "…피곤해.",
    ],
    feed: [
      "이걸로 만족하라고?",
      "맛없어.",
      "그냥 먹을게, 시끄러워.",
      "…고마운 척은 안 할 거야.",
      "배만 채웠어.",
      "다음엔 더 나은 걸로.",
      "…먹었으니까 조용해.",
      "이 맛이 뭐가 좋다는 거야.",
      "…됐어, 그만.",
    ],
    play: [
      "놀 시간 없어.",
      "재미없어. 그만해.",
      "싫어, 하지 마.",
      "…지겨워.",
      "나 바쁜 척이라도 할게.",
      "그만 웃어.",
      "…또 시작이네.",
      "재미있다고 말 안 할 거야.",
      "…됐어, 그만해.",
    ],
    clean: [
      "더러워도 상관없어.",
      "굳이?",
      "어차피 금방 더러워져.",
      "…시간 낭비.",
      "깨끗해져도 기분은 그대로야.",
      "…고마워. …아니야.",
      "다음엔 안 해도 돼.",
      "…그래, 됐어.",
      "어차피 아무도 안 봐.",
    ],
    sleep: [
      "방해하지 마.",
      "...",
      "…조용히.",
      "…잘 거야.",
      "…깨우지 마.",
      "……",
    ],
    wake: [
      "왜 깨운 거야.",
      "피곤해, 조용히 해.",
      "…아직 안 잤어.",
      "…5분만 더.",
      "…귀찮아.",
      "…또 하루가 시작됐네.",
    ],
    snoozing: [
      "…쿨쿨",
      "시끄러워…",
      "그만…",
      "…zzz",
      "…방해하지 마…",
      "…응…?",
      "…조용히…",
      "…zzz…",
      "…아직…",
      "……",
      "…쿨…",
      "…잠…",
    ],
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
    happy: [
      "요즘 바다 분위기 괜찮네.",
      "나 좀 컸다고.",
      "…고마워. 말 안 해도.",
      "오늘은 기분 좋아.",
      "헤엄 실력 늘었지? 봤지?",
      "심해 밤바다, 생각보다 멋있어.",
      "가끔은 이렇게 있는 것도 나쁘지 않아.",
      "네가 와서 조용한 것도 괜찮아졌어.",
      "오늘은 뭔가 잘 될 것 같아.",
      "…웃지 마. 그냥 기분 좋다는 거야.",
      "커다란 물고기처럼 보이지? …조금?",
      "다음엔 더 깊은 데도 가보고 싶어.",
    ],
    neutral: [
      "별로 안 배고픈데.",
      "혼자 있고 싶어… 아니 그냥.",
      "뭐.",
      "그냥 그래.",
      "오늘은 말할 게 없어.",
      "바다 소리 들리지? …나도 들려.",
      "가만히 있어도 되지?",
      "딱히 심심하진 않아.",
      "…뭐 보려고 그래.",
      "그냥 헤엄치는 중이야.",
      "별일 없으면 건드리지 마.",
      "생각 중이야. 조용히.",
    ],
    sad: [
      "아무것도 재미없어.",
      "신경 안 써도 돼.",
      "…피곤해.",
      "왜 자꾸 신경 써.",
      "기분이 가라앉는 것 같아.",
      "말하고 싶지 않아.",
      "그냥 내버려 둬.",
      "오늘은 좀 무거워.",
      "웃으라고 하지 마.",
      "…괜찮아. 안 괜찮은데.",
      "심해가 왜 이렇게 조용하지.",
      "아무한테도 말 안 할 거야.",
    ],
    snoozing: [
      "…쿨쿨",
      "깨우지 마…",
      "5분만…",
      "…zzz",
      "…조금만 더…",
      "꿈속에서도 헤엄쳐…",
      "…시끄러워…",
      "…응…?",
      "…안 깨어났어…",
      "…포근…",
      "…zzz…",
      "…내일 말해…",
    ],
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
  return getAdultVariant(pet.adultVariantId, pet.speciesTheme).label;
}
