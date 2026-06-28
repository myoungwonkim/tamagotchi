#!/usr/bin/env python3
"""스피커 ON/OFF 아이콘 시안 — 직관적 디자인 비교용 (스테이징)."""

from pathlib import Path

from generate_all_sprites import (
    ACCENT,
    ACCENT2,
    GLOW,
    K,
    MUTE_SLASH,
    MUTED,
    PAPER,
    PAPER2,
    _arc_pts,
    blank,
    draw_line,
    draw_poly,
    fill_ellipse,
    px,
    save_grid,
    sprite_sound_off,
    sprite_sound_on,
)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "speaker-icon-preview"


def draw_speaker_box_cone(g, ox=6, oy=10, body_w=6, body_h=12, cone_tip=20, fill=PAPER, fill2=PAPER2):
    """클래식 스피커 — 왼쪽 사각형 + 오른쪽 삼각형."""
    x0, y0 = ox, oy
    x1, y1 = ox + body_w, oy + body_h
    draw_poly(g, [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], fill, K)
    mid = (y0 + y1) // 2
    draw_poly(g, [(x1, y0), (cone_tip, mid - 1), (cone_tip, mid + 1), (x1, y1)], fill2, K)
    for y in range(y0 + 2, y1 - 1, 3):
        px(g, x0 + 2, y, fill2)


def draw_waves_right(g, cx=21, cy=16, *, bright=True, count=2):
    cols = (GLOW, ACCENT, ACCENT2) if bright else (MUTED, MUTED, MUTED)
    radii = (3, 5, 7)[:count]
    for r, col in zip(radii, cols):
        for x, y in _arc_pts(cx, cy, r, -55, 55):
            px(g, x, y, col)


