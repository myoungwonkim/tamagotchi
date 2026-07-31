#!/usr/bin/env bash
# Create Play upload keystore (do NOT commit the .jks file).
# Usage: ./scripts/create_upload_keystore.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/play-upload.keystore"
PROPS="$ROOT/keystore.properties"

if [[ -f "$OUT" ]]; then
  echo "Already exists: $OUT"
  exit 1
fi

keytool -genkeypair \
  -v \
  -keystore "$OUT" \
  -alias abysspet-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "${PLAY_STORE_PASSWORD:-change-me-before-upload}" \
  -keypass "${PLAY_STORE_PASSWORD:-change-me-before-upload}" \
  -dname "CN=Abyss Pet, OU=Nolsoop Games, O=Nolsoop Games, L=Seoul, ST=Seoul, C=KR"

cat > "$PROPS" <<EOF
storeFile=../play-upload.keystore
storePassword=${PLAY_STORE_PASSWORD:-change-me-before-upload}
keyAlias=abysspet-upload
keyPassword=${PLAY_STORE_PASSWORD:-change-me-before-upload}
EOF

echo "Created $OUT and $PROPS (gitignored). Back up offline; change passwords before production."
