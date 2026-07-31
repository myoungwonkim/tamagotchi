# Capacitor Android / Google Play 빌드 가이드

## 사전 요구

- Node 20+ (`npm`)
- Android Studio + SDK 35
- JDK 17+

## 빌드

```bash
# 일반 (AdMob 샘플 유닛 포함)
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

## applicationId

`com.nolsoopgames.abysspet`

## 관련 문서

- [GOOGLE-PLAY-LAUNCH-PLAN.md](./GOOGLE-PLAY-LAUNCH-PLAN.md)
- [ADMOB-PLAY.md](./ADMOB-PLAY.md)
- [GOOGLE-PLAY-STORE-LISTING.md](./GOOGLE-PLAY-STORE-LISTING.md)
- [PLAY-PHASE0-CHECKLIST.md](./PLAY-PHASE0-CHECKLIST.md)
