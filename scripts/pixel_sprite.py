#!/usr/bin/env python3
"""Upscale indexed pixel grids to PNG sprites (Famicom / 90s retro style)."""

from pathlib import Path

from PIL import Image

# Shared retro palette
PALETTE = {
    ".": (0, 0, 0, 0),       # transparent
    "K": (45, 42, 38, 255),  # outline
    "W": (255, 255, 255, 255),
    "C": (255, 243, 214, 255),  # cream body
    "L": (255, 239, 184, 255),  # light yellow
    "S": (232, 196, 160, 255),  # speckle
    "T": (245, 216, 154, 255),  # tan speckle
    "D": (210, 180, 130, 255),  # shadow
}


def grid_to_png(rows, out_path, scale=4):
    h = len(rows)
    w = len(rows[0])
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            px[x, y] = PALETTE.get(ch, (255, 0, 255, 255))
    size = w * scale
    img = img.resize((size, size), Image.NEAREST)
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG")
    return out_path


# 32×32 Famicom-style egg — limited palette, 1px outline, flat highlight
EGG_PIXELS = [
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    ".............KKKK...............",
    "............KWWCCK..............",
    "...........KWWCCCCCK............",
    "..........KCCCCCCCCCK...........",
    ".........KCCWWCCCCCCCK..........",
    "........KCCCCCCCCCCCCCK.........",
    ".......KCCCCCCCCCCCCCCCK........",
    "......KCCCCCCCCCCCCCCCCCK.......",
    ".....KCCCCCCCCCCCCCCCCCCCK......",
    ".....KCCCCCCCCCCCCCCCCCCCK......",
    "....KCCCCCCCCCCCCCCCCCCCCCK.....",
    "....KCCCCCCCCCCCCCCCCCCCCCK.....",
    "....KCCCCCCSCCCCCCCCCCCCCK......",
    "....KCCCCCCCCCCCTCCCCCCCCK......",
    "....KCCCCCCCCCCCCCCCCCCCCCK.....",
    ".....KCCCCCCCCCCCCCCCCCCCK......",
    ".....KCCCCCCCCCCCCCCCCCCCK......",
    "......KCCCCCCCCCCCCCCCCCK.......",
    "......KCCCCCCCCCCCCCCCDCK.......",
    ".......KCCCCCCCCCCCCCCCK........",
    "........KCCCCCCCCCCCCCK.........",
    ".........KCCCCCCCCCCCK..........",
    "..........KCCCCCCCCCK...........",
    "...........KCCCCCCCK............",
    "............KCCCCCK.............",
    ".............KKKKK..............",
    "................................",
]

if __name__ == "__main__":
    import sys

    name = sys.argv[1] if len(sys.argv) > 1 else "egg"
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(f".sprite-staging/evolution/{name}.png")
    scale = int(sys.argv[3]) if len(sys.argv) > 3 else 8  # 32×8 = 256
    grids = {"egg": EGG_PIXELS}
    grid_to_png(grids[name], out, scale=scale)
    print(out)
