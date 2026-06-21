# PNG 스프라이트 제작 가이드

Phase 5B에서 PNG drop-in 구조는 이미 적용되어 있습니다.  
이 문서는 **별도 창/도구에서 PNG 21종을 만들 때** 참고하는 체크리스트입니다.

**프로젝트 경로:** `/Users/myoungwonkim/Desktop/kaffeine/tamagotchi`  
**출력 경로:** `assets/sprites/{category}/{id}.png`

---

## 제작 규격

| 항목 | 값 |
|------|-----|
| 캔버스 | **128×128px** (또는 256×256 @2x) |
| 비율 | 1:1 정사각 |
| 배경 | **투명** (PNG alpha) |
| 파일명 | SVG와 **동일** (`golden.png` ↔ `golden.svg`) |
| 코드 변경 | **불필요** — 파일만 추가 |

### 팔레트 (SVG placeholder 기준)

| 용도 | 색상 참고 |
|------|-----------|
| 윤곽선 | `#2D2A26` |
| pretty tier | 골드 `#FFD54F`, 핑크 `#F582AE`, 보라 `#E1BEE7` |
| normal tier | 갈색 `#F5C542`, `#E8C4A0`, 회색 `#EEEEEE` |
| defective tier | 탁한 `#BCAAA4`, `#8D6E63`, 청회 `#CFD8DC` |
| 무드 원 | 밝은 파스텔 (happy `#FFF9C4`, sad `#E3F2FD` 등) |

기존 SVG는 **레퍼런스 실루엣**으로 사용하세요:  
`assets/sprites/**/*.svg`

---

## 21종 체크리스트

### evolution/ (5) — 중앙 진화 스프라이트 (~6rem)

| [ ] | 파일 | 설명 | fallback |
|-----|------|------|------------|
| [ ] | `egg.png` | 알 | 🥚 |
| [ ] | `baby.png` | 아기 병아리 | 🐤 |
| [ ] | `child.png` | 어린이 | 🐥 |
| [ ] | `teen.png` | 청소년 닭 | 🐔 |
| [ ] | `dead.png` | 게임 오버 유령 | 👻 |

### adult/ (9) — 성체 variant (~6rem)

| [ ] | 파일 | tier | 라벨 | fallback |
|-----|------|------|------|----------|
| [ ] | `golden.png` | pretty | 황금 닭 | 🐓 |
| [ ] | `fluffy.png` | pretty | 복슬 닭 | ✨🐔 |
| [ ] | `sparkle.png` | pretty | 반짝 닭 | 🌟🐔 |
| [ ] | `standard.png` | normal | 평범한 닭 | 🐔 |
| [ ] | `farm.png` | normal | 농장 닭 | 🐔‍🌾 |
| [ ] | `plain.png` | normal | 무난한 닭 | 🐔💤 |
| [ ] | `scruffy.png` | defective | 털 빠진 닭 | 🪶🐔 |
| [ ] | `grumpy.png` | defective | 심술 닭 | 💢🐔 |
| [ ] | `sickly.png` | defective | 병든 닭 | 🤕🐔 |

### mood/ (5) — 말풍선 무드 (~3rem)

| [ ] | 파일 | 조건 | fallback |
|-----|------|------|----------|
| [ ] | `happy.png` | 행복 높음 | 😊 |
| [ ] | `neutral.png` | 보통 | 😐 |
| [ ] | `sad.png` | 슬픔 | 😢 |
| [ ] | `sleep.png` | 수면 중 | 😴 |
| [ ] | `sick.png` | 건강 < 30 | 🤒 |

### ui/ (2) — 오버레이

| [ ] | 파일 | 용도 | fallback |
|-----|------|------|----------|
| [ ] | `heart-broken.png` | 게임 오버 | 💔 |
| [ ] | `locked.png` | 도감 미수집 | ❓ |

---

## 적용 방법

1. PNG를 위 경로에 저장 (SVG와 **같은 폴더**, 확장자만 `.png`)
2. 로컬 서버 실행:
   ```bash
   cd ~/Desktop/kaffeine/tamagotchi
   python3 -m http.server 8080
   ```
3. `http://localhost:8080/?dev=1` 접속
4. dev 패널 → **스프라이트 on** → **스프라이트 포맷 svg/png**
5. 진화·무드·도감·게임 오버 화면에서 PNG 표시 확인
6. 문제 없으면 메인 프로젝트에서 **커밋/푸시**

PNG 로드 실패 시 해당 슬롯은 **이모지 fallback**으로 표시됩니다.

---

## 별도 Cursor 창용 프롬프트 (복사)

```
tamagotchi PNG 스프라이트 21종 제작.

프로젝트: /Users/myoungwonkim/Desktop/kaffeine/tamagotchi
가이드: docs/PNG-SPRITE-GUIDE.md
레퍼런스 SVG: assets/sprites/

규칙:
- 128×128 투명 PNG
- SVG와 동일 경로·파일명 (예: assets/sprites/adult/golden.png)
- tier별 톤: pretty 밝/화려, normal 중립, defective 칙칙
- 한 카테고리씩 만들고 체크리스트 [x] 표시

evolution 5종부터 시작해줘.
```

---

## QA (PNG 반영 후)

[`docs/QA-CHECKLIST.md`](QA-CHECKLIST.md) **B섹션** + **G7** (스프라이트 포맷 png) 항목 확인.

---

## 주의

- **파일명·spriteId 변경 금지** — `js/sprites.js` 레지스트리와 연동됨
- PNG만 추가할 때 SVG는 **삭제하지 않음** (svg 포맷 fallback용으로 유지 권장)
- `@2x` (256px) 사용 시 게임 내 `object-fit: contain`으로 자동 축소됨
