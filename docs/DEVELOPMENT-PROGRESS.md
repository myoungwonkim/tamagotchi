# 개발 진행 상황

**프로젝트:** [웹 기반 모바일 게임 개발 시작](https://github.com/myoungwonkim/tamagotchi) — 심해 다마고치  
**저장소:** `/Users/myoungwonkim/Desktop/kaffeine/tamagotchi`  
**배포:** https://myoungwonkim.github.io/tamagotchi/

---

## Phase 요약

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | MVP — 펫·상태·돌봄·저장·게임 오버 | ✅ 완료 |
| 2 | 진화 5단계 + Web Audio SFX | ✅ 완료 |
| 3 | 이중 그래픽·성체 9종·도감·FAB | ✅ 완료 |
| 4 | 스프라이트 시스템·preload·dev 토글 | ✅ 완료 |
| 5B | PNG·모션·FX·접근성 | ✅ 완료 |
| **5B+** | **심해어 테마 리디자인 (PNG 21종)** | ✅ **2026-06-21 완료** |

---

## Phase 5B+ — 심해어 테마 (2026-06-21)

닭 컨셉 SVG 21종을 **삭제**하고, 90년대 패미컴 스타일 **심해어 PNG 21종**으로 교체했습니다.

### 그래픽

| 항목 | 내용 |
|------|------|
| 스타일 | 32×32 픽셀 → 256×256 nearest-neighbor |
| 테마 | 심해어 (난자→라바→치어→청소년어→성체) |
| pretty | 등불어 · 달빛 해파리 · 발광 오징어 |
| normal | 산호어 · 해조어 · 진흙어 |
| defective | 썩은 아귀 · 송곳니어 · 기생어 (징그럽게 차별) |
| dead | 생선뼈 |
| mood | happy(♥눈) · sleep(침) · sick(눈물) · heart-broken(반쪽) |
| 기본 포맷 | **PNG** (`spriteFormat` 미설정 시 png) |

### 코드·콘텐츠

- `assets/sprites/**/*.png` — 21종 배포
- `assets/sprites/**/*.svg` — 닭 SVG **삭제**
- `js/evolution.js` · `js/adultVariants.js` — 라벨·이모지 심해어화
- `js/sprites.js` — 기본 포맷 png, dead fallback 🦴
- `scripts/generate_all_sprites.py --install` — PNG 재생성·배포

### 재생성

```bash
python3 scripts/generate_all_sprites.py --install
```

미리보기만 (스테이징):

```bash
python3 scripts/generate_all_sprites.py
# → .sprite-staging-deepsea/_preview-sheet.png
```

---

## 다음 (선택)

- [x] QA 3단계 자동 스모크 (`scripts/qa-smoke.sh`)
- [ ] QA A~G Desktop 수동 (터치·소리·애니메이션)
- [ ] iOS / Android 실기기
- [ ] PWA / Phase 6 검토

---

## 관련 문서

- [README.md](../README.md)
- [QA-CHECKLIST.md](QA-CHECKLIST.md)
- [PNG-SPRITE-GUIDE.md](PNG-SPRITE-GUIDE.md)
