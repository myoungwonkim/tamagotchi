# nolsoopgames.com 도메인 · /abysspet/ 배포 가이드

`nolsoopgames.com`을 스튜디오 도메인으로 쓰고, 어비스펫 게임은 **`/abysspet/` 하위 경로**로 서빙합니다.
게임 소스는 저장소 루트에 그대로 두고(스프라이트·빌드 스크립트 유지), 배포 시점에만
GitHub Actions가 `/abysspet/` 경로를 조립합니다.

연결 후 최종 URL:

| 항목 | URL |
|------|-----|
| 게임 | https://nolsoopgames.com/abysspet/ |
| 개인정보 처리방침 (검수 제출용) | https://nolsoopgames.com/abysspet/privacy.html |
| 이용약관 | https://nolsoopgames.com/abysspet/terms-of-service.html |
| 루트 | https://nolsoopgames.com/ → `/abysspet/`로 리디렉트 (추후 스튜디오 랜딩으로 교체 가능) |

> `nolsoopgames.com/privacy.html`, `myoungwonkim.github.io/tamagotchi/...`, 기존 `docs/privacy.html`
> 링크는 모두 `/abysspet/...`로 자동 리디렉트됩니다.

---

## 구조 개요

- **소스는 루트 유지:** `index.html`, `css/`, `js/`, `assets/` 는 이동하지 않음 → 스프라이트 생성·AiT 빌드 스크립트 그대로 동작.
- **배포는 Actions가 조립:** `.github/workflows/pages.yml` 이 push마다 아래를 만들어 Pages에 올림.
  - `_site/abysspet/` ← `index.html` + `css/` + `js/` + `assets/sprites` (+ `assets/ait-store`) + `privacy.html` + `terms-of-service.html`
  - `_site/CNAME`, `_site/.nojekyll`
  - `_site/index.html`, `_site/privacy.html`, `_site/terms-of-service.html` ← `/abysspet/...`로 리디렉트
- 게임 내부 경로는 전부 상대경로라 `/abysspet/` 아래에서 그대로 동작합니다.

---

## 1단계 — Pages Source를 "GitHub Actions"로 변경 (1회)

1. GitHub 저장소 → **Settings → Pages**
2. **Build and deployment → Source:** `GitHub Actions` 선택
   - 기존 "Deploy from a branch"에서 바꾸는 것입니다.
3. `main`에 push하면 `Deploy game to GitHub Pages (/abysspet/)` 워크플로가 자동 실행됩니다.
   - **Actions** 탭에서 성공(초록 체크) 확인.

---

## 2단계 — 커스텀 도메인 등록

1. **Settings → Pages → Custom domain** 에 `nolsoopgames.com` 입력 → **Save**
   - 워크플로가 아티팩트에 `CNAME`을 포함하므로 도메인 값이 유지됩니다.

---

## 3단계 — 도메인 등록업체(레지스트라) DNS 설정

`nolsoopgames.com` 구매처(가비아·Cloudflare·GoDaddy·Namecheap 등)의 DNS 관리 화면에서:

### (a) 루트 도메인 `nolsoopgames.com` — A 레코드 4개

호스트/이름 `@`(또는 공란), 타입 `A`:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

> IPv6도 원하면 같은 값들의 AAAA 레코드 추가(선택):
> `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`

### (b) `www.nolsoopgames.com` — CNAME (권장)

| 타입 | 호스트/이름 | 값 |
|------|-------------|-----|
| CNAME | `www` | `myoungwonkim.github.io.` |

> 기존 파킹/포워딩 레코드가 루트(@)에 있으면 **삭제**하세요.

### Cloudflare 사용 시

- A 레코드는 초기 연결 동안 **"DNS only"(회색 구름)** 로 두세요(프록시 켜면 인증서 발급 실패 가능).
- SSL/TLS 모드는 **Full** 이상.

---

## 4단계 — 확인 및 HTTPS 강제

```bash
dig +short nolsoopgames.com          # 185.199.108.153 등 4개
dig +short www.nolsoopgames.com      # myoungwonkim.github.io.
```

1. **Settings → Pages** 에서 "DNS check successful" 확인.
2. **Enforce HTTPS** 체크(인증서 발급 후 활성화됨).
3. 브라우저 확인:
   - https://nolsoopgames.com/abysspet/ → 게임
   - https://nolsoopgames.com/abysspet/privacy.html → 개인정보 처리방침
   - https://nolsoopgames.com/abysspet/terms-of-service.html → 이용약관
   - https://nolsoopgames.com/ , /privacy.html → `/abysspet/...`로 리디렉트

---

## 5단계 — 검수/콘솔 반영 확인

문서에는 이미 새 URL이 반영되어 있습니다:

- App-in-Toss 콘솔 개인정보 URL: `https://nolsoopgames.com/abysspet/privacy.html`
- GRAC 제출 문서(`01-game-description.md`)의 개인정보 URL
- `granite.config.ts` 아이콘 URL: `https://nolsoopgames.com/abysspet/assets/ait-store/app-logo-light.png`

---

## 트러블슈팅

| 증상 | 원인/해결 |
|------|-----------|
| Actions 실패 | Actions 탭 로그 확인. Source가 "GitHub Actions"인지 재확인 |
| 도메인 미연결 | DNS 전파 대기 또는 A 레코드 오타. `dig`로 확인 |
| HTTPS 체크박스 비활성 | 인증서 발급 대기(수십 분). 이후 다시 켜기 |
| `/abysspet/`는 되는데 스프라이트 404 | 워크플로가 `assets/sprites`를 복사하는지 확인 |
| 파킹 페이지가 대신 뜸 | 레지스트라 기본 포워딩/파킹 레코드 삭제 |

---

## 대안 — 게임을 루트에 두고 싶어지면

`_site` 조립을 `/abysspet/` 대신 루트로 바꾸거나(워크플로 수정), Pages Source를 다시
"Deploy from a branch"로 돌리면 됩니다. 문의: nolsoop.games@gmail.com
