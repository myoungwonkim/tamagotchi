# AdMob / Play 광고 연동 메모

정책(T1–T4 / R1–R3)은 [`MONETIZATION.md`](./MONETIZATION.md)와 동일. 구현: `js/adsAdMob.js` · façade `js/ads.js`.

## 환경 변수 (`.env.play` — gitignored)

```
VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-xxxxxxxx/yyyyyyyy
VITE_ADMOB_REWARDED_ID=ca-app-pub-xxxxxxxx/zzzzzzzz
VITE_PLAY_ADS=1
```

기본값은 Google **샘플** 유닛 ID. 운영 유닛으로 로컬 클릭 테스트 금지.

## Empty-ads 셸

```bash
npm run build:play:empty-ads
```

`VITE_PLAY_ADS=0` → `adsEmpty.js` (크래시 없이 광고 스킵).

## AndroidManifest

`@capacitor-community/admob` sync 후 Application ID meta-data 확인:

```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-xxxxxxxx~yyyyyyyy"/>
```

샘플 App ID: `ca-app-pub-3940256099942544~3347511713`

## Console

- [ ] AdMob 앱 ↔ Play 앱 연결
- [ ] Data safety / Ads 선언
- [ ] UMP(EEA 등) — 출시 국가에 맞게
