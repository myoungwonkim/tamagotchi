# 심해 다마고치 웹 게임

모바일 브라우저에서 키우는 **심해어 / 인어** 다마고치 게임입니다. 90년대 패미컴 스타일 32×32 픽셀 PNG 스프라이트(256px nearest-neighbor).

**플레이:** https://nolsoopgames.com/abysspet/ (커스텀 도메인, DNS 연결 후) · https://myoungwonkim.github.io/tamagotchi/ (연결 시 위 도메인으로 리디렉트)

## 기능

### Phase 1 (MVP)
- 펫 1마리 키우기 (이름 설정 가능)
- 상태 4가지: 포만감, 행복, 청결, 건강
- 돌봄 버튼: 먹이, 놀기, 씻기, 재우기/깨우기
- 실시간 상태 감소 + 오프라인 시간 반영
- localStorage 자동 저장
- 방치 시 게임 오버 후 새 펫 시작

### Phase 2 (진화 + 사운드)
- **진화:** 나이에 따라 5단계 (알 → 라바 → 치어 → 청소년어 → 성체)
- **진화 알림:** 단계가 올라가면 메시지 + 팡파레
- **효과음:** 돌봄·진화·게임 오버·오프라인 환영 (Web Audio)
- **음소거:** 헤더 🔊/🔇 토글 (`tamagotchi-settings` localStorage 저장)

### Phase 3 (이중 그래픽 + 성체 변형 + 도감)
- **이중 그래픽:** 중앙 진화 + 옆 말풍선 무드
- **성체 변형:** tier 3종 × variant 3종 (총 9종)
- **성체 대사:** tier별 idle·돌봄·수면(snoozing) 대사
- **탐사 일지:** 성체 달성 시 등록 · 심해어/심해인어 탭별 9종 (최대 18종)
- **새 펫 FAB:** 성체 후 새 알 시작

### Phase 4 (그래픽 업그레이드)
- **스프라이트:** 진화·성체·무드·도감·오버레이 UI (PNG)
- **이중 fallback:** 이미지 로드 실패 또는 설정 off 시 이모지 표시
- **preload:** 현재 펫·다음 진화·무드 5종 선로드
- **dev 토글:** `?dev=1` → "스프라이트 on/off" (`tamagotchi-settings.useSprites`)

### Phase 5B (그래픽 고도화)
- **심해어 PNG 28종:** 90년대 패미컴 픽셀아트 (`scripts/generate_all_sprites.py`)
- **PNG 기본:** `spriteFormat` 미설정 시 png (dev에서 svg/png 전환 가능, svg 파일 없음)
- **진화 전환:** `evolvePop` 애니메이션 (`js/effects.js`)
- **무드·수면:** 말풍선 fade, 수면 배경 gradient, sleep idle bob
- **idle 모션:** tier별 bob/shake (`data-variant` on `#pet-evolution`)
- **접근성:** `prefers-reduced-motion: reduce` 시 애니메이션 비활성

### Phase 5C (UI·돌봄·더러움)
- **액션 버튼:** 픽셀 PNG 아이콘 (사과·테니스공·빗자루·달·해) + **Galmuri11 Bold** 라벨 (먹이 / 놀이 / 청소 / 재우기·깨우기)
- **돌봄 FX:** 이모지 대신 UI 스프라이트 1개씩 펫 가장자리 궤도에 표시 (`#care-fx`, `js/effects.js`)
- **더러움 레이어:** 청결 70 미만 시 배변물·파리 PNG가 펫 주변에 단계별 등장 (`js/mess.js`, `#mess-layer`)
- **메시지 박스:** 펫 영역 상단 얇은 밴드 오버레이 (옵션 C)
- **부트 에러:** JS 모듈 로드 실패·`file://` 접속 시 안내 오버레이

### Phase 5D (도감·스프라이트 품질)
- **도감 상세:** 카드 클릭 → 변종별 기괴한 설명문 (flavor text)
- **도감 레이아웃:** 목록 한 화면에 맞춤, 스프라이트 인게임 성체 크기에 맞게 확대
- **불량 성체 눈:** scruffy / grumpy / sickly — 검정 테두리·흰자·홍채·동공 픽셀 링으로 또렷하게
- **배변물·파리:** 단순화된 poop A / fly A 디자인
- **캐시 버스트:** importmap으로 모든 JS 모듈에 `app-version` 쿼리 적용

