import { ADULT_VARIANTS, getAdultVariant } from "./adultVariants.js";
import { getEvolutionStage } from "./evolution.js";
import { getVariantLabelForTheme, normalizeSpeciesTheme } from "./speciesThemes.js";

const STORAGE_KEY = "tamagotchi-encyclopedia";

function createEntryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadEncyclopedia() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries)) return { entries: [] };
    return { entries: parsed.entries.filter((e) => e && typeof e.id === "string") };
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

export function getCollectedCount() {
  return loadEncyclopedia().entries.length;
}

export function getCollectedVariantIds() {
  return new Set(loadEncyclopedia().entries.map((e) => e.variantId));
}

export function addToEncyclopedia(pet) {
  if (!pet?.adultVariantId) return null;
  if (getEvolutionStage(pet).id !== "adult") return null;

  const variant = getAdultVariant(pet.adultVariantId, pet.speciesTheme);
  const speciesTheme = normalizeSpeciesTheme(pet.speciesTheme);
  const data = loadEncyclopedia();

  const duplicate = data.entries.find(
    (e) => e.petBornAt === pet.bornAt && e.variantId === pet.adultVariantId
  );
  if (duplicate) return duplicate;

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

export function getEncyclopediaSlots() {
  const data = loadEncyclopedia();
  const collected = new Set(data.entries.map((e) => e.variantId));
  return ADULT_VARIANTS.map((variant) => ({
    variant,
    collected: collected.has(variant.id),
    entries: data.entries.filter((e) => e.variantId === variant.id),
  }));
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
    "{name}은 달빛을 먹고 자란다고 해요. 몸이 반투명해서 속이 비치는데, 그 안에는 어제 먹은 플랑크톤과 어제의 비밀이 둥둥 떠다닙니다. 기분이 좋으면 빛나고, 기분이 나쁘면 더 빛나요. 구분법은 없습니다. 그냥 항상 빛납니다.",
  sparkle:
    "{name}이 기분이 좋으면 몸 전체가 깜빡여요. 파티 조명 대신 쓰기 좋지만, 밤에 재우려면 먼저 눈을 가려야 할지도 모릅니다. 깜빡임 패턴은 모스 부호처럼 보이는데, 해독하면 대부분 '밥 줘'입니다. 가끔 '놀아줘'도 섞여 있어요.",
  standard:
    "{name}은 산호초 옆에서 평범하게 살아요. 특별한 능력은 없지만, 물고기 친구들 사이에서 가장 무난한 인사를 건넵니다. '별일 없음'이 최대 특기이고, 분노 임계값은 매우 높습니다. 한번 화내면 산호초도 조용해진다는 소문이 있지만, 아무도 본 적 없어요.",
  farm:
    "{name}의 지느러미 사이사이에 해조류가 자라요. 스스로 키운 채소를 먹는다고 주장하지만, 사실은 그냥 안 빗겨 주는 겁니다. 수확 시기마다 몸이 무거워져 헤엄치기 귀찮아하고, 그때가 바로 '채소 다이어트'를 시작하는 때예요. 다음 날 또 자랍니다.",
  plain:
    "{name}은 진흙과 한 몸이 된 지 오래예요. 색이 바닥이랑 똑같아서 찾기 어렵지만, 발밑에서 '안녕' 하고 손을 흔듭니다. 숨바꼭질 대회에서 항상 우승하지만, 상장은 받은 적 없어요. 심사위원이 {name}을 못 찾거든요.",
  scruffy:
    "{name}은 바닷속 냉장고에서 3년을 보냈어요. 냄새는 나지만 정이 많고, 지나가던 가오리에게도 먼저 인사를 건넵니다. '유통기한'이라는 말을 들으면 잠깐 슬퍼하다가, 곧 '그래도 맛있었지'라고 말합니다. 주변 생물들은 의견이 갈립니다.",
  grumpy:
    "{name}의 송곳니는 생각보다 부드러워요. 표정만 험악할 뿐, 사실은 쓰다듬어 달라고 입을 벌리고 기다립니다. 첫인상은 '물리면 안 됨'이지만, 실제로 물린 적 있는 생물은 아직 없어요. 대신 눈빛으로 협박은 자주 합니다.",
  sickly:
    "{name} 몸에 기생충이 살지만 이름표를 달고 다녀요. 주인은 기생충이고, 기생충이 진짜 주인인지는 아직 논쟁 중입니다. {name}은 '함께 사는 룸메이트'라고 부르고, 기생충은 '월세 미납'이라고 주장합니다. 매달 조용히 틈틈이 밥을 먹어 치웁니다.",
};

/** variantId → {name} 치환 가능한 도감 설명 (인어 — 티어 콘셉트 캐릭터) */
const MERMAID_ENCYCLOPEDIA_DESCRIPTIONS = {
  golden:
    "{name}의 장미 티아라는 매일 아침 닦아야 빛이 나요. 분홍 가운과 장미빛 꼬리는 우아하지만, 꼬리에 박힌 진주 점은 헤엄칠 때마다 하나씩 떨어집니다. {name}은 '의도한 장식'이라고 하고, 주운 갈매기는 대답하지 않아요. 그래도 미소는 공주 교과서에서 베낀 것처럼 정확합니다.",
  fluffy:
    "{name}은 은빛 달 망토를 두른 왕자예요. 망토 끝이 물살에 닿으면 조금씩 밀려 오르는데, 그때마다 은발을 넘기며 '밀려도 괜찮다'고 중얼거립니다. 초승달 관은 밤에만 빛나고 낮엔 살짝 기울어져 있어요. 이웃 고래는 노래 소리가 좋다고 하면서도 이불을 뒤집어 씁니다.",
  sparkle:
    "{name}의 보랏빛 꼬리에는 청록 별 점이 박혀 있어요. 기분이 좋으면 별이 반짝이고, 졸리면 하나씩 꺼집니다. 어느 날 천문 애호가가 '새 성좌' 사진을 올렸을 때 당황한 건 {name}뿐이었습니다. 사실 별 점의 절반은 '간식 줘'를 뜻하는 신호였어요.",
  standard:
    "{name}은 태양 클립 때문에 오른쪽 머리만 살짝 탔어요. 줄무늬 탑과 산호빛 꼬리로 인사하면 바닷가 풍경이 한 장 더 늘어난 기분입니다. 파도가 세면 꼬리보다 포니테일을 먼저 감추지만, 웃는 건 포기하지 않아요. '평범한 해변 소녀'가 최고의 칭찬이라고 합니다.",
  farm:
    "{name}은 낡은 항구 모자를 절대 벗지 않아요. 모자 안에는 젖은 엽전과 사탕이 함께 살고, 주황 바람막이 주머니에는 어느 부두 열쇠인지 모르는 열쇠가 들어 있습니다. 해초록 꼬리로 헤엄칠 때는 물고기인데, 부두에 올라서면 갑자기 사람 같아 보여요. {name}도 그 차이를 설명하긴 어렵다고 합니다.",
  plain:
    "{name}은 머스타드 가디건과 잿빛 꼬리가 잘 어울리는 비 오는 날 전문가예요. 땋은 머리 끝에서 가끔 빗방울 픽셀이 떨어지는데, 맑은 날엔 '오늘은 안 왔네' 하고 살짝 실망합니다. 우산은 없지만 가디건이 비를 대신 맞아 준다고 믿고 있어요. 믿음의 문제입니다.",
  scruffy:
    "{name}은 위는 평범한 회색 물고기인데 아래는 청바지와 운동화예요. 헤엄치다가 갑자기 걸으면 친구들이 '어디 산책 갔다 왔어?'라고 물어봅니다. 한쪽 눈을 감은 건 위협이 아니라 길이 헷갈려서라고 주장해요. 바지 밑단이 젖어 있으면 그날은 기분이 좋습니다.",
  grumpy:
    "{name}의 물고기 얼굴은 항상 입을 벌리고 있어요. 이빨이 보이면 화난 줄 알지만, 사실은 바닷물 온도를 확인하는 중입니다. 사람 다리로 걸을 때마다 구두 밑창에 조개가 끼면 표정이 조금 부드러워져요. 첫인상은 험하지만, 쓰다듬어 달라고 기다리는 시간이 더 깁니다.",
  sickly:
    "{name}은 은빛 반점이 있는 물고기 상체와 창백한 사람 다리를 가졌어요. 거울 앞에 서면 어색해서 피하지만, 거울 없는 날엔 오히려 제일 활발합니다. 한쪽 눈이 비어 보이는 건 무서운 게 아니라 '오늘은 여기까지 쉴게요'라는 신호래요. 발끝까지 신발을 신는 성실함은 인정받고 있습니다.",
};

const ENCYCLOPEDIA_BY_THEME = {
  deepsea: DEEPSEA_ENCYCLOPEDIA_DESCRIPTIONS,
  mermaid: MERMAID_ENCYCLOPEDIA_DESCRIPTIONS,
};

export function getVariantDescription(variantId, petName, speciesTheme) {
  const theme = normalizeSpeciesTheme(speciesTheme);
  const table = ENCYCLOPEDIA_BY_THEME[theme] ?? DEEPSEA_ENCYCLOPEDIA_DESCRIPTIONS;
  const template = table[variantId] ?? table.standard;
  const name = petName?.trim() || "이 친구";
  return template.replace(/\{name\}/g, name);
}
