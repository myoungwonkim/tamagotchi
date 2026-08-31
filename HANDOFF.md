# 인계 문서 — nolsoopgames.com 도메인 전체

작성 2026-08-19, 갱신 2026-08-20. **이 문서는 다음 작업자(사람 또는 AI)를 위한 것이다.**
작업은 여러 PC와 여러 저장소에 흩어져 있고, 저장소 하나만 봐서는 전체가 안 보인다.

---

## 0. 진행 중 — 어비스펫 Play 앱 깨짐 (2026-08-20, 미완)

**증상**: 안드로이드 앱 설치 후 첫 화면이 JS 미실행 정적 HTML로 뜬다 —
펫 이름 "치치"(HTML 기본값), 알 스프라이트 없음, 이름 짓기 모달 없음, 수조가 밝은 하늘색.

**진단 (완료, 확정)**:
- 원인은 08-19 웹 커밋이 아니다. 앱은 Capacitor로 빌드 시점의 `dist/`를 APK에
  내장하며 원격 로드가 없다. 웹 전 경로(abysspet.nolsoopgames.com,
  nolsoopgames.com/abysspet/)는 정상 확인됨 (콘솔 에러 0).
- 설치된 APK의 번들은 **07-18 이전 상태의 스테일 dist**다. 근거: JS가 죽으면
  현재 CSS에서는 보상 광고 버튼 2개가 노출되는데(07-18 CTA 리스타일부터),
  스크린샷에는 없다. 안드로이드 트랙은 07-31 생성 → 빌드 시 `npm run build:play`를
  건너뛰어 그 PC의 옛 dist가 들어간 것. 상세는 2-6 참조.

**조치 완료 (커밋 9b6971d, push됨)**:
- `js/main.js` 부팅 방어 — `initPlayNative()`/`initAds()` 실패가 게임 부팅을 못 막게
  개별 try/catch, `init()` 실패 시 부트 에러 오버레이 표시 (기존엔 조용히 정적 화면).
- 이 문서 2-6에 함정 기록.

**추가 발견·조치 (2026-08-20 오후, 커밋 397291a, push됨) — 보상형 광고 버튼**:
- "버튼 눌러도 광고 안 뜸" 신고. 원인 3가지 전부 수정:
  1. **유령 버튼**: 07-18 CTA 리스타일의 `display:flex`가 `[hidden]{display:none}`을
     이겨서, 조건 미달(새 펫: 최저 스탯 60 ≥ 임계 40)이어도 올케어·건강 회복·부활
     버튼이 항상 보였다. 눌러도 핸들러가 조건 검사에서 조용히 반환.
     → `css/style.css`에 `[hidden]` 복원 규칙 추가.
  2. 광고 로드 실패·중도 이탈이 전부 무음이었다 → `showRewarded*`가
     `{shown, rewarded}`를 반환하고 `main.js`가 실패 사유별 메시지 표시.
  3. 웹 한정: Ad Placement API 비활성 시 adBreak 콜백이 하나도 안 와서 무한 대기
     → `adsWeb.js`에 6초 start-aware 타임아웃.
- 검증됨: localhost 테스트 모드에서 새 펫은 버튼 숨김, 포만감<40이면 노출,
  클릭 시 실제 H5 테스트 보상형 광고 표시까지 확인.
- 웹은 push로 자동 배포됨. **앱은 아래 재빌드를 해야 반영된다.**

**다음 작업자가 할 일 (Android SDK 있는 PC에서 — 이 진단을 한 PC(bahamoth)에는 SDK/Java 없음)**:
1. `git pull`
2. `npm run build:play` (vite build + 정적 복사 + `cap sync android`까지 수행)
3. 검증: `grep -c bootstrapAnalytics android/app/src/main/assets/public/index.html` → 1 이상
4. Android Studio(또는 gradle)로 재빌드, 기기의 기존 앱 **삭제 후** 설치
5. 첫 화면 확인: "펫 이름 짓기" 모달 + 알 스프라이트가 떠야 한다.
   보상 광고 버튼은 **새 펫에서는 안 보여야 정상** (스탯이 임계 40 미만으로
   떨어지면 나타난다).
