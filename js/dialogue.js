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
    feedLow: [
      "배고팠어… 진짜 고마워!",
      "이제 살 것 같아!",
      "허기 가시니까 세상이 반짝여.",
      "늦게라도 챙겨줘서 다행이야.",
    ],
    play: [
      "재밌다! 또 놀자!",
      "너랑 노는 게 제일 좋아!",
      "오늘은 누가 더 빨리 헤엄치나!",
      "하하, 또 졌다! 다음엔 내가 이길 거야.",
      "놀다 보니 시간이 금방 가.",
      "심심할 틈이 없어, 고마워!",
    ],
    playFull: [
      "신나긴 한데, 잠깐 숨 고를게.",
      "이미 기분이 좋은데 또 놀아 주네!",
      "조금만 천천히… 그래도 좋아.",
      "오늘은 이미 충분한 것 같아. 고마워!",
    ],
    clean: [
      "상쾌해! 기분 최고!",
      "깨끗해서 헤엄치기 좋아!",
      "비늘이 반짝반짝!",
      "청소해줘서 고마워, 몸이 가벼워!",
      "이제 어디든 자신 있게 갈 수 있어.",
      "깨끗한 물속 기분, 최고야!",
    ],
    cleanLow: [
      "후… 이제야 숨이 편해.",
      "끈적했던 게 다 떨어졌어, 고마워!",
      "몸이 가벼워지니까 헤엄이 신나.",
      "더러워서 미안했어. 이제 반짝인다!",
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
    feedLow: [
      "배고팠는데, 됐어.",
      "이제 좀 살겠어.",
      "늦게라도 줘서 다행이야.",
      "허기는 가셨어. 고마워.",
    ],
    play: [
      "조금 재밌었어.",
      "그만해도 돼.",
      "나쁘지 않았어.",
      "다음엔 좀 더 천천히.",
      "…괜찮아.",
      "됐어, 충분해.",
    ],
    playFull: [
      "이미 괜찮은데.",
      "이 정도면 됐어.",
      "너무 자주 안 해도 돼.",
      "숨 고르고 있을게.",
    ],
    clean: [
      "깨끗해졌네.",
      "나쁘지 않아.",
      "시원하긴 하네.",
      "…고마워.",
      "이 정도면 됐어.",
      "덕분에 좀 나아졌어.",
    ],
    cleanLow: [
      "좀 지저분했는데, 됐어.",
      "이제 덜 끈적여.",
      "이 정도면 헤엄칠 만해.",
      "…고마워. 편해졌어.",
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
    feedLow: [
      "배고파서 먹은 거야. 착한 척 하지 마.",
      "허기는 가셨으니까 이제 꺼져.",
      "이걸로 생색내지 마.",
      "안 주면 더 짜증 났을 뿐이야.",
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
    playFull: [
      "이미 충분하대도.",
      "그만 들볶아.",
      "지금 분위기 깨지 마.",
      "…됐어. 혼자 있을게.",
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
    cleanLow: [
      "더러워서 한 거지. 칭찬 기대하지 마.",
      "이제 덜 끈적일 뿐이야.",
      "생색내지 마. 원래 네 일이야.",
      "…됐어. 만지지 마.",
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
    feed: {
      happy: ["…달콤…", "안에서 출렁…"],
      neutral: ["…냠…", "…따뜻해…"],
      sad: ["…배고파…", "…조금만…"],
    },
    play: {
      happy: ["…흔들…", "…어장질…"],
      neutral: ["…둥실…", "…어라…"],
      sad: ["…조용히…", "…안아 줘…"],
    },
    clean: {
      happy: ["…반짝…", "…시원…"],
      neutral: ["…물결…", "…닦아…"],
      sad: ["…추워…", "…부드럽게…"],
    },
    sleep: {
      happy: ["…포근…", "…쿨…"],
      neutral: ["…", "…잠…"],
      sad: ["…어둡다…", "…옆에…"],
    },
    wake: {
      happy: ["…반짝!", "쿵… 쿵…"],
      neutral: ["…일어났어…", "…빛…"],
      sad: ["…아직…", "…춥다…"],
    },
  },
  baby: {
    happy: ["으갸!", "너 왔다!", "같이 놀자!", "심해 처음인데 재밌어!"],
    neutral: ["…", "뭐 하는 거야?", "작아서 헤엄치기 힘들어…"],
    sad: ["배고파…", "외로워…", "어디 갔어…", "흑…"],
    snoozing: ["쿨쿨…", "작은 거품…", "zzz…", "포근해…"],
    feed: {
      happy: ["으갸, 맛있어!", "더 줘!", "배부르다!", "냠냠, 좋아!"],
      neutral: ["먹었어.", "이게 밥이야?", "배, 조금 찼어.", "…고마워."],
      sad: ["배고팠어…", "흑, 고마워…", "이제 덜 배고파…", "더 있으면…?"],
    },
    play: {
      happy: ["같이 놀자!", "또 하자!", "으갸! 재밌어!", "숨바꼭질!"],
      neutral: ["뭐야, 이거?", "조금 신기해.", "또… 해도 돼?", "헤엄, 어려워…"],
      sad: ["놀아줘…", "외로웠어…", "가지 마…", "흑, 같이…"],
    },
    clean: {
      happy: ["깨끗하다!", "간지러워, 헤헤", "반짝!", "시원해!"],
      neutral: ["물이야?", "조금 차갑네.", "닦았어.", "…응."],
      sad: ["추워…", "살살…", "흑, 미안…", "이제 덜 끈적…"],
    },
    sleep: {
      happy: ["포근해…", "쿨쿨…", "잘게…", "옆에 있어…"],
      neutral: ["졸려…", "zzz…", "조금만…", "불 꺼…"],
      sad: ["혼자 싫어…", "안아 줘…", "흑… 잘게…", "가지 마…"],
    },
    wake: {
      happy: ["일어났어!", "너 왔다!", "오늘 놀자!", "으갸!"],
      neutral: ["하암…", "아침이야?", "일어났어.", "…응."],
      sad: ["아직 졸려…", "어디 갔어…", "흑…", "옆에 있어…"],
    },
  },
  child: {
    happy: ["저기 뭐야?", "따라와!", "숨바꼭질하자!", "심해는 신기해!", "오늘 뭐 발견할까?"],
    neutral: ["심심한데…", "별일 없어.", "그냥 헤엄치는 중."],
    sad: ["놀아줘…", "심심해…", "기분이 별로야…", "배고픈 것 같아…"],
    snoozing: ["꿈속에서 헤엄쳐…", "쿨쿨…", "좋은 꿈…", "zzz…"],
    feed: {
      happy: ["맛있다! 또 있어?", "배 든든해!", "오늘 먹이 최고!", "냠, 고마워!", "꼬리가 들썩들썩!"],
      neutral: ["먹었어.", "그럭저럭이야.", "배 찼어.", "다음에도 줘.", "…고마워."],
      sad: ["배고팠어…", "이제 좀 살겠어.", "늦게라도 고마워.", "더 있으면 줘…", "허기 가셨다…"],
    },
    play: {
      happy: ["또 하자!", "숨바꼭질!", "따라와!", "심해 탐험이야!", "내가 이겼지?"],
      neutral: ["심심 풀렸어.", "조금 재밌었어.", "잠깐이면 돼.", "다음엔 뭐 하지?", "…응, 놀았어."],
      sad: ["놀아줘서 다행이야…", "심심했어…", "가지 마, 조금만 더.", "기분 풀렸어… 조금.", "같이 있어 줘."],
    },
    clean: {
      happy: ["반짝반짝!", "시원하다!", "이제 자신 있어!", "비늘 봐!", "고마워, 가벼워!"],
      neutral: ["깨끗해졌네.", "물 차갑네.", "이 정도면 됐어.", "…고마워.", "헤엄치기 괜찮다."],
      sad: ["끈적했어… 미안.", "이제 덜 더러워.", "살살 해 줘서 고마워.", "몸이 편해졌어…", "추웠는데, 괜찮아."],
    },
    sleep: {
      happy: ["좋은 꿈 꿀게!", "포근해, 잘 자.", "내일 또 놀자.", "쿨쿨… 안녕.", "옆에 있어 줘서 좋아."],
      neutral: ["졸려… 잘게.", "불 꺼 줘.", "내일 봐.", "zzz…", "…응, 잘게."],
      sad: ["혼자 자기 싫어…", "옆에 있어 줘.", "악몽 싫어요…", "흑, 잘게…", "깨우지 마… 근데 있어 줘."],
    },
    wake: {
      happy: ["좋은 아침!", "오늘 뭐 발견할까?", "일어났어, 놀자!", "잘 잤어!", "따라와!"],
      neutral: ["하암, 아침이네.", "일어났어.", "오늘도 그냥 그래.", "…좋은 아침.", "시작하자."],
      sad: ["아직 졸려…", "악몽 꿨어…", "옆에 있었어?", "일어나기 싫어…", "조금만 더… 아니, 일어났어."],
    },
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
    feed: {
      happy: [
        "맛있네. …고마워.",
        "배 든든해. 말 안 해도 알지?",
        "오늘 먹이 괜찮았어.",
        "한 입 더? …농담이야.",
        "이 정도면 충분해. 고마워.",
      ],
      neutral: ["먹었어.", "그럭저럭.", "배 찼어.", "다음에도 줘.", "…고마워.", "별로 안 배고팠는데."],
      sad: [
        "배고팠거든. …고마워.",
        "허기는 가셨어.",
        "늦게라도 줘서 다행이야.",
        "생색내진 마. 그래도 됐어.",
        "이제 좀 살겠어.",
      ],
    },
    play: {
      happy: [
        "조금 재밌었어. 인정.",
        "헤엄 실력 봤지?",
        "또 해도 돼. …원하면.",
        "시간 가는 줄 몰랐네.",
        "…웃지 마. 그냥 좋았다는 거야.",
      ],
      neutral: ["그만해도 돼.", "나쁘지 않았어.", "이 정도면 됐어.", "…괜찮아.", "심심 풀렸어.", "다음엔 천천히."],
      sad: [
        "심심하긴 했어.",
        "잠깐은 나았어.",
        "억지로 웃으라고 하진 마.",
        "그래도… 있어 줘서 괜찮아.",
        "됐어, 이만하면.",
      ],
    },
    clean: {
      happy: [
        "비늘 괜찮아졌네.",
        "시원하긴 하다.",
        "이제 좀 자신 있어.",
        "…고마워. 말 안 해도.",
        "깨끗한 게 싫진 않아.",
      ],
      neutral: ["굳이?", "이 정도면 됐어.", "시원하네.", "…고마워.", "금방 또 더러워질 텐데.", "나쁘지 않아."],
      sad: [
        "좀 지저분하긴 했어.",
        "이제 덜 끈적여.",
        "만지는 건 질색인데… 됐어.",
        "…고마워. 편해졌어.",
        "생색내진 마.",
      ],
    },
    sleep: {
      happy: ["잘 자. 내일도.", "포근하네…", "깨우지 마. 좋은 꿈.", "…고마워.", "내일 봐."],
      neutral: ["잘 자.", "...", "…쿨쿨.", "내일 봐.", "…응.", "불 꺼."],
      sad: ["방해하지 마.", "혼자 있을게… 아니, 있어 줘.", "악몽 싫으니까.", "…조용히.", "5분만… 아니, 잘게."],
    },
    wake: {
      happy: ["깼어. 오늘은 괜찮네.", "좋은 아침. …말 안 해도 돼.", "일어났어. 뭐 하게?", "잘 잤어.", "시작하자."],
      neutral: ["깼어.", "아침이구나.", "…일어났어.", "…좋은 아침.", "하암.", "…시작하자."],
      sad: ["왜 깨운 거야.", "아직 안 잤어.", "5분만 더.", "…귀찮아.", "또 하루네.", "…피곤해."],
    },
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
const recentLines = [];

function pickFromPool(pool) {
  if (!pool?.length) return null;

  const avoidCount = pool.length >= 4 ? 3 : pool.length > 1 ? 1 : 0;
  const avoid = new Set(recentLines.slice(-avoidCount));
  const candidates = avoidCount ? pool.filter((line) => !avoid.has(line)) : pool;
  const source = candidates.length ? candidates : pool;
  const line = source[Math.floor(Math.random() * source.length)];
  recentLines.push(line);
  if (recentLines.length > 3) recentLines.shift();
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

function pickStageActionPool(stageId, actionKey, moodKey) {
  const action = STAGE_DIALOGUE[stageId]?.[actionKey];
  if (!action) return null;
  if (Array.isArray(action)) return action;
  return action[moodKey] ?? action.neutral ?? action.happy ?? null;
}

const STAT_LOW = 40;
const STAT_FULL = 80;

function pickAdultActionPool(pet, actionKey, before) {
  const d = ADULT_DIALOGUE[getAdultTier(pet) ?? "normal"] ?? ADULT_DIALOGUE.normal;
  if (actionKey === "feed" && before?.hunger < STAT_LOW && d.feedLow?.length) return d.feedLow;
  if (actionKey === "play" && before?.happiness >= STAT_FULL && d.playFull?.length) return d.playFull;
  if (actionKey === "clean" && before?.cleanliness < STAT_LOW && d.cleanLow?.length) return d.cleanLow;
  return d[actionKey] ?? d.idle;
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

export function getCareActionMessage(pet, actionKey, statsBefore = pet) {
  if (!pet?.isAlive) return null;
  if (pet.isSleeping && actionKey !== "sleep") return null;

  const resolvedKey = actionKey === "sleep" ? (pet.isSleeping ? "sleep" : "wake") : actionKey;
  const stageId = getEvolutionStage(pet).id;
  const moodSource = { ...pet, ...statsBefore };
  const moodKey = getIdlePoolKey(moodSource);
  const actionMood = moodKey === "snoozing" ? "neutral" : moodKey;

  if (stageId === "adult") {
    if (!pet.adultVariantId) return null;
    return pickFromPool(pickAdultActionPool(pet, resolvedKey, statsBefore));
  }

  return pickFromPool(pickStageActionPool(stageId, resolvedKey, actionMood));
}

/** @deprecated use getCareActionMessage */
export function getAdultActionMessage(pet, actionKey) {
  return getCareActionMessage(pet, actionKey);
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
  recentLines.length = 0;
}

export function getVariantLabel(pet) {
  if (!pet.adultVariantId) return null;
  return getAdultVariant(pet.adultVariantId, pet.speciesTheme).label;
}
