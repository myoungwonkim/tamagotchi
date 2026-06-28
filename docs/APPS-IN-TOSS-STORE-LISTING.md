# 앱인토스 스토어 등록 문구 (확정)

콘솔 **앱 정보**·**앱 상세 페이지**에 입력할 확정값입니다.

| 항목 | 값 |
|------|-----|
| appName (수정 불가) | `deepsea-tamagotchi` |
| 한국어 앱 이름 | **어비스펫: 심해 가상 펫** |
| 영어 앱 이름 | **Abyss Pet** |
| 부제 | **심해 가상펫 육성 및 수집 게임** |
| 고객문의 이메일 | `nolsoop.games@gmail.com` |

`granite.config.ts`의 `brand.displayName`은 한국어 앱 이름과 **동일**해야 합니다.

---

## 상세 설명 (콘솔 «상세 설명»)

```
어비스펫은 심해를 배경으로 한 무료 가상 펫 육성 게임이에요. 당신 앞에 떨어진 불가사의한 알을 정성을 담아 돌보면 당신만의 독창적인 펫이 탄생합니다. 때로는 귀엽고, 때로는 약간 괴기할 수도 있죠. 이렇게 모은 펫은 비밀 탐사일지에 차곡차곡 기록됩니다.
```

---

## 웹·SEO 메타 (`index.html`)

```html
<title>어비스펫: 심해 가상 펫</title>
<meta name="description" content="심해 가상펫 육성 및 수집 게임. 불가사의한 알을 돌보며 나만의 펫을 키우고 비밀 탐사일지에 기록하세요.">
```

---

## GRAC·검수 제출용

| 항목 | 값 |
|------|-----|
| 게임명 (한글) | 어비스펫: 심해 가상 펫 |
| 게임명 (영문) | Abyss Pet |
| 부제 | 심해 가상펫 육성 및 수집 게임 |
| 장르 | 시뮬레이션 / 육성 |
| 고객문의 | nolsoop.games@gmail.com |

---

## 앱 검색 키워드 (참고)

```
어비스펫, 심해, 심해어, 인어, 가상펫, 키우기, 육성, 수집, 진화, 탐사일지, 픽셀, 무료게임, 모바일게임
```

---

## 스토어 이미지 에셋 (`assets/ait-store/`)

앱인토스 콘텐츠 가이드 규격에 맞춰 생성된 PNG입니다.

| 파일 | 규격 | 용도 |
|------|------|------|
| `app-logo-light.png` | 600×600 | 앱 로고 (라이트) — 캐릭터 풀블리드, 텍스트 없음 |
| `app-logo-dark.png` | 600×600 | 앱 로고 (다크) |
| `thumbnail-1932x828.png` | 1932×828 | 가로형 썸네일 — 진화+탐사 일지 이어붙임 (48:52, 펫 중앙 보정) |
| `thumbnail-1000x1000.png` | 1000×1000 | 정방형 썸네일 — 진화 화면 캡처 크롭 |
| `screenshot-portrait-01-main.png` | 636×1048 | 스크린샷 — 메인 돌보기 (실제 게임 캡처) |
| `screenshot-portrait-02-evolution.png` | 636×1048 | 스크린샷 — 성체 진화 (실제 게임 캡처) |
| `screenshot-portrait-03-encyclopedia.png` | 636×1048 | 스크린샷 — 탐사 일지 (실제 게임 캡처) |
| `screenshot-landscape-01.png` | 1504×741 | 스크린샷 — 가로형 (키아트 크롭) |

재생성 (Playwright + Chromium 필요, 최초 1회 `python3 -m playwright install chromium`):

```bash
python3 scripts/build_ait_store_assets.py
```

콘솔 업로드 후 `app-logo-light.png` URL을 `granite.config.ts` `brand.icon`에 입력하세요.

---

## 스크린샷 캡션 (5장 이상 권장)

| # | 화면 | 캡션 |
|---|------|------|
| 1 | 메인 · 펫 표시 | 심해에서 내 펫을 돌보세요 |
| 2 | 돌보기 버튼 | 먹이·놀기·씻기·재우기로 육성 |
| 3 | 진화 연출 | 알에서 성체까지 5단계 진화 |
| 4 | 탐사 일지 | 모은 펫을 비밀 탐사일지에 기록 |
| 5 | 게임 오버 | 이별 후 부활 또는 새 알 시작 |

---

## 체크리스트

- [ ] 콘솔 `앱 이름` = **어비스펫: 심해 가상 펫**
- [ ] 콘솔 `부제` = **심해 가상펫 육성 및 수집 게임**
- [ ] `granite.config.ts` `displayName`과 콘솔 일치
- [ ] 고객문의 이메일 = **nolsoop.games@gmail.com**
- [ ] GRAC 신청서 게임명 일치
- [ ] 썸네일·스크린샷 업로드 → [assets/ait-store/](../assets/ait-store/)
