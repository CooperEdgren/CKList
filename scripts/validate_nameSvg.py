#!/usr/bin/env python3
"""Validate that each nameSvg referenced in channels.json exists on disk.

Usage: python3 scripts/validate_nameSvg.py
"""
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
cfg = ROOT / 'channels.json'

def main():
    if not cfg.exists():
        print('channels.json not found at', cfg)
        return 2
    data = json.loads(cfg.read_text())
    channels = data.get('channels', [])
    missing = []
    for ch in channels:
        ns = ch.get('nameSvg')
        if not ns:
            print(f"{ch.get('number','?')}: no nameSvg field (will use text fallback)")
            continue
        # make path absolute (allow leading /)
        p = ROOT / ns.lstrip('/')
        if not p.exists():
            missing.append((ch.get('number'), ns, str(p)))
    if not missing:
        print('All nameSvg files exist on disk.')
        return 0
    print('\nMissing nameSvg files:')
    for num, ns, p in missing:
        print(f' - channel {num}: {ns} -> {p} (MISSING)')
    return 1

if __name__ == '__main__':
    raise SystemExit(main())
