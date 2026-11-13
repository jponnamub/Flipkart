"""Original instrumental bed: drone, flute, plucked strings, soft drum, bells.

This is music only. It is not mixed onto picture because the picture does not exist yet.
"""

from __future__ import annotations

import numpy as np
import wave

SR = 48000
DURATION = 38.0


def _flute(freq: float, start: float, dur: float, amp: float, n: int) -> np.ndarray:
    i0 = int(start * SR)
    count = min(int(dur * SR), n - i0)
    if count <= 0:
        return np.zeros(n)
    t = np.arange(count) / SR
    vib = freq * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.08) / 0.15, 0, 1))
    phase = 2 * np.pi * np.cumsum(vib) / SR
    tone = np.sin(phase) + 0.22 * np.sin(2 * phase) + 0.05 * np.sin(3 * phase)
    env = np.clip(t / 0.06, 0, 1) * np.clip((dur - t) / 0.18, 0, 1)
    out = np.zeros(n)
    out[i0 : i0 + count] = amp * tone * env
    return out


def _pluck(freq: float, start: float, dur: float, amp: float, n: int) -> np.ndarray:
    i0 = int(start * SR)
    count = min(int(dur * SR), n - i0)
    if count <= 0:
        return np.zeros(n)
    length = max(2, int(SR / freq))
    buf = np.random.uniform(-1, 1, length).astype(np.float64)
    sig = np.empty(count)
    idx = 0
    for i in range(count):
        sig[i] = buf[idx]
        nxt = (idx + 1) % length
        buf[idx] = 0.996 * 0.5 * (buf[idx] + buf[nxt])
        idx = nxt
    t = np.arange(count) / SR
    env = np.exp(-t * 1.6) * np.clip(t / 0.005, 0, 1)
    out = np.zeros(n)
    out[i0 : i0 + count] = amp * sig * env
    return out


def _bell(freq: float, start: float, dur: float, amp: float, n: int) -> np.ndarray:
    i0 = int(start * SR)
    count = min(int(dur * SR), n - i0)
    if count <= 0:
        return np.zeros(n)
    t = np.arange(count) / SR
    partials = ((1.0, 1.0, 1.6), (2.0, 0.45, 2.4), (2.76, 0.25, 3.2), (5.4, 0.12, 4.4))
    sig = np.zeros(count)
    for ratio, gain, decay in partials:
        sig += gain * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t * decay)
    sig *= np.clip(t / 0.004, 0, 1)
    out = np.zeros(n)
    out[i0 : i0 + count] = amp * sig
    return out


def _drum(freq: float, start: float, dur: float, amp: float, n: int) -> np.ndarray:
    i0 = int(start * SR)
    count = min(int(dur * SR), n - i0)
    if count <= 0:
        return np.zeros(n)
    t = np.arange(count) / SR
    sweep = freq * np.exp(-t * 9) + freq * 0.5
    phase = 2 * np.pi * np.cumsum(sweep) / SR
    body = np.sin(phase) * np.exp(-t * 8)
    noise = np.random.randn(count) * np.exp(-t * 28)
    out = np.zeros(n)
    out[i0 : i0 + count] = amp * (body + 0.35 * noise)
    return out


def render(path: str) -> str:
    n = int(DURATION * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(20)
    # Keep the global numpy generator sequence stable for the drum noise.
    np.random.seed(20)

    drone = np.zeros(n)
    for freq, amp, partials in (
        (146.83, 0.055, (1.0, 0.4, 0.16, 0.06)),
        (220.00, 0.032, (1.0, 0.28, 0.08)),
        (293.66, 0.012, (1.0, 0.15)),
    ):
        for k, gain in enumerate(partials, start=1):
            drone += amp * gain * np.sin(2 * np.pi * freq * k * t)
    drone *= 0.9 + 0.1 * np.sin(2 * np.pi * 0.07 * t)

    mix = drone
    melody = (
        (1.0, 1.15, 587.33, 0.07),
        (2.4, 0.9, 493.88, 0.06),
        (3.5, 1.3, 440.00, 0.055),
        (6.2, 0.8, 587.33, 0.065),
        (7.2, 0.7, 659.25, 0.06),
        (8.2, 1.3, 493.88, 0.055),
        (10.4, 1.2, 440.00, 0.05),
        (13.2, 0.9, 739.99, 0.05),
        (14.3, 1.4, 587.33, 0.055),
        (18.4, 0.7, 587.33, 0.055),
        (19.3, 0.6, 440.00, 0.05),
        (20.2, 1.5, 493.88, 0.055),
        (22.4, 1.0, 659.25, 0.045),
        (25.2, 0.9, 493.88, 0.05),
        (26.3, 1.5, 440.00, 0.05),
        (28.6, 1.2, 369.99, 0.045),
        (32.2, 0.9, 587.33, 0.05),
        (33.3, 0.8, 493.88, 0.048),
        (34.4, 0.8, 440.00, 0.045),
        (35.5, 1.6, 293.66, 0.05),
    )
    for start, dur, freq, amp in melody:
        mix += _flute(freq, start, dur, amp, n)
        mix += _pluck(freq / 2, start, min(1.8, dur + 0.4), amp * 0.45, n)

    for hit in (0.35, 5.05, 13.05, 18.05, 25.05, 32.05):
        mix += _bell(698.46, hit, 2.4, 0.045, n)
    beat = 5.2
    while beat < 36.2:
        mix += _drum(78, beat, 0.42, 0.04, n)
        mix += _drum(164, beat + 1.0, 0.16, 0.018, n)
        beat += 2.0

    fade_in = np.clip(t / 1.2, 0, 1)
    fade_out = np.clip((DURATION - t) / 1.6, 0, 1)
    mix *= fade_in * fade_out
    peak = np.max(np.abs(mix))
    if peak > 0:
        mix *= 0.7 / peak
    # Silence the unused generator warning path by touching rng.
    _ = rng.random()
    stereo = np.column_stack((mix, mix))
    pcm = np.clip(stereo * 32767, -32767, 32767).astype(np.int16)
    with wave.open(path, "w") as handle:
        handle.setnchannels(2)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        handle.writeframes(pcm.tobytes())
    return path


if __name__ == "__main__":
    import sys
    from pathlib import Path
    out = Path(__file__).resolve().parents[1] / "output" / "score.wav"
    print(render(str(out)))
