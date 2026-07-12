import { ADULT_VARIANTS, getAdultVariant } from "./adultVariants.js";
import { getEvolutionStage } from "./evolution.js";
import {
  DEFAULT_SPECIES_THEME,
  getVariantLabelForTheme,
  normalizeSpeciesTheme,
} from "./speciesThemes.js";

const STORAGE_KEY = "tamagotchi-encyclopedia";

function createEntryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeEncyclopediaEntry(entry) {
  if (!entry || typeof entry.id !== "string") return null;
  if (typeof entry.variantId !== "string") return null;
  if (!ADULT_VARIANTS.some((variant) => variant.id === entry.variantId)) return null;

  let speciesTheme = DEFAULT_SPECIES_THEME;
  if (typeof entry.speciesTheme === "string") {
    speciesTheme = normalizeSpeciesTheme(entry.speciesTheme);
  } else if (typeof entry.label === "string" && /인어|어인/.test(entry.label)) {
    speciesTheme = "mermaid";
  }

  return {
    ...entry,
    speciesTheme,
    label: getVariantLabelForTheme(entry.variantId, speciesTheme),
  };
}

export function loadEncyclopedia() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries)) return { entries: [] };
    return {
      entries: parsed.entries
        .map(normalizeEncyclopediaEntry)
        .filter(Boolean),
    };
  } catch {
    return { entries: [] };
  }
}

