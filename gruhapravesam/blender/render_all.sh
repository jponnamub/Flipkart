#!/usr/bin/env bash
# Render scenes into build/frames/sN/. Arguments are scene numbers, optionally with a frame range: 4:1-112
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BLENDER="${BLENDER:-/opt/blender/blender}"
for job in "$@"; do
  sc="${job%%:*}"
  range=()
  [[ "$job" == *:* ]] && range=(--frames "${job#*:}")
  out="$ROOT/build/frames/s$sc"
  mkdir -p "$out"
  xvfb-run -a -s "-screen 0 1280x1024x24" "$BLENDER" -b -P "$ROOT/blender/scenes.py" -- \
    --scene "$sc" --res 720 --samples 6 --out "$out" "${range[@]}" > "$ROOT/build/render_${job//[:]/_}.log" 2>&1
  echo "$job exit $?"
done
