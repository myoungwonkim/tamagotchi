# GRAC 심의 제출 자료 (abysspet)

| 파일 | 설명 |
|------|------|
| `abysspet-grac-demo.webm` | 시연 영상 (~60–70초, 성장·액션·도감·게임오버 자동 연출) |
| `abysspet-grac-submission.zip` | 설명서·스크린샷·영상·가이드 일괄 패키지 |
| `abysspet-sandbox.ait` | 앱인토스 샌드박스 빌드 (로컬 `npm run build:ait` 후 복사) |

## 재생성

```bash
python3 scripts/record_grac_demo.py          # 영상만
python3 scripts/package_grac_submission.py   # zip만
bash scripts/build_grac_submission.sh        # 영상 + (npm 있으면) .ait + zip
```

상세: [docs/GRAC-DEMO-SUBMISSION.md](../docs/GRAC-DEMO-SUBMISSION.md)

## GRAC 신청 시

- **영상** `abysspet-grac-demo.webm` 첨부 (또는 MP4 변환 후)
- **또는** 온라인 URL: https://myoungwonkim.github.io/tamagotchi/
- **또는** `.ait` + 콘솔 QR (앱인토스 실기 시연)
