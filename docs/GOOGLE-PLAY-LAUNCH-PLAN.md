# Google Play 출시 계획 — 어비스펫 (Abyss Pet)

> **상태:** Phase 0 진행 중 (2026-07-18).  
> **제약 (Phase 1 전):** Capacitor init / 게임 로직 수정 / Android 프로젝트 생성 / 패키징용 npm 설치는 AIT 내부 검수 통과 전까지 하지 않는다.  
> **병행:** 앱인토스(AIT) 출시·검수는 계속 진행한다.

---

## 1. Goal & Non-goals

### Goal

- 기존 Vite + vanilla JS 웹 게임을 **Capacitor Android 셸**로 감싸 Google Play에 **독립 앱**으로 출시한다.
- 게임 코어(육성·진화·도감·오디오·UI)는 **공유**하고, 광고·환경 감지만 **플랫폼 어댑터**로 분리한다.
- Play 앱 정체성: `applicationId` 예) `com.nolsoopgames.abysspet` — AIT `appName: abysspet` / `intoss://abysspet`와 **다르다**.
- 1차 Play 마일스톤: **광고 비활성(empty-ads) 셸**이 실기기에서 안정 동작 → 이후 AdMob 전면형·보상형.

### Non-goals (이번 계획·1차 출시)

- 네이티브 전면 재작성, React Native / Flutter 이식
- TWA(Trusted Web Activity)를 **주 경로**로 채택 (아래 아키텍처에서 Capacitor 권장)
- iOS App Store (추후 Capacitor iOS는 가능하나 범위 밖)
- 인앱 결제(IAP), 배너 광고, 서버 계정·클라우드 세이브
- AIT 스토어 에셋(`assets/ait-store/` 1932×828 등)을 Play에 그대로 재사용
- AIT 검수 블로킹을 Play 작업으로 대체하거나, 그 반대로 Play를 AIT에 종속

---

## 2. Architecture

### 2.1 권장: Capacitor + shared web core

```
┌─────────────────────────────────────────┐
│  Vite build (dist/) — 공유 게임 코어      │
│  js/* · css/* · assets/sprites …         │
└───────────────┬─────────────────────────┘
                │
     ┌──────────┴──────────┐
     ▼                     ▼
 AIT (Granite/ait)    Capacitor Android
 apps-in-toss.config.ts    android/ + WebView
 @apps-in-toss/*      applicationId 별도
 Toss Ad SDK          AdMob (Phase 2+)
```

| 선택지 | 판정 | 이유 |
|--------|------|------|
| **Capacitor (권장)** | ✅ | 기존 `npm run build` 산출물을 WebView에 로드. 백 버튼·safe area·플러그인(AdMob) 경로가 명확. AIT와 빌드 파이프라인만 분기하면 됨. |
| TWA | ❌ 비주 | 호스팅 URL·Digital Asset Links·오프라인·광고 SDK 통합이 더 번거롭고, 현재 게임이 정적 번들+localStorage 중심이라 Capacitor가 단순. |
| 네이티브 재작성 | ❌ | 비용·리스크 과다. |

### 2.2 Shared core vs platform adapters

**공유 (건드리지 않거나 최소 변경):**

- 육성/진화/도감/사망·부활 UI 플로우 (`js/pet.js`, `evolution.js`, `encyclopedia.js`, …)
- `localStorage` 세이브 (`js/storage.js` 키 `tamagotchi-pet` 등) — WebView에서도 동일 API
- 광고 **정책·트리거·빈도** (`js/adConfig.js`의 `AD_TUNING`, T1–T4, R1–R3) — [MONETIZATION.md](./MONETIZATION.md)와 동일 계약
- CSS safe-area 변수 (이미 `env(safe-area-inset-*)` 사용)

**어댑터로 분리할 표면:**