def draw_volume_bars(g, x0=17, cy=16, *, bright=True):
    heights = (5, 9, 13)
    cols = (ACCENT2, ACCENT, GLOW) if bright else (MUTED, MUTED, MUTED)
    for i, (h, col) in enumerate(zip(heights, cols)):
        x = x0 + i * 4
        for dy in range(h):
            px(g, x, cy - h // 2 + dy, col)
            px(g, x + 1, cy - h // 2 + dy, col)


def draw_mute_slash(g, x0=17, y0=9, x1=28, y1=23):
    draw_line(g, x0, y0, x1, y1, MUTE_SLASH)
    draw_line(g, x0 + 1, y0, x1 + 1, y1, (160, 72, 64, 255))
    px(g, x0 - 1, y0 - 1, K)
    px(g, x1 + 1, y1 + 1, K)


def draw_mute_x(g, cx=22, cy=16, r=5):
    for d in range(-r, r + 1):
        px(g, cx + d, cy + d, MUTE_SLASH)
        px(g, cx + d, cy - d, MUTE_SLASH)
    draw_line(g, cx - r, cy - r, cx + r, cy + r, MUTE_SLASH)
    draw_line(g, cx - r, cy + r, cx + r, cy - r, MUTE_SLASH)


# ── A: 현재 (함체 인터컴) ─────────────────────────────────────────────
def variant_current_on():
    return sprite_sound_on()


def variant_current_off():
    return sprite_sound_off()


# ── B: 클래식 스피커 + 파동 (가장 보편적) ─────────────────────────────
def variant_classic_on():
    g = blank()
    draw_speaker_box_cone(g)
    draw_waves_right(g, cx=22, cy=16, bright=True, count=3)
    px(g, 8, 12, ACCENT)
    return g


def variant_classic_off():
    g = blank()
    draw_speaker_box_cone(g, fill=MUTED, fill2=MUTED)
    draw_waves_right(g, cx=22, cy=16, bright=False, count=3)
    draw_mute_slash(g)
    return g


# ── C: 스피커 + 볼륨 막대 (크기 직관) ─────────────────────────────────
def variant_bars_on():
    g = blank()
    draw_speaker_box_cone(g, ox=5, oy=11, body_w=5, body_h=10, cone_tip=14)
    draw_volume_bars(g, x0=17, cy=16, bright=True)
    px(g, 7, 13, GLOW)
    return g


def variant_bars_off():
    g = blank()
    draw_speaker_box_cone(g, ox=5, oy=11, body_w=5, body_h=10, cone_tip=14, fill=MUTED, fill2=MUTED)
    draw_volume_bars(g, x0=17, cy=16, bright=False)
    draw_mute_slash(g, x0=16, y0=10, x1=27, y1=22)
    return g


# ── D: 굵은 실루엣 + 큰 파동 (작은 헤더에서도 잘 보임) ───────────────
def variant_bold_on():
    g = blank()
    draw_poly(g, [(5, 9), (12, 9), (12, 23), (5, 23)], PAPER, K)
    draw_poly(g, [(12, 9), (21, 14), (21, 18), (12, 23)], PAPER2, K)
    for y in (11, 15, 19):
        px(g, 7, y, ACCENT2)
        px(g, 8, y, ACCENT2)
    for r, col in ((4, GLOW), (7, ACCENT), (10, ACCENT2)):
        for x, y in _arc_pts(23, 16, r, -60, 60):
            px(g, x, y, col)
            if r < 10:
                px(g, x, y - 1, col)
    return g


def variant_bold_off():
    g = blank()
    draw_poly(g, [(5, 9), (12, 9), (12, 23), (5, 23)], MUTED, K)
    draw_poly(g, [(12, 9), (21, 14), (21, 18), (12, 23)], MUTED, K)
    for r in (4, 7, 10):
        for x, y in _arc_pts(23, 16, r, -60, 60, step=2):
            px(g, x, y, (72, 84, 96, 255))
    draw_mute_slash(g, x0=18, y0=8, x1=29, y1=24)
    return g


# ── E: 메가폰 (소리 방향이 명확) ───────────────────────────────────────
def variant_horn_on():
    g = blank()
    draw_poly(g, [(6, 14), (10, 10), (10, 22), (6, 18)], PAPER, K)
    draw_poly(g, [(10, 10), (24, 6), (24, 26), (10, 22)], PAPER2, K)
    draw_line(g, 11, 12, 22, 9, ACCENT2)
    draw_line(g, 11, 20, 22, 23, ACCENT2)
    for i, col in enumerate((GLOW, ACCENT, ACCENT2)):
        y = 12 + i * 4
        for x in range(25, 29 - i):
            px(g, x, y, col)
            px(g, x, y + 1, col)
    return g


def variant_horn_off():
    g = blank()
    draw_poly(g, [(6, 14), (10, 10), (10, 22), (6, 18)], MUTED, K)
    draw_poly(g, [(10, 10), (24, 6), (24, 26), (10, 22)], MUTED, K)
    for i in range(3):
        y = 12 + i * 4
        for x in range(25, 27):
            px(g, x, y, (72, 84, 96, 255))
    draw_mute_slash(g, x0=14, y0=7, x1=28, y1=25)
    return g


# ── F: 벨 + 취소선 (알림음 연상) ─────────────────────────────────────
def variant_bell_on():
    g = blank()
    fill_ellipse(g, 16, 14, 8, 7, PAPER2, K)
    draw_poly(g, [(8, 14), (24, 14), (22, 22), (10, 22)], PAPER, K)
    draw_line(g, 10, 22, 22, 22, ACCENT2)
    px(g, 16, 23, PAPER)
    px(g, 15, 24, PAPER2)
    px(g, 17, 24, PAPER2)
    px(g, 16, 25, K)
    for x, y in _arc_pts(24, 15, 4, -40, 40):
        px(g, x, y, GLOW)
    for x, y in _arc_pts(25, 15, 6, -35, 35):
        px(g, x, y, ACCENT)
    return g


def variant_bell_off():
    g = blank()
    fill_ellipse(g, 16, 14, 8, 7, MUTED, K)
    draw_poly(g, [(8, 14), (24, 14), (22, 22), (10, 22)], MUTED, K)
    px(g, 16, 23, MUTED)
    px(g, 16, 25, K)
    draw_mute_slash(g, x0=10, y0=8, x1=26, y1=24)
    return g


VARIANTS = [
    {
        "id": "current",
        "name": "A · 현재",
        "desc": "함체 인터컴 + 소나 파동 — 테마는 맞지만 스피커로 안 읽힘",
        "on": variant_current_on,
        "off": variant_current_off,
        "tag": "현재",
    },
    {
        "id": "classic",
        "name": "B · 클래식",
        "desc": "▶︎ 스피커 몸체 + 소리 파동 — 앱·OS에서 가장 흔한 패턴",
        "on": variant_classic_on,
        "off": variant_classic_off,
        "tag": "추천",
    },
    {
        "id": "bars",
        "name": "C · 볼륨 막대",
        "desc": "스피커 + 세로 막대 — 소리 크기·켜짐이 한눈에 구분",
        "on": variant_bars_on,
        "off": variant_bars_off,
        "tag": "추천",
    },
    {
        "id": "bold",
        "name": "D · 굵은 실루엣",
        "desc": "큰 스피커 + 굵은 파동 — 28px 헤더에서 가독성 최우선",
        "on": variant_bold_on,
        "off": variant_bold_off,
        "tag": "",
    },
    {
        "id": "horn",
        "name": "E · 메가폰",
        "desc": "확성기 형태 — 소리가 나가는 방향이 직관적",
        "on": variant_horn_on,
        "off": variant_horn_off,
        "tag": "",
    },
    {
        "id": "bell",
        "name": "F · 벨",
        "desc": "알림 벨 + 파동 — 효과음·알림음 연상 (게임 SFX에도 어울림)",
        "on": variant_bell_on,
        "off": variant_bell_off,
        "tag": "",
    },
]


def build_html():
  cards = []
  for v in VARIANTS:
    tag = f'<span class="tag">{v["tag"]}</span>' if v["tag"] else ""
    cards.append(f"""
    <section class="variant" id="{v['id']}">
      <div class="variant__head">
        <h2>{v['name']}{tag}</h2>
        <p>{v['desc']}</p>
      </div>
      <div class="pair">
        <figure>
          <img src="variants/{v['id']}/on.png" width="96" height="96" alt="">
          <figcaption>소리 켜짐</figcaption>
        </figure>
        <figure>
          <img src="variants/{v['id']}/off.png" width="96" height="96" alt="">
          <figcaption>소리 꺼짐 (음소거)</figcaption>
        </figure>
      </div>
      <div class="phones">
        <div>
          <div class="label-row"><span>소리 ON</span></div>
          <div class="phone"><div class="phone__inner"><div class="header-mock">
            <button type="button" class="icon-btn icon-btn--left" disabled><img src="../header-icons-preview/encyclopedia.png" alt=""></button>
            <button type="button" class="icon-btn icon-btn--right" disabled><img src="variants/{v['id']}/on.png" alt=""></button>
            <p class="pet-name">치치</p><p class="pet-meta">3일째 · 성체</p>
          </div></div></div>
        </div>
        <div>
          <div class="label-row"><span>소리 OFF</span></div>
          <div class="phone"><div class="phone__inner"><div class="header-mock">
            <button type="button" class="icon-btn icon-btn--left" disabled><img src="../header-icons-preview/encyclopedia.png" alt=""></button>
            <button type="button" class="icon-btn icon-btn--right" disabled><img src="variants/{v['id']}/off.png" alt=""></button>
            <p class="pet-name">치치</p><p class="pet-meta">3일째 · 성체</p>
          </div></div></div>
        </div>
      </div>
    </section>""")

  return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#1a2838">
  <title>스피커 아이콘 시안</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      background: #101820; color: #c8d4dc;
      padding: 20px 14px 48px; line-height: 1.5;
    }}
    .wrap {{ max-width: 420px; margin: 0 auto; }}
    h1 {{ font-size: 1.0625rem; color: #eef4f8; margin-bottom: 6px; }}
    .lead {{ font-size: 0.75rem; color: #7a8898; margin-bottom: 16px; }}
    .notice {{
      background: #1a2838; border: 1px solid #3a5060; border-radius: 8px;
      padding: 12px 14px; font-size: 0.6875rem; color: #98a8b8; margin-bottom: 20px;
    }}
    .notice strong {{ color: #58b8c8; }}
    .toc {{
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;
    }}
    .toc a {{
      font-size: 0.6875rem; padding: 5px 10px; border-radius: 999px;
      border: 1px solid #3a5060; color: #98b0c0; text-decoration: none;
      background: #1a2838;
    }}
    .toc a:hover {{ border-color: #58b8c8; color: #d8e4ec; }}
    .variant {{
      background: #1a2838; border: 1px solid #3a5060; border-radius: 12px;
      padding: 14px; margin-bottom: 16px;
    }}
    .variant__head h2 {{
      font-size: 0.875rem; color: #eef4f8; margin-bottom: 4px;
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }}
    .variant__head p {{ font-size: 0.6875rem; color: #7a8898; margin-bottom: 12px; }}
    .tag {{
      font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.04em;
      padding: 2px 7px; border-radius: 4px;
      background: rgba(88,184,200,.18); color: #58b8c8; border: 1px solid rgba(88,184,200,.35);
    }}
    .tag:empty {{ display: none; }}
    .pair {{
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;
    }}
    figure {{
      text-align: center; background: #243040; border-radius: 8px; padding: 10px 6px;
      border: 1px solid #2a3848;
    }}
    figure img {{ image-rendering: pixelated; }}
    figcaption {{ font-size: 0.625rem; color: #88a0b0; margin-top: 6px; }}
    .phones {{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }}
    .phone {{
      background: #142030; border: 1px solid #2a3848; border-radius: 12px; overflow: hidden;
    }}
    .phone__inner {{ padding: 8px 6px 10px; }}
    .header-mock {{
      position: relative; text-align: center; padding: 2px 40px 8px; min-height: 48px;
    }}
    .icon-btn {{
      position: absolute; top: 0; width: 40px; height: 40px;
      border: 1px solid rgba(88, 184, 200, 0.4); border-radius: 10px;
      background: #304858; display: flex; align-items: center; justify-content: center;
    }}
    .icon-btn--left {{ left: 0; }}
    .icon-btn--right {{ right: 0; }}
    .icon-btn img {{ width: 28px; height: 28px; image-rendering: pixelated; }}
    .pet-name {{ font-size: 0.9375rem; font-weight: 700; color: #d8e4ec; }}
    .pet-meta {{ font-size: 0.625rem; color: #7a8a98; margin-top: 1px; }}
    .label-row {{ font-size: 0.5625rem; color: #6a7888; margin-bottom: 4px; text-align: center; }}
    .stamp {{
      display: inline-block; margin-top: 8px; padding: 4px 10px;
      background: #3a5060; color: #98b0c0; font-size: 0.5625rem; font-weight: 700;
      border-radius: 4px;
    }}
    footer {{ text-align: center; font-size: 0.6875rem; color: #6a7888; margin-top: 20px; }}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>스피커 아이콘 시안</h1>
    <p class="lead">32×32 픽셀 · 헤더 28px 표시 · <strong>스테이징 전용</strong></p>
    <div class="notice">
      <strong>문제</strong> — 현재 아이콘은 원형 함체+소나 파동이라 스피커로 잘 안 읽힘.<br>
      <strong>목표</strong> — ON/OFF 상태가 직관적으로 구분되는 디자인 후보 비교.
    </div>
    <nav class="toc">
      {"".join(f'<a href="#{v["id"]}">{v["name"]}</a>' for v in VARIANTS)}
    </nav>
    {"".join(cards)}
    <footer>
      재생성: <code>python3 scripts/generate_speaker_icon_drafts.py</code><br>
      <span class="stamp">STAGING ONLY</span>
    </footer>
  </div>
</body>
</html>"""


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for v in VARIANTS:
        d = OUT / "variants" / v["id"]
        d.mkdir(parents=True, exist_ok=True)
        save_grid(v["on"](), d / "on.png")
        save_grid(v["off"](), d / "off.png")
    html = build_html()
    (OUT / "index.html").write_text(html, encoding="utf-8")
    print(f"Generated {len(VARIANTS)} speaker icon variants -> {OUT}")
    print(f"Preview -> {OUT / 'index.html'}")


if __name__ == "__main__":
    main()
