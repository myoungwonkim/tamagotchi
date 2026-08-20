# 웹 게임 광고 (AdSense H5)

정책(T1–T4 / R1–R3)은 [`MONETIZATION.md`](./MONETIZATION.md)와 동일.  
구현: `js/adsWeb.js` · façade `js/ads.js` · [Google Ad Placement API](https://developers.google.com/ad-placement).

## 플랫폼

| 환경 | Provider |
|------|----------|
| 웹 (`abysspet.nolsoopgames.com`) | `adsWeb.js` (AdSense H5) |
| Play APK | `adsAdMob.js` |
| 앱인토스 | `adsToss.js` |

## 설정 (`index.html` meta)

```html
<meta name="web-adsense-client" content="ca-pub-4999376453226791">
<meta name="web-ads-test" content="auto">
```

| meta | 값 | 설명 |
|------|-----|------|
| `web-adsense-client` | `ca-pub-…` | AdSense 게시자 ID. 비우면 웹 광고 비활성(`adsEmpty`) |
| `web-ads-test` | `auto` / `on` / `off` | `auto`: localhost·`*.pages.dev`에서만 테스트 광고 |
| `web-ads` | `0` | 명시적 비활성 |

`ads.txt`는 [`assemble_web_game.sh`](../scripts/assemble_web_game.sh)가 **게임 호스트** 루트에 복사합니다.  
**판매자 인증에 쓰는 파일은 apex 루트** `https://nolsoopgames.com/ads.txt` · `/app-ads.txt` 입니다
(`scripts/assemble_apex_site.sh`). 서브도메인 파일만으로는 루트 인증을 대체하지 못합니다.

라이브 확인:

```bash
bash scripts/verify-apex-deploy.sh --live
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://nolsoopgames.com/ads.txt
# expect: 200 text/plain
```

## GA4 · Consent Mode v2

| 속성 | 대상 |
|------|------|
| `G-VZ2DXER02Y` | `apex/` 랜딩 + 어비스펫 웹 (`js/gaConsent.js`) |
| `G-ZZE20NFCE9` | 사주만세력만 (이 레포에 넣지 말 것) |

Consent Mode는 gtag 로드 **전에** 기본값을 넣습니다. EEA는 deny, KR/JP 등은 grant.  
자세한 구현: [`js/gaConsent.js`](../js/gaConsent.js).

## AdSense 콘솔 (1회)

1. [AdSense](https://adsense.google.com) → 사이트 추가: `abysspet.nolsoopgames.com`
2. **H5 Games Ads** / Ad Placement API 사용 승인 (베타·지역별 상이)
3. `https://abysspet.nolsoopgames.com/ads.txt` 접근 확인

루트 `nolsoopgames.com`을 사이트로 넣으면 심사 봇은 **서브도메인이 아니라 루트 홈**을 봅니다.
카드만 있는 빈 랜딩은 «가치가 별로 없는 콘텐츠»로 거절됩니다. 본문은 `apex/index.html`·`about.html`·`privacy.html`·`terms.html`에 두고, **소개 페이지에는 AdSense 코드를 넣지 않습니다.**
라이브에 본문이 반영된 뒤에만 콘솔에서 «검토 요청»을 누릅니다.

## 배포

```bash
git push origin main   # Cloudflare Pages 자동 빌드
```

로컬 확인:

```bash
bash scripts/assemble_web_game.sh _site_game
python3 -m http.server 8080 -d _site_game
# http://localhost:8080/?mockAds=1  → UI만 (Toss mock)
# meta client 설정 시 → AdSense 테스트 광고 (data-adbreak-test)
```

## 프로덕션 전

- `web-ads-test` → `off` (또는 `auto` 유지 시 `pages.dev`만 테스트)
- AdSense 승인·ads.txt 검증 완료 후 실광고

## 웹 API 제약

- **전면(T2/T4)**: 타이머 트리거는 사용자 클릭이 아니라 fill이 안 될 수 있음. T1/T3(버튼 후)는 정상.
- **보상(R1–R3)**: «광고 보고 …» 버튼 클릭 → `adBreak({ type: 'reward' })`.

## Vite dev (선택)

`.env.web` (gitignored):

```
VITE_WEB_ADSENSE_CLIENT=ca-pub-4999376453226791
```
