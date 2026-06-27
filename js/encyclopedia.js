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

/** variantId → {name} 치환 가능한 기괴한 도감 설명 */
const ENCYCLOPEDIA_DESCRIPTIONS = {
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

export function getVariantDescription(variantId, petName) {
  const template =
    ENCYCLOPEDIA_DESCRIPTIONS[variantId] ?? ENCYCLOPEDIA_DESCRIPTIONS.standard;
  const name = petName?.trim() || "이 친구";
  return template.replace(/\{name\}/g, name);
}
