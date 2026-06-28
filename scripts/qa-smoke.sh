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
MERMAID_COUNT=$(find assets/sprites/mermaid -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
VENT_COUNT=$(find assets/sprites/vent -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
if [ "$PNG_COUNT" -eq 69 ]; then ok "69 PNG sprites (31 deepsea + 19 mermaid + 19 vent)"; else bad "PNG count=$PNG_COUNT (expected 69)"; fi
if [ "$MERMAID_COUNT" -eq 19 ]; then ok "19 mermaid pet sprites"; else bad "mermaid PNG count=$MERMAID_COUNT (expected 19)"; fi
if [ "$VENT_COUNT" -eq 19 ]; then ok "19 vent pet sprites"; else bad "vent PNG count=$VENT_COUNT (expected 19)"; fi

for cat in evolution adult mood ui; do
  if [ -d "assets/sprites/$cat" ]; then ok "dir assets/sprites/$cat"; else bad "missing assets/sprites/$cat"; fi
done
for cat in evolution adult mood; do
  if [ -d "assets/sprites/mermaid/$cat" ]; then ok "dir assets/sprites/mermaid/$cat"; else bad "missing assets/sprites/mermaid/$cat"; fi
done
for cat in evolution adult mood; do
  if [ -d "assets/sprites/vent/$cat" ]; then ok "dir assets/sprites/vent/$cat"; else bad "missing assets/sprites/vent/$cat"; fi
done
rg -q 'speciesTheme' js/pet.js js/storage.js js/sprites.js && ok 'speciesTheme field' || bad 'speciesTheme field'
for id in poop fly feed play clean sleep wake encyclopedia sound-on sound-off; do
  if [ -f "assets/sprites/ui/$id.png" ]; then ok "ui sprite $id.png"; else bad "missing assets/sprites/ui/$id.png"; fi
done

# --- HTML / cache ---
echo "[html]"
grep -q 'name="app-version"' index.html && ok 'app-version meta' || bad 'app-version meta'
grep -q 'action-label' index.html && ok 'action button labels' || bad 'action button labels'
grep -q 'action-icon' index.html && ok 'action sprite icons' || bad 'action sprite icons'
grep -q 'care-fx' index.html && ok '#care-fx layer' || bad '#care-fx layer'
grep -q 'id="pet-area"' index.html && rg -q 'id="message"' index.html && ok 'message in pet-area' || bad 'message in pet-area'
grep -q 'encyclopedia-list' index.html && grep -q 'encyclopedia-detail' index.html && ok 'encyclopedia list/detail panels' || bad 'encyclopedia list/detail panels'
grep -q 'encyclopedia-tab-vent' index.html && ok 'encyclopedia vent tab' || bad 'encyclopedia vent tab'
grep -q 'encyclopedia-card__species' index.html || rg -q 'encyclopedia-card__species' css/style.css && ok 'encyclopedia species label' || bad 'encyclopedia species label'
rg -q 'encyclopedia-panel--detail' css/style.css && ok 'encyclopedia compact detail panel' || bad 'encyclopedia compact detail panel'
grep -q 'style.css?v=' index.html && ok 'css cache query' || bad 'css cache query'
grep -q 'import(`./js/main.js?v=' index.html && ok 'js dynamic import cache' || bad 'js dynamic import'
grep -q 'injectJsImportMap' index.html && ok 'js importmap cache bust' || bad 'js importmap cache bust'

grep -q 'btn-revive-ad' index.html && ok 'revive ad button' || bad 'revive ad button'
grep -q 'reward-prompts' index.html && ok 'reward prompt bar' || bad 'reward prompt bar'
test -f granite.config.ts && ok 'granite.config.ts' || bad 'granite.config.ts'
rg -q 'appName: "abysspet"' granite.config.ts && ok 'granite appName abysspet' || bad 'granite appName not abysspet'
test -f docs/privacy.html && ok 'privacy.html' || bad 'privacy.html'
test -f docs/ABYSSPET-LAUNCH-RUNBOOK.md && ok 'ABYSSPET-LAUNCH-RUNBOOK.md' || bad 'ABYSSPET-LAUNCH-RUNBOOK.md'
test -f docs/GRAC-SUBMISSION-PACK.md && ok 'GRAC-SUBMISSION-PACK.md' || bad 'GRAC-SUBMISSION-PACK.md'
test -f package.json && ok 'package.json (ait)' || bad 'package.json'
test -f docs/MONETIZATION.md && ok 'MONETIZATION.md' || bad 'MONETIZATION.md'

# --- JS hooks ---
echo "[js]"
for sym in syncSleepControls playCareEffect playEvolutionTransition playMoodTransition applyIdleClasses getSpriteFormat initAds tryShowInterstitial captureDeathSnapshot; do
  if rg -q "$sym" js/ 2>/dev/null; then ok "$sym"; else bad "missing $sym"; fi
done
rg -q 'getVariantDescription' js/encyclopedia.js && ok 'encyclopedia descriptions' || bad 'encyclopedia descriptions'
rg -q 'SLEEP_TOGGLE_GUARD_MS' js/actions.js && ok 'sleep toggle guard' || bad 'sleep toggle guard'
rg -q 'lastActionAtByKey' js/actions.js && ok 'per-action cooldown' || bad 'per-action cooldown'
rg -q 'pet-mood-fallback' js/ui.js && ok 'mood fallback selector' || bad 'mood fallback selector'
rg -q 'scene === "gameover"' js/storeCapture.js && ok 'store capture gameover' || bad 'store capture gameover'

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
for cls in pet-area--sleeping evolvePop moodFade careFxFeed idleBob prefers-reduced-motion new-pet-fab actions--care-blocked action-label action-icon reward-prompt-btn overlay-btn--reward; do
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
