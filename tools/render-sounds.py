#!/usr/bin/env python3
"""Synthesises Oczko's sound effects into assets/sounds/ (16-bit mono WAV).

    python3 tools/render-sounds.py

Everything is generated here (noise bursts, sine tones): no third-party
recordings or licences. Deterministic: the same files on every run.
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sounds")
rng = np.random.default_rng(21)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(n, attack, decay):
    """Fast attack, exponential decay (seconds)."""
    x = np.arange(n) / SR
    a = np.clip(x / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(x - attack, 0) / decay)


def smooth(x, width):
    """Moving average: a cheap low-pass."""
    k = np.ones(width) / width
    return np.convolve(x, k, mode="same")


def tone(freq, seconds, decay, harmonics=(1.0, 0.35, 0.12)):
    x = t(seconds)
    y = sum(a * np.sin(2 * np.pi * freq * (i + 1) * x) for i, a in enumerate(harmonics))
    return y * env(len(x), 0.004, decay)


def card_snap(seconds=0.09, bright=6):
    """A card sliding onto the cloth: filtered noise with a soft click."""
    n = int(SR * seconds)
    noise = rng.standard_normal(n)
    y = smooth(noise, bright) * env(n, 0.002, 0.025)
    click = np.zeros(n)
    click[: int(SR * 0.004)] = np.hanning(int(SR * 0.004)) * 0.6
    return y + click


def seq(*parts, gap=0.0):
    out = []
    for p in parts:
        out.append(p)
        if gap:
            out.append(np.zeros(int(SR * gap)))
    return np.concatenate(out)


def mix_at(base_len, items):
    y = np.zeros(int(SR * base_len))
    for start, sig in items:
        i = int(SR * start)
        j = min(len(y), i + len(sig))
        y[i:j] += sig[: j - i]
    return y


def save(name, y, gain=0.8):
    y = y / (np.max(np.abs(y)) + 1e-9) * gain
    data = (np.clip(y, -1, 1) * 32767).astype("<i2")
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def main():
    os.makedirs(OUT, exist_ok=True)
    # "Dobieram": one card.
    save("hit.wav", card_snap(), 0.7)
    # The deal: a few quick cards.
    save("deal.wav", mix_at(0.42, [(0.0, card_snap()), (0.11, card_snap()), (0.22, card_snap()), (0.33, card_snap(0.08))]), 0.65)
    # "Starczy": a soft knock on the table.
    knock = tone(180, 0.18, 0.04, (1.0, 0.2)) + smooth(rng.standard_normal(int(SR * 0.18)), 30) * env(int(SR * 0.18), 0.001, 0.02) * 0.5
    save("stand.wav", knock, 0.6)
    # Your turn: a short, light tick.
    save("turn.wav", tone(1320, 0.12, 0.035, (1.0, 0.15)), 0.35)
    # "Fura!": a low falling tone.
    x = t(0.45)
    fall = np.sin(2 * np.pi * (220 - 110 * x / 0.45) * x) * env(len(x), 0.005, 0.18)
    save("bust.wav", fall + 0.3 * tone(110, 0.45, 0.2), 0.75)
    # "Perskie oczko!": a bright rising arpeggio with a shimmer.
    notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    arp = mix_at(1.1, [(i * 0.09, tone(f, 0.7, 0.25)) for i, f in enumerate(notes)])
    shimmer = mix_at(1.1, [(0.45, tone(2093, 0.6, 0.2, (1.0,)) * 0.4)])
    save("persian.wav", arp + shimmer, 0.8)
    # A won round: a two-note chime.
    save("win.wav", mix_at(0.7, [(0.0, tone(784, 0.6, 0.18)), (0.12, tone(1046.5, 0.6, 0.22))]), 0.7)
    # The end of a match: a short fanfare.
    fan = [392.0, 523.25, 659.25, 783.99]
    save("end.wav", mix_at(1.3, [(i * 0.13, tone(f, 0.9, 0.3)) for i, f in enumerate(fan)] + [(0.55, tone(1046.5, 0.8, 0.35))]), 0.8)


if __name__ == "__main__":
    main()
