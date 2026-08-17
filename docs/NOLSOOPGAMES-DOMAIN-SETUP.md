# 도메인 · 웹 게임 분리 배포

Play 앱(`com.nolsoopgames.abysspet`)은 Capacitor 로컬 `dist`를 씁니다. **AAB 재빌드 없음.**  
웹 게임은 **별도 호스트**입니다.

| 항목 | URL |
|------|-----|
| 웹 게임 | https://abysspet.nolsoopgames.com/ |
| 개인정보 (Play 정책 URL) | https://abysspet.nolsoopgames.com/privacy.html |
| 이용약관 | https://abysspet.nolsoopgames.com/terms-of-service.html |
| 스튜디오 apex | https://nolsoopgames.com/ → 웹 게임으로 리디렉트 |
| 구 경로 | https://nolsoopgames.com/abysspet/ → 웹 게임으로 리디렉트 |
| ads.txt (apex 유지) | https://nolsoopgames.com/ads.txt · `/app-ads.txt` |
| Notion | https://nolsoopgames.com/notion/ |

다른 서브도메인(건드리지 말 것):

| 호스트 | 호스팅 |
|--------|--------|
| `bazi.nolsoopgames.com` | Cloudflare Pages (`bazi-8le.pages.dev`) |
| `apartments.nolsoopgames.com` | Cloudflare Pages (`apartments-4vu.pages.dev`) |

---

## 구조

- **소스는 루트 유지:** `index.html`, `css/`, `js/`, `assets/`
- **GitHub Pages (apex `nolsoopgames.com`):** [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) — `CNAME`은 `nolsoopgames.com` 유지. ads.txt · notion · 구 URL 리디렉트.
- **Cloudflare Pages (웹 게임):** [`scripts/assemble_web_game.sh`](../scripts/assemble_web_game.sh) → `_site_game/` 루트. [`wrangler.toml`](../wrangler.toml) 프로젝트명 `abysspet`.

GitHub Pages는 커스텀 도메인 1개라, 서브도메인 게임은 bazi/apartments와 같이 **별도 Pages 프로젝트**입니다.

---

## 1회 설정 — Cloudflare Pages (bazi와 동일)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → Pages 프로젝트 이름 `abysspet` (이 저장소 연결 가능).
2. 빌드: `bash scripts/assemble_web_game.sh _site_game` · 출력 디렉터리 `_site_game`.
3. 또는 GitHub 시크릿 `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` → [`.github/workflows/cloudflare-web-game.yml`](../.github/workflows/cloudflare-web-game.yml)이 `wrangler pages deploy` 실행.
4. Pages 프로젝트 **Custom domain:** `abysspet.nolsoopgames.com`.

## DNS (가비아 / hosting.co.kr)

`bazi` / `apartments` / apex A 레코드는 **수정하지 않음.** 추가만:

| 타입 | 호스트 | 값 |
|------|--------|-----|
| CNAME | `abysspet` | Cloudflare가 안내하는 `abysspet.pages.dev` 또는 `abysspet-xxxx.pages.dev` |

회색 구름(DNS only)으로 인증서 발급 후 프록시 가능.

```bash
dig +short abysspet.nolsoopgames.com CNAME
# 브라우저: https://abysspet.nolsoopgames.com/privacy.html
```

## Play Console (앱 업로드 없음)

1. 위 privacy URL이 200인지 확인.
2. **앱 콘텐츠 → 개인정보처리방침** (약관을 넣었다면 그쪽도)을  
   `https://abysspet.nolsoopgames.com/privacy.html`  
   `https://abysspet.nolsoopgames.com/terms-of-service.html`  
   로 저장.
3. 개발자 웹사이트는 `https://nolsoopgames.com` 유지 (Search Console·ads.txt).

앱인토스 콘솔 개인정보 URL도 웹을 쓰면 같은 privacy URL로 맞출 것.

문의: contact@nolsoopgames.com
