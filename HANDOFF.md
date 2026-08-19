# 인계 문서 — nolsoopgames.com 도메인 전체

작성 2026-08-19. **이 문서는 다음 작업자(사람 또는 AI)를 위한 것이다.**
작업은 여러 PC와 여러 저장소에 흩어져 있고, 저장소 하나만 봐서는 전체가 안 보인다.

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

### 2-6. Play 앱과 웹의 계약

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

## 5. 최근 작업 (2026-08-14 ~ 08-19)

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

- [ ] 루트 랜딩 파비콘을 새 `n` 로고로 교체 (이미지 파일 필요)
- [ ] `nolsoopgames.com/robots.txt`·`sitemap.xml` 없음
- [ ] 애드센스 ads.txt 경고 해소 확인 (복구 후 재크롤링 대기)
- [ ] 신년 운세 아티클은 10월에 `updated` 갱신 + 해당 연도 내용 보강 (11월부터 검색 급증)
- [ ] Play 앱 저장소 위치 확인 후 이 문서에 반영
- [ ] 유럽 트래픽이 늘면 Consent Mode v2 (현재 EEA 방문자에게 GA가 동의 전 실행됨)

---

## 7. 하지 말 것

- **개인 사주 PDF 리포트 자동 판매를 제안하지 말 것.** 명시적으로 거부됐다.
- **해석 콘텐츠에 클라우드/LLM API를 쓰지 말 것.** 로컬 규칙 기반으로만.
- **고객지원 문구에 회신 시간을 약속하지 말 것.**
- **판매/마케팅 카피에서 문장 중간에 줄바꿈(`<br>`)을 넣지 말 것.**
- **없는 데이터를 플레이스홀더로 꾸미지 말 것.** 없으면 없다고 쓴다.
- `~/Desktop/Claude/Notion/.notion_token`은 다른 제품과 공유된다. **절대 삭제·출력 금지.**
