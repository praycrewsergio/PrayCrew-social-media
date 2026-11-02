#!/usr/bin/env python3
"""Feature-series recap reel: every PrayCrew feature from the Oct 26 - Nov 11 series in ~45 s,
as kinetic type over the verse-video loops, then the usual QR + "Available on" end card and a music bed.

usage: feature_recap.py en|es OUT.mp4 [--music N]
"""
import argparse, os, subprocess, tempfile
from PIL import Image, ImageDraw
from render import A, W, H, font, fit, wrap_words, white_logo, gradient, soft_shadow, FADE_STEPS

HERE = os.path.dirname(os.path.abspath(__file__))
SAND = (227, 195, 162)
XF = 0.5  # crossfade between scenes

# (kind, label, lines, loop) ; kind: "quote" = big serif, "title" = headline + lines, "big" = headline only
SCENES = {
 "en": [
  ("quote", "", ["A prayer is not a", "one-time moment.", "It's a process."], 7),
  ("big", "PRAYCREW", ["Everything we built so no prayer gets forgotten."], 12),
  ("title", "PRAY WITH INTENTION", ["See who's praying for you", "Follow up with a voice note or video", "Know every time someone prays"], 3),
  ("title", "PRAY TOGETHER", ["Start a prayer crew in under a minute", "Invite your prayer warriors with a QR code", "A private chat for every crew"], 21),
  ("title", "GROW IN PRAYER", ["A new verse and guided prayer every day", "Remember: a video of your answered prayers every month"], 30),
  ("title", "LEAD WITH INSIGHT", ["See your prayer life in numbers", "Group metrics for pastors and leaders", "A branded prayer page for your church"], 36),
  ("title", "EASY TO START", ["Sign in with Apple or Gmail", "Start praying in seconds"], 15),
  ("big", "", ["Wherever two or three gather, there's a PrayCrew."], 40),
 ],
 "es": [
  ("quote", "", ["Una oración", "no es un momento.", "Es un proceso."], 7),
  ("big", "PRAYCREW", ["Todo lo que creamos para que ninguna oración se olvide."], 12),
  ("title", "ORA CON INTENCIÓN", ["Ve quién está orando por ti", "Da seguimiento con nota de voz o video", "Entérate cada vez que alguien ora"], 3),
  ("title", "OREN JUNTOS", ["Crea tu grupo de oración en menos de un minuto", "Suma guerreros de oración con un código QR", "Un chat privado para cada grupo"], 21),
  ("title", "CRECE EN ORACIÓN", ["Un versículo y una oración guiada cada día", "Recordando: un video de tus oraciones contestadas cada mes"], 30),
  ("title", "LIDERA CON CLARIDAD", ["Tu vida de oración en números", "Métricas del grupo para pastores y líderes", "Una página de oración con la marca de tu iglesia"], 36),
  ("title", "FÁCIL DE EMPEZAR", ["Entra con Apple o Gmail", "Empieza a orar en segundos"], 15),
  ("big", "", ["Donde se reúnan dos o tres, hay un PrayCrew."], 40),
 ],
}


def run(cmd):
    subprocess.run(cmd, check=True)


