# PNG 스프라이트 가이드

**테마:** 90년대 패미컴 스타일 **심해어** 픽셀아트  
**출력 경로:** `assets/sprites/{category}/{id}.png`  
**재생성:** `python3 scripts/generate_all_sprites.py --install`

---

## 제작 규격

| 항목 | 값 |
|------|-----|
| 캔버스 | 256×256 (32×32 그리드 ×8 nearest-neighbor) |
| 배경 | 투명 |
| 파일명 | spriteId와 동일 (`golden.png` 등) |

### tier 팔레트

| tier | 톤 |
|------|-----|
| pretty | 발광 골드·핑크·보라 (등불어·해파리·오징어) |
| normal | 구리·갈색·회색 (산호·해조·진흙) |
| defective | 칙칙·점액·기생 (아귀·송곳니·기생어) |

소스: `scripts/generate_all_sprites.py`

### 심해인어 성체 스테이징 (능어 방식)

새 성체 시안은 **능어(lingyu)** 워크플로만 사용합니다. GenerateImage로 256×256 픽셀아트를 직접 생성한 뒤 `scripts/prepare_staging_adult.py`로 최소 후처리(scruffy bbox `(27,13,229,243)` 정렬)합니다. HQ→픽셀 2단계·절차적 32×32 그리드·`*-pixel.png` 파이프라인은 금지입니다.

- 규칙: `.cursor/rules/adult-sprite-lingyu.mdc`
- 시안 예시: `docs/lingyu-design-preview.html`
- 스테이징: `assets/custom/{name}-{1,2,3}.png` → 승인 후 `assets/sprites/mermaid/adult/`에 복사

---

## 21종 체크리스트

### evolution/ (5)

| [x] | 파일 | 설명 | fallback |
|-----|------|------|----------|
| [x] | `egg.png` | 알 (난자) | 🥚 |
| [x] | `baby.png` | 라바 | 🐠 |
| [x] | `child.png` | 치어 | 🐟 |
| [x] | `teen.png` | 청소년어 | 🐡 |
| [x] | `dead.png` | 생선뼈 | 🦴 |

### adult/ (9)

| [x] | 파일 | tier | 라벨 |
|-----|------|------|------|
| [x] | `golden.png` | pretty | 등불어 |
| [x] | `fluffy.png` | pretty | 달빛 해파리 |
| [x] | `sparkle.png` | pretty | 주머니귀오징어 |
| [x] | `standard.png` | normal | 산호어 |
| [x] | `farm.png` | normal | 해조어 |
| [x] | `plain.png` | normal | 진흙어 |
| [x] | `scruffy.png` | defective | 썩은 아귀 |
| [x] | `grumpy.png` | defective | 송곳니어 |
| [x] | `sickly.png` | defective | 기생어 |

### mood/ (5) + ui/ (2)

| [x] | 파일 | 비고 |
|-----|------|------|
| [x] | `happy.png` | ♥ 눈 |
| [x] | `neutral.png` | |
| [x] | `sad.png` | |
| [x] | `sleep.png` | 입 벌리고 침 |
| [x] | `sick.png` | 눈물 |
| [x] | `heart-broken.png` | 반쪽 하트 |
| [x] | `locked.png` | 도감 미수집 |

---

## QA

[`docs/QA-CHECKLIST.md`](QA-CHECKLIST.md) B·G섹션
