#!/usr/bin/env bash
# Assemble the standalone web game at DEST root (https://abysspet.nolsoopgames.com/).
# Source stays at repo root. Play APK is unrelated (Capacitor dist).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-"$ROOT/_site_game"}"
cd "$ROOT"

rm -rf "$DEST"
mkdir -p "$DEST/assets"

cp index.html privacy.html terms-of-service.html "$DEST/"
cp -R css "$DEST/css"
cp -R js "$DEST/js"
# Exclude Finder junk; fail the copy only if sprites missing
rsync -a --exclude '.DS_Store' assets/sprites "$DEST/assets/"
if [ -d assets/ait-store ]; then
  rsync -a --exclude '.DS_Store' assets/ait-store "$DEST/assets/"
fi
if [ -d assets/brand-icon ]; then
  rsync -a --exclude '.DS_Store' assets/brand-icon "$DEST/assets/"
fi
if [ -d assets/app-icon ]; then
  rsync -a --exclude '.DS_Store' assets/app-icon "$DEST/assets/"
fi
if [ -f favicon.ico ]; then
  cp favicon.ico "$DEST/favicon.ico"
fi
if [ -f manifest.webmanifest ]; then
  cp manifest.webmanifest "$DEST/manifest.webmanifest"
fi

touch "$DEST/.nojekyll"

# Old path bookmarks → site root (Cloudflare Pages)
cat > "$DEST/_redirects" <<'EOF'
/abysspet / 301
/abysspet/ / 301
/abysspet/* /:splat 301
EOF

echo "Web game assembled at $DEST"
