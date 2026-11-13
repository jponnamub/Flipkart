#!/usr/bin/env bash
# Render scenes in the given order into build/frames/sN/. Safe to rerun; finished frames are skipped.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BLENDER="${BLENDER:-/opt/blender/blender}"
for sc in "$@"; do
  out="$ROOT/build/frames/s$sc"
  mkdir -p "$out"
  xvfb-run -a -s "-screen 0 1280x1024x24" "$BLENDER" -b -P "$ROOT/blender/scenes.py" -- \
    --scene "$sc" --res 720 --samples 6 --out "$out" > "$ROOT/build/render_s$sc.log" 2>&1
  echo "scene $sc exit $?"
done
