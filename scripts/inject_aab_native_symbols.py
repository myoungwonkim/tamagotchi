#!/usr/bin/env python3
"""Copy merged .so files into an unsigned AAB as Play native debug symbols."""
from __future__ import annotations

import sys
import zipfile
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: inject_aab_native_symbols.py <aab> <merged-lib-dir>", file=sys.stderr)
        return 2
    aab = Path(sys.argv[1])
    libs = Path(sys.argv[2])
    if not aab.is_file() or not libs.is_dir():
        print(f"missing aab or libs: {aab} {libs}", file=sys.stderr)
        return 1

    prefix = "BUNDLE-METADATA/com.android.tools.build.debugsymbols/"
    tmp = aab.with_suffix(".inject.aab")
    added = 0
    with zipfile.ZipFile(aab, "r") as zin, zipfile.ZipFile(tmp, "w") as zout:
        for info in zin.infolist():
            if info.filename.startswith(prefix):
                continue
            zout.writestr(info, zin.read(info.filename), compress_type=info.compress_type)
        for so in sorted(libs.rglob("*.so")):
            rel = so.relative_to(libs).as_posix()
            dest = prefix + rel
            zout.write(so, dest, compress_type=zipfile.ZIP_DEFLATED)
            added += 1
    tmp.replace(aab)
    print(f"injected {added} native symbol libs into {aab}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
