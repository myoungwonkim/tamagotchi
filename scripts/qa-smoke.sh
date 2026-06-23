#!/usr/bin/env bash
# Automated smoke checks for tamagotchi QA (no browser required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
WARN=0

ok() { echo "  OK  $1"; PASS=$((PASS + 1)); }
bad() { echo "  FAIL $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  WARN $1"; WARN=$((WARN + 1)); }

echo "=== tamagotchi qa-smoke ==="
echo "root: $ROOT"
echo

# --- Assets ---
echo "[assets]"
PNG_COUNT=$(find assets/sprites -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
SVG_COUNT=$(find assets/sprites -name '*.svg' 2>/dev/null | wc -l | tr -d ' ')
if [ "$PNG_COUNT" -eq 28 ]; then ok "28 PNG sprites"; else bad "PNG count=$PNG_COUNT (expected 28)"; fi
if [ "$SVG_COUNT" -eq 0 ]; then ok "no legacy SVG (png-only)"; else warn "SVG count=$SVG_COUNT (legacy)"; fi

for cat in evolution adult mood ui; do
  if [ -d "assets/sprites/$cat" ]; then ok "dir assets/sprites/$cat"; else bad "missing assets/sprites/$cat"; fi
done
for id in poop fly feed play clean sleep wake; do
  if [ -f "assets/sprites/ui/$id.png" ]; then ok "ui sprite $id.png"; else bad "missing assets/sprites/ui/$id.png"; fi
done

# --- HTML / cache ---
echo "[html]"
grep -q 'name="app-version"' index.html && ok 'app-version meta' || bad 'app-version meta'
grep -q 'action-label' index.html && ok 'action button labels' || bad 'action button labels'
grep -q 'action-icon' index.html && ok 'action sprite icons' || bad 'action sprite icons'
grep -q 'care-fx' index.html && ok '#care-fx layer' || bad '#care-fx layer'
grep -q 'id="pet-area"' index.html && rg -q 'id="message"' index.html && ok 'message in pet-area' || bad 'message in pet-area'
grep -q 'encyclopedia-detail' index.html && ok 'encyclopedia detail panel' || bad 'encyclopedia detail panel'
grep -q 'style.css?v=' index.html && ok 'css cache query' || bad 'css cache query'
grep -q 'import(`./js/main.js?v=' index.html && ok 'js dynamic import cache' || bad 'js dynamic import'
grep -q 'injectJsImportMap' index.html && ok 'js importmap cache bust' || bad 'js importmap cache bust'

# --- JS hooks ---
echo "[js]"
for sym in syncSleepControls playCareEffect playEvolutionTransition playMoodTransition applyIdleClasses getSpriteFormat; do
  if rg -q "$sym" js/ 2>/dev/null; then ok "$sym"; else bad "missing $sym"; fi
done
rg -q 'getVariantDescription' js/encyclopedia.js && ok 'encyclopedia descriptions' || bad 'encyclopedia descriptions'
rg -q 'SLEEP_TOGGLE_GUARD_MS' js/actions.js && ok 'sleep toggle guard' || bad 'sleep toggle guard'
rg -q 'lastActionAtByKey' js/actions.js && ok 'per-action cooldown' || bad 'per-action cooldown'
rg -q 'pet-mood-fallback' js/ui.js && ok 'mood fallback selector' || bad 'mood fallback selector'
rg -q 'syncMessLayer' js/mess.js js/ui.js && ok 'mess layer sync' || bad 'mess layer sync'

DEFAULT_PNG=$(python3 - <<'PY'
import re
t=open("js/sprites.js").read()
# default when spriteFormat unset: png branch
print("return \"png\"" in t or 'return "png"' in t)
PY
)
[ "$DEFAULT_PNG" = "True" ] && ok 'default spriteFormat png' || warn 'default spriteFormat not png'

# --- CSS ---
echo "[css]"
for cls in pet-area--sleeping evolvePop moodFade careFxFeed idleBob prefers-reduced-motion new-pet-fab actions--care-blocked action-label action-icon; do
  if rg -q "$cls" css/style.css 2>/dev/null; then ok "css: $cls"; else bad "css missing: $cls"; fi
done

# --- Dev panel ---
echo "[dev]"
rg -q 'toggleSpriteFormat' js/dev.js js/main.js && ok 'dev sprite format toggle' || bad 'dev sprite format toggle'
rg -q 'toggleSprites' js/dev.js && ok 'dev sprites on/off' || bad 'dev sprites on/off'

# --- Optional local server ---
if curl -sf -o /dev/null "http://127.0.0.1:8093/" 2>/dev/null; then
  echo "[local-server :8093]"
  curl -sf "http://127.0.0.1:8093/" | grep -q 'app-version' && ok 'local index serves' || bad 'local index'
else
  warn 'local server :8093 not running (skip live fetch)'
fi

echo
echo "=== summary: $PASS ok, $FAIL fail, $WARN warn ==="
[ "$FAIL" -eq 0 ]