### Phase 6 (인어 테마)
- **종 테마:** 새 펫 시작 시 `deepsea`(심해어) / `mermaid`(인어) **50% 랜덤**
- **진화 규칙 동일:** 나이·케어 기반 tier / variant 9종 풀은 심해어와 같음
- **테마별 라벨:** 단계명·변종명·이모지가 테마에 맞게 표시 (`js/speciesThemes.js`)
- **인어 스프라이트 19종:** `assets/sprites/mermaid/` — 측면 프로필 v2 (상체+대각선 꼬리)
- **도감 설명:** `speciesTheme`별 flavor text (심해어 / 인어 각 9종)
- **UI 아이콘 공용:** 먹이·청소·배변물·헤더(도감·스피커 on/off) 등 12종은 심해어·인어 공통

진행 상황: **[docs/DEVELOPMENT-PROGRESS.md](docs/DEVELOPMENT-PROGRESS.md)**

## 종 테마 (speciesTheme)

| 항목 | 심해어 (`deepsea`) | 인어 (`mermaid`) |
|------|-------------------|------------------|
| 알 | 알 | 진주 알 |
| baby | 라바 | 꼬물 인어 |
| child | 치어 | 어린 인어 |
| teen | 청소년어 | 청소년 인어 |
| pretty 예 | 등불어 · 달빛 해파리 · 발광 오징어 | 진주 인어 · 달빛 실크 인어 · 별빛 인어 |
| normal 예 | 산호어 · 해조어 · 진흙어 | 산호 인어 · 해초 인어 · 늪 인어 |
| defective 예 | 썩은 아귀 · 송곳니어 · 기생어 | 능어 · 투성 어인 · 반점 어인 |

- `pet.speciesTheme`은 **알 단계에서 한 번 정해지면** 해당 펫 생애 동안 유지
- 기존 세이브(필드 없음) → `deepsea`로 처리
- 도감 엔트리에 `speciesTheme`·테마별 `label` 저장

## 스프라이트 구조

총 **50 PNG** (심해어 28 + 인어 19 + UI 12종 공용, UI는 심해어 경로에만 존재)

```
assets/sprites/
  evolution/          egg baby child teen dead          # 심해어 (28종 중)
  adult/              golden fluffy sparkle standard farm plain scruffy grumpy sickly
  mood/               happy neutral sad sleep sick
  ui/                 feed play clean sleep wake poop fly heart-broken locked
                      encyclopedia sound-on sound-off
  mermaid/
    evolution/        egg baby child teen dead          # 인어 (19종)
    adult/            (동일 9종 ID)
    mood/             (동일 5종)
```

| 카테고리 | 심해어 경로 | 인어 경로 |
|----------|------------|-----------|
| evolution / adult / mood | `assets/sprites/{category}/{id}.png` | `assets/sprites/mermaid/{category}/{id}.png` |
| ui | `assets/sprites/ui/{id}.png` | 동일 (공용) |

PNG 재생성:

```bash
# 심해어 28종 → assets/sprites/
python3 scripts/generate_all_sprites.py --install

# 인어 19종 → assets/sprites/mermaid/
python3 scripts/generate_mermaid_side_preview.py --install
```

스테이징 미리보기 (게임 미반영):

```bash
python3 scripts/generate_all_sprites.py              # → .sprite-staging-deepsea/
python3 scripts/generate_mermaid_side_preview.py       # → docs/mermaid-side-preview/
python3 scripts/generate_action_preview.py           # 액션 버튼 시안
python3 scripts/generate_mess_preview.py             # 배변물·파리 시안
python3 scripts/generate_defective_eye_preview.py    # 불량 눈 시안
```

## 그래픽 표시 규칙

### 메인 (진화 스프라이트)

| 조건 | 스프라이트 |
|------|-----------|
| 게임 오버 | `{theme}/evolution/dead.png` |
| egg ~ teen | `{theme}/evolution/{stage}.png` |
| adult | `{theme}/adult/{variantId}.png` |

`{theme}` = `deepsea`(기본 경로) 또는 `mermaid`(mermaid/ 하위)

### 말풍선 (무드 스프라이트)

| 조건 | 스프라이트 |
|------|-----------|
| 게임 오버 | 숨김 |
| 수면 | `{theme}/mood/sleep.png` |
| 건강 < 30 | `{theme}/mood/sick.png` |
| 슬픔/보통/좋음 | `{theme}/mood/sad\|neutral\|happy.png` |

### 더러움·돌봄 FX

| 요소 | 스프라이트 |
|------|-----------|
| 배변물·파리 | `ui/poop.png`, `ui/fly.png` (청결 < 70, egg 제외) |
| 돌봄 궤도 FX | `ui/feed|play|clean|sleep|wake.png` (액션 1회당 1개) |

