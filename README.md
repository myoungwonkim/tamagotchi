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
cd ~/Projects/tamagotchi
python3 -m http.server 8080
```

브라우저에서 http://localhost:8080 을 엽니다.

> ES 모듈을 사용하므로 `file://`로 직접 열면 동작하지 않습니다. 반드시 로컬 서버를 사용하세요.

## GitHub Pages 배포

1. GitHub에 저장소 생성 후 push:

```bash
git add .
git commit -m "Add tamagotchi web game MVP"
git remote add origin https://github.com/YOUR_USERNAME/tamagotchi.git
git push -u origin main
```

2. GitHub 저장소 Settings → Pages → Source: `main` 브랜치, `/ (root)` 선택
3. 배포 URL: `https://YOUR_USERNAME.github.io/tamagotchi/`

## 모바일 테스트

1. PC와 폰이 같은 Wi-Fi에 연결
2. PC IP 확인: `ipconfig getifaddr en0` (macOS)
3. 폰 브라우저에서 `http://<PC-IP>:8080` 접속

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
```
