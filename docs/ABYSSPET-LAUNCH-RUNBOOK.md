# abysspet 출시 실행서 (사용자용)

콘솔·심의·검수에 **직접 로그인해서 클릭**해야 하는 작업만 정리했습니다.  
코드·문서·빌드는 저장소에 준비되어 있습니다.

---

## 사전 확인

| 항목 | 값 |
|------|-----|
| appName (수정 불가) | `abysspet` |
| 한국어 앱 이름 | 어비스펫: 심해 가상 펫 |
| 영어 앱 이름 | Abyss Pet |
| 부제 | 심해 가상펫 육성 및 수집 게임 |
| 고객문의 | nolsoop.games@gmail.com |
| 개인정보 URL | https://myoungwonkim.github.io/tamagotchi/docs/privacy.html |
| 스토어 에셋 | `assets/ait-store/` |
| 스토어 문구 | [APPS-IN-TOSS-STORE-LISTING.md](./APPS-IN-TOSS-STORE-LISTING.md) |

---

## Step 1 — 앱인토스 콘솔 미니앱 등록 (30분)

1. [앱인토스 콘솔](https://developers-apps-in-toss.toss.im/) 로그인
2. **미니앱 만들기** → **게임**
3. 아래 값 **그대로** 입력:

```
appName: abysspet
한국어 앱 이름: 어비스펫: 심해 가상 펫
영어 앱 이름: Abyss Pet
부제: 심해 가상펫 육성 및 수집 게임
고객문의: nolsoop.games@gmail.com
```

4. **상세 설명** — STORE-LISTING 문서의 «상세 설명» 블록 복붙
5. **이미지 업로드** (`assets/ait-store/`):
   - 로고 light/dark (600×600)
   - 썸네일 1932×828, 1000×1000
   - 스크린샷 portrait 4장 + landscape 1장
6. 정산 정보 **승인** 상태 확인 (워크스페이스 → 정보)

### 에이전트에 전달 (1줄)

로고 업로드 후 이미지 URL:

```
icon URL: https://...
```

---

## Step 2 — GRAC 등급 심의 (병렬, 7~14영업일)

1. [게임물관리위원회](https://www.grac.or.kr) 등급분류 신청
2. 게임 설명서: [GRAC-SUBMISSION-PACK.md](./GRAC-SUBMISSION-PACK.md) → PDF 변환 후 첨부
3. 스크린샷 5장: `assets/ait-store/screenshot-portrait-0*.png` + landscape
4. 수수료 납부
5. **등급분류증명서 PDF** 보관

체크리스트: [GRAC-RATING-CHECKLIST.md](./GRAC-RATING-CHECKLIST.md)

---

## Step 3 — 인앱 광고 (20분 + 최대 2시간 대기)

콘솔 → 인앱 광고 → 약관 동의 → 광고 그룹 2개:

| 이름 | 유형 | 리워드 |
|------|------|--------|
| `abysspet_gameover_interstitial` | 전면형 | — |
| `abysspet_reward_revive` | 보상형 | 부활 1회 / 수량 1 |

### 에이전트에 전달

```
VITE_AD_INTERSTITIAL_ID=...
VITE_AD_REWARDED_ID=...
```

(검수 전까지 테스트 ID로도 샌드박스 QA 가능)

---

## Step 4 — 빌드·테스트

로컬 (Node.js 필요):

```bash
cd ~/Desktop/kaffeine/tamagotchi
npm install
cp .env.ait.example .env.ait   # 운영 ID 반영 시
npm run build:ait
```

### 샌드박스

1. 샌드박스 앱 설치
2. `npm run dev` → `intoss://abysspet`
3. [APPS-IN-TOSS-LAUNCH.md](./APPS-IN-TOSS-LAUNCH.md) L1~L10 확인

### 실기기 (필수)

1. 콘솔에 `.ait` 업로드
2. **토스앱 QR** 스캔 후 최종 테스트

---

## Step 5 — 검수 제출 (2~3영업일)

콘솔 → 검수 요청:

| 첨부 | 파일/URL |
|------|----------|
| 등급분류증명서 | GRAC PDF |
| 개인정보 처리방침 | privacy.html URL (위) |
| 빌드 | 최신 `.ait` |

승인 후 → **출시하기**

---

## 한 장 체크리스트

- [ ] appName = `abysspet` (다른 값 금지)
- [ ] 스토어 문구·이미지 업로드
- [ ] 정산 승인
- [ ] GRAC 접수 → 증명서 PDF
- [ ] 광고 그룹 2개 → ID 전달
- [ ] 로고 URL → 에이전트 전달
- [ ] `.ait` 업로드 + QR 테스트
- [ ] 검수 제출 → 출시

---

## 관련 문서

| 문서 | 용도 |
|------|------|
| [APPS-IN-TOSS-CONSOLE-SETUP.md](./APPS-IN-TOSS-CONSOLE-SETUP.md) | 콘솔 상세 |
| [APPS-IN-TOSS-LAUNCH.md](./APPS-IN-TOSS-LAUNCH.md) | 광고 QA |
| [MONETIZATION.md](./MONETIZATION.md) | 광고 정책 |
| [GRAC-SUBMISSION-PACK.md](./GRAC-SUBMISSION-PACK.md) | 심의 설명서 |