| 관심사 | 현재 (AIT) | Play 목표 |
|--------|------------|-----------|
| 환경 감지 | `js/tossEnv.js` (`isTossEnv`) | `isPlayEnv()` / `getPlatform()` — Capacitor `Capacitor.getPlatform() === 'android'` 등 |
| 광고 로드·표시 | `js/ads.js` → `@apps-in-toss/web-framework` `loadFullScreenAd` / `showFullScreenAd` | `adsToss.js` + `adsAdMob.js` (또는 `ads/` 폴더) — **동일 public API** (`isAdsSupported`, interstitial/rewarded, audio suspend) |
| 빌드 엔트리 | `npm run build` + `ait build` | `build` + Capacitor `sync` / `open android` — **AIT 의존성은 Play 번들에서 트리셰이킹 또는 동적 import 실패 허용 유지** |
| 스토어 에셋 | `assets/ait-store/` | **신규** `assets/play-store/` (규격 다름) |

설계 원칙:

1. `adConfig.js`의 트리거 ID·쿨다운은 **플랫폼 불변**.
2. `ads.js`는 얇은 façade → 런타임에 Toss vs AdMob 구현 선택.
3. Play Phase 0–1에서는 AdMob 미연동: `isAdsSupported() === false` 또는 no-op 구현 → 게임 플로우는 기존 “광고 실패 시 계속”과 동일.

### 2.3 Identity 분리

| | Apps in Toss | Google Play |
|--|--------------|-------------|
| 앱 ID | `abysspet` (`apps-in-toss.config.ts`) | `com.nolsoopgames.abysspet` (가칭, 확정 필요) |
| 표시명 | 어비스펫: 심해 가상 펫 | 동일 권장 |
| 광고 | Toss Ad 그룹 ID (`VITE_AD_*`) | AdMob App ID + Ad Unit IDs |
| 개인정보 URL | `https://abysspet.nolsoopgames.com/privacy.html` | 웹 게임 호스트. Play 앱은 이 URL을 로드하지 않음 — Console 정책 링크만 |
| GRAC | AIT WebView 플랫폼으로 제출 중 | **Android 플랫폼 주석/갱신** (재심의 여부 확인 — Open decision) |

---

## 3. Repo / Branch Strategy (AIT 병행)

### 권장: **단일 메인라인 + 어댑터 + 빌드 플래그** (브랜치 분리 비권장)

AIT 출시가 진행 중이므로 `platforms/play` 장기 브랜치는 **머지 지옥 비용이 큼**. 대신:

1. **메인(또는 AIT feature 브랜치)에 어댑터 인터페이스만 먼저 합의**하고, 실제 Capacitor/`android/` 추가는 Play 작업 스프린트에서 수행.
2. npm scripts 예 (구현 시):
   - `build` — 기존 Vite + AIT static copy (변경 최소화)
   - `build:play` — Vite production + Capacitor sync (Play 전용)
   - `build:ait` — 현행 유지
3. Capacitor 산출물:
   - `android/` 커밋 여부: 팀 관행에 따름. 권장은 **커밋** (CI·서명 재현성).
   - `.gitignore`에 `android/app/build`, keystore, local.properties만 제외.
4. 의존성:
   - `@capacitor/core` / `@capacitor/android` / (이후) AdMob 플러그인은 **dev 또는 optional peer**로 Play 스크립트에서만 필수.
   - AIT의 `@apps-in-toss/web-framework`는 **제거하지 않음** — `ads.js` 동적 import 패턴 유지.

### 비권장: `platforms/play` 장기 포크

- 스프라이트·밸런스·광고 튜닝이 AIT와 동시에 바뀌면 이중 백포트.
- 단, **단기 실험 브랜치** `feat/play-capacitor-shell`는 OK — 머지 전 어댑터만 남기고 `android/`는 한 번에 합치기.

### 작업 분리 (사람/에이전트)

| 트랙 | 담당 | 금지 |
|------|------|------|
| AIT | 현재 부모 채팅 | Play용 Capacitor/AdMob 패키지 설치로 `package.json`을 흔들지 않기 |
| Play | 별도 채팅/스프린트 | `apps-in-toss.config.ts`·AIT 광고 ID·`assets/ait-store` 덮어쓰기 금지 |

---

## 4. Phased Milestones

### Phase 0 — 계획·계정·법무 준비 (구현 없음)

**할 일**

