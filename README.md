# 심해 다마고치 웹 게임

모바일 브라우저에서 키우는 **심해어** 다마고치 게임입니다. 90년대 패미컴 스타일 픽셀 PNG 스프라이트 21종.

**플레이:** https://myoungwonkim.github.io/tamagotchi/

## 기능

### Phase 1 (MVP)
- 펫 1마리 키우기 (이름 설정 가능)
- 상태 4가지: 배고픔, 행복, 청결, 건강
- 돌봄 버튼: 먹이, 놀기, 씻기, 재우기
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
- **도감:** 성체 달성 시 등록, 📖 9종 수집
- **새 펫 FAB:** 성체 후 새 알 시작

### Phase 4 (그래픽 업그레이드)
- **스프라이트:** 진화·성체·무드·도감·오버레이 UI (PNG)
- **이중 fallback:** 이미지 로드 실패 또는 설정 off 시 이모지 표시
- **preload:** 현재 펫·다음 진화·무드 5종 선로드
- **dev 토글:** `?dev=1` → "스프라이트 on/off" (`tamagotchi-settings.useSprites`)

### Phase 5B (그래픽 고도화)
- **심해어 PNG 21종:** 90년대 패미컴 픽셀아트 (`scripts/generate_all_sprites.py`)
- **PNG 기본:** `spriteFormat` 미설정 시 png (dev에서 svg/png 전환 가능, svg 파일 없음)
- **진화 전환:** `evolvePop` 애니메이션 (`js/effects.js`)
- **무드·수면:** 말풍선 fade, 수면 배경 gradient, sleep idle bob
- **idle 모션:** tier별 bob/shake (`data-variant` on `#pet-evolution`)
- **돌보기 FX:** 먹이/놀기/씻기 이모지 파티클 (`#care-fx`)
- **접근성:** `prefers-reduced-motion: reduce` 시 애니메이션 비활성

진행 상황: **[docs/DEVELOPMENT-PROGRESS.md](docs/DEVELOPMENT-PROGRESS.md)**

## 스프라이트 구조

```
assets/sprites/
  evolution/   egg baby child teen dead   (.png)
  adult/       golden fluffy sparkle standard farm plain scruffy grumpy sickly
  mood/        happy neutral sad sleep sick
  ui/          heart-broken locked
```

PNG 재생성:

```bash
python3 scripts/generate_all_sprites.py --install
```

## 그래픽 표시 규칙

### 메인 (진화 스프라이트)

| 조건 | 스프라이트 |
|------|-----------|
| 게임 오버 | `evolution/dead.png` |
| egg ~ teen | `evolution/{stage}.png` |
| adult | `adult/{variantId}.png` |

### 말풍선 (무드 스프라이트)

| 조건 | 스프라이트 |
|------|-----------|
| 게임 오버 | 숨김 |
| 수면 | `mood/sleep.png` |
| 건강 < 30 | `mood/sick.png` |
| 슬픔/보통/좋음 | `mood/sad|neutral|happy.png` |

스프라이트 off 또는 로드 실패 시 이모지 fallback.

## 성체 변형 (tier)

| tier | 조건 (진화 시점) | 톤 |
|------|------------------|-----|
| pretty | 4 stat min ≥ 65, avg ≥ 72 | 빛나는 심해어, 긍정 대사 |
| normal | min ≥ 40, avg ≥ 50 | 보통 심해어, 중립 대사 |
| defective | 그 외 | 불량 심해어, 부정 대사 |

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

스프라이트 URL에도 동일 버전 쿼리가 붙습니다 (`sprites.js`).

### 개발 테스트 모드

```
http://localhost:8080/?dev=1
```

테스트 패널: 게임 오버, 오프라인, 나이 +1일, 진화, 성체 pretty/defective, 도감 초기화, idle 대사, **스프라이트 on/off**, **스프라이트 포맷 svg/png**

## 모바일 테스트

1. PC와 폰이 같은 Wi-Fi에 연결
2. PC IP 확인 (macOS): `ipconfig getifaddr en0`
3. 폰 브라우저에서 `http://<PC-IP>:8080` 또는 배포 URL 접속

### 체크리스트

상세 QA 시나리오(기기별 Pass/Fail 표): **[docs/QA-CHECKLIST.md](docs/QA-CHECKLIST.md)**

요약 (수동 확인):

- [ ] 메인 진화 PNG + 말풍선 무드 PNG 동시 표시
- [ ] `?dev=1` 스프라이트 off → 이모지 fallback
- [ ] 진화 단계별 PNG 전환 (dev 나이 +1일)
- [ ] 성체 pretty/defective → 다른 adult PNG
- [ ] 도감 카드 PNG + 미수집 locked PNG
- [ ] 게임 오버·졸업 오버레이 PNG
- [ ] 🔊/🔇, safe-area, 오프라인 반영
- [ ] 재우기/깨우기·돌보기 버튼 (최근 버그 회귀 — A섹션)
- [ ] Phase 5B 모션·FX (G섹션)

## 밸런스

| 항목 | 값 |
|------|-----|
| 배고픔 감소 | 0.04/초 |
| 행복 감소 | 0.024/초 |
| 청결 감소 | 0.016/초 |
| 건강 감소 | 0.016/초 (tiered) |
| 방치 게임 오버 | 평균 < 10, 10분 |

수치 조정: `js/pet.js`의 `DECAY_RATES`, `HEALTH_DECAY_RATE`

## GitHub Pages 배포

저장소: https://github.com/myoungwonkim/tamagotchi

1. `main` 브랜치에 push
2. **Settings → Pages → Source:** Deploy from a branch
3. Branch: `main`, Folder: `/ (root)`

배포 URL: https://myoungwonkim.github.io/tamagotchi/

## 프로젝트 구조

```
tamagotchi/
  assets/sprites/   # 심해어 PNG 21종
  index.html
  css/style.css
  js/
    sprites.js        # 스프라이트 URL, preload, useSprites 설정
    pet.js            # getMoodKind, decay
    evolution.js      # 진화 단계 + spriteId
    adultVariants.js  # 성체 variant + spriteId
    dialogue.js       # 성체 tier별 대사
    encyclopedia.js   # 도감 localStorage
    audio.js          # Web Audio SFX, 음소거
    actions.js        # 돌봄 버튼
    effects.js        # 진화·무드·idle·돌보기 FX
    storage.js        # localStorage
    ui.js             # setPetGraphic, 도감·FAB UI
    main.js           # 게임 루프
    dev.js            # ?dev=1 테스트 패널
```
