# 앱인토스 콘솔 설정 가이드

## 1. 워크스페이스·미니앱 등록

1. [앱인토스 콘솔](https://developers-apps-in-toss.toss.im/) 로그인 (토스 비즈니스)
2. **미니앱 만들기** → 게임 카테고리
3. 콘솔 입력값과 [`granite.config.ts`](../granite.config.ts) **완전 일치** 필수:

| 콘솔 필드 | granite.config.ts | 예시 |
|-----------|-------------------|------|
| appName (수정 불가) | `appName` | `abysspet` |
| 앱 이름 | `brand.displayName` | `어비스펫: 심해 가상 펫` |
| 부제 | 콘솔 앱 정보 | `심해 가상펫 육성 및 수집 게임` |
| 영어 앱 이름 | 콘솔 앱 정보 | `Abyss Pet` |
| 고객문의 이메일 | 콘솔 앱 정보 | `nolsoop.games@gmail.com` |
| 앱 아이콘 URL | `brand.icon` | 콘솔 업로드 이미지 우클릭 → 링크 복사 |
| primaryColor | `brand.primaryColor` | `#58b8c8` |

스토어 문구·이미지: [APPS-IN-TOSS-STORE-LISTING.md](./APPS-IN-TOSS-STORE-LISTING.md) · 에셋 폴더 [assets/ait-store/](../assets/ait-store/)  
**한 장 실행서:** [ABYSSPET-LAUNCH-RUNBOOK.md](./ABYSSPET-LAUNCH-RUNBOOK.md)

## 2. 사업자·정산

- [ ] 사업자 정보 등록 (완료)
- [ ] **정산 정보** 입력 → 검토 요청 (영업일 2~3일)
- [ ] 예금주명 = 통장 사본과 **한 글자도 동일**

## 3. 인앱 광고

1. **인앱 광고** 메뉴 → 약관 동의
2. 광고 그룹 2개 생성 (이름은 운영 식별용):

| 광고 그룹 이름 | 유형 | 콘솔 리워드 설정 | 코드 상수 |
|----------------|------|------------------|-----------|
| `abysspet_gameover_interstitial` | 전면형 | — | `AD_GROUP_INTERSTITIAL` |
| `abysspet_reward_revive` | 보상형 | 부활 1회 / 수량 1 | `AD_GROUP_REWARDED` |

3. 발급된 **광고 그룹 ID**를 `.env.ait`에 입력 (아래 참고)
4. ID 반영 후 **최대 2시간** 대기 (AdMob 연동)

### 환경 변수 (`.env.ait`)

```bash
cp .env.ait.example .env.ait
# 콘솔에서 복사한 ID로 교체 (개발 중에는 테스트 ID 유지)
VITE_AD_INTERSTITIAL_ID=ait-ad-test-interstitial-id
VITE_AD_REWARDED_ID=ait-ad-test-rewarded-id
```

## 4. 빌드·업로드

```bash
npm install
npm run build:ait      # dist/ + .ait 번들
```

콘솔 → **출시하기** → `.ait` 업로드 → QR 실기기 테스트 → 검수 요청

## 5. 검수 제출 서류

- [ ] 등급분류증명서 (GRAC)
- [ ] 개인정보 처리방침 URL: `https://nolsoopgames.com/abysspet/privacy.html`
- [ ] 게임 설명·광고 노출 정책 → [MONETIZATION.md](./MONETIZATION.md) 링크

## 6. 출시 후

- 인앱 광고 → **분석** 탭 (SDK 2.7.0+, D+1 08시 갱신)
- 정산: 익월 말 입금, 광고 수수료 15% 공제 ([FAQ](https://developers-apps-in-toss.toss.im/faq.html))