- [ ] Google Play Console 개발자 계정 (결제·신원 확인) — **사용자**
- [x] `applicationId` / 스토어 표시명 / 패키지 소유자 이메일 확정 → `com.nolsoopgames.abysspet`, 표시명 «어비스펫: 심해 가상 펫», `contact@nolsoopgames.com`
- [ ] GRAC: Android 출시 시 기존 등급분류증명 재사용 가능 여부 확인 (위원회·서류 “플랫폼”란) — **사용자**
- [x] 개인정보·약관 개정 초안 (AdMob·Android·광고 식별자) — 레포 `privacy.html` / `terms-of-service.html` (호스팅 배포는 별도)
- [x] Open decisions → §7 확정값 반영

**Acceptance**

- Play Console 앱 초안 생성 가능, ID·정책 URL 초안 합의.

---

### Phase 1 — Empty-ads Capacitor 셸 (핵심 기술 마일스톤)

**할 일 (구현 스프린트에서)**

- [x] Capacitor 초기화, `webDir: dist`, Android 프로젝트 생성
- [x] `applicationId` = `com.nolsoopgames.abysspet`, `versionName`/`versionCode` 시작값
- [x] 릴리스 서명 키스토어 스크립트 (`scripts/create_upload_keystore.sh`) — 운영자가 실행·백업
- [x] 플랫폼 감지 + ads no-op (`VITE_PLAY_ADS=0` / `adsEmpty.js`)
- [x] Android 뒤로가기 → 모달 닫기 / 확인 후 종료
- [x] status bar / gesture inset: `viewport-fit=cover` + CSS safe-area (실기기 QA 남음)
- [x] 세로 고정 (`screenOrientation=portrait`)
- [ ] 내부 테스트 트랙에 AAB 업로드 — **운영자 (Android Studio / gradlew + Console)**

**Acceptance**

- 실기기에서: 새 펫 → 돌보기 → 진화(dev 가속) → 도감 → 게임오버 → 재시작. (실기기 QA)
- localStorage 재실행 유지.
- 광고 버튼/트리거가 있어도 **크래시 없이** 스킵 또는 미표시.
- AIT `npm run build:ait` **회귀 없음**.

---

### Phase 2 — AdMob (전면형·보상형)

**할 일**

- [x] AdMob 플러그인 연동 (`js/adsAdMob.js`, 샘플 유닛 기본값)
- [x] 전면형 = T1–T4, 보상형 = R1–R3 — façade가 동일 게이트 유지
- [x] `userEarnedReward` 상당 콜백 이후에만 보상 지급 (Rewarded 리스너)
- [x] 광고 중 오디오 suspend/resume
- [ ] UMP/동의(EEA 등) — 출시 국가 정책에 맞게 (운영자)
- [ ] Data safety / Ads 선언을 Play Console에 기재 (운영자)
- [ ] 운영 AdMob App/Unit ID로 `strings.xml` · `.env.play` 교체 (운영자)

**Acceptance**

- 테스트 기기에서 전면·보상 각 1회 이상 성공. (실기기)
- 광고 실패·닫기 시 게임 플로우 유지 (AIT와 동일).
- 운영 유닛 ID로 **로컬 클릭 테스트 금지** 정책 문서화 (`docs/ADMOB-PLAY.md`).

---

### Phase 3 — 스토어 리스팅·정책·출시

**할 일**

- [x] Play 전용 에셋 제작 (`assets/play-store/`, `npm run build:play-store-assets`)
- [x] 스토어 문구: [`GOOGLE-PLAY-STORE-LISTING.md`](./GOOGLE-PLAY-STORE-LISTING.md)
- [ ] 콘텐츠 등급(IARC), 타겟 연령, 광고 포함 여부 — Console (운영자)
- [ ] GRAC 등급 표시(필요 시) + 증명서 첨부/비고 — 운영자
- [ ] privacy/terms 호스팅 배포 후 Console URL 일치 — 운영자
- [ ] 내부 → 비공개/오픈 테스트 → 프로덕션 — 운영자

**Acceptance**

