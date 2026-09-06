# Firebase Analytics + Crashlytics (Google Play)

**범위:** Android Play 앱 `com.nolsoopgames.abysspet`만. Auth / FCM / Firestore / Remote Config / iOS는 쓰지 않는다.

웹·앱인토스는 `index.html`의 기존 GA4 태그(`G-VZ2DXER02Y`)를 그대로 쓴다.
Play만 Capacitor Firebase로 수집한다 — WebView gtag로는 네이티브 크래시가 안 잡힌다.

## 1. Firebase Console (운영자)

1. [Firebase Console](https://console.firebase.google.com) → 프로젝트 선택/생성
2. **Android 앱 추가**
   - 패키지 이름: **`com.nolsoopgames.abysspet`** (다른 앱 것을 쓰면 안 된다 — 2-9 참조)
   - SHA-1: Play App Signing / 업로드 키스토어 지문 (선택, 향후 Google 서비스용)
3. **Analytics** · **Crashlytics** 제품 활성화
4. `google-services.json` 다운로드 → **`android/app/google-services.json`** 에 배치

**현재:** 파일이 배치됨. 프로젝트 `abysspet`, 패키지 `com.nolsoopgames.abysspet`.
AAB 1.0.9에서 `processReleaseGoogleServices`가 `google_app_id`를 생성했다.

이 파일이 없으면 `android/app/build.gradle`이 `google-services`·`crashlytics` 플러그인을
**건너뛴다**. 빌드는 성공하지만 Firebase는 동작하지 않는다 (JS 쪽도 조용히 no-op).

### Console의 Kotlin DSL 스니펫은 무시할 것

이 레포는 Capacitor 기본값인 Groovy `buildscript` + `apply plugin` 방식이다.

| Firebase Console 안내 | 이 프로젝트 |
|---|---|
| root `plugins { id 'com.google.gms.google-services' }` | `android/build.gradle` → `classpath 'com.google.gms:google-services:…'` |
| app `plugins { id 'com.google.gms.google-services' }` | `android/app/build.gradle` → json 있으면 자동 `apply plugin` |
| `firebase-bom` + `firebase-analytics` 의존성 | **불필요** — `@capacitor-firebase/*`가 SDK를 끌어온다 |
| Crashlytics Gradle 플러그인 | `classpath 'com.google.firebase:firebase-crashlytics-gradle:…'` + json 가드 안에서 apply |

## 2. 코드 구조

| 파일 | 역할 |
|---|---|
| `js/firebasePlay.js` | Play에서만 플러그인 로드, Analytics/Crashlytics 활성화, 이벤트 래퍼 |
| `js/playNative.js` | `initPlayNative()` 마지막에 `initFirebasePlay()` 호출 |
| `js/main.js` | 게임 훅에서 이벤트 기록 |

플러그인 버전은 **Capacitor 메이저와 맞춰야 한다.** 현재 Capacitor 8 → `@capacitor-firebase/*@8`.
Capacitor를 올리면 이 플러그인도 같이 올린다.

### 수집 이벤트

| 이벤트 | 시점 | 파라미터 |
|---|---|---|
| `pet_hatch` | 새 펫 시작 | `species_theme` |
| `pet_evolve` | 진화 단계 변경 | `stage`, `species_theme`, `adult_variant` |
| `pet_care` | 먹이·놀이·청소·재우기 | `action` |
| `encyclopedia_open` | 도감 열기 | — |

세션·`first_open`(신규 설치)은 **네이티브 SDK가 앱 프로세스 시작 시** 수집한다.
`MainActivity.onCreate`에서 `FirebaseAnalytics.getInstance()`를 호출해 WebView JS가
죽어도 설치 수가 올라가도록 한다. JS는 `play_boot`와 게임 이벤트만 추가로 보낸다.

**오늘 설치가 안 보이면 먼저 확인할 것**
1. Firebase 프로젝트 **`abysspet`** (패키지 `com.nolsoopgames.abysspet`)인지.
   사주만세력 `city-sound-4c962` / 웹 GA4 `G-VZ2DXER02Y`에는 Play 설치가 안 잡힌다.
2. 보고서 기본 화면은 **최대 24시간** 지연. **Realtime** 또는 DebugView를 본다.
3. Play에 올라간 AAB에 `google-services.json`이 들어갔는지 (1.0.9 이전 빌드는 없음).
4. `android/app/google-services.json`이 없으면 **릴리스 빌드가 실패**한다.

## 3. 검증

```bash
npm run build:play        # 또는 build:play:empty-ads
npm run open:android      # Studio에서 Run
```

- **Analytics**: Console → 분석 → **DebugView**.
  기기에서 디버그 모드를 켜면 실시간으로 보인다:
  ```bash
  adb shell setprop debug.firebase.analytics.app com.nolsoopgames.abysspet
  ```
  끄기는 `.none`으로 다시 설정. DebugView를 안 쓰면 이벤트 반영에 최대 24시간.
- **Crashlytics**: 크래시는 보통 **다음 실행** 때 업로드된다. 즉시 안 보여도 정상.
  핸들링된 오류는 `recordNonFatal()`로 비치명 리포트를 보낼 수 있다.

## 4. Play Data safety (운영자)

Firebase가 들어가면 **Play Console → 앱 콘텐츠 → 데이터 보안** 설문을 갱신해야 한다.

- 수집: **앱 상호작용**(Analytics 이벤트), **크래시 로그**, **진단**, 앱 인스턴스 ID
- 목적: 분석 / 앱 기능
- 전송 암호화: 예 · 사용자 삭제 요청 경로: 문의 메일

`abysspet/privacy.html`의 수집 항목도 실제와 어긋나지 않는지 함께 확인한다.

## 5. 릴리스

Firebase가 들어간 바이너리를 올려야 Console에 데이터가 쌓인다.

1. `android/app/build.gradle`의 `versionCode` +1
2. `npm run build:play` → `cd android && ./gradlew bundleRelease`
3. Play Console 업로드 (R8을 켠 경우 같은 빌드의 `mapping.txt`도 함께)

## 관련 문서

- [CAPACITOR-ANDROID.md](./CAPACITOR-ANDROID.md)
- [ADMOB-PLAY.md](./ADMOB-PLAY.md)
- [GOOGLE-PLAY-LAUNCH-PLAN.md](./GOOGLE-PLAY-LAUNCH-PLAN.md)
