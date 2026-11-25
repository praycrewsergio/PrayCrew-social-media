"""Cinematic score for the Thanksgiving testimony doodle video, timed to its scenes.
Piano intro -> diagnosis (minor) -> strings of hope -> tension on surgery day -> full climax on the miracle -> warm resolve.
Writes a MIDI file and renders it with FluidSynth (FluidR3 GM soundfont) to assets/music/thanks.m4a."""
import os, subprocess, sys
import mido

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets", "music", "thanks.m4a")
TMP = sys.argv[1] if len(sys.argv) > 1 else "/tmp"
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
TOTAL = 82.3
TPB = 480  # tempo = 1 beat per second, so ticks = seconds * 480

PC = dict(C=0, D=2, E=4, F=5, G=7, A=9, B=11)
MAJ, MIN = [0, 4, 7], [0, 3, 7]
def ch(name):  # 'Am' -> (pc, quality)
    return PC[name[0]], (MIN if name.endswith('m') else MAJ)

# (start, end, [chords], section)
SECTIONS = [
    (0.0, 5.0, ['C', 'G'], 'intro'),
    (5.0, 10.6, ['Am', 'F'], 'diag'),
    (10.6, 21.6, ['F', 'C', 'G', 'Am'], 'hope'),
    (21.6, 38.0, ['C', 'G', 'Am', 'F', 'C', 'G'], 'faith'),
    (38.0, 48.2, ['Am', 'F', 'Dm', 'E'], 'tension'),
    (48.2, 54.2, ['F', 'G'], 'lift'),
    (54.2, 60.4, ['C', 'G', 'Am', 'F'], 'climax'),
    (60.4, 71.8, ['C', 'F', 'Am', 'G'], 'anthem'),
    (71.8, 78.8, ['F', 'G', 'C'], 'resolve'),
    (78.8, 82.3, ['C'], 'end'),
]
# channel: program
PROG = {0: 0, 1: 48, 2: 42, 3: 43, 4: 52, 5: 60, 6: 47, 7: 49}
ev = []  # (time, kind, channel, a, b)
def note(t, d, c, n, v):
    v = max(1, min(127, int(v)))
    ev.append((t, 'on', c, n, v)); ev.append((t + d, 'off', c, n, 0))
def cc(t, c, num, val): ev.append((t, 'cc', c, num, max(0, min(127, int(val)))))

def strings_level(t):  # expression curve for sustained orchestra
    pts = [(0, 0), (10.6, 0), (11.5, 45), (21.6, 70), (38, 80), (46, 92), (48.2, 78), (53.8, 105), (54.2, 127), (60.4, 120),
           (66, 100), (71.8, 98), (77, 112), (78.8, 100), (80.5, 70), (82.3, 30)]
    for (t0, v0), (t1, v1) in zip(pts, pts[1:]):
        if t0 <= t <= t1: return v0 + (v1 - v0) * (t - t0) / max(t1 - t0, 1e-6)
    return 0
for c in (1, 2, 3, 4, 5, 7):
    t = 0.0
    while t < TOTAL:
        cc(t, c, 11, strings_level(t)); t += 0.2
for c, p in PROG.items(): cc(0, c, 91, 70 if c != 6 else 40)  # reverb send

