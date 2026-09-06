# Capacitor Android / Google Play 빌드 가이드

## 사전 요구

- Node 20+ (`npm`)
- Android Studio + SDK 36
- JDK 17+

## 빌드

```bash
# Play (`.env.play` 운영 AdMob 유닛 + cap sync)
npm run build:play

# Phase 1 empty-ads 셸
npm run build:play:empty-ads

# Android Studio
npm run open:android
```

AAB (내부 테스트):

```bash
./scripts/create_upload_keystore.sh   # 최초 1회, 산출물 gitignored
cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```

`versionCode`는 [`android/app/build.gradle`](../android/app/build.gradle)에서 단조 증가.

릴리스는 `targetSdk`/`compileSdk` **36**, R8(`minifyEnabled`)·네이티브 심볼을 AAB에 포함합니다.
매핑은 Play가 번들에서 읽습니다. 사본: `android/app/build/outputs/mapping/release/mapping.txt`

Play 출시에는 **AAB 하나만** 넣습니다. 예전 APK/AAB를 같은 버전에 남겨 두면
「버전 코드가 더 높은 APK로 대체되어 제공되지 않음」오류와 API 35 경고가 납니다.
초안에서 낮은 `versionCode` 아티팩트는 **포함되지 않음**으로 옮긴 뒤 저장하세요.

## applicationId

`com.nolsoopgames.abysspet`

## 관련 문서

- [GOOGLE-PLAY-LAUNCH-PLAN.md](./GOOGLE-PLAY-LAUNCH-PLAN.md)
- [ADMOB-PLAY.md](./ADMOB-PLAY.md)
- [FIREBASE-PLAY.md](./FIREBASE-PLAY.md) — Analytics·Crashlytics, `google-services.json` 배치
- [GOOGLE-PLAY-STORE-LISTING.md](./GOOGLE-PLAY-STORE-LISTING.md)
- [PLAY-PHASE0-CHECKLIST.md](./PLAY-PHASE0-CHECKLIST.md)
