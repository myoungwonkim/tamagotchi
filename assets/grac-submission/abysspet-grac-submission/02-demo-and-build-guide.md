# GRAC 시연·빌드 제출 가이드

게임물관리위원회(GRAC) 등급분류 신청 시 **«시연 영상 또는 빌드»** 항목용 안내입니다.

| 항목 | 값 |
|------|-----|
| 게임명 | 어비스펫: 심해 가상 펫 |
| appName | `abysspet` |
| 온라인 시연 (웹) | https://nolsoopgames.com/abysspet/ |
| 문의 | nolsoop.games@gmail.com |
| 자료 갱신 기준 | 2026년 7월 16일 |

---

## 제출 방식 (택 1 또는 병행)

GRAC는 보통 아래 **하나 이상**을 받습니다. 모두 준비해 두면 심의가 수월합니다.

| 방식 | 파일/URL | 권장 |
|------|----------|------|
| **A. 시연 영상** | `assets/grac-submission/abysspet-grac-demo.mp4` (또는 `.webm`) | **권장** — 심의위원이 바로 확인 |
| **B. 온라인 URL** | GitHub Pages 링크 | 영상과 함께 신청서 «시연 방법»란에 기재 |
| **C. 앱인토스 빌드** | `abysspet-sandbox.ait` + 콘솔 QR | 토스 미니앱 실기 동작 증명 |

---

## A. 시연 영상 (자동 생성)

### 포함 화면 (약 60~70초, 자동 연출)

`?gracDemo=1` 모드가 아래 순서로 재생합니다.

1. 새 펫 시작 (알)
2. **돌보기** — 먹이 · 놀기 · 씻기
3. **성장** — 테마별 알·유년기 → 청소년기 → 성체 진화
4. **탐사 일지** — 심해어·심해인어 탭, 수집 성체와 미수집 봉인 도장 열람
5. **재우기 / 깨우기**
6. 스탯 위험 → 응급 돌보기
7. **상어 습격** — 접근·플래시 후 유령 전환
8. **게임 오버** → 광고 보고 부활 (모의)

광고는 전환 구간·자발적 선택만 노출됩니다. 상세: [MONETIZATION.md](./MONETIZATION.md)

### 생성 명령

```bash
cd ~/Desktop/kaffeine/tamagotchi
python3 scripts/record_grac_demo.py
```

산출물:

| 파일 | 용도 |
|------|------|
| `assets/grac-submission/abysspet-grac-demo.webm` | 기본 녹화 |
| `assets/grac-submission/abysspet-grac-demo.mp4` | ffmpeg 있으면 자동 변환 (GRAC 업로드 권장) |

MP4 변환 (수동):

```bash
ffmpeg -i assets/grac-submission/abysspet-grac-demo.webm \
  -c:v libx264 -pix_fmt yuv420p \
  assets/grac-submission/abysspet-grac-demo.mp4
```

### 전체 패키지 한 번에 (영상 + zip)

```bash
bash scripts/build_grac_submission.sh
```

Node.js가 있으면 `.ait`까지 포함합니다. 없으면 영상·스크린샷·문서만 패키징됩니다.

---

## B. 온라인 시연 URL (신청서 기재용)

신청서 «시연 방법» 또는 «비고»란에 아래 문구를 복붙하세요.

```
[온라인 시연]
URL: https://nolsoopgames.com/abysspet/
설명: 모바일·PC 브라우저에서 무료 플레이 가능. 회원가입·로그인 없음.
주요 화면 직접 링크:
- 메인: .../index.html?capture=main
- 진화: .../index.html?capture=evolution
- 탐사 일지: .../index.html?capture=encyclopedia
- 게임 오버: .../index.html?capture=gameover
광고 UI 모의: .../index.html?toss=1&mockAds=1 (토스 미니앱 광고 플로우 확인용)
```

---

## C. 샌드박스 `.ait` 빌드 + 검수용 QR

앱인토스 미니앱으로 심의·검수 시 실기 테스트가 필요할 때 사용합니다.

### C-1. 빌드 (로컬, Node.js 필요)

```bash
cd ~/Desktop/kaffeine/tamagotchi
npm install
cp .env.ait.example .env.ait    # 샌드박스: 테스트 광고 ID 유지
npm run build:ait
```

프로젝트 루트에 `abysspet_*.ait` (또는 유사 이름) 파일이 생성됩니다.

콘솔 업로드용 복사:

```bash
cp *.ait assets/grac-submission/abysspet-sandbox.ait
```

> `.ait` 파일은 `.gitignore` 대상입니다. GRAC 제출용으로 로컬·zip 패키지에만 보관하세요.

### C-2. 앱인토스 콘솔 업로드

1. [앱인토스 콘솔](https://developers-apps-in-toss.toss.im/) → 미니앱 `abysspet`
2. **출시하기** (또는 빌드 관리) → `.ait` 업로드
3. 업로드 완료 후 **QR 코드** 표시

### C-3. 샌드박스 앱 + QR 테스트

1. [개발자센터](https://developers-apps-in-toss.toss.im/) 가이드에 따라 **샌드박스 앱** 설치
2. 콘솔 QR 스캔 → 실기에서 미니앱 실행
3. 딥링크: `intoss://abysspet`

개발 중 로컬 연동:

```bash
npm run dev
# 샌드박스에서 intoss://abysspet 접속 (PC와 폰 동일 Wi-Fi)
```

### C-4. GRAC 신청서에 기재 (빌드 제출 시)

```
[빌드 시연]
플랫폼: 앱인토스 WebView 미니앱 (appName: abysspet)
빌드: abysspet-sandbox.ait (첨부 또는 별도 전달)
실기 시연: 토스앱 샌드박스 + 콘솔 QR (심의 담당자 요청 시 안내 가능)
문의: nolsoop.games@gmail.com
```

QR은 콘솔에서만 발급되므로 **스크린샷으로 GRAC에 첨부**하거나, 담당자 연락 시 이메일로 QR·접속 방법을 안내하세요.

---

## 제출 패키지 zip

```bash
# 영상 녹화 후 (또는 build_grac_submission.sh 실행 후)
python3 scripts/package_grac_submission.py
```

산출: `assets/grac-submission/abysspet-grac-submission.zip`

포함:

| 파일 | 내용 |
|------|------|
| `01-game-description.md` | 게임 설명서 → **PDF 변환 후 GRAC 첨부** |
| `02-demo-and-build-guide.md` | 본 문서 |
| `03-privacy-policy.html` | 개인정보 처리방침 |
| `screenshots/` | 스토어 스크린샷 5장 |
| `04-demo-video.*` | 시연 영상 |
| `05-abysspet-sandbox.ait` | 있으면 포함 |

---

## GRAC 신청 체크리스트

- [ ] 게임 설명서 PDF ([GRAC-SUBMISSION-PACK.md](./GRAC-SUBMISSION-PACK.md))
- [ ] 스크린샷 5장 (`assets/ait-store/screenshot-*.png`)
- [ ] 시연 영상 MP4/WebM **또는** 온라인 URL
- [ ] (선택) `.ait` 빌드 + 콘솔 QR 스크린샷
- [ ] 사업자등록증 사본
- [ ] 등급분류 신청서 ([grac.or.kr](https://www.grac.or.kr))

관련: [GRAC-RATING-CHECKLIST.md](./GRAC-RATING-CHECKLIST.md) · [ABYSSPET-LAUNCH-RUNBOOK.md](./ABYSSPET-LAUNCH-RUNBOOK.md)
