#!/usr/bin/env bash
# Verify apex Pages assemble locally, and optionally check live content-types.
#
# Usage:
#   bash scripts/verify-apex-deploy.sh           # local _site only
#   bash scripts/verify-apex-deploy.sh --live    # local + https://nolsoopgames.com
#   bash scripts/verify-apex-deploy.sh --serve   # assemble then http.server :4180
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

LIVE=0
SERVE=0
for arg in "$@"; do
  case "$arg" in
    --live) LIVE=1 ;;
    --serve) SERVE=1 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown arg: $arg" >&2
      exit 2
      ;;
  esac
done

bash scripts/assemble_apex_site.sh "$ROOT/_site"

fail=0
need() {
  local path="$1"
  if [ ! -e "$ROOT/_site/$path" ]; then
    echo "MISSING _site/$path" >&2
    fail=1
  else
    echo "ok  _site/$path"
  fi
}

echo "== Local artifact =="
need index.html
need about.html
need privacy.html
need terms.html
need robots.txt
need sitemap.xml
need ads.txt
need app-ads.txt
need favicon.ico
need CNAME
need assets/brand/favicon-32.png
need assets/brand/apple-touch-icon.png
need assets/js/gaConsent.js
need assets/js/site-i18n.js
need assets/css/site.css
need notion/index.html
need abysspet/index.html

# robots must point at apex sitemap; sitemap must be real XML (not HTML)
if ! grep -q 'Sitemap: https://nolsoopgames.com/sitemap.xml' "$ROOT/_site/robots.txt"; then
  echo "BAD  robots.txt missing Sitemap line" >&2
  fail=1
else
  echo "ok  robots.txt Sitemap line"
fi
if ! head -1 "$ROOT/_site/sitemap.xml" | grep -q 'xml'; then
  echo "BAD  sitemap.xml does not look like XML" >&2
  fail=1
else
  echo "ok  sitemap.xml looks like XML"
fi

check_live() {
  local path="$1"
  local expect_ct="$2" # substring match; use "html" for real HTML pages
  local url="https://nolsoopgames.com${path}?cb=${RANDOM}"
  local headers code ct
  headers="$(/usr/bin/curl -sL -D - -o /tmp/nolsoop-verify-body -w '%{http_code}' "$url" || true)"
  code="${headers: -3}"
  ct="$(printf '%s' "$headers" | /usr/bin/awk -F': ' 'tolower($1)=="content-type"{print $2; exit}' | /usr/bin/tr -d '\r')"
  if [ -z "$ct" ]; then
    echo "FAIL live $path → no content-type (code=$code)" >&2
    fail=1
    return
  fi
  # SPA / Pages fallback: missing *asset* often returns 200 text/html
  if [[ "$expect_ct" != *html* && "$ct" == text/html* ]]; then
    echo "FAIL live $path → $code $ct (missing or HTML fallback)" >&2
    fail=1
    return
  fi
  if [[ "$ct" != *"$expect_ct"* ]]; then
    echo "FAIL live $path → $code $ct (expected contains '$expect_ct')" >&2
    fail=1
    return
  fi
  echo "ok  live $path → $code $ct"
}

if [ "$LIVE" -eq 1 ]; then
  echo "== Live content-type (cache-busted) =="
  if ! command -v curl >/dev/null; then
    echo "curl required for --live" >&2
    exit 1
  fi
  check_live /robots.txt "text/plain"
  check_live /sitemap.xml "xml"
  check_live /ads.txt "text/plain"
  check_live /app-ads.txt "text/plain"
  check_live /favicon.ico "image/"
  check_live /assets/brand/favicon-32.png "image/"
  check_live /assets/js/gaConsent.js "javascript"
  check_live /assets/css/site.css "css"
  check_live /notion/ "html"
  check_live /about.html "html"
  check_live /privacy.html "html"
fi

if [ "$fail" -ne 0 ]; then
  echo "verify-apex-deploy: FAILED" >&2
  exit 1
fi

echo "verify-apex-deploy: OK"

if [ "$SERVE" -eq 1 ]; then
  echo "Serving _site on http://127.0.0.1:4180/"
  cd "$ROOT/_site"
  exec python3 -m http.server 4180
fi
