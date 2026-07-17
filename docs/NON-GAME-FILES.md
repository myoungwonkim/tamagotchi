# 게임 미적용 파일 목록 (향후 작업 참조 제외용)

> 목적: 실제 게임/배포에 **적용되지 않는** 파일(시안·프리뷰·레퍼런스 아트·실험 스크립트)을 정리합니다.
> 향후 코드/자산 작업 시 이 목록의 파일은 **참조 대상에서 제외**하세요. (기능 추적·영향 분석·리팩터링 대상 아님)
> 감사 기준: 2026-07-17. 참조 여부는 저장소 전체 grep으로 검증했습니다.

## 핵심 배포 사실 (먼저 이해)

배포 대상이 2개이며, 서로 다른 하위집합만 나갑니다.

- **GitHub Pages (공개 사이트 `nolsoopgames.com/abysspet/`)** — `.github/workflows/pages.yml`이 `_site/`에 복사하는 것: `index.html`, `privacy.html`, `terms-of-service.html`, `css/`, `js/`, `assets/sprites/`, `assets/ait-store/`, `CNAME`, `.nojekyll`. → **`docs/`는 배포되지 않음.**
- **Apps-in-Toss (`npm run build`)** — `vite build`가 `index.html` 진입 JS 그래프를 번들, `scripts/copy-ait-static.mjs`가 `assets/`·`css/` 전체를 `dist/`로 복사(참조 여부 무관 통째 복사).

따라서 `docs/*-preview.html` 시안은 **공개 사이트에서 404 날 일이 없음**(애초에 배포 안 됨).

## 게임에 적용됨 (삭제 금지 — 참조 대상)

- **런타임**: `index.html`, `css/style.css`, `js/*.js` 전 25개(전부 import 그래프에 포함; `dev.js`/`storeCapture.js`/`gracDemo.js`는 URL 파라미터 게이트지만 번들됨).
- **스프라이트/자산**: `assets/sprites/**`(동적 경로 로드, `vent/**` 포함 — 도감 비활성이지만 향후 콘텐츠라 유지), `assets/ait-store/**`(앱 아이콘 `app-logo-light.png` 포함).
- **법적/루트 페이지**: 루트 `privacy.html`, `terms-of-service.html`, `CNAME`, `.nojekyll`.
- **배포/빌드 설정**: `.github/workflows/pages.yml`, `package.json`, `vite.config.js`, `granite.config.ts`, `.gitignore`, `.cursorignore`, `.env.ait.example`, `scripts/copy-ait-static.mjs`.
- **package.json/CI/README에 연결된 툴링 스크립트**(런타임 아님이나 사용됨): `build_ait_store_assets.py`, `qa-smoke.sh`, `bump-version.sh`, `generate_all_sprites.py`, `generate_mermaid_side_preview.py`, `generate_action_preview.py`, `generate_mess_preview.py`, `generate_defective_eye_preview.py`, `prepare_staging_adult.py`, `package_grac_submission.py`, `record_grac_demo.py`, `build_grac_submission.sh`, `generate_speaker_icon_drafts.py`.

## 게임 미적용 (참조 제외 대상)

### A. 디자인 프리뷰 / 시안 (저장소 전용, 미배포)
- `docs/*-preview.html` — 루트 약 93개(git 추적됨; `.cursorignore`의 `docs/*-preview.html`로 에이전트 기본 검색에서는 숨겨짐).
- 프리뷰 폴더: `docs/header-icons-preview/`, `docs/speaker-icon-preview/`, `docs/mermaid-side-preview/`, `docs/vent-theme-preview/`.
- `docs/index.html`(시안 갤러리), `docs/c.html`, `docs/mood-mini-preview.html`.
- `docs/ui-icon-redesign-preview.html` — 미추적(`??`), 신규.
- 이 중 23개는 `docs/index.html`에서 링크, 나머지 ~70개는 어디서도 링크 안 됨.

### B. 레퍼런스 & 스테이징 아트
- `assets/custom/**` — git 추적 29개 + 나머지 무시됨(`.gitignore: assets/custom/`). 레퍼런스/드래프트 스프라이트. css/js/html 미참조.
- `assets/fonts/Galmuri11-Bold.woff2` — git 추적되나 **게임 미사용**(`@font-face` 없음). `generate_action_preview.py` 프리뷰 렌더에만 사용.
- `assets/grac-submission/**` — GRAC 제출 산출물(webm/zip/스크린샷/설명 md). 툴링/제출물, 런타임 아님.

