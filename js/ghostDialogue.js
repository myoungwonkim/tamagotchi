/**
 * 상어 습격으로 유령이 된 펫이 남기는 슬픈·애원 대사.
 * 게임오버(상어) 화면에서 랜덤으로 표시되고 주기적으로 바뀝니다.
 */
export const GHOST_LINES = [
  "추워… 여기 너무 외로워.",
  "가지 마… 아직 네 곁에 있고 싶어.",
  "나… 다시 헤엄치고 싶어.",
  "혼자 두지 마… 무서워.",
  "한 번만… 다시 불러줘, 응?",
  "너랑 더 놀고 싶었는데…",
  "이대로 사라지긴 싫어…",
  "돌아갈 수… 있을까?",
  "제발… 날 도와줘.",
  "아직 작별 인사도 못 했잖아…",
  "저 빛으로 가기 싫어… 네 옆이 좋아.",
  "날 잊지 말아줘…",
  "손 한 번만 잡아줄래…?",
  "다시 만나고 싶어. 정말이야.",
  "미안해… 상어가 너무 빨랐어.",
];

let lastIndex = -1;

export function pickGhostLine() {
  if (GHOST_LINES.length === 0) return "";
  let i = Math.floor(Math.random() * GHOST_LINES.length);
  if (i === lastIndex && GHOST_LINES.length > 1) {
    i = (i + 1) % GHOST_LINES.length;
  }
  lastIndex = i;
  return GHOST_LINES[i];
}
