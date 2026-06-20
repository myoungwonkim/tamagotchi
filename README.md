# 다마고치 웹 게임

모바일 브라우저에서 플레이하는 웹 기반 다마고치 게임입니다.

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
- **진화:** 나이에 따라 5단계 (알 → 아기 → 어린이 → 청소년 → 어른)
- **진화 알림:** 단계가 올라가면 메시지 + 팡파레
- **효과음:** 돌봄·진화·게임 오버·오프라인 환영 (Web Audio)
- **음소거:** 헤더 🔊/🔇 토글 (`tamagotchi-settings` localStorage 저장)

### Phase 3 (이중 그래픽 + 성체 변형 + 도감)
- **이중 그래픽:** 중앙에 진화 이모지(메인), 옆 말풍선에 무드 이모지(😊😐😢😴🤒)
- **성체 변형:** 14일째 어른 진화 시 돌봄 수치로 tier 결정 (예쁜 / 보통 / 불량), tier 내 랜덤 3종
- **성체 대사:** tier별 idle·돌봄 대사 (예쁜=긍정, 불량=부정)
- **도감:** 성체 달성 시 자동 등록, 헤더 📖에서 9종 수집 현황 확인
- **새 펫 FAB:** 성체 달성 후 화면 측면 버튼으로 도감 보존 + 새 알 시작

## 진화 단계

| 단계 | 일수 | 이모지 | 이름 |
|------|------|--------|------|
| egg | 0 | 🥚 | 알 |
| baby | 1–2 | 🐣 | 아기 |
| child | 3–6 | 🐥 | 어린이 |
| teen | 7–13 | 🐤 | 청소년 |
| adult | 14+ | 변형별 | 어른 (9종) |

## 그래픽 표시 규칙

### 메인 (진화 그래픽)

| 조건 | 표시 |
|------|------|
| 게임 오버 | 👻 |
| egg ~ teen | 해당 단계 이모지 (🥚🐣🐥🐤) |
| adult | 성체 변형 이모지 (🐓 ✨🐔 🪶🐔 등) |

### 말풍선 (무드 그래픽)

| 조건 | 표시 |
|------|------|
| 게임 오버 | 숨김 |
| 수면 | 😴 |
| 건강 < 30 | 🤒 |
| minStat < 35 또는 avg < 40 | 😢 |
| minStat < 55 또는 avg < 70 | 😐 |
| 그 외 | 😊 |

## 성체 변형 (tier)

| tier | 조건 (진화 시점) | 톤 |
|------|------------------|-----|
| pretty | 4 stat min ≥ 65, avg ≥ 72 | 예쁜 닭, 긍정 대사 |
| normal | min ≥ 40, avg ≥ 50 | 보통 닭, 중립 대사 |
| defective | 그 외 | 불량 닭, 부정 대사 |

tier당 3종 variant (총 9종). `js/adultVariants.js` 참고.

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

### 개발 테스트 모드

```
http://localhost:8080/?dev=1
```

테스트 패널: 게임 오버, 오프라인, 나이 +1일, 진화, 성체 pretty/defective, 도감 초기화, idle 대사

## 모바일 테스트

1. PC와 폰이 같은 Wi-Fi에 연결
2. PC IP 확인 (macOS): `ipconfig getifaddr en0`
3. 폰 브라우저에서 `http://<PC-IP>:8080` 또는 배포 URL 접속

### 체크리스트

- [ ] 메인 진화 이모지 + 말풍선 무드 이모지 동시 표시
- [ ] 0일째 **알** 단계에서 메인 🥚, 말풍선은 상태에 따라 변경
- [ ] 4개 돌봄 버튼 터치 + 각각 다른 소리
- [ ] 🔊/🔇 음소거 토글 (새로고침 후 유지)
- [ ] iOS: 첫 버튼 터치 후 소리 재생
- [ ] `?dev=1` 성체 pretty/defective 진화 → 다른 이모지·대사
- [ ] 성체 달성 시 도감 등록 + 📖 그리드 표시
- [ ] 성체 FAB → 새 펫 시작 후 도감 유지
- [ ] safe-area, 레이아웃, 오프라인 반영

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
  index.html
  css/style.css
  js/
    pet.js            # 펫 모델, decay, getEvolutionEmoji/getMoodEmoji
    evolution.js      # 진화 단계, checkEvolution
    adultVariants.js  # 성체 tier·variant, resolveAdultVariant
    dialogue.js       # 성체 tier별 대사
    encyclopedia.js   # 도감 localStorage
    audio.js          # Web Audio SFX, 음소거
    actions.js        # 돌봄 버튼
    storage.js        # localStorage
    ui.js             # 화면 갱신, 도감·FAB UI
    main.js           # 게임 루프
    dev.js            # ?dev=1 테스트 패널
```
