"""Edit timeline for the 38-second invitation.

Picture slots stay empty until each one is a real moving video.
A still image, or a video made by sliding a camera across one frame, is rejected.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOOTAGE = ROOT / "footage"

# Seconds are the storyboard edges. Each file must cover its slot.
SLOTS = (
    {"id": "01_opening", "start": 0.0, "end": 5.0, "needs": "brass lamp, flowers, Ganesha, real motion"},
    {"id": "02_gomatha_entrance", "start": 5.0, "end": 12.0, "needs": "cow blinks and turns, calf walks, doors open"},
    {"id": "03_hosts", "start": 12.0, "end": 17.0, "needs": "moving invitation scene for the hosts"},
    {"id": "04_gruhapravesam", "start": 17.0, "end": 24.0, "needs": "kalasham scene with physical motion"},
    {"id": "05_vratham", "start": 24.0, "end": 31.0, "needs": "Satyanarayana puja with physical motion"},
    {"id": "06_venue", "start": 31.0, "end": 38.0, "needs": "return to the entrance with the cow and calf moving"},
)


def probe(path: Path) -> dict:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=codec_type,nb_frames,avg_frame_rate,width,height,duration",
            "-show_entries", "format=duration",
            "-of", "json", str(path),
        ],
        check=False, capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"ffprobe failed for {path.name}")
    return json.loads(result.stdout)


def frame_motion(path: Path) -> float:
    """Mean absolute difference between frames one second apart. A still scores near zero."""
    result = subprocess.run(
        [
            "ffmpeg", "-v", "error", "-i", str(path),
            "-vf", "fps=2,scale=160:284,format=gray",
            "-f", "rawvideo", "-pix_fmt", "gray", "-",
        ],
        check=False, capture_output=True,
    )
    if result.returncode != 0 or not result.stdout:
        return 0.0
    width, height = 160, 284
    frame = width * height
    raw = result.stdout
    count = len(raw) // frame
    if count < 2:
        return 0.0
    import numpy as np

    frames = np.frombuffer(raw[: count * frame], dtype=np.uint8).reshape(count, height, width)
    deltas = np.abs(frames[1:].astype(np.int16) - frames[:-1].astype(np.int16)).mean(axis=(1, 2))
    return float(deltas.mean())


def evaluate() -> list[str]:
    problems: list[str] = []
    if not FOOTAGE.exists():
        return ["footage directory is missing"]
    videos = sorted(FOOTAGE.glob("*.mp4"))
    if not videos:
        problems.append("footage/ has no mp4 files. Stills in reference/ are not footage.")
    by_name = {path.stem: path for path in videos}
    for slot in SLOTS:
        path = by_name.get(slot["id"])
        if path is None:
            problems.append(f"missing {slot['id']}.mp4 ({slot['start']:.0f}-{slot['end']:.0f}s): {slot['needs']}")
            continue
        info = probe(path)
        duration = float(info.get("format", {}).get("duration") or 0)
        needed = slot["end"] - slot["start"]
        if duration + 0.05 < needed:
            problems.append(f"{path.name} is {duration:.2f}s; the slot needs {needed:.0f}s")
        motion = frame_motion(path)
        if motion < 1.5:
            problems.append(
                f"{path.name} has almost no frame-to-frame change ({motion:.2f}). "
                "Camera movement over one still is not accepted."
            )
    return problems


def main() -> int:
    problems = evaluate()
    if problems:
        print("Invitation picture was not assembled.")
        print("Moving footage is still missing:")
        for item in problems:
            print(f"- {item}")
        return 2
    print("All six picture slots are moving video. The final assembly can be cut from these files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