function saveEncyclopedia(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getCollectedCount(speciesTheme) {
  const data = loadEncyclopedia();
  if (speciesTheme == null) {
    return data.entries.length;
  }
  const theme = normalizeSpeciesTheme(speciesTheme);
  const collected = new Set();
  for (const entry of data.entries) {
    if (normalizeSpeciesTheme(entry.speciesTheme) === theme) {
      collected.add(entry.variantId);
    }
  }
  return collected.size;
}

export function getCollectedVariantIds(speciesTheme) {
  const data = loadEncyclopedia();
  if (speciesTheme == null) {
    return new Set(data.entries.map((e) => e.variantId));
  }
  const theme = normalizeSpeciesTheme(speciesTheme);
  return new Set(
    data.entries
      .filter((e) => normalizeSpeciesTheme(e.speciesTheme) === theme)
      .map((e) => e.variantId),
  );
}

export function addToEncyclopedia(pet) {
  if (!pet?.adultVariantId) return null;
  if (getEvolutionStage(pet).id !== "adult") return null;

  const variant = getAdultVariant(pet.adultVariantId, pet.speciesTheme);
  const speciesTheme = normalizeSpeciesTheme(pet.speciesTheme);
  const data = loadEncyclopedia();

  const duplicate = data.entries.find(
    (e) =>
      e.petBornAt === pet.bornAt &&
      e.variantId === pet.adultVariantId &&
      normalizeSpeciesTheme(e.speciesTheme) === speciesTheme,
  );
  if (duplicate) {
    duplicate.label = getVariantLabelForTheme(variant.id, speciesTheme);
    duplicate.speciesTheme = speciesTheme;
    duplicate.emoji = variant.emoji;
    saveEncyclopedia(data);
    return duplicate;
  }

  const entry = {
    id: createEntryId(),
    petName: pet.name,
    petBornAt: pet.bornAt,
    variantId: variant.id,
    tier: variant.tier,
    emoji: variant.emoji,
    spriteId: variant.spriteId,
    label: getVariantLabelForTheme(variant.id, speciesTheme),
    speciesTheme,
    achievedAt: Date.now(),
    careSnapshot: pet.adultCareSnapshot ?? null,
  };

  data.entries.unshift(entry);
  saveEncyclopedia(data);
  return entry;
}

export function clearEncyclopedia() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getEncyclopediaSlots(speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  const data = loadEncyclopedia();
  return ADULT_VARIANTS.map((variant) => {
    const entries = data.entries.filter(
      (e) =>
        e.variantId === variant.id &&
        normalizeSpeciesTheme(e.speciesTheme) === theme,
    );
    return {
      variant,
      speciesTheme: theme,
      collected: entries.length > 0,
      entries,
    };
  });
}

export function formatAchievedDate(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

/** variantId → {name} 치환 가능한 기괴한 도감 설명 (심해어) */
const DEEPSEA_ENCYCLOPEDIA_DESCRIPTIONS = {
  golden:
    "{name}의 등에는 영원히 꺼지지 않는 할로겐이 붙어 있어요. 심해 한가운데서도 길을 잃지 않지만, 가끔 지나가던 물고기 눈을 멀게 합니다. 밤마다 등불을 켜 두는 이유는 '어둠이 무서워서'라고 주장하지만, 사실은 지나가는 친구에게 인사하려는 것뿐이에요. 전기세는 주인 몫입니다.",
  fluffy:
    "{name}의 우산 안에는 무지개 빛살 밴드가 천천히 흐르고, 촉수 끝에서는 독성 녹색 스파클이 깜박여요. 밝아질수록 기분이 좋다는 신호인데, {name}은 ‘경고등 점검 중’이라고만 합니다. 손 대지 마세요. 인사하려다 독침을 맞을 수 있어요. 멀리서 고개만 끄덕여 주면 {name}은 아주 만족해요.",
  sparkle:
    "{name}의 촉수 안쪽에는 청록색 발광 흡반이 줄지어 있어요. 평소엔 촉수를 모았다가, 기분이 좋거나 먹이 근처에서는 촉수를 쫙 펼치며 흡반을 하나씩 켜요. {name}은 그걸 ‘조명 리허설’이라고 부르지만, 사실은 자랑하는 거예요. 발광이 세지면 가까이 가지 마세요. 친하다는 뜻일 수도 있고, 지렁이일 수도 있습니다.",
  standard:
    "{name}은 산호암 틈새에서 하루 종일 천천히 기어다녀요. 등의 복숭아색 아가미 꽃은 숨 쉴 때마다 살짝 펴졌다 접혔다 하고, 머리 더듬이는 ‘아직 생각 중’이라며 한 박자 느리게 움직입니다. 패각은 오래전에 버렸지만, 대신 크림색 점무늬를 얻었고 — 그걸로 충분하다고 주장해요.",
  farm:
    "{name}의 지느러미 사이사이에 해조류가 자라요. 스스로 키운 채소를 먹는다고 주장하지만, 사실은 그냥 안 빗겨 주는 겁니다. 수확 시기마다 몸이 무거워져 헤엄치기 귀찮아하고, 그때가 바로 '채소 다이어트'를 시작하는 때예요. 다음 날 또 자랍니다.",
  plain:
    "{name}은 잉어 몸에 사람 얼굴을 얹은 채 바닥을 천천히 지나가요. 입은 하루에도 몇 번씩 한숨과 하품을 번갈아 내는데, 본인은 '물살을 마시는 중'이라고만 합니다. 눈을 마주치면 잠깐 슬퍼 보이지만, 곧 '원래 이런 얼굴'이라고 둘러대요. 전설에 나온다는 말을 들으면 살짝 자랑합니다.",
  scruffy:
    "{name}은 입을 크게 벌린 채 바닥에 가만히 누워 있어요. 머리 위 주황 유인등은 거의 움직이지 않는데, '이미 완벽한 위치'라고 주장합니다. 입이 닫히는 속도는 매우 느려서, 지나가던 먹이가 '지금?' 하다가 하품만 하고 갑니다. 먹이를 놓치면 '일부러 안 먹었어'라고 말합니다.",
  grumpy:
    "{name}의 촉수 끝은 녹색으로 빛나요. 평소엔 바닥에 붙어 가만히 있다가, 기분이 좋거나 먹이가 지나가면 촉수를 천천히 흔들며 더 밝아집니다. 하얀 구강 안의 진홍 속은 '인사'라고 주장하지만, 손을 대면 보라 독액이 떨어져요. 가까이 가지 마세요. 멀리서 고개만 끄덕이면 {name}은 아주 만족해요.",
  sickly:
    "{name}의 몸에는 초록 발광점이 박혀 있고, 머리 위 유인등은 항상 같은 자리를 지킵니다. 입은 갑자기 쩍 벌어졌다가 천천히 다물어지는데, 그때마다 지나가는 먹이가 깜짝 놀라요. {name}은 '인사한 것뿐'이라고 하지만, 이빨이 너무 길어서 설득력이 없습니다. 밤에만 더 밝아진다고 주장합니다.",
};

/** variantId → {name} 치환 가능한 도감 설명 (인어 — 티어 콘셉트 캐릭터) */
const MERMAID_ENCYCLOPEDIA_DESCRIPTIONS = {
  golden:
    "{name}은 허리와 머리카락에 걸린 진주 끈이 물살 따라 흔들리는 심해 인어예요. 가슴의 청록 보석은 기분이 좋을 때마다 은은하게 빛나고, 어깨 지느러미는 바람 대신 물결을 받아들입니다. 정면으로 인사하면 고개를 살짝 숙이는데, '위엄 있는 수호'라 불리지만 사실은 수줍어서 그런 거라고 주장합니다. 진주가 떨어지면 행운이라 하지만, {name}은 분실물이라며 다시 주워요.",
  fluffy:
    "{name}은 등에 큰 소라 껍데기를 지고 다니면서, 작은 소라 나팔로 바닷속 멜로디를 불어요. 음표 대신 물방울이 피어오르고, 지나가는 물고기는 잠깐 멈춰 듣다가 고개만 끄덕입니다. 껍데기가 무거워 헤엄이 느린 건 사실인데, {name}은 “무대 세팅 중”이라고만 해요. 나팔 소리가 들리면 기분이 좋다는 뜻이에요. 꼭 인사해 주세요.",
  sparkle:
    "{name}은 가슴과 팔에 청록 빛무늬가 흐르는 심해 어인이에요. 머리카락과 꼬리 지느러미는 물살 따라 살랑거리지만, 본인은 '심해가 숨 쉬는 것'이라고만 말합니다. 허리 장식의 푸른 보석은 밤마다 한 번씩 깜박이며, {name}은 그때마다 '신호등 점검 중'이라고 합니다.",
  standard:
    "{name}은 태양 클립 때문에 오른쪽 머리만 살짝 탔어요. 줄무늬 탑과 산호빛 꼬리로 인사하면 바닷가 풍경이 한 장 더 늘어난 기분입니다. 파도가 세면 꼬리보다 포니테일을 먼저 감추지만, 웃는 건 포기하지 않아요. '평범한 해변 소녀'가 최고의 칭찬이라고 합니다.",
  farm:
    "{name}은 개복치 몸에 노인 얼굴이 붙은 채 심해를 둥둥 떠다녀요. 몸통과 꼬리는 있는데, 대부분은 얼굴만 본다고 합니다. 가만히 있다가 눈만 천천히 껌뻑이고, 귀처럼 생긴 옆지느러미는 거의 움직이지 않아요. {name}은 '큰 것만 움직이면 바닷물이 흔들린다'며 조심한다고 하는데, 실제로 흔들린 적은 없습니다. 인면어 이야기를 들으면 '잉어 쪽 친척'이라고만 짧게 답해요.",
  plain:
    "{name}은 머스타드 가디건과 잿빛 꼬리가 잘 어울리는 비 오는 날 전문가예요. 땋은 머리 끝에서 가끔 빗방울 픽셀이 떨어지는데, 맑은 날엔 '오늘은 안 왔네' 하고 살짝 실망합니다. 우산은 없지만 가디건이 비를 대신 맞아 준다고 믿고 있어요. 믿음의 문제입니다.",
  scruffy:
    "{name}은 산해경 목판화에서 걸어 나온 능어예요. 회녹 비늘 몸에 사람 얼굴과 팔·다리가 달려, 바닥을 성큼성큼 걷기도 하고 헤엄도 칩니다. 기분이 좋으면 손을 모았다가 흔들며 인사하는데, {name}은 '예의는 전설의 기본'이라고만 합니다. 손짓이 끝나면 다시 조용히 서 있지만, 눈빛만으로 '또 와 주세요'라고 말하는 것 같아요.",
  grumpy:
    "{name}의 등지느러미는 헤엄칠 때마다 물살을 가르며 분홍빛으로 번집니다. 물고기 머리라 입을 다물기 어렵지만, 표정만 보면 항상 뭔가 불만인 것 같아요. 바지는 절대 벗지 않는데, 이유를 물으면 '바닥이 차갑다'고만 합니다.",
  sickly:
    "{name}은 은빛 반점이 있는 물고기 상체와 창백한 사람 다리를 가졌어요. 거울 앞에 서면 어색해서 피하지만, 거울 없는 날엔 오히려 제일 활발합니다. 한쪽 눈이 비어 보이는 건 무서운 게 아니라 '오늘은 여기까지 쉴게요'라는 신호래요. 발끝까지 신발을 신는 성실함은 인정받고 있습니다.",
};

/** variantId → {name} 치환 가능한 도감 설명 (열수구) */
const VENT_ENCYCLOPEDIA_DESCRIPTIONS = {
  golden:
    "{name}의 꼬리는 열수 기둥 옆에서 천천히 맴돌아요. 몸이 S자로 구부러져 있어서 '지금 춤추는 중'처럼 보이지만, 사실은 수온을 재는 중입니다. 주둥이로 먹이를 빨아들일 때 작은 기포가 올라오고, 기분이 좋으면 꼬리 끝이 더 말립니다. 해마인데 수영은 새우 속도라고 주장합니다.",
  fluffy:
    "{name}은 등에 눈 대신 밝은 반점이 있어요. 어두운 열수구에서는 그게 나침반처럼 작동한다고 해요. 측면으로 헤엄치며 다리를 규칙적으로 움직이는데, 밥 달라고 다리 소리가 바닥까지 전달됩니다. 눈이 없다고 슬퍼하지 않아요. 대신 등이 더 예민합니다.",
  sparkle:
    "{name}의 집게는 생각보다 큽니다. 작은 다리 여덟 개는 바쁘게 움직이고, 몸에는 하얀 털 같은 setae가 나 있어요. 첫 만남엔 무섭지만, 사실은 바닥 청소를 자처합니다. 청소비로 박테리아를 받고, 영수증은 발행하지 않습니다.",
  standard:
    "{name}은 담수어 실루엣을 유지한 채 열수구에 적응했어요. 어두운 몸색 덕분에 바위 틈에 숨기 쉽고, 표정은 항상 '별일 없음'입니다. 온도가 오르면 잠깐 숨고, 내리면 다시 나와 인사합니다. 특별한 능력은 없지만 무난함이 최고의 생존 전략입니다.",
  farm:
    "{name}은 큰 집게와 작은 다리로 바닥을 기어다녀요. 집게 사이에 박테리아 뭉치를 들고 다니는데, 그걸 먹이로 삼는다고 합니다. 싸울 때는 집게만 크게 보이고, 평소엔 의외로 조심스럽습니다. '게는 느리다'는 말을 들으면 다리부터 빨라집니다.",
  plain:
    "{name}은 작은 황새우 실루엣으로 열수 바닥을 누빕니다. 등이 살짝 굽어 있어서 항상 바람을 맞는 것처럼 보여요. 무리 지어 다니진 않지만, 같은 바위에 친구가 있으면 꼬리를 살짝 흔듭니다. 작아서 안 보이지만, 존재감은 꽤 큽니다.",
  scruffy:
    "{name} 몸에 녹슨 얼룩이 있어요. 열수 화학 성분과 싸운 흔적이라고 주장합니다. 측면 실루엣은 여전히 새우인데, 색만 보면 낡은 파이프 같기도 합니다. 그래도 다리는 성실하게 움직이고, 밥 줄 때는 제일 먼저 반응합니다.",
  grumpy:
    "{name}은 뱀처럼 긴 몸에 갈고리 이빨이 보여요. 표정은 험하지만, 실제로 물린 기록은 아직 없습니다. 좁은 틈을 유연하게 지나다니며 '내 영역'을 표시하는데, 그 영역은 매일 조금씩 넓어집니다. 쓰다듬어 달라고 하진 않지만, 지나가면 몸을 살짝 비춥니다.",
  sickly:
    "{name}은 옆구리에 기생 반점이 있어요. 주인은 '룸메이트'라고 부르고, 반점은 '월세'라고 부릅니다. 측면 새우 실루엣은 그대로인데, 가끔 한쪽 다리가 늦게 움직입니다. 건강할 때보다 밥 달라는 빈도는 오히려 더 높습니다.",
};

const ENCYCLOPEDIA_BY_THEME = {
  deepsea: DEEPSEA_ENCYCLOPEDIA_DESCRIPTIONS,
  mermaid: MERMAID_ENCYCLOPEDIA_DESCRIPTIONS,
  vent: VENT_ENCYCLOPEDIA_DESCRIPTIONS,
};

export function getVariantDescription(variantId, petName, speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  const table = ENCYCLOPEDIA_BY_THEME[theme] ?? DEEPSEA_ENCYCLOPEDIA_DESCRIPTIONS;
  const template = table[variantId] ?? table.standard;
  const name = petName?.trim() || "이 친구";
  return template.replace(/\{name\}/g, name);
}
