# nolsoopgames.com 도메인 연결 가이드

`nolsoopgames.com`을 이 저장소의 GitHub Pages에 **커스텀 도메인**으로 연결해
게임과 개인정보/약관 문서를 한 도메인에서 서빙합니다. 추가 서버·호스팅 비용이 없습니다.

연결 후 최종 URL:

| 항목 | URL |
|------|-----|
| 게임 | https://nolsoopgames.com/ |
| 개인정보 처리방침 (검수 제출용) | https://nolsoopgames.com/privacy.html |
| 이용약관 | https://nolsoopgames.com/terms-of-service.html |

> `myoungwonkim.github.io/tamagotchi/...` 및 기존 `docs/privacy.html` 링크는 위 도메인으로 자동 리디렉트됩니다.

---

## 사전 준비 (저장소 쪽 — 완료됨)

- [x] 루트 `CNAME` 파일 = `nolsoopgames.com`
- [x] 루트 `privacy.html`, `terms-of-service.html` (정식본)
- [x] `docs/privacy.html`, `docs/terms-of-service.html` → 루트로 리디렉트
- [x] GRAC 패키징 스크립트가 루트 `privacy.html`을 사용하도록 갱신

> `main` 브랜치에 push하면 위 파일이 GitHub Pages에 반영됩니다.

---

## 1단계 — GitHub Pages에 커스텀 도메인 등록

1. GitHub 저장소 → **Settings → Pages**
2. **Source:** Deploy from a branch / Branch: `main` / Folder: `/ (root)` 확인
3. **Custom domain** 입력란에 `nolsoopgames.com` 입력 → **Save**
   - 저장소에 이미 `CNAME` 파일이 있으므로 값이 자동으로 채워질 수 있습니다.
4. 저장하면 GitHub이 DNS 확인을 시작합니다 (아직 실패해도 정상 — 2단계 후 통과).

---

## 2단계 — 도메인 등록업체(레지스트라)에서 DNS 설정

`nolsoopgames.com`을 구매한 곳(가비아, Cloudflare, GoDaddy, Namecheap, 가비아/후이즈 등)의
**DNS 관리 / 네임서버 레코드** 화면에서 아래 레코드를 추가합니다.

### (a) 루트 도메인 `nolsoopgames.com` — A 레코드 4개

호스트/이름 칸은 `@` 또는 공란(루트), 타입 `A`:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

> IPv6도 지원하려면 같은 값들의 AAAA 레코드를 추가로 넣을 수 있습니다(선택):
> `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`

### (b) `www.nolsoopgames.com` — CNAME 레코드 (권장)

| 타입 | 호스트/이름 | 값 |
|------|-------------|-----|
| CNAME | `www` | `myoungwonkim.github.io.` |

> 기존에 도메인에 다른 A/CNAME/포워딩(파킹 페이지 등) 레코드가 있으면 **삭제**하세요.
> 특히 루트(@)에 파킹용 A 레코드가 남아 있으면 충돌합니다.

### Cloudflare를 쓰는 경우 주의

- 위 A 레코드를 넣되, 초기 연결 시에는 **Proxy 상태를 "DNS only"(회색 구름)** 로 두세요.
  프록시(주황 구름)가 켜져 있으면 GitHub의 인증서 발급이 실패할 수 있습니다.
- SSL/TLS 모드는 **Full** 이상으로 두세요.

---

## 3단계 — 확인 및 HTTPS 강제

1. DNS 전파를 기다립니다 (보통 몇 분 ~ 최대 24시간, 대개 10~30분).
2. 터미널에서 전파 확인:

   ```bash
   dig +short nolsoopgames.com
   # → 185.199.108.153 ... 4개가 보이면 정상
   dig +short www.nolsoopgames.com
   # → myoungwonkim.github.io. 가 보이면 정상
   ```

3. **Settings → Pages** 에서 "DNS check successful" 표시 확인.
4. **Enforce HTTPS** 체크박스를 켭니다.
   - 인증서 발급 전에는 비활성화일 수 있음 → 발급 완료 후 다시 들어가 체크.
5. 브라우저에서 접속 확인:
   - https://nolsoopgames.com/ → 게임
   - https://nolsoopgames.com/privacy.html → 개인정보 처리방침
   - https://nolsoopgames.com/terms-of-service.html → 이용약관

---

## 4단계 — 검수/콘솔 반영 확인

도메인이 뜨면 아래가 이미 새 URL을 가리키는지 확인(문서에는 반영 완료):

- App-in-Toss 콘솔 개인정보 URL: `https://nolsoopgames.com/privacy.html`
- GRAC 제출 문서(`01-game-description.md`)의 개인정보 URL
- `granite.config.ts`의 아이콘 URL (도메인 연결 후 유효)

---

## 트러블슈팅

| 증상 | 원인/해결 |
|------|-----------|
| Pages에서 "domain does not resolve" | DNS 전파 대기 또는 A 레코드 오타. `dig`로 확인 |
| HTTPS 체크박스 비활성 | 인증서 발급 대기(수십 분). 나중에 다시 켜기 |
| `www`만 되고 루트 안 됨(또는 반대) | 루트 A 4개 + `www` CNAME 둘 다 설정 |
| 파킹 페이지가 대신 뜸 | 레지스트라의 기본 포워딩/파킹 레코드 삭제 |
| Cloudflare에서 인증서 오류 | 프록시를 DNS only로 변경, SSL을 Full로 |

---

## 대안 — 게임과 도메인을 분리하고 싶다면

`nolsoopgames.com`을 게임과 분리해 **개인정보/약관 전용**으로만 쓰고 싶다면,
별도 저장소(`nolsoopgames`)를 만들어 `privacy.html`·`terms-of-service.html`만 두고
그 저장소에 커스텀 도메인을 연결하면 됩니다. 이 경우 이 저장소의 `CNAME`은 제거하고
게임은 계속 `myoungwonkim.github.io/tamagotchi/`로 둡니다. 필요하면 요청 주세요.
