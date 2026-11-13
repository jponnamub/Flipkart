"""Cut the six rendered scenes into the 38-second film: dissolves, Telugu cards, score.

Every picture frame comes from the Blender renders in build/frames/sN/. Nothing here moves a still.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from overlays import CARDS, OUT as OVERLAYS  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
FRAMES = ROOT / "build" / "frames"
OUTPUT = ROOT / "output"
SCORE = OUTPUT / "score.wav"
FPS = 30
XF = 0.5
# scene: (frames rendered, start of the scene in the film)
SCENES = {1: (165, 0.0), 2: (255, 5.0), 3: (165, 13.0), 4: (225, 18.0), 5: (225, 25.0), 6: (180, 32.0)}
DURATION = 38.0


def check_frames():
    for sc, (n, _) in SCENES.items():
        have = len(list((FRAMES / f"s{sc}").glob(f"s{sc}_*.png")))
        if have < n:
            raise SystemExit(f"scene {sc}: {have}/{n} frames rendered")


def build(out: Path, width: int, crf: int, preset: str):
    args = ["ffmpeg", "-y", "-v", "error", "-stats"]
    for sc in SCENES:
        args += ["-framerate", str(FPS), "-i", str(FRAMES / f"s{sc}" / f"s{sc}_%04d.png")]
    for name, *_ in CARDS:
        args += ["-loop", "1", "-framerate", str(FPS), "-t", str(DURATION), "-i", str(OVERLAYS / f"{name}.png")]
    args += ["-i", str(SCORE)]
    height = width * 16 // 9

    f = []
    for i in range(len(SCENES)):
        f.append(f"[{i}:v]scale={width}:{height}:flags=lanczos,setsar=1,format=yuv420p,fps={FPS}[v{i}]")
    prev = "v0"
    for i in range(1, len(SCENES)):
        offset = SCENES[i + 1][1]
        f.append(f"[{prev}][v{i}]xfade=transition=fade:duration={XF}:offset={offset}[x{i}]")
        prev = f"x{i}"
    f.append(f"[{prev}]trim=duration={DURATION},setpts=PTS-STARTPTS,format=yuva420p[base]")
    prev = "base"
    for k, (name, t0, t1, *_rest) in enumerate(CARDS):
        idx = len(SCENES) + k
        fin, fout = 0.6, 0.5 if t1 < DURATION else 0.0
        chain = f"[{idx}:v]scale={width}:{height},format=rgba,fade=t=in:st={t0}:d={fin}:alpha=1"
        if fout:
            chain += f",fade=t=out:st={t1 - fout}:d={fout}:alpha=1"
        f.append(chain + f"[o{k}]")
        rise = int(height * 0.012)
        f.append(f"[{prev}][o{k}]overlay=x=0:y='{rise}*max(0,1-(t-{t0})/0.9)':enable='between(t,{t0},{t1})'[b{k}]")
        prev = f"b{k}"
    f.append(f"[{prev}]fade=t=in:st=0:d=0.6,fade=t=out:st={DURATION - 1.0}:d=1.0,format=yuv420p[vout]")
    a_idx = len(SCENES) + len(CARDS)
    f.append(f"[{a_idx}:a]atrim=duration={DURATION},afade=t=out:st={DURATION - 1.6}:d=1.6[aout]")

    args += ["-filter_complex", ";".join(f), "-map", "[vout]", "-map", "[aout]",
             "-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-profile:v", "high", "-pix_fmt", "yuv420p",
             "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart",
             "-t", str(DURATION), str(out)]
    subprocess.run(args, check=True)
    print("wrote", out)


def main():
    check_frames()
    OUTPUT.mkdir(exist_ok=True)
    build(OUTPUT / "Gruhapravesam_Final_Invitation.mp4", 1080, 17, "slow")
    build(OUTPUT / "Gruhapravesam_Invitation_Mobile_720p.mp4", 720, 23, "medium")


if __name__ == "__main__":
    main()