스프라이트 off 또는 로드 실패 시 이모지 fallback.

## 성체 변형 (tier)

| tier | 조건 (진화 시점) | 톤 |
|------|------------------|-----|
| pretty | 4 stat min ≥ 65, avg ≥ 72 | 빛나는 종, 긍정 대사 |
| normal | min ≥ 40, avg ≥ 50 | 보통 종, 중립 대사 |
| defective | 그 외 | 불량 종, 부정 대사 |

티어·variant ID는 심해어·인어 **동일**. 스프라이트·라벨만 테마별.

## 효과음

| sfx | 재생 시점 |
|-----|-----------|
| feed / play / clean | 각 돌봄 버튼 성공 시 |
| sleep / wake | 재우기 / 깨우기 |
| evolve | 진화 알림 |
| gameover | 게임 오버 화면 |
| message | 5분+ / 30분+ 오프라인 복귀 메시지 |

iOS Safari에서는 **첫 버튼 터치** 후 소리가 재생됩니다. 🔇로 음소거 가능.

## 로컬 실행

```bash
cd ~/Desktop/kaffeine/tamagotchi
python3 -m http.server 8080
```

브라우저에서 http://localhost:8080 을 엽니다.

> ES 모듈을 사용하므로 `file://`로 직접 열면 동작하지 않습니다. 반드시 로컬 서버를 사용하세요.

### 배포 후 캐시

`index.html`의 `<meta name="app-version">`과 `css/style.css?v=…`가 배포마다 갱신됩니다. JS·CSS 변경 후:

```bash
./scripts/bump-version.sh   # git short SHA로 app-version 동기화
```

스프라이트 URL·importmap JS 모듈에도 동일 버전 쿼리가 붙습니다 (`sprites.js`, `index.html`).

### QA 스모크 (자동)

```bash
bash scripts/qa-smoke.sh
```

PNG 50종·디렉터리·`speciesTheme`·핵심 JS/CSS 심볼 등을 검사합니다.

### 개발 테스트 모드

```
http://localhost:8080/?dev=1
```

테스트 패널: 게임 오버, 오프라인, 나이 +1일, 진화, 성체 pretty/defective, 도감 초기화, idle 대사, **스프라이트 on/off**, **스프라이트 포맷 svg/png**

광고 UI 모의 테스트: `http://localhost:8080/?toss=1&mockAds=1`

## 앱인토스 (Apps in Toss) 출시

토스 미니앱 WebView 포팅 + 인앱 광고(전면형·보상형) 연동.  
앱 식별자: **`abysspet`** (`intoss://abysspet`)

```bash
npm install
cp .env.ait.example .env.ait   # 콘솔 광고 그룹 ID 입력
npm run dev                    # 샌드박스 + vite (포트 5173)
npm run build:ait              # dist/ + .ait 번들 (콘솔 업로드용)
```