for s0, s1, chords, sec in SECTIONS:
    dur = (s1 - s0) / len(chords)
    for i, name in enumerate(chords):
        t, pc, q = s0 + i * dur, *ch(name)
        r3 = 48 + pc  # root in octave 3
        # --- piano ---
        if sec in ('intro', 'diag'):
            step = 0.6
            pat = [0, 7, 12, q[1] + 12, 19, 12]
            k = 0
            while k * step < dur - 0.05:
                note(t + k * step, 1.6, 0, r3 + pat[k % len(pat)], 52 if sec == 'intro' else 46); k += 1
            note(t, dur, 0, r3 - 12, 50)
        elif sec in ('hope', 'faith', 'anthem', 'resolve'):
            step = 0.45 if sec != 'resolve' else 0.5
            pat = [0, 7, 12, q[1] + 12, 19, q[1] + 12, 12, 7]
            k = 0
            while k * step < dur - 0.05:
                note(t + k * step, 1.2, 0, r3 + pat[k % len(pat)], 48 if sec == 'hope' else 58); k += 1
            note(t, dur, 0, r3 - 12, 60)
            if sec in ('faith', 'anthem'):  # simple melody on top
                note(t, dur * 0.5, 0, 72 + pc + q[1] - (12 if pc + q[1] > 9 else 0), 70)
                note(t + dur * 0.5, dur * 0.5, 0, 72 + pc + 7 - (12 if pc + 7 > 11 else 0), 66)
        elif sec == 'tension':
            note(t, dur, 0, r3 - 12, 55); note(t, dur, 0, r3 + 12, 40); note(t, dur, 0, r3 + 12 + q[1], 40)
        elif sec in ('lift', 'climax'):
            for k, o in enumerate([0, 12, 12 + q[1], 19, 24]):
                note(t + k * 0.06, dur, 0, r3 + o, 80 if sec == 'climax' else 65)
        elif sec == 'end':
            for k, o in enumerate([-12, 0, 7, 12, 16, 24]):
                note(t + k * 0.08, 3.4, 0, r3 + o, 55)
        # --- strings / bass / choir / horns (sustained) ---
        if sec in ('hope', 'faith', 'lift', 'climax', 'anthem', 'resolve', 'end'):
            for o in (12, 12 + q[1], 19, 24):
                note(t, dur + 0.15, 1, r3 + o, 90)
            note(t, dur + 0.15, 2, r3, 85)
            if sec != 'hope': note(t, dur + 0.15, 3, r3 - 12, 85)
        if sec in ('lift', 'climax', 'anthem', 'resolve', 'end'):
            for o in (12, 12 + q[1], 19):
                note(t, dur + 0.15, 4, r3 + o, 95 if sec == 'climax' else (45 if sec == 'lift' else 75))
        if sec in ('climax', 'anthem', 'resolve'):
            for o in ((q[1], 7, 12, 12 + q[1]) if sec == 'climax' else (q[1], 7, 12)):
                note(t, dur + 0.1, 5, r3 + o, 115 if sec == 'climax' else 75)
        if sec == 'climax':  # octave doublings for the miracle
            for o in (24 + q[1], 31, 36): note(t, dur + 0.15, 1, r3 + o, 110)
            note(t, dur + 0.15, 4, r3 + 24, 100)
        if sec == 'tension':  # pulsing low strings ostinato
            k = 0
            while k * 0.3 < dur - 0.05:
                note(t + k * 0.3, 0.26, 7, r3 - 12 if k % 2 == 0 else r3, 85 + k * 2); note(t + k * 0.3, 0.26, 3, r3 - 12, 90); k += 1
            for o in (12, 12 + q[1], 19):
                note(t, dur + 0.1, 1, r3 + o, 70)

# timpani: soft hit when tension starts, rolls into the lift and into the climax, big hits on the miracle
def roll(t0, t1, n, v0, v1):
    t = t0
    while t < t1:
        note(t, 0.1, 6, n, v0 + (v1 - v0) * (t - t0) / (t1 - t0)); t += 0.075
note(38.0, 1.5, 6, 45, 80)
roll(46.4, 48.2, 43, 25, 105); note(48.2, 1.5, 6, 41, 115)
roll(52.0, 54.2, 43, 20, 120)
for t, n in ((54.2, 36), (55.7, 43), (57.3, 36), (60.4, 36)): note(t, 2.0, 6, n, 127)
for t in (54.2, 60.4): note(t, 2.0, 9, 49, 110); note(t, 1.0, 9, 35, 120)
note(71.8, 2.0, 6, 41, 90); note(76.3, 2.0, 6, 36, 100)

mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack(); mid.tracks.append(tr)
tr.append(mido.MetaMessage('set_tempo', tempo=1_000_000, time=0))
for c, p in PROG.items(): tr.append(mido.Message('program_change', channel=c, program=p, time=0))
order = {'off': 0, 'cc': 1, 'on': 2}
last = 0
for t, kind, c, a, b in sorted(ev, key=lambda e: (e[0], order[e[1]])):
    tick = int(round(t * TPB)); dt = tick - last; last = tick
    if kind == 'on': tr.append(mido.Message('note_on', channel=c, note=a, velocity=b, time=dt))
    elif kind == 'off': tr.append(mido.Message('note_off', channel=c, note=a, velocity=0, time=dt))
    else: tr.append(mido.Message('control_change', channel=c, control=a, value=b, time=dt))
mpath = os.path.join(TMP, "thanks.mid"); wpath = os.path.join(TMP, "thanks.wav")
mid.save(mpath)
subprocess.run(["fluidsynth", "-ni", "-g", "0.6", "-r", "44100", "-F", wpath, SF2, mpath], check=True, capture_output=True)
# peak-normalize to -1 dB (keeps the dynamics of the build and the climax)
cpath = os.path.join(TMP, "thanks_c.wav")
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", wpath, "-af",
                "volume=18dB,acompressor=threshold=-26dB:ratio=3.5:attack=80:release=700:knee=6", cpath], check=True)
wpath = cpath
r = subprocess.run(["ffmpeg", "-nostdin", "-v", "info", "-i", wpath, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True)
peak = float(r.stderr.split("max_volume:")[1].split("dB")[0])
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", wpath, "-t", str(TOTAL),
                "-af", f"volume={-1 - peak}dB,afade=t=out:st={TOTAL - 1.5}:d=1.5", "-c:a", "aac", "-b:a", "192k", OUT], check=True)
print(OUT)
