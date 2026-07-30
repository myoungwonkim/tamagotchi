# 게임물 용량 확인 자료

**게임명:** 어비스펫: 심해 가상 펫 (Abyss Pet)  
**용도:** 웹 실행 게임물 등급분류 수수료 산정을 위한 용량 확인  
**작성일:** 2026-07-30  

---

## 1. 결론

| 항목 | 내용 |
|------|------|
| **게임 이용에 필요한 총 용량** | **약 4.70 MB** (4,929,119 bytes) |
| 수수료 조견 참고 구간 | 기타(단순 캐주얼 플래시 게임 등) **10 MB 미만** |
| 실행 방식 | 웹 브라우저 / 앱인토스 WebView (설치형 APK 아님) |
| 실행 URL | https://nolsoopgames.com/abysspet/ |

플레이어가 게임을 실행·이용하는 데 필요한 **클라이언트 정적 리소스**만 합산했습니다.  
심의·마케팅용 대용량 원본(`assets/custom` 등)과 GRAC 제출 패키지 자체는 제외합니다.

---

## 2. 용량 내역 (이용에 필요한 자료)

측정 기준일: 2026-07-30  
측정 방법: 저장소 내 배포용 게임 리소스 파일 크기 합산

| 구성 | 경로 | 용량 (약) |
|------|------|-----------|
| 진입 HTML | `index.html` | 12.9 KB |
| PWA 매니페스트 | `manifest.webmanifest` | 0.9 KB |
| 파비콘 | `favicon.ico` | 9.9 KB |
| 스타일 | `css/` | 50.8 KB |
| 스크립트 | `js/` | 246.5 KB |
| 게임 스프라이트 | `assets/sprites/` | 4.2 MB |
| 폰트 | `assets/fonts/` | 162.3 KB |
| 개인정보·약관 페이지 | `privacy.html`, `terms-of-service.html` | 6.7 KB |
| **합계** | | **약 4.70 MB** |

---

## 3. 제외한 항목 (플레이 필수 아님)

수수료용 「이용에 필요한 용량」에서 제외한 예시:

- `assets/custom/` — 스프라이트 제작·스테이징 원본
- `assets/grac-submission/` — 등급분류 제출 자료
- `assets/ait-store/`, `assets/play-store/` — 스토어 마케팅 이미지
- `Screenshot/` — 개발용 캡처
- `node_modules/`, 소스 빌드 도구

---

## 4. 확인 방법 (재현)

프로젝트 루트에서:

```bash
# HTML·CSS·JS·sprites·fonts 등 플레이 필수 경로 합산
du -sh index.html manifest.webmanifest favicon.ico css js \
  assets/sprites assets/fonts privacy.html terms-of-service.html
```

합계가 약 **4.7 MB**이면 본 자료와 동일합니다.
