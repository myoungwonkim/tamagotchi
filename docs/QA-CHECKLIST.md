# QA 체크리스트

**배포 URL:** [https://myoungwonkim.github.io/tamagotchi/](https://myoungwonkim.github.io/tamagotchi/)  
**검증 기준 커밋:** `a1e6b7a` (심해어 PNG + QA 3단계, 2026-06-21)  
**dev 모드:** `?dev=1` 붙여 접속  
**자동 스모크:** `./scripts/qa-smoke.sh`

---

## 자동 검증 결과 (2026-06-21, `68c4188`)

코드·배포 서버 기준으로 확인한 항목입니다. UI 동작은 아래 수동 체크리스트로 확인하세요.

| 항목 | 결과 | 근거 |
|------|------|------|
| GitHub Pages 배포 | ✅ | `main` push 후 Pages 빌드 |
| Phase 5B `effects.js` | ✅ | 진화·무드·idle·care FX |
| `spriteFormat` svg/png | ✅ | `sprites.js` + dev F6 (기본 png) |
| `renderPet` / sleep 수정 | ✅ | `fca2f30` 이후 유지 |
| PNG 21종 (심해어) | ✅ | `assets/sprites/` — [DEVELOPMENT-PROGRESS.md](DEVELOPMENT-PROGRESS.md) |
| 닭 SVG | — | 삭제됨 |
| safe-area CSS | ✅ | `style.css` |
| 캐시 버스팅 (`app-version`) | ✅ | `index.html` meta + `style.css?v=` + `main.js` dynamic import |

### 2단계 배포 스모크 (2026-06-21)

| 항목 | 결과 | 근거 |
|------|------|------|
| Pages `effects.js` | ✅ | HTTP 200, `playEvolutionTransition` 등 |
| Pages `care-fx` in HTML | ✅ | `index.html` `#care-fx` |
| Pages sleep/care hooks | ✅ | `main.js` `syncSleepControls`, `playCareEffect` |
| 로컬 8093 smoke | ✅ | index meta, main/effects/css 키워드 |

### 3단계 QA 자동 검증 (2026-06-21)

`./scripts/qa-smoke.sh` — **31 OK, 0 FAIL**

| 영역 | 결과 | 비고 |
|------|------|------|
| PNG 21종 (로컬) | ✅ | SVG 0, png-only |
| 캐시·HTML·JS 훅 | ✅ | sleep/care/effects/sprites |
| CSS 모션·레이아웃 | ✅ | evolvePop, idleBob, FAB z-index |
| dev F6/F toggles | ✅ | 코드 존재 |
| **배포 PNG** | ⏳ | `git push` 후 Pages 재검 (로컬 21 PNG ✅) |

**Desktop `[x]`** = 자동·코드 검증 통과  
**Desktop `[ ]`** = 브라우저에서 터치·소리·애니메이션 **수동 확인 필요**  
**iOS / Android** = 실기기 테스트 **사용자 확인**


---

## 수동 테스트 — 사용 방법

1. **강력 새로고침** (Cmd+Shift+R / Ctrl+Shift+R) 후 시작
2. 각 항목 테스트 후 `[ ]` → `[x]` 또는 `실패` 표시
3. 실패 시: 증상, 기기, 브라우저, 재현 순서를 메모

**환경 기록란**


|         | Desktop | iOS Safari | Android Chrome |
| ------- | ------- | ---------- | -------------- |
| 날짜      |         |            |                |
| OS/브라우저 |         |            |                |
| 테스터     |         |            |                |


---

## A. 핵심 돌봄 버튼 (최근 버그 회귀)


| #   | 시나리오                   | 기대 결과                                | Desktop | iOS | Android |
| --- | ---------------------- | ------------------------------------ | ------- | --- | ------- |
| A1  | **재우기** 탭              | 배경 어두워짐, 먹이/놀기/씻기 비활성, 버튼 문구 **깨우기** | [ ]     | [ ] | [ ]     |
| A2  | **깨우기** 탭              | 배경 밝아짐, 돌보기 버튼 활성, 문구 **재우기**        | [ ]     | [ ] | [ ]     |
| A3  | 재우기 ↔ 깨우기 3회 연속        | 매번 UI·상태 정상 전환, 버튼 멈춤 없음             | [ ]     | [ ] | [ ]     |
| A4  | 먹이 → 1초 내 놀기 → 씻기      | 각각 반응 (공유 쿨다own 1.5초 버그 없음)          | [ ]     | [ ] | [ ]     |
| A5  | 재운 상태에서 먹이/놀기/씻기 탭     | 동작하지 않음 (의도된 동작)                     | [x]     | [ ] | [ ]     |
| A6  | 새 펫 FAB(왼쪽 하단)과 재우기 버튼 | FAB가 재우기 버튼 가리지 않음                   | [x]     | [ ] | [ ]     |


---

## B. 그래픽 · 스프라이트 (Phase 4)


| #   | 시나리오                       | 기대 결과                                      | Desktop | iOS | Android |
| --- | -------------------------- | ------------------------------------------ | ------- | --- | ------- |
| B1  | 게임 시작 직후                   | 중앙 **진화 SVG** + 옆 **무드 말풍선 SVG** 동시 표시     | [ ]     | [ ] | [ ]     |
| B2  | `?dev=1` → **스프라이트 off**   | 진화·무드 모두 **이모지 fallback**                  | [ ]     | [ ] | [ ]     |
| B3  | dev **나이 +1일** 반복          | egg → baby → child → teen → adult SVG 순 전환 | [ ]     | [ ] | [ ]     |
| B4  | dev **성체 pretty**          | adult SVG (golden/sparkle/fluffy 계열)       | [ ]     | [ ] | [ ]     |
| B5  | dev **성체 defective**       | adult SVG (scruffy/grumpy/sickly 계열)       | [ ]     | [ ] | [ ]     |
| B6  | 재우기                        | 무드 → sleep SVG (또는 😴 fallback)            | [ ]     | [ ] | [ ]     |
| B7  | 건강 낮추기 (dev 게임오버 전)        | 무드 → sick SVG                              | [ ]     | [ ] | [ ]     |
| B8  | 📖 도감 열기                   | 수집 카드 SVG, 미수집 **locked SVG**              | [ ]     | [ ] | [ ]     |
| B9  | dev **건강 게임 오버**           | 오버레이 **heart-broken SVG**                  | [ ]     | [ ] | [ ]     |
| B10 | 성체 후 **새 펫 FAB** → 졸업 오버레이 | graduate 영역 SVG 표시                         | [ ]     | [ ] | [ ]     |


---

## C. 사운드 · 설정


| #   | 시나리오           | 기대 결과                      | Desktop | iOS | Android |
| --- | -------------- | -------------------------- | ------- | --- | ------- |
| C1  | 첫 버튼 탭 후 돌보기   | 효과음 재생                     | [ ]     | [ ] | [ ]     |
| C2  | 🔊 → 🔇 토글     | 음소거 시 SFX 없음, 새로고침 후 설정 유지 | [ ]     | [ ] | [ ]     |
| C3  | 재우기 / 깨우기      | sleep / wake SFX           | [ ]     | [ ] | [ ]     |
| C4  | dev **진화 테스트** | evolve 팡파레                 | [ ]     | [ ] | [ ]     |


---

## D. 저장 · 오프라인 · 게임 흐름


| #   | 시나리오             | 기대 결과                   | Desktop | iOS | Android |
| --- | ---------------- | ----------------------- | ------- | --- | ------- |
| D1  | stat 변경 후 새로고침   | 상태·이름 유지 (localStorage) | [ ]     | [ ] | [ ]     |
| D2  | dev **5분 오프라인**  | 환영 메시지 + stat 감소 반영     | [ ]     | [ ] | [ ]     |
| D3  | dev **30분 오프라인** | 장기 오프라인 메시지             | [ ]     | [ ] | [ ]     |
| D4  | dev **방치 게임 오버** | 오버레이 + 새 펫 시작 가능        | [ ]     | [ ] | [ ]     |
| D5  | 성체 달성 → 도감       | 해당 variant 도감 등록        | [ ]     | [ ] | [ ]     |
| D6  | 졸업 → 새 알         | 도감 유지, 새 펫 egg부터 시작     | [ ]     | [ ] | [ ]     |


---

## E. 레이아웃 · 모바일 UX


| #   | 시나리오              | 기대 결과                        | Desktop | iOS | Android |
| --- | ----------------- | ---------------------------- | ------- | --- | ------- |
| E1  | iPhone 노치/홈 인디케이터 | footer 버튼이 safe-area에 가리지 않음 | —       | [ ] | [ ]     |
| E2  | 세로 화면 375px 폭     | stats·pet·버튼 한 화면에 무리 없이 배치  | [ ]     | [ ] | [ ]     |
| E3  | 가로 모드 (선택)        | 레이아웃 깨짐 없음                   | [ ]     | [ ] | [ ]     |
| E4  | 도감·오버레이 스크롤       | 카드 잘림 없이 스크롤 가능              | [ ]     | [ ] | [ ]     |


---

## F. dev 패널 스모크 (`?dev=1`)


| #   | 버튼             | 기대 결과           | Pass |
| --- | -------------- | --------------- | ---- |
| F1  | 건강 게임 오버       | 즉시 game over UI | [ ]  |
| F2  | 방치 게임 오버 (11분) | neglect 사유 메시지  | [ ]  |
| F3  | 나이 +1일         | 진화 또는 나이 증가     | [ ]  |
| F4  | 도감 초기화         | 수집 0/9          | [ ]  |
| F5  | idle 대사 강제     | 메시지 표시          | [ ]  |
| F6  | 스프라이트 포맷 svg/png | 포맷 전환 + 그래픽 갱신 | [ ]  |


---

## G. Phase 5B — 그래픽·모션


| #   | 시나리오              | 기대 결과                              | Desktop | iOS | Android |
| --- | ----------------- | ---------------------------------- | ------- | --- | ------- |
| G1  | dev 나이 +1일 / 진화 테스트 | 진화 시 `evolvePop` 전환 (scale+opacity) | [ ]     | [ ] | [ ]     |
| G2  | stat 변경으로 무드 전환    | 말풍선 fade (`moodFade`)              | [ ]     | [ ] | [ ]     |
| G3  | 재우기 / 깨우기         | 배경 gradient 전환 + sleep idle bob    | [ ]     | [ ] | [ ]     |
| G4  | 성체 pretty (dev)   | 빠른 idle bob (`variant-pretty`)     | [ ]     | [ ] | [ ]     |
| G5  | 성체 defective (dev) | idle shake (`variant-defective`)   | [ ]     | [ ] | [ ]     |
| G6  | 먹이 / 놀기 / 씻기      | `#care-fx` 이모지 파티클 상승             | [ ]     | [ ] | [ ]     |
| G7  | dev 스프라이트 포맷 png  | URL이 `.png`로 변경 (파일 없으면 fallback)  | [x]     | [ ] | [ ]     |
| G8  | OS reduced-motion | idle·FX·진화 전환 애니메이션 없음            | [x]     | [ ] | [ ]     |


---

## 실패 기록 템플릿

```
ID: (예: A2)
환경: iOS 18 / Safari
증상:
재현:
스크린샷/녹화:
```

---

## Phase 5B 구현 상태

| 항목 | 상태 |
| ---- | ---- |
| 심해어 PNG 21종 | 완료 |
| 닭 SVG 제거 | 완료 |
| PNG 기본 포맷 | 완료 |
| 진화 전환 애니메이션 | 완료 |
| 무드·수면 연출 | 완료 |
| idle 모션 (tier별) | 완료 |
| 돌보기 FX | 완료 |

전체 진행: **[DEVELOPMENT-PROGRESS.md](DEVELOPMENT-PROGRESS.md)**

수동 검증: **G섹션** 참고.
