#!/usr/bin/env bash
# Build GRAC submission assets: demo video, optional .ait bundle, zip package.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT="$ROOT/assets/grac-submission"
PKG="$OUT/abysspet-grac-submission"
AIT_SRC=""

echo "=== abysspet GRAC submission build ==="

# 1. Demo video
echo "[1/4] Recording demo video..."
python3 scripts/record_grac_demo.py

# 2. Optional .ait (requires Node.js)
echo "[2/4] AIT bundle (optional)..."
if command -v npm >/dev/null 2>&1; then
  if [ ! -d node_modules ]; then
    npm install
  fi
  if [ ! -f .env.ait ]; then
    cp .env.ait.example .env.ait
    echo "  created .env.ait from example (test ad IDs)"
  fi
  npm run build:ait
  AIT_SRC="$(find "$ROOT" -maxdepth 1 -name '*.ait' -print -quit)"
  if [ -n "$AIT_SRC" ]; then
    mkdir -p "$OUT"
    cp "$AIT_SRC" "$OUT/abysspet-sandbox.ait"
    echo "  copied $(basename "$AIT_SRC") → assets/grac-submission/abysspet-sandbox.ait"
  else
    echo "  WARN: npm run build:ait finished but no .ait file found in project root"
  fi
else
  echo "  SKIP: npm not found — run 'npm run build:ait' locally, then copy *.ait to assets/grac-submission/abysspet-sandbox.ait"
fi

# 3. Assemble package folder
echo "[3/4] Assembling submission folder..."
rm -rf "$PKG"
mkdir -p "$PKG/screenshots"

cp docs/GRAC-SUBMISSION-PACK.md "$PKG/01-game-description.md"
cp docs/GRAC-DEMO-SUBMISSION.md "$PKG/02-demo-and-build-guide.md"
cp docs/privacy.html "$PKG/03-privacy-policy.html"

for f in "$ROOT/assets/ait-store"/screenshot-*.png; do
  [ -f "$f" ] && cp "$f" "$PKG/screenshots/"
done

if [ -f "$OUT/abysspet-grac-demo.mp4" ]; then
  cp "$OUT/abysspet-grac-demo.mp4" "$PKG/04-demo-video.mp4"
elif [ -f "$OUT/abysspet-grac-demo.webm" ]; then
  cp "$OUT/abysspet-grac-demo.webm" "$PKG/04-demo-video.webm"
fi

if [ -f "$OUT/abysspet-sandbox.ait" ]; then
  cp "$OUT/abysspet-sandbox.ait" "$PKG/05-abysspet-sandbox.ait"
fi

cat > "$PKG/README.txt" <<'EOF'
어비스펫 (abysspet) — GRAC 등급분류 제출 패키지
================================================

포함 파일
---------
01-game-description.md     게임 설명서 (PDF로 변환해 신청서에 첨부)
02-demo-and-build-guide.md 시연 영상·빌드·QR 안내
03-privacy-policy.html     개인정보 처리방침
screenshots/               스크린샷 5장
04-demo-video.*            시연 영상 (MP4 또는 WebM)
05-abysspet-sandbox.ait    앱인토스 샌드박스 빌드 (있는 경우)

GRAC 신청 시
------------
- 게임 설명서 PDF + 스크린샷 + 시연 영상(또는 온라인 시연 URL) 첨부
- 자세한 절차: docs/GRAC-DEMO-SUBMISSION.md

문의: nolsoop.games@gmail.com
EOF

# 4. Zip
echo "[4/4] Creating zip..."
ZIP="$OUT/abysspet-grac-submission.zip"
rm -f "$ZIP"
(cd "$OUT" && zip -r "abysspet-grac-submission.zip" "abysspet-grac-submission" -x "*.DS_Store")

echo
echo "=== done ==="
echo "Package: $PKG"
echo "Zip:     $ZIP"
echo "Video:   $OUT/abysspet-grac-demo.webm"
[ -f "$OUT/abysspet-sandbox.ait" ] && echo "AIT:     $OUT/abysspet-sandbox.ait"
echo
echo "Next: open docs/GRAC-DEMO-SUBMISSION.md for GRAC portal upload steps."
