# Google Play Phase 0 — 계정·법무 체크리스트

레포 측 초안은 완료됨. Console·GRAC는 운영자 계정에서 확인한다.

## 확정값

| 항목 | 값 |
|------|-----|
| applicationId | `com.nolsoopgames.abysspet` |
| 표시명 | 어비스펫: 심해 가상 펫 |
| D-U-N-S | `696696303` (Kaffeine · 유효 2026-07-30 ~ 2027-07-29) |
| 문의 | contact@nolsoopgames.com |
| 개인정보 URL | https://abysspet.nolsoopgames.com/privacy.html |
| 이용약관 URL | https://abysspet.nolsoopgames.com/terms-of-service.html |

## Play Console 개발자 계정 — **조직(Organization) 유형**

계정 유형: 조직. 전화번호 인증은 아래 항목이 모두 승인된 뒤에야 활성화된다.

- [x] 개발자 이메일 주소 확인
- [x] **D-U-N-S 번호** — `696696303` (Kaffeine · 유효 2026-07-30 ~ 2027-07-29)
- [x] 결제 프로필(조직) — 법인명·주소가 D-U-N-S(**Kaffeine**) 레코드와 **정확히 일치**
- [x] 등록비 $25 결제
- [x] 조직 서류 업로드 — 사업자등록증(또는 고유번호증) 한국어 원본
- [x] 대표자/계정 소유자 신원 서류 — 정부 발행 신분증
- [x] 조직 웹사이트 인증 — `nolsoopgames.com` (Search Console 소유권 확인)
- [x] 개발자 이메일: 조직 도메인 주소 사용 (`contact@nolsoopgames.com`) (일반·개인 Gmail은 조직 계정에 부적합)
- [x] **연락처 전화번호 인증** (`+82 10…`, 앞 0 제외) → SMS 6자리 → **변경사항 저장**

조직 계정은 신규 개인 계정의 «비공개 테스터 12명 × 14일» 게이트가 **면제**된다.

## Play Console 앱 (운영자)

- [x] 앱 생성: 게임 / 무료 / 기본 언어 **영어** (추가 언어 예정) / 광고 포함 예정
- [x] 기본 스토어 등록정보 + 연락처 (기본 언어: 영어)
- [x] 개인정보처리방침 URL 등록

## GRAC (운영자)

- [x] 등급분류 완료 → **전체이용가**, 등급분류번호 제SC-OM-260731-001호 (2026-07-31)
- [x] 증명서 «플랫폼»란에 **Android(Google Play)** 포함 · 재사용 OK (사용자 확인)
- [x] 플랫폼 추가/재신청 **불필요** (증명서에 Google Play 포함)
- [ ] Play Console IARC 콘텐츠 등급 설문에 GRAC 전체이용가 결과 반영

## 레포 완료

- [x] applicationId·표시명·문의 메일 확정
- [x] `privacy.html` / `terms-of-service.html` Play·AdMob 채널 문구
- [x] 호스팅에 privacy/terms 배포 (Console URL과 동기화)