6. 광고 확인: 스탯을 떨어뜨려 버튼 노출 후 탭 → 광고가 뜨거나, 못 불러오면
   "지금은 광고를 불러올 수 없어요" 메시지가 떠야 한다 (무반응이면 버그).
   기본은 Google 샘플(테스트) 유닛이고, `.env.play`에 프로덕션 `VITE_ADMOB_*`를
   쓰면 신규 유닛은 며칠간 no-fill일 수 있다 — 메시지가 뜨면 코드가 아니라 서빙 문제다.
7. 그래도 깨지면: USB 디버깅 + 데스크톱 크롬 `chrome://inspect`로 웹뷰 콘솔 확인
   (부팅 방어 코드 덕에 원인이 콘솔과 화면에 찍힌다). 결과를 이 섹션에 갱신할 것.

---

## 1. 제품 지도

| 제품 | 주소 | 저장소 | 스택 |
|---|---|---|---|
| Nolsoop 랜딩 | `nolsoopgames.com` | `tamagotchi` → `home/index.html` | 정적 HTML 1장, 3개 언어 |
| 어비스펫 (게임) | `nolsoopgames.com/abysspet/` | `tamagotchi` 루트 | 바닐라 JS |
| 어비스펫 (독립 호스트) | `abysspet.nolsoopgames.com` | `tamagotchi` | Cloudflare Pages |
| 사주만세력 (웹) | `bazi.nolsoopgames.com` | `bazi-web` | React 18 + Vite, 프리렌더 |
| 사주만세력 (앱) | Play `com.nolsoopgames.bazi` | **별도 저장소, 다른 PC** | Android WebView |
| 팔린아파트 | `apartments.nolsoopgames.com` | `inaptos` | React + Vite |

**Play 앱 저장소는 이 문서 작성 시점에 접근할 수 없었다.** 웹이 앱에 제공하는 접점만
`bazi-web/README.md`에 기록돼 있다. 앱 코드를 손대야 하면 먼저 저장소 위치를 확인할 것.

---

## 2. 함정 — 반드시 읽을 것

### 2-1. GitHub Pages는 복사한 것만 배포한다

`tamagotchi/.github/workflows/pages.yml`이 `_site/`를 조립한다. **저장소에 파일을 두는
것만으로는 라이브에 뜨지 않는다.** 복사 목록에 없으면 404다.

이 함정으로 실제로 잃은 것:
- `ads.txt` — 커밋 후 몇 주간 404. 애드센스 판매자 인증이 그동안 없었다.
- `app-ads.txt` — 동일
- 파비콘 4개, `manifest.webmanifest` — 참조는 있고 파일은 404

새 정적 파일을 추가하면 **워크플로 복사 목록에도 넣어야 한다.**

푸시 전 로컬 검증:

```bash
cd ~/Desktop/Claude/tamagotchi
python3 - <<'EOF' > /tmp/build.sh
s = open(".github/workflows/pages.yml").read()
blk = s.split("run: |\n",1)[1].split("\n      - uses:")[0]
print("\n".join(l[10:] if l.startswith(" "*10) else l for l in blk.split("\n")))
EOF
bash /tmp/build.sh && cd _site && python3 -m http.server 4180
```

`set -euo pipefail`이 걸려 있어 `mkdir` 없는 `cp -R`은 배포 전체를 실패시킨다.
실제로 이 방법으로 `_site/assets` 누락을 잡았다.

### 2-2. 배포 확인은 상태 코드로 하면 안 된다

