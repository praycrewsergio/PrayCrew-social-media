"""Compose original, royalty-free calm background tracks (soft pads + gentle piano-like notes).
Writes assets/music/track1..4.m4a (40 s each). Run once; the files are committed to the repo."""
import os, subprocess
import numpy as np
from scipy.signal import fftconvolve, butter, lfilter
from scipy.io import wavfile

SR = 44100
DUR = 40.0
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets", "music"); os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def hz(n):  # MIDI -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n, a, r):
    e = np.ones(n); a = int(a * SR); r = int(r * SR)
    e[:a] = np.linspace(0, 1, a) ** 2
    e[-r:] *= np.linspace(1, 0, r) ** 1.5
    return e


def pad(freq, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for det in (-0.12, 0.0, 0.11):          # gentle chorus
        f = freq * 2 ** (det / 12)
        s += np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    s *= 1 + 0.15 * np.sin(2 * np.pi * 0.2 * t)  # slow swell
    return s * env(n, dur * 0.35, dur * 0.4) / 3


def piano(freq, dur=3.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * (1.6 + k * 0.9)) for k, a in ((1, 1), (2, .45), (3, .2), (4, .08)))
    a = int(0.01 * SR); s[:a] *= np.linspace(0, 1, a)
    return s


def reverb(x, secs=3.2, mix=0.45):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * (6.9 / secs))
    b, a = butter(2, 3500 / (SR / 2)); ir = lfilter(b, a, ir); ir /= np.abs(ir).sum() ** 0.5 * 40
    wet = fftconvolve(x, ir)[: len(x)]
    return (1 - mix) * x + mix * wet / (np.abs(wet).max() + 1e-9) * np.abs(x).max()


# (root progression in MIDI, chord quality offsets, melody scale)
TRACKS = {
    1: ([60, 57, 53, 55], [[0, 7, 16], [0, 7, 15], [0, 7, 16], [0, 7, 16]]),   # C  Am F  G
    2: ([62, 59, 55, 57], [[0, 7, 16], [0, 7, 15], [0, 7, 16], [0, 7, 16]]),   # D  Bm G  A
    3: ([57, 53, 60, 55], [[0, 7, 15], [0, 7, 16], [0, 7, 16], [0, 7, 16]]),   # Am F  C  G
    4: ([65, 62, 58, 60], [[0, 7, 16], [0, 7, 15], [0, 7, 16], [0, 7, 16]]),   # F  Dm Bb C
}

for k, (roots, quals) in TRACKS.items():
    mix = np.zeros(int((DUR + 4) * SR))
    bar = DUR / 4 / 2                       # chord length (two passes of the progression)
    i = 0
    for rep in range(2):
        for root, q in zip(roots, quals):
            start = int(i * bar * SR)
            for off in q:
                p = pad(hz(root - 12 + off), bar * 1.5)
                mix[start:start + len(p)] += 0.22 * p[: len(mix) - start]
            p = pad(hz(root - 24), bar * 1.5); mix[start:start + len(p)] += 0.18 * p[: len(mix) - start]
            # a few soft piano notes from the chord, an octave up
            for j, off in enumerate(rng.permutation(q)[:3]):
                s = start + int((0.4 + j * bar / 3.2) * SR)
                n = piano(hz(root + 12 + off)); mix[s:s + len(n)] += 0.10 * n[: len(mix) - s]
            i += 1
    mix = reverb(mix)[: int(DUR * SR)]
    mix *= env(len(mix), 2.0, 4.0)
    mix = mix / np.abs(mix).max() * 0.7
    stereo = np.stack([mix, np.roll(mix, int(0.012 * SR))], 1)
    wav = os.path.join(OUT, f"track{k}.wav"); wavfile.write(wav, SR, (stereo * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-af", "loudnorm=I=-20:TP=-2", "-c:a", "aac", "-b:a", "160k",
                    os.path.join(OUT, f"track{k}.m4a")], check=True)
    os.remove(wav)
    print("track", k)