def blank():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def static_layer(label):
    s = gradient(0.45, 0.85)
    top = blank(); lg = white_logo(250); top.alpha_composite(lg, ((W - lg.width) // 2, 150))
    if label:
        ImageDraw.Draw(top).text((W / 2, 640), " ".join(label), font=font("sans_bold.woff", 32), fill=SAND + (255,), anchor="mm")
    s.alpha_composite(soft_shadow(top, 5, 0.5))
    return s


def scene_layers(kind, lines):
    """Return [(layer, start_seconds)], scene duration."""
    out = []
    if kind == "quote":
        f = font("serif_italic.woff", 96); lh = 132
        y0 = 960 - (len(lines) - 1) * lh / 2
        for i, ln in enumerate(lines):
            L = blank(); ImageDraw.Draw(L).text((W / 2, y0 + i * lh), ln, font=f, fill="white", anchor="mm")
            out.append((soft_shadow(L), 0.5 + i * 1.1 + (0.5 if i == len(lines) - 1 else 0)))
        return out, out[-1][1] + 2.6
    if kind == "big":
        f, rows, lh = fit(lines[0].split(), "sans_bold.woff", 92, 60, 900, 520, 1.18)
        y0 = 960 - (len(rows) - 1) * lh / 2
        L = blank(); d = ImageDraw.Draw(L)
        for i, r in enumerate(rows):
            d.text((W / 2, y0 + i * lh), " ".join(r), font=f, fill="white", anchor="mm")
        out.append((soft_shadow(L), 0.5))
        return out, 4.2
    # title: first line is the headline, the rest are supporting lines with a sand dot
    hf, hrows, hlh = fit(lines[0].split(), "sans_bold.woff", 84, 56, 920, 300, 1.15)
    bf = font("sans.woff", 56); blh = 70
    brows = [wrap_words(b.split(), bf, 860) for b in lines[1:]]
    total_h = len(hrows) * hlh + 70 + sum(len(r) * blh + 40 for r in brows)
    y = 1010 - total_h / 2 + hlh / 2
    L = blank(); d = ImageDraw.Draw(L)
    for r in hrows:
        d.text((W / 2, y), " ".join(r), font=hf, fill="white", anchor="mm"); y += hlh
    out.append((soft_shadow(L), 0.4)); y += 70 - hlh / 2
    t = 1.5
    for rows in brows:
        L = blank(); d = ImageDraw.Draw(L)
        d.ellipse((W / 2 - 7, y - 26, W / 2 + 7, y - 12), fill=SAND)
        y += 14
        for r in rows:
            d.text((W / 2, y + blh / 2), " ".join(r), font=bf, fill="white", anchor="mm"); y += blh
        y += 40
        out.append((soft_shadow(L), t)); t += 1.15
    return out, t - 1.15 + 2.7


def states(static, layers, total):
    """Still images + durations: each layer fades in (FADE_STEPS) at its start time and stays."""
    events = sorted(s for _, s in layers)
    res, t = [], 0.0
    def frame(n_full, partial=None, a=1.0):
        im = static.copy()
        for k in range(n_full):
            im.alpha_composite(layers[k][0])
        if partial is not None:
            L = layers[partial][0].copy(); L.putalpha(L.getchannel("A").point(lambda v: int(v * a)))
            im.alpha_composite(L)
        return im
    for i, start in enumerate(events):
        if start > t:
            res.append((frame(i), start - t)); t = start
        for a in FADE_STEPS:
            res.append((frame(i, i, a), 0.1)); t += 0.1
    res.append((frame(len(layers)), max(0.1, total - t)))
    return res


def render_scene(kind, label, lines, loop, tmp, idx):
    layers, total = scene_layers(kind, lines)
    st = states(static_layer(label), layers, total)
    lst, d = os.path.join(tmp, f"l{idx}.txt"), []
    for j, (im, dur) in enumerate(st):
        p = os.path.join(tmp, f"s{idx}_{j:03d}.png"); im.save(p); d.append(f"file '{p}'\nduration {dur:.3f}")
    d.append(f"file '{p}'"); open(lst, "w").write("\n".join(d))
    out = os.path.join(tmp, f"scene{idx}.mp4")
    bg = os.path.join(HERE, "loops", f"loop{loop:02d}.mp4")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-stream_loop", "-1", "-i", bg, "-f", "concat", "-safe", "0", "-i", lst,
         "-filter_complex", f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30,setsar=1[bg];"
                            "[1:v]format=rgba[ov];[bg][ov]overlay=0:0,format=yuv420p[v]",
         "-map", "[v]", "-t", f"{total:.3f}", "-c:v", "libx264", "-crf", "18", "-r", "30", out])
    return out, total


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("lang", choices=["en", "es"]); ap.add_argument("out")
    ap.add_argument("--music", type=int, default=2); a = ap.parse_args()
    tmp = tempfile.mkdtemp()
    clips = [render_scene(*sc, tmp, i) for i, sc in enumerate(SCENES[a.lang])]
    end = A(f"endcard_{a.lang}.mp4")
    ins, fc, prev, off = [], "", "0:v", 0.0
    for i, (p, dur) in enumerate(clips):
        ins += ["-i", p]
    ins += ["-i", end]
    for i in range(1, len(clips)):
        off += clips[i - 1][1] - XF
        fc += f"[{prev}][{i}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}[x{i}];"; prev = f"x{i}"
    n = len(clips)
    fc += (f"[{n}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30,format=yuv420p[e];"
           f"[{prev}][e]concat=n=2:v=1[v]")
    joined = os.path.join(tmp, "joined.mp4")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "[v]",
         "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", joined])
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", joined],
                               capture_output=True, text=True, check=True).stdout)
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", joined, "-stream_loop", "-1", "-i", A(f"music/track{a.music}.m4a"),
         "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", f"afade=t=in:d=1.0,afade=t=out:st={dur - 2.5:.2f}:d=2.5",
         "-c:a", "aac", "-b:a", "160k", "-t", f"{dur:.3f}", "-movflags", "+faststart", a.out])
    w, h = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                           "-of", "csv=p=0", a.out], capture_output=True, text=True).stdout.strip().split(",")[:2]
    if (int(w), int(h)) != (W, H):
        os.remove(a.out); raise SystemExit(f"Rendered {w}x{h}, expected {W}x{H}")
    print(a.out, f"{w}x{h}", f"{dur:.1f}s")


if __name__ == "__main__":
    main()