GitHub Pages와 Cloudflare Pages 모두 **없는 경로에 404 HTML을 200으로 돌려준다**
(SPA 폴백). 상태 코드만 보면 파일이 없어도 정상으로 보인다.

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://nolsoopgames.com/ads.txt
# 200 text/plain          ← 정상
# 200 text/html; ...      ← 파일 없음
```

### 2-3. 엣지 캐시

배포 직후 잠시 구버전이 보인다. `?cb=$RANDOM`으로 우회 확인한다.
`sitemap.xml`은 `max-age=3600`이라 특히 늦다.

### 2-4. workflow 스코프

이 PC의 GitHub 토큰에 `workflow` 스코프가 없다. `.github/workflows/*` 수정은
push가 거부된다. GitHub 웹 편집기(`/edit/main/...`)로 우회하거나 PAT를 재발급할 것.

### 2-5. 사주 계산기 링크는 언어별 주소를 써야 한다

루트 `bazi.nolsoopgames.com/`는 **영어 페이지**다. 한국어는 `/ko/`, 일본어는 `/ja/`.
루트를 걸면 SNS 미리보기 카드가 영어로 뜬다. 이 실수를 두 번 했다.

### 2-6. 어비스펫 Play 앱은 웹 배포로 안 바뀐다 — 스테일 dist 함정

어비스펫 안드로이드 앱(Capacitor, `com.nolsoopgames.abysspet`)은 **빌드 시점의
`dist/`를 APK 안에 내장**한다. 원격 로드가 없으므로 웹을 배포해도 앱 화면은 안 바뀐다.
(bazi 앱과 반대다 — 아래 2-7 참조.)

따라서 APK를 빌드하기 전 **반드시 `npm run build:play`를 다시 실행**해야 한다.
이 명령이 `vite build` + 정적 복사 + `cap sync android`를 전부 수행한다.
이걸 건너뛰고 Android Studio에서 바로 빌드하면 **그 PC에 남아 있던 옛/불완전한
dist가 그대로 APK에 들어간다.**

증상: 앱이 JS가 전혀 실행되지 않은 정적 HTML만 표시 — 펫 이름이 기본값 "치치",
알 스프라이트 없음, 이름 짓기 모달 없음, 수조가 밝은 하늘색. 2026-08-20에 실제로
이 증상의 APK가 설치됐고, 번들 CSS가 07-18 이전 상태였다 (스테일 dist 확정).

빌드 검증: 설치 전에 `android/app/src/main/assets/public/index.html`에
`bootstrapAnalytics` 문자열이 있는지 확인 (08-19 이후 소스라는 뜻).
기기에서 확인: USB 디버깅 + 데스크톱 크롬 `chrome://inspect`로 웹뷰 콘솔을 본다.

### 2-7. bazi Play 앱과 웹의 계약

앱은 WebView라 **웹을 배포하면 앱 화면이 즉시 바뀐다. 스토어 심사를 안 거친다.**
계약은 클래스명과 엘리먼트 ID뿐이고 **테스트가 없다.** 이름을 바꾸면 조용히 깨진다.

| 접점 | 뜻 |
|---|---|
| `html.bazi-play` | 앱 WebView 표시 → 연운·월운 잠김 |
| `html.bazi-extra-on` | 리워드 광고 시청 완료 → 해제 |
| `#bazi-extra` | 잠기는 영역 |
| `#bazi-reward-gate` | 잠금 안내 + 광고 버튼 |
| `#bazi-reward-fail` | 광고 로드 실패 메시지 |
| `window.BaziNative.requestRewardedExtra()` | 광고 요청 브리지 |

**웹 브라우저에서는 아무것도 잠기지 않는다.** 앱에서만 잠긴다.

### 2-8. CSS `display`는 `hidden` 속성을 이긴다

이 게임은 요소를 `el.hidden = true`로 숨긴다. 그런데 그 요소에 CSS로
`display: flex` 등을 주면 **UA의 `[hidden]{display:none}`을 author 스타일이
이겨서 숨김이 무력화된다.** 07-18 CTA 리스타일이 이걸로 보상 광고 버튼 3개를
한 달 넘게 항상 노출시켰다 (08-20 발견·수정, 397291a).

새 컴포넌트에 `display`를 줄 때는 반드시 짝으로
`.foo[hidden] { display: none; }`을 함께 추가할 것. 기존 예: `css/style.css`의
`.reward-prompts[hidden]`, `.new-pet-fab[hidden]`, `.overlay[hidden]`.

---

## 3. 광고 · 분석

| | 웹 (AdSense) | Play 앱 (AdMob) |
|---|---|---|
| 퍼블리셔 | `ca-pub-4999376453226791` | 동일 |
| 인증 파일 | `nolsoopgames.com/ads.txt` | `nolsoopgames.com/app-ads.txt` |
| 분석 | GA4 | Firebase Analytics + Crashlytics |

**인증 파일은 루트 도메인에만 두어야 유효하다.** 서브도메인 파일로 대체되지 않는다.

GA4 속성이 둘 있다. 헷갈리지 말 것.

| 속성 | 대상 |
|---|---|
| `G-4HJZRPTNN2` | 루트 랜딩 + 어비스펫 |
| `G-ZZE20NFCE9` | 사주만세력 (`bazi-web`) |

앱 안에서는 웹 AdSense와 gtag 요청을 앱이 차단하고 네이티브 AdMob을 띄운다.
**그래서 앱 트래픽은 GA4에 안 잡힌다.** Firebase로 따로 본다.

프라이버시 정책은 웹과 앱을 모두 고지한다 (`tamagotchi/privacy.html`,
`bazi-web/public/privacy.html`). **수집 항목을 바꾸면 정책도 3개 언어 전부 고칠 것.**
과거에 "쿠키를 쓰지 않는 분석"이라고 적힌 상태에서 GA4를 붙여 정책이 거짓이 된 적이 있다.

---

## 4. 사주만세력 (`bazi-web`) 요점

엔진을 엑셀에서 1:1 이식했다. **기준일은 1949-10-01 = 甲子.** 영어권에 퍼진
1984-02-02 기준일은 **이틀 틀렸다.** 이것이 이 제품의 핵심 차별점이므로 건드리지 말 것.

- 자시는 23:00에 전환된다 (자정 아님)
- 연주는 입춘(2월 4일 근사) 기준
- 진태양시 보정 = (경도 − 표준자오선) × 4분, 서머타임이면 −60분

`npm test`가 John/Hana 기준값 12개를 고정한다. **엔진을 만지면 반드시 통과시킬 것.**

해설 톤은 **직설**이다. 사탕발림 금지, 약점을 장점으로 재포장 금지.
특성 → 대가 → 대응 순서로 쓴다. 자세한 규칙은 `bazi-web/README.md`.

아티클은 **번역하지 않는다.** 언어권마다 검색 의도가 다르다.
EN 21편 / KO 8편 / JA 8편이 각각 따로 쓰였고, 그래서 **아티클 간 hreflang을 걸지 않는다.**

---

## 5. 최근 작업 (2026-08-14 ~ 08-20)

**2026-08-20 — 어비스펫 Play 앱 (섹션 0 참조)**
- 앱 정적 화면 증상 진단: 스테일 dist가 APK에 내장된 것. 웹 커밋과 무관 확인
- `js/main.js` 부팅 방어 코드 + 부트 에러 표시 (9b6971d)
- 웹 전 경로 정상 동작 재확인 (데스크톱/모바일 크기, 콘솔 에러 0)
- 보상형 광고 버튼 3중 수정: 유령 버튼(CSS가 hidden 무력화, 2-8 함정),
  실패 무음 → 사용자 메시지, 웹 adBreak 무한 대기 → 6초 타임아웃 (397291a)

**SEO**
- 3개 언어 metaTitle/metaDesc 키워드 최적화 (무료 사주·운세·신년 운세 / 四柱推命 無料 / Chinese birth chart)
- KO 8편 + JA 8편 + EN 3편 아티클 신규. 사이트맵 24 → 45 URL
- 아티클 `<title>`을 60자 이내 `seoTitle`로 분리 (기존 86~94자, 구글이 잘랐다)
- 영어 사이트에 "Chinese"가 0회였던 것을 수정

**버그**
- 년 `11980`·시 `111`이 입력되던 문제 — `type="number"`는 min/max로 타이핑을 막지 않는다
- 언어 전환 시 출생 국가가 이전 언어 기본값으로 남아 진태양시 보정이 24분 틀어졌다
- 모바일 360px에서 폼이 2열로 무너져 버튼이 화면 밖으로 나갔다 (`minmax(92px)`는 3열에 300px 필요)
- 입력 상태를 클로저에서 읽어 연속 입력 시 값이 유실됐다

**인프라**
- GA4 45개 페이지 전체 배선, 프라이버시 정책 3개 언어 정정
- 파비콘 실제 파일화 (데이터 URI는 구글 검색 결과에 안 쓰인다)
- 언어별 OG 카드 1200×630
- 루트 도메인 자동 이동 제거 → 3개 언어 랜딩 페이지
- `ads.txt`·`app-ads.txt`·파비콘 배포 복구

**마케팅**
- `bazi-web/marketing/threads.md` — Threads 게시물 15편 + 앱용 3편. 500자 제한 검증됨

---

## 6. 남은 일

- [ ] **어비스펫 Play APK 재빌드·재설치 (섹션 0 — 최우선)**
- [ ] `nolsoopgames.com/robots.txt`·`sitemap.xml` 없음
- [ ] 애드센스 ads.txt 경고 해소 확인 (복구 후 재크롤링 대기)
- [ ] 신년 운세 아티클은 10월에 `updated` 갱신 + 해당 연도 내용 보강 (11월부터 검색 급증)
- [ ] Play 앱 저장소 위치 확인 후 이 문서에 반영
- [ ] 유럽 트래픽이 늘면 Consent Mode v2 (현재 EEA 방문자에게 GA가 동의 전 실행됨)

---

## 아이콘 두 세트 — 헷갈리지 말 것

| 경로 | 정체 | 쓰이는 곳 |
|---|---|---|
| `assets/brand-icon/` | **Nolsoop 브랜드 마크** (초록 `n`) | 루트 랜딩·게임 페이지의 파비콘, 랜딩 홈화면 아이콘 |
| `assets/app-icon/` | **어비스펫 게임 아이콘** (인어) | 게임의 PWA 매니페스트, 게임 apple-touch-icon, 스토어 등록 |

**브랜드 마크를 바꿀 때 `app-icon/`은 건드리지 않는다.** 게임의 스토어 아이덴티티다.
반대로 게임 아이콘을 바꿀 때 브랜드 파비콘도 같이 바꾸면 다른 제품 페이지가 어긋난다.

작은 크기(16·32·48)는 원본을 그대로 줄이지 않는다. 마크가 캔버스의 40%만 차지해서
16px에서 6px이 되어 안 보인다. 마크 중심 300×300으로 잘라 쓴다 (중심 268,256).
큰 크기(180·192·512)는 원본 여백을 유지한다.

파일을 교체하면 HTML의 `?v=brandicon-N` 쿼리를 올려야 브라우저가 새로 받는다.

## 7. 하지 말 것

- **개인 사주 PDF 리포트 자동 판매를 제안하지 말 것.** 명시적으로 거부됐다.
- **해석 콘텐츠에 클라우드/LLM API를 쓰지 말 것.** 로컬 규칙 기반으로만.
- **고객지원 문구에 회신 시간을 약속하지 말 것.**
- **판매/마케팅 카피에서 문장 중간에 줄바꿈(`<br>`)을 넣지 말 것.**
- **없는 데이터를 플레이스홀더로 꾸미지 말 것.** 없으면 없다고 쓴다.
- `~/Desktop/Claude/Notion/.notion_token`은 다른 제품과 공유된다. **절대 삭제·출력 금지.**