### C. 실험 / 일회성 스크립트 (scripts/ 밖 참조 0)
`apply_pinback_walk.py`, `batch_prepare_action_frames.py`, `batch_prepare_deepsea_evo.py`, `batch_prepare_mermaid_evo.py`, `batch_prepare_mood_mini.py`, `batch_prepare_ui.py`, `clean_sora_frames.py`, `generate_ait_assets.py`, `generate_encyclopedia_compare_preview.py`, `generate_fiji_defective_preview.py`, `generate_ghost_sprites.py`, `generate_header_icons_preview.py`, `generate_mermaid_preview.py`, `generate_mermaid_tier_concept_preview.py`, `generate_shark_mouth_preview.py`, `generate_shark_sprite.py`, `generate_ui_overall_preview.py`, `generate_vent_preview.py`, `pixel_sprite.py`, `prepare_staging_evolution.py`, `prepare_staging_mermaid_evolution.py`, `prepare_staging_mood.py`, `prepare_staging_ui.py`, `svg_to_png.py`, `verify_adult_sprite_frames.py`(단, `.cursor/rules` 1건 참조), `prepare_ui_redesign.py`(미추적 `??`).

### D. 기타
- `docs/*.md` — 프로젝트 문서 15개(런타임 아님, 살아있는 참고 문서 — 이 파일 포함).
- `docs/privacy.html`, `docs/terms-of-service.html` — 오래된 리다이렉트 스텁(`docs/` 미배포라 무의미).
- git 무시/로컬 전용: `_archive/`, `.tools/`, `_site/`, `.sprite-staging*/`, `.DS_Store`.

## 삭제 안전성

| 그룹 | 삭제 가능? | 사유 |
|---|---|---|
| `docs/*-preview.html` 중 갤러리 미링크(~70) | **예** | 저장소 전용·미배포·런타임/CI 참조 없음. |
| `docs/*-preview.html` 중 갤러리 링크(23) + `docs/index.html` | **주의** | 공개 사이트엔 없지만 개별 삭제 시 로컬 갤러리 링크 깨짐. 갤러리 통째 제거 시 안전. 일부는 `PNG-SPRITE-GUIDE.md`에서도 링크. |
| 프리뷰 폴더 4종 | **주의** | 갤러리 링크; `speaker-icon-`·`mermaid-side-`는 추적 스크립트로 재생성 가능. |
| `docs/ui-icon-redesign-preview.html`, `scripts/prepare_ui_redesign.py` | **예** | 미추적·참조 0. |
| `assets/custom/**` | **예** | 레퍼런스/스테이징; 참조 없음(디렉터리 이미 `.gitignore`). |
| `assets/fonts/Galmuri11-Bold.woff2` | **주의** | 게임 미사용이나 `generate_action_preview.py`가 로드. 액션 프리뷰 재생성 안 하면 안전. |
| `assets/grac-submission/**` | **주의** | 제출 산출물, 스크립트로 재생성 가능. 등급 재제출 가능성 있으면 유지. |
| 실험 스크립트(C, 참조 0) | **예** | package.json/CI/README/문서/타 스크립트 참조 없음. |
| `docs/privacy.html`, `docs/terms-of-service.html` | **예** | 미배포 스텁; 정본은 루트 페이지. |
| `docs/*.md` 프로젝트 문서 | **주의** | 미배포지만 실사용 문서. 의도적 폐기 시에만. |
| `_archive/`, `.tools/`, `_site/`, `.sprite-staging*/`, `.DS_Store` | **예** | 전부 git 무시·로컬 전용(빌드 산출물/다운로드 바이너리/스테이징/OS 노이즈). |

## 사람 판단 필요

1. `docs/index.html` 갤러리는 공개 미배포 — 내부 아카이브로 유지할지, 링크된 23개 프리뷰와 함께 제거할지 결정.
2. `assets/fonts/Galmuri11-Bold.woff2` — 향후 게임 내 사용 의도 없으면 삭제 가능.
3. `assets/ait-store/**`는 앱 아이콘 때문에 배포됨 — 스토어/등급 심사 주기 동안 유지.
4. `assets/sprites/vent/**` — 도감 비활성이나 향후 콘텐츠(의도적 유지).
