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

`ads.txt`는 [`assemble_web_game.sh`](../scripts/assemble_web_game.sh)가 사이트 루트에 복사합니다.

## AdSense 콘솔 (1회)

1. [AdSense](https://adsense.google.com) → 사이트 추가: `abysspet.nolsoopgames.com`
2. **H5 Games Ads** / Ad Placement API 사용 승인 (베타·지역별 상이)
3. `https://abysspet.nolsoopgames.com/ads.txt` 접근 확인

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
