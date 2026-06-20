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
- **표정:** 기분(😢😐)은 유지, 좋을 때는 진화 단계 이모지 표시
- **진화 알림:** 단계가 올라가면 메시지 + 팡파레
- **효과음:** 돌봄·진화·게임 오버·오프라인 환영 (Web Audio)
- **음소거:** 헤더 🔊/🔇 토글 (설정 localStorage 저장)

## 진화 단계

| 단계 | 일수 | 이모지 | 이름 |
|------|------|--------|------|
| egg | 0 | 🥚 | 알 |
| baby | 1–2 | 🐣 | 아기 |
| child | 3–6 | 🐥 | 어린이 |
| teen | 7–13 | 🐤 | 청소년 |
| adult | 14+ | 🐔 | 어른 |

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

테스트 패널: 게임 오버, 오프라인, 나이 +1일, 진화 테스트

## 모바일 테스트

1. PC와 폰이 같은 Wi-Fi에 연결
2. PC IP 확인 (macOS): `ipconfig getifaddr en0`
3. 폰 브라우저에서 `http://<PC-IP>:8080` 또는 배포 URL 접속

### 체크리스트

- [ ] 4개 돌봄 버튼 터치 + 각각 다른 소리
- [ ] 🔊/🔇 음소거 토글 (새로고침 후 유지)
- [ ] iOS: 첫 버튼 터치 후 소리 재생
- [ ] 진화 단계명 표시 + 나이 +1일 시 진화 알림
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
    pet.js         # 펫 모델, decay, 게임 오버
    evolution.js   # 진화 단계, checkEvolution
    audio.js       # Web Audio SFX, 음소거
    actions.js     # 돌봄 버튼
    storage.js     # localStorage
    ui.js          # 화면 갱신
    main.js        # 게임 루프
    dev.js         # ?dev=1 테스트 패널
```