- 스토어 리스팅 미리보기 통과, 정책 설문 완료, 프로덕션 제출 가능. (Console)

---

### Phase 4 — 출시 후 (범위 밖이지만 메모)

- eCPM·빈도 튜닝은 AIT [AD-TUNING.md](./AD-TUNING.md)와 **수치 공유**, 플랫폼별 ID만 분리.
- 크래시·ANR (Play Vitals), WebView 버전 이슈 모니터링.

---

## 5. Concrete Checklist

### 5.1 Play Console

- [ ] 개발자 계정 · 결제 프로필
- [ ] 앱 생성 (게임 / 무료 / 광고 포함)
- [ ] 기본 스토어 등록정보 (한·영 선택)
- [ ] 개인정보처리방침 URL
- [ ] Data safety 양식 (localStorage만 + 광고 SDK 수집)
- [ ] 광고 선언
- [ ] 콘텐츠 등급 설문
- [ ] 타겟 국가 (1차: 한국 권장)
- [ ] 앱 카테고리: 게임 > 시뮬레이션 또는 캐주얼
- [ ] 연락처: `contact@nolsoopgames.com`

### 5.2 Signing & applicationId

- [ ] `applicationId`: `com.nolsoopgames.abysspet` (가칭 — Open decision)
- [ ] Upload keystore 생성·오프라인 백업
- [ ] Play App Signing 등록
- [ ] `versionCode` 단조 증가 규칙 문서화
- [ ] debug vs release 빌드 구분

### 5.3 AdMob

- [ ] AdMob 계정 ↔ Play 앱 연결
- [ ] App ID, Interstitial unit, Rewarded unit
- [ ] 테스트 디바이스 등록
- [ ] 정책: AIT와 동일 T1–T4 / R1–R3, 세션 캡·쿨다운
- [ ] Phase 1에서는 **유닛 생성만** 하고 코드 연동은 Phase 2

### 5.4 Store listing assets (Play 전용 — AIT 재사용 금지)

AIT `thumbnail-1932x828`·`636×1048` 캡처는 **규격·알파·권장 해상도가 달라** Play에 그대로 올리지 않는다. 소스 캡처는 재사용하되 **리사이즈·알파 제거·크롭** 파이프라인을 `assets/play-store/`에 새로 둔다.

| 에셋 | 규격 | 비고 |
|------|------|------|
| 고해상도 아이콘 | **512×512** PNG/JPEG, **알파 없음** | AIT 600×600 로고와 별도 제작·검증 |
| Feature graphic | **1024×500** 정확히, JPEG 또는 24-bit PNG (**알파 없음**) | AIT 1932×828과 **비호환** |
| 폰 스크린샷 | 최소 2장 (권장 4–8), JPEG/24-bit PNG, 변 320–3840px, 긴 변 ≤ 2×짧은 변 | 권장 **1080×1920** (9:16). 장면: 메인 / 진화 / 도감 / 게임오버 |
| 7"/10" 태블릿 | 선택 (지원 선언 시 최소 4장 등 콘솔 가이드 준수) | 1차는 폰만으로도 가능 |
| 짧은/긴 설명 | AIT 상세 설명 재사용 + “Google Play / Android” 문구 | |

참고: [Play Console — preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)

### 5.5 GRAC

- [ ] 기존 [GRAC-RATING-CHECKLIST.md](./GRAC-RATING-CHECKLIST.md) 콘텐츠 자가점검 재사용
- [ ] 제출 서류 “플랫폼”에 **Android(Google Play)** 병기 또는 별도 신청 여부 확인
- [ ] 등급분류증명서 PDF를 Play 정책/스토어 설명에 반영 (심의 결과 따름)
- [ ] AIT 대안 경로(“스토어 선출시 후 링크”)와 혼동하지 않기 — Play는 자체 출시 트랙

### 5.6 Privacy / Terms

현행 `privacy.html`은 AdMob을 **제3자·위탁**에 이미 언급하나, 서비스 제공 채널이 **앱인토스만**으로 서술됨. `terms-of-service.html`도 동일.

개정 체크:

