# AdMob / Play 광고 연동 메모

정책은 [`MONETIZATION.md`](./MONETIZATION.md). 구현: `AbyssPetAdsPlugin.java` · `js/adsAdMob.js` · `js/ads.js`.

## 유닛

| 용도 | 포맷 | 환경 변수 |
|------|------|-----------|
| T1/T3 | 전면 | `VITE_ADMOB_INTERSTITIAL_ID` |
| (예비) | 보상형 | `VITE_ADMOB_REWARDED_ID` |
| R4 보호 | 리워드 인터스티셜 | `VITE_ADMOB_REWARDED_INTERSTITIAL_ID` |

App ID(`~` 형태)는 `android/app/src/main/res/values/strings.xml`의 `admob_app_id`와 같아야 한다.

`.env.play`는 gitignored. `npm run build:play`가 읽는다. 운영 유닛으로 로컬 클릭 테스트 금지.

## 미디에이션 (코드에 포함)

어댑터: Meta Audience Network · Unity Ads · Pangle. 입찰은 AdMob 콘솔 미디에이션 그룹에서 켠다.

1. AdMob → 미디에이션 → 소스로 Meta / Unity / Pangle 계정 연결
2. **전면** 유닛과 **리워드 인터스티셜** 유닛에 입찰 그룹 생성
3. 콘솔이 주는 `app-ads.txt` 스니펫을 루트 [`app-ads.txt`](../app-ads.txt)에 붙여 넣고 main에 푸시  
   (`https://nolsoopgames.com/app-ads.txt` — Pages 워크플로가 복사함)
4. Play 앱 ↔ AdMob 앱 연결, Data safety / Ads 선언

어댑터만 넣고 콘솔 그룹이 없으면 Google 입찰만 동작한다.

## Empty-ads 셸

```bash
npm run build:play:empty-ads
```

`VITE_PLAY_ADS=0` → `adsEmpty.js`.

## Console

- [ ] AdMob 앱 ↔ Play 앱 연결
- [ ] 미디에이션 입찰 그룹 (전면 + 리워드 인터스티셜)
- [ ] `app-ads.txt` 파트너 줄 반영 후 배포
- [ ] Data safety / Ads 선언
- [ ] UMP(EEA 등) — 출시 국가에 맞게
