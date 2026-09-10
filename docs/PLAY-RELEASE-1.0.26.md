# Play 업로드 팩 — 1.0.26 (versionCode 30)

운영자용. 코드 반영이 아니라 **스토어에 올리는 것**만 정리한다.

## 왜 이 버전인가

스토어에 있는 것으로 보이는 **1.0.25 (versionCode 29)** 는 보호 보상 광고(R4)만 있다.

워킹 트리 **1.0.26** 이 Play 수익화 본편이다.

| | 1.0.25 (추정 스토어) | 1.0.26 (이번 AAB) |
|--|----------------------|-------------------|
| R4 8시간 보호 | 일반 보상형 | **리워드 인터스티셜** |
| T1 사망 → 새 이름 | 없음 | 전면, 이름 모달 앞 |
| T3 졸업 → 새 알 | 없음 | 전면, 이름 모달 앞 |
| 미디에이션 | Google만 | 어댑터: Meta · Unity · Pangle (콘솔 그룹은 별도) |

디스크의 옛 `app-release.aab`(9월 6일 13:44)는 1.0.25 커밋보다 이전이다. **그 파일은 올리지 말 것.**

## 바이너리 (레포가 만듦)

| 항목 | 값 |
|------|-----|
| 패키지 | `com.nolsoopgames.abysspet` |
| versionName | `1.0.26` |
| versionCode | `30` (같은 번호 재업로드 불가) |
| AAB | `android/app/build/outputs/bundle/release/app-release.aab` |
| 매핑 | `android/app/build/outputs/mapping/release/mapping.txt` |
| 빌드 | `npm run build:play` 후 `cd android && ./gradlew bundleRelease` |
| AdMob | `.env.play` 운영 유닛 (샘플/`VITE_ADMOB_FORCE_TEST=1` 금지) |

Play Console → 테스트 및 출시 → **내부 테스트**(또는 프로덕션) → 새 버전 → AAB 업로드 → 같은 빌드의 `mapping.txt` 를 디옵시파일로 첨부.

## 스토어 등록정보

붙여넣기 원문: [GOOGLE-PLAY-STORE-LISTING.md](./GOOGLE-PLAY-STORE-LISTING.md)

**하지 말 것:** AIT/웹 문구의 «광고 보고 부활» «올케어». Play에는 그 버튼이 없다.

그래픽 (`assets/play-store/`):

| 파일 | Console |
|------|---------|
| `icon-512.png` | 고해상도 아이콘 |
| `feature-graphic-1024x500.png` | 그래픽 이미지 |
| `screenshot-phone-01-main.png` | 폰 1 — 보호 버튼 |
| `screenshot-phone-02-evolution.png` | 폰 2 — 성체 |
| `screenshot-phone-03-encyclopedia.png` | 폰 3 — 탐사 일지 |
| `screenshot-phone-04-gameover.png` | 폰 4 — 이별 (부활 버튼 없음) |

재생성: `npm run build:play-store-assets` (`?play=1` 캡처).

## 앱 콘텐츠 설문 (이번 빌드 기준)

### 광고

- 앱에 광고가 포함됨: **예**
- 광고 SDK: Google AdMob (전면, 리워드 인터스티셜). 미디에이션 어댑터: Meta Audience Network, Unity Ads, Pangle

### 데이터 보안

앱이 사용자 데이터를 수집·공유하는가: **예** (SDK. 펫·도감은 기기 localStorage만)

| 데이터 유형 | 수집 | 공유 | 목적 |
|-------------|------|------|------|
| 기기 또는 기타 ID (광고 ID) | 예 | 예 (AdMob·미디에이션) | 광고·마케팅 |
| 앱 상호작용 | 예 | 예 (Firebase Analytics) | 분석 |
| 비정상 종료 로그 | 예 | 예 (Firebase Crashlytics) | 앱 기능·분석 |
| 진단 | 예 | 예 (Firebase) | 앱 기능·분석 |

공통:

- 전송 중 암호화: **예**
- 사용자가 삭제 요청 가능: 게임 세이브는 앱 데이터 삭제로 지워짐. 광고 ID는 기기 설정에서 재설정. Analytics/Crashlytics는 운영자 서버에 펫 데이터가 없음 → 문의 `contact@nolsoopgames.com`
- 필수 / 선택: 광고·분석 SDK는 앱 기능의 일부 (계정 로그인 없음)
- 판매: **아니요**

### 개인정보 처리방침

Console URL: https://abysspet.nolsoopgames.com/privacy.html  
소스: 루트 [`privacy.html`](../privacy.html) — 문구 바꾼 뒤에는 Pages 배포가 반영된 다음에 제출.

## AdMob 콘솔 (AAB와 별개, 매출에 필요)

코드에 어댑터만 넣고 콘솔 그룹이 없으면 Google 입찰만 동작한다. [ADMOB-PLAY.md](./ADMOB-PLAY.md)

- [ ] Play 앱 ↔ AdMob 앱 연결
- [ ] 전면 + 리워드 인터스티셜 입찰 그룹 (Meta/Unity/Pangle)
- [ ] `app-ads.txt` 파트너 줄 (`https://nolsoopgames.com/app-ads.txt`)
- [ ] 운영 유닛으로 로컬 클릭 테스트 하지 말 것

## 올리지 않는 것

- `android/.idea/`
- `build:play:empty-ads` / `build:play:test-ads` 산출물
- AIT 스토어 캡처(`assets/ait-store/screenshot-portrait-04-gameover.png` 등 — 부활 버튼)
- 인앱 결제 상품 (없음)