- [x] 제공 채널: 앱인토스 **및** Google Play(Android) 명시 (레포 초안)
- [x] AdMob / 광고 식별자(ADID) / 측정 목적 명확화 (레포 초안)
- [x] localStorage·sessionStorage 설명 유지 (서버 미전송)
- [x] 아동·전체이용가·문의 메일 유지
- [ ] 시행일 갱신 후 `https://abysspet.nolsoopgames.com/privacy.html` · `terms-of-service.html` **배포**
- [ ] Play Console URL과 동기화

### 5.7 Android UX

- [ ] **Back button:** Capacitor `App` plugin — 오버레이/모달 우선 닫기, 루트에서 종료 확인
- [ ] **Safe area:** 기존 CSS + Android 35+ edge-to-edge / 제스처 내비 실기기 QA ([QA-CHECKLIST.md](./QA-CHECKLIST.md) E1 확장)
- [ ] 키보드(이름 입력)가 하단 액션을 가리지 않는지
- [ ] 앱 전환 후 오디오·틱 타이머 정상 재개
- [ ] 오프라인(로컬 에셋) 동작 — Capacitor는 번들 로드라 네트워크 불필요(광고 제외)

### 5.8 기술 회귀 (AIT 보호)

- [ ] `apps-in-toss.config.ts` `appName: abysspet` 유지
- [ ] `npm run build:ait` 성공
- [ ] Toss 광고 경로: `isTossEnv()`일 때만 framework import
- [ ] `?toss=1&mockAds=1` 브라우저 플로우 유지

---

## 6. Do not do yet (운영자 Console 작업·주의)

레포 구현은 완료. 아래는 **운영자 계정/실기기**에서만 가능하거나, 정책상 금지.

1. Play Console 프로덕션 제출·내부 테스트 AAB 업로드 (JDK/Android SDK + 계정 필요)
2. `scripts/create_upload_keystore.sh` 실행 후 키스토어 오프라인 백업
3. 운영 AdMob 유닛으로 로컬 실클릭 테스트
4. privacy/terms 호스팅 배포 (레포 초안은 반영됨)
5. TWA를 Capacitor 대신 채택

---

## 7. Decisions (확정)

1. **`applicationId`:** `com.nolsoopgames.abysspet`
2. **GRAC:** Android 플랫폼 재사용/재신청 — Phase 0에서 위원회·서류 확인 중 (미완)
3. **1차 Play 출시 범위:** (A) empty-ads 내부 테스트 → AdMob
4. **privacy/terms:** 동일 URL 개정 (`privacy.html` / `terms-of-service.html`)
5. **`android/` 커밋 + 시작 시점:** AIT 내부 검수 통과 후 Phase 1, `android/`는 리포에 커밋

---

## 8. Reference map (현재 레포)

| 문서/파일 | Play 관련성 |
|-----------|-------------|
| `package.json` | `build:play` / Capacitor·AdMob deps |
| `capacitor.config.json` | appId `com.nolsoopgames.abysspet`, webDir `dist` |
| `android/` | Capacitor Android 프로젝트 |
| `js/platformEnv.js` · `js/ads.js` · `js/adsAdMob.js` · `js/adsToss.js` · `js/adsEmpty.js` · `js/playNative.js` | 어댑터 |
| `docs/MONETIZATION.md` | AdMob에도 동일 정책 |
| `docs/ADMOB-PLAY.md` · `docs/CAPACITOR-ANDROID.md` · `docs/GOOGLE-PLAY-STORE-LISTING.md` | Play 운영 |
| `assets/play-store/` · `scripts/build_play_store_assets.py` | Play 에셋 |
| `privacy.html` / `terms-of-service.html` | 채널·AdMob 문구 |

---

## 9. Summary for implementers (later)

출시 순서 한 줄:

> **Phase 0 결정 → Phase 1 Capacitor empty-ads 셸 + 내부 테스트 → Phase 2 AdMob(동일 모네타이제이션 계약) → Phase 3 Play 에셋·정책·프로덕션.**

AIT와 Play는 **공유 코어 + 광고 어댑터 + 별도 applicationId + 별도 스토어 에셋**으로 병행한다.
