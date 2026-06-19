# 다마고치 웹 게임

모바일 브라우저에서 플레이하는 웹 기반 다마고치 게임입니다.

## 기능

- 펫 1마리 키우기 (이름 설정 가능)
- 상태 4가지: 배고픔, 행복, 청결, 건강
- 돌봄 버튼: 먹이, 놀기, 씻기, 재우기
- 실시간 상태 감소 + 오프라인 시간 반영
- localStorage 자동 저장
- 방치 시 게임 오버 후 새 펫 시작

## 로컬 실행

```bash
cd ~/Desktop/kaffeine/tamagotchi
python3 -m http.server 8080
```

브라우저에서 http://localhost:8080 을 엽니다.

> ES 모듈을 사용하므로 `file://`로 직접 열면 동작하지 않습니다. 반드시 로컬 서버를 사용하세요.

8080 포트가 사용 중이면 `8081` 등 다른 포트를 사용하세요.

### 개발 테스트 모드

콘솔 붙여넣기 없이 게임 오버·오프라인·나이를 확인하려면:

```
http://localhost:8080/?dev=1
```

화면 오른쪽 아래 테스트 패널이 표시됩니다.

## 모바일 테스트

1. PC와 폰이 같은 Wi-Fi에 연결
2. PC IP 확인 (macOS): `ipconfig getifaddr en0`
3. 폰 브라우저에서 `http://<PC-IP>:8080` 접속
4. 아래 체크리스트 확인

### 모바일 체크리스트

- [ ] 4개 돌봄 버튼이 손가락으로 누르기 쉬운 크기 (72px+)
- [ ] 세로 화면에서 레이아웃이 깨지지 않음
- [ ] 노치·홈 인디케이터 영역과 겹치지 않음 (safe-area)
- [ ] 버튼 연타 시 쿨다운(1.5초) 동작
- [ ] 탭을 닫았다 열면 상태가 반영됨
- [ ] 5~10분 플레이 후 치명적 버그 없음

## 밸런스 (Day 7)

| 항목 | 값 | 설명 |
|------|-----|------|
| 배고픔 감소 | 0.04/초 | 약 10분 방치 시 -24 |
| 행복 감소 | 0.024/초 | |
| 청결 감소 | 0.016/초 | |
| 건강 감소 | 0.016/초 | 돌봄 3종이 매우 낮을 때 |
| 방치 게임 오버 | 평균 < 10, 10분 | `pet.js` 상수 참고 |

수치 조정은 `js/pet.js`의 `DECAY_RATES`, `HEALTH_DECAY_RATE`만 변경하면 됩니다.

## GitHub Pages 배포

### 1. GitHub 저장소 생성 및 push

```bash
cd ~/Desktop/kaffeine/tamagotchi
git add .
git commit -m "Add tamagotchi web game MVP"
git remote add origin https://github.com/YOUR_USERNAME/tamagotchi.git
git push -u origin main
```

### 2. GitHub Pages 활성화

1. GitHub에서 저장소 열기: https://github.com/myoungwonkim/tamagotchi
2. 상단 **Settings** 탭 클릭 (안 보이면 `⋯` 메뉴 안에 있음)
3. 왼쪽 사이드바 **Code and automation** 섹션에서 **Pages** 클릭
4. **Build and deployment** → **Source**에서 **Deploy from a branch** 선택
5. **Branch:** `main` / **Folder:** `/ (root)` 선택 → **Save**

> **GitHub Actions** 옵션은 workflow 파일과 추가 권한이 필요합니다. 이 프로젝트는 정적 HTML이라 **Deploy from a branch**가 더 간단합니다.

### 3. 배포 URL

```
https://YOUR_USERNAME.github.io/tamagotchi/
```

## 프로젝트 구조

```
tamagotchi/
  index.html
  css/style.css
  js/
    pet.js       # 펫 모델, 시간 감소, 게임 오버
    actions.js   # 돌봄 버튼 로직
    storage.js   # localStorage
    ui.js        # 화면 갱신
    main.js      # 게임 루프
    dev.js       # ?dev=1 테스트 패널
```
