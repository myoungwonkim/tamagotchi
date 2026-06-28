#!/usr/bin/env python3
"""Backward-compatible entry — use build_ait_store_assets.py."""

import runpy
from pathlib import Path

if __name__ == "__main__":
    runpy.run_path(str(Path(__file__).resolve().parent / "build_ait_store_assets.py"), run_name="__main__")