| 문서 | 내용 |
|------|------|
| [docs/ABYSSPET-LAUNCH-RUNBOOK.md](docs/ABYSSPET-LAUNCH-RUNBOOK.md) | **출시 실행서** (사용자 체크리스트) |
| [docs/APPS-IN-TOSS-STORE-LISTING.md](docs/APPS-IN-TOSS-STORE-LISTING.md) | 스토어 등록 문구 (확정) |
| [docs/APPS-IN-TOSS-CONSOLE-SETUP.md](docs/APPS-IN-TOSS-CONSOLE-SETUP.md) | 콘솔·정산·광고 그룹 |
| [docs/GRAC-RATING-CHECKLIST.md](docs/GRAC-RATING-CHECKLIST.md) | 게임물 등급 심의 |
| [docs/GRAC-SUBMISSION-PACK.md](docs/GRAC-SUBMISSION-PACK.md) | GRAC 제출용 게임 설명서 |
| [docs/GRAC-DEMO-SUBMISSION.md](docs/GRAC-DEMO-SUBMISSION.md) | GRAC 시연 영상·.ait·QR 가이드 |
| [privacy.html](privacy.html) | 개인정보 처리방침 정식본 (검수 URL: https://nolsoopgames.com/abysspet/privacy.html) |
| [terms-of-service.html](terms-of-service.html) | 이용약관 정식본 (https://nolsoopgames.com/abysspet/terms-of-service.html) |
| [docs/MONETIZATION.md](docs/MONETIZATION.md) | 광고 지점·보상 정책 |
| [docs/APPS-IN-TOSS-LAUNCH.md](docs/APPS-IN-TOSS-LAUNCH.md) | 출시·QA 체크리스트 |
| [docs/AD-TUNING.md](docs/AD-TUNING.md) | 출시 후 eCPM·빈도 튜닝 |

`granite.config.ts`의 `appName`(`abysspet`)·`displayName`·`icon`은 콘솔과 **동일**해야 합니다.

## 모바일 테스트

1. PC와 폰이 같은 Wi-Fi에 연결
2. PC IP 확인 (macOS): `ipconfig getifaddr en0`
3. 폰 브라우저에서 `http://<PC-IP>:8080` 또는 배포 URL 접속

### 체크리스트

상세 QA 시나리오(기기별 Pass/Fail 표): **[docs/QA-CHECKLIST.md](docs/QA-CHECKLIST.md)**

요약 (수동 확인):

- [ ] 메인 진화 PNG + 말풍선 무드 PNG 동시 표시
- [ ] 새 펫 시 심해어 / 인어 랜덤 (단계 라벨·스프라이트 확인)
- [ ] `?dev=1` 스프라이트 off → 이모지 fallback
- [ ] 진화 단계별 PNG 전환 (dev 나이 +1일)
- [ ] 성체 pretty/defective → 다른 adult PNG
- [ ] 도감 카드·상세 (스프라이트·flavor text)
- [ ] 게임 오버·졸업 오버레이 PNG
- [ ] 액션 버튼 PNG + Galmuri 라벨
- [ ] 돌봄 FX 궤도 스프라이트
- [ ] 청결 낮을 때 배변물·파리
- [ ] 🔊/🔇, safe-area, 오프라인 반영
- [ ] 재우기/깨우기·돌보기 버튼 회귀
- [ ] Phase 5B 모션·FX (G섹션)

## 밸런스

| 항목 | 값 |
|------|-----|
| 포만감 감소 | 0.04/초 (깊은 잠 시 0.02/초) |
| 행복 감소 | 0.024/초 |
| 청결 감소 | 0.016/초 |
| 건강 감소 | 0.016/초 (tiered, 아래 참고) |
| 방치 게임 오버 | 평균 케어 < 10 유지 **10분** |
| 더러움 시작 | 청결 < 70 (egg 제외) |

수치 조정: `js/pet.js` (`DECAY_RATES`, `HEALTH_DECAY_RATE`), `js/mess.js` (`MESS_THRESHOLD`)

### 진화까지 예상 시간 (실시간)

진화는 **돌봄과 무관**하게 `bornAt` 기준 **경과 시간(ms)**으로만 결정됩니다. 앱을 닫아 둔 오프라인 시간도 그대로 쌓입니다. 알 → 성체 **총 누적 5일**이며, 기존 14일 스케줄(1·3·7·14일) 비율을 그대로 축소했습니다.

| 단계 | 출생 후 누적 | 이전 단계부터 |
|------|-------------|--------------|
| 알 | **0** | — |
| 라바 (baby) | **8시간 34분 17초** | 8시간 34분 17초 |
| 치어 (child) | **1일 1시간 42분 51초** | 17시간 8분 34초 |
| 청소년어 (teen) | **2일 12시간** | 1일 10시간 17분 9초 |
| 성체 (adult) | **5일** | 2일 12시간 |

> 예: 오늘 정오에 알을 깠다면, 라바 진화는 **오늘 밤 10시 34분 이후** 첫 접속·틱 시점에 반영됩니다.

코드: `js/evolution.js` (`EVOLUTION_STAGES`, `EVOLUTION_TOTAL_DAYS = 5`)

### 방치 사망 예상 시간 (돌봄 0회)

시뮬레이션 조건: 새 펫 기본 스탯(포만감 80 · 행복 70 · 청결 60 · 건강 100), **깨어 있는 상태**, 먹이/놀이/청소/수면 없음. `js/pet.js` decay 공식 그대로 100ms 단위 적산.

| 경과 | 일어나는 일 |
|------|------------|
| **약 6분 15초** | 평균 케어 < 60 → 건강 서서히 감소 시작 (완만) |
| **약 18분 45초** | 평균 케어 < 40 → 건강 감소 가속 |
| **약 41분 40초** | 평균 케어 < 10 → **방치 타이머 시작**; 포만감·행복·청결 모두 ≤ 20 |
| **약 51분 40초** | 방치 타이머 10분 경과 → **게임 오버** (실제 사망) |
| *(참고)* **약 2시간 8분 57초** | 건강 0 (방치 규칙이 없었다면 이 시점; 현재는 51분대에 먼저 사망) |

| 사망 경로 | 예상 시간 (일/시간/분) |
|-----------|------------------------|
| **방치 (`neglect`)** — 평균 < 10 후 10분 | **0일 0시간 51분 40초** (3,100초) |
| 건강 0 (`health`) — 단독 시 | 0일 2시간 8분 57초 (방치보다 느림, 도달 전에 방치 사망) |

재우기만 반복하면 포만감 감소가 절반(`0.02/초`)이라 위 시간은 **더 길어집니다**. 수면 중에도 행복·청결은 같은 속도로 떨어져 방치 사망은 지연되지만 막을 수는 없습니다.

## GitHub Pages 배포

저장소: https://github.com/myoungwonkim/tamagotchi

게임은 `/abysspet/` 하위 경로로 서빙합니다. 소스는 루트에 그대로 두고, 배포 시점에
`.github/workflows/pages.yml` 이 `/abysspet/` 경로를 조립해 Pages에 올립니다.

1. `main` 브랜치에 push
2. **Settings → Pages → Source:** `GitHub Actions` (기존 "Deploy from a branch"에서 변경)
3. **Settings → Pages → Custom domain:** `nolsoopgames.com` 입력 후 저장 (`CNAME` 파일 포함됨)
4. DNS·전체 절차는 [docs/NOLSOOPGAMES-DOMAIN-SETUP.md](docs/NOLSOOPGAMES-DOMAIN-SETUP.md) 참고

배포 URL: https://nolsoopgames.com/abysspet/ (커스텀 도메인) · https://myoungwonkim.github.io/tamagotchi/ (리디렉트)

개인정보/약관 정식 URL (검수 제출용):
- https://nolsoopgames.com/abysspet/privacy.html
- https://nolsoopgames.com/abysspet/terms-of-service.html

### 디자인 시안 (docs/, 게임 미반영)

| 문서 | 내용 |
|------|------|
| [docs/index.html](docs/index.html) | 시안 목록 허브 |
| [docs/ui-theme-preview.html](docs/ui-theme-preview.html) | UI 테마 A·B·C·D |
| [docs/ui-theme-bd-preview.html](docs/ui-theme-bd-preview.html) | UI 테마 B+D 조합 |
| [docs/ui-theme-sub-preview.html](docs/ui-theme-sub-preview.html) | 잠수함 테마 mockup |
| [docs/encyclopedia-size-preview.html](docs/encyclopedia-size-preview.html) | 도감 스프라이트 크기 |
| [docs/encyclopedia-layout-preview.html](docs/encyclopedia-layout-preview.html) | 도감 레이아웃 |
| [docs/message-position-preview.html](docs/message-position-preview.html) | 메시지 위치 |

## 프로젝트 구조

```
tamagotchi/
  assets/
    fonts/              Galmuri11-Bold.woff2 (액션 라벨)
    sprites/            심해어 PNG 28종 + mermaid/ 인어 19종
  index.html
  css/style.css
    js/
    speciesThemes.js    deepsea/mermaid 테마·라벨·랜덤 선택
    sprites.js          테마별 스프라이트 URL, preload, useSprites
    pet.js              speciesTheme, getMoodKind, decay
    evolution.js        진화 단계 + spriteId
    adultVariants.js    성체 variant + tier (테마 무관)
    dialogue.js         성체 tier별 대사
    encyclopedia.js     도감 localStorage + flavor text
    mess.js             배변물·파리 레이어
    audio.js            Web Audio SFX, 음소거
    actions.js          돌봄 버튼
    effects.js          진화·무드·idle·돌봄 FX
    storage.js          localStorage, speciesTheme 정규화
    ui.js               setPetGraphic, 도감·FAB UI
    ads.js              앱인토스 인앱 광고 (전면·보상형)
    adConfig.js         광고 빈도·그룹 ID
    tossEnv.js          토스 WebView 환경 감지
    deathSnapshot.js    부활용 사망 스냅샷
    main.js             게임 루프
    dev.js              ?dev=1 테스트 패널
  scripts/
    generate_all_sprites.py       심해어 28종 생성
    generate_mermaid_side_preview.py   인어 측면 v2 19종 생성·설치
    generate_action_preview.py    액션 버튼 시안
    generate_mess_preview.py      배변물·파리 시안
    generate_defective_eye_preview.py  불량 눈 시안
    qa-smoke.sh                     자동 QA
    bump-version.sh                 app-version 동기화
  docs/                 QA·시안·가이드
```
