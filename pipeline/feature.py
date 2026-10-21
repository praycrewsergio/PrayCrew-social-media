#!/usr/bin/env python3
"""Render a PrayCrew feature-education reel from phone screen recordings.

usage: feature.py SPEC.json OUT.mp4 --src NAME=recording.mp4 [--src NAME2=...] [--music N]

SPEC.json:
{
  "lang": "en",
  "label": "SINGLE SIGN-ON",                 # small series label, shown the whole time
  "crop_top": 150,                           # px removed from the top of the recording (status bar / rec pill)
  "segments": [                              # played in order on the phone
    {"src": "apple", "at": 3.2, "freeze": 1.6, "caption": "One more password? Not here."},
    {"src": "apple", "a": 3.2, "b": 5.6, "caption": "Tap Apple or Gmail"},
    {"src": "apple", "a": 8.0, "b": 12.2, "speed": 2.5},
    {"src": "apple", "a": 15.8, "b": 17.4, "hold": 1.5}
  ]
}
A caption stays on screen until the next one. Output: 1080x1920 / 30fps, then the QR + "Available on" end card,
with an original music bed (same end card and music as the verse reels).
"""
import argparse, json, os, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFilter
from render import A, W, H, font, fit, white_logo

SAND = (227, 195, 162)
SCREEN_H = 1440
SCREEN_TOP = 400
RADIUS = 58


def run(cmd):
    subprocess.run(cmd, check=True)


def dur_of(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True, check=True).stdout)


def background(sw, path):
    top, bot = (36, 65, 81), (14, 25, 31)
    bg = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(bg)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse((W / 2 - 520, SCREEN_TOP + 250, W / 2 + 520, SCREEN_TOP + 1250), fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    bg = Image.composite(Image.new("RGB", (W, H), SAND), bg, glow)
    x0 = (W - sw) // 2
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).rounded_rectangle((x0 + 6, SCREEN_TOP + 24, x0 + sw + 6, SCREEN_TOP + SCREEN_H + 24), RADIUS, fill=170)
    sh = sh.filter(ImageFilter.GaussianBlur(28))
    bg = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), bg, sh)
    ImageDraw.Draw(bg).rounded_rectangle((x0 - 3, SCREEN_TOP - 3, x0 + sw + 2, SCREEN_TOP + SCREEN_H + 2), RADIUS + 3,
                                         outline=(255, 255, 255), width=3)
    lg = white_logo(230)
    bg.paste(lg, ((W - lg.width) // 2, 64), lg)
    bg.save(path)


def callout_png(src, at, box, cy, path, tmp, maxw=660, maxh=210):
    """Zoomed 'pop-out' card of a small part of the screen (e.g. counters), taken from a still frame."""
    fr = os.path.join(tmp, f"co_{at}.png")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(at), "-i", src, "-frames:v", "1", fr])
    crop = Image.open(fr).convert("RGB").crop(tuple(box))
    sc = min(maxw / crop.width, maxh / crop.height)
    crop = crop.resize((round(crop.width * sc), round(crop.height * sc)), Image.LANCZOS)
    pad = 34; cw, ch = crop.width + 2 * pad, crop.height + 2 * pad
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x0, y0 = (W - cw) // 2, int(cy - ch / 2)
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).rounded_rectangle((x0 + 4, y0 + 18, x0 + cw + 4, y0 + ch + 18), 40, fill=150)
    sh = sh.filter(ImageFilter.GaussianBlur(22))
    im.putalpha(sh)
    card = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    ImageDraw.Draw(card).rounded_rectangle((0, 0, cw - 1, ch - 1), 40, fill=(255, 255, 255, 255), outline=SAND + (255,), width=6)
    card.paste(crop, (pad, pad))
    m = Image.new("L", (cw, ch), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, cw - 1, ch - 1), 40, fill=255)
    im.paste(card, (x0, y0), m)
    im.save(path)


def caption_png(label, text, path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lf = font("sans_bold.woff", 28)
    spaced = " ".join(label)  # letter-spaced label
    d.text((W / 2, 170), spaced, font=lf, fill=SAND + (255,), anchor="mm")
    if "\n" in text:  # manual line breaks
        rows = [r.split() for r in text.split("\n")]
        for size in range(74, 44, -2):
            f = font("sans_bold.woff", size)
            if max(f.getlength(" ".join(r)) for r in rows) <= 940: break
        lines, lh = rows, int(size * 1.18)
    else:
        f, lines, lh = fit(text.split(), "sans_bold.woff", 74, 46, 940, 2 * 92, 1.18)
    y = 285 - (len(lines) - 1) * lh / 2
    for ln in lines:
        d.text((W / 2, y), " ".join(ln), font=f, fill="white", anchor="mm")
        y += lh
    im.save(path)


def render_chapter(ch, label, srcs, tmp, idx):
    """One chapter = one screen layout: "phone" (portrait recording) or "wide" (browser / desktop recording)."""
    global SCREEN_H, SCREEN_TOP, RADIUS
    wide = ch.get("screen") == "wide"
    SCREEN_H, SCREEN_TOP, RADIUS = 1440, 400, 58
    crop_top = ch.get("crop_top", 0 if wide else 150)
    spec = {"label": label, "segments": ch["segments"]}
    tmp = os.path.join(tmp, f"ch{idx}"); os.makedirs(tmp, exist_ok=True)
    # 1. phone track: trim / speed / freeze every segment, then concatenate
    sw = None; parts = []; caps = []; callouts = []; t = 0.0
    for i, s in enumerate(spec["segments"]):
        src = srcs[s["src"]]
        if sw is None:
            w0, h0 = (int(v) for v in subprocess.run(
                ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", src],
                capture_output=True, text=True, check=True).stdout.strip().split(",")[:2])
            if "crop" in ch:
                cx, cy, w0, h0 = ch["crop"]; h0 += crop_top
            if wide:
                sw = 1000; SCREEN_H = round(sw * (h0 - crop_top) / w0 / 2) * 2
                SCREEN_TOP = max(430, (H - SCREEN_H) // 2 + 120); RADIUS = 22
            else:
                sw = round(w0 * SCREEN_H / (h0 - crop_top) / 2) * 2
        if "crop" in ch:
            cx, cy, cw, chh = ch["crop"]
            vf = f"crop={cw}:{chh}:{cx}:{cy},scale={sw}:{SCREEN_H},setsar=1"
        else:
            vf = f"crop=iw:ih-{crop_top}:0:{crop_top},scale={sw}:{SCREEN_H},setsar=1"
        if s.get("blur"):  # privacy: blur boxes [x, y, w, h(, t0, t1)] in source pixels/seconds, before crop/scale
            pre = ""; t_in = s.get("a", s.get("at", 0))
            for k, box in enumerate(s["blur"]):
                bx, by, bw, bh = box[:4]
                if len(box) == 6:
                    t0, t1 = box[4], box[5]
                    if "freeze" in s and not (t0 <= s["at"] <= t1):
                        continue
                    en = "" if "freeze" in s else f":enable='between(t,{t0 - t_in:.3f},{t1 - t_in:.3f})'"
                else:
                    en = ""
                pre += (f"split[m{k}][c{k}];[c{k}]crop={bw}:{bh}:{bx}:{by},gblur=sigma=28:steps=3[b{k}];"
                        f"[m{k}][b{k}]overlay={bx}:{by}{en},")
            vf = pre + vf
        p = os.path.join(tmp, f"p{i:02d}.mp4")
        if "freeze" in s:
            run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(s["at"]), "-i", src, "-frames:v", "1", "-vf", vf,
                 os.path.join(tmp, f"f{i}.png")])
            run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-loop", "1", "-i", os.path.join(tmp, f"f{i}.png"), "-t",
                 str(s["freeze"]), "-r", "30", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", p])
        else:
            sp = s.get("speed", 1.0); hold = s.get("hold", 0)
            f = f"{vf},setpts=(PTS-STARTPTS)/{sp},fps=30"
            if hold: f += f",tpad=stop_mode=clone:stop_duration={hold}"
            run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(s["a"]), "-to", str(s["b"]), "-i", src, "-an",
                 "-vf", f, "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", p])
        if "caption" in s: caps.append([t, s["caption"]])
        d_seg = dur_of(p)
        if "callout" in s:
            c = s["callout"]; cp = os.path.join(tmp, f"co{i}.png")
            callout_png(src, c["at"], c["box"], c.get("y", SCREEN_TOP + 640), cp, tmp, c.get("maxw", 660), c.get("maxh", 210))
            callouts.append([t, t + d_seg, cp])
        t += d_seg; parts.append(p)
    total = t
    lst = os.path.join(tmp, "parts.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    phone = os.path.join(tmp, "phone.mp4")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:v", "libx264", "-crf", "16",
         "-pix_fmt", "yuv420p", "-r", "30", phone])

    # 2. compose: background + rounded phone screen + captions (fade between them)
    bgp = os.path.join(tmp, "bg.png"); background(sw, bgp)
    mask = Image.new("L", (sw, SCREEN_H), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, sw - 1, SCREEN_H - 1), RADIUS, fill=255)
    mp = os.path.join(tmp, "mask.png"); mask.save(mp)
    inputs = ["-loop", "1", "-t", f"{total:.3f}", "-i", bgp, "-i", phone, "-loop", "1", "-i", mp]
    fc = (f"[1:v]format=rgba[ph];[2:v]format=gray,scale={sw}:{SCREEN_H}[m];[ph][m]alphamerge[scr];"
          f"[0:v]format=rgba[bg];[bg][scr]overlay={(W - sw) // 2}:{SCREEN_TOP}:shortest=1[v0]")
    last = "v0"
    for k, (start, text) in enumerate(caps):
        end = caps[k + 1][0] if k + 1 < len(caps) else total
        cp = os.path.join(tmp, f"c{k}.png"); caption_png(spec["label"], text, cp)
        d = end - start; fin = 0.0 if k == 0 else 0.25
        inputs += ["-loop", "1", "-t", f"{d:.3f}", "-i", cp]
        n = 3 + k
        fade_in = "" if k == 0 else f"fade=t=in:st=0:d={fin}:alpha=1,"
        fc += (f";[{n}:v]format=rgba,{fade_in}"
               f"fade=t=out:st={max(d - 0.25, 0):.3f}:d=0.25:alpha=1,setpts=PTS-STARTPTS+{start:.3f}/TB[c{k}];"
               f"[{last}][c{k}]overlay=0:0:eof_action=pass[v{k + 1}]")
        last = f"v{k + 1}"
    n = 3 + len(caps)
    for k, (start, end, cp) in enumerate(callouts):
        d = end - start
        inputs += ["-loop", "1", "-t", f"{d:.3f}", "-i", cp]
        fc += (f";[{n}:v]format=rgba,fade=t=in:st=0:d=0.2:alpha=1,fade=t=out:st={max(d - 0.2, 0):.3f}:d=0.2:alpha=1,"
               f"setpts=PTS-STARTPTS+{start:.3f}/TB[o{k}];[{last}][o{k}]overlay=0:0:eof_action=pass[w{k}]")
        last = f"w{k}"; n += 1
    fc += f";[{last}]format=yuv420p[v]"
    seg = os.path.join(tmp, "feature.mp4")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-t", f"{total:.3f}",
         "-r", "30", "-c:v", "libx264", "-crf", "18", seg])

    return seg

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec"); ap.add_argument("out")
    ap.add_argument("--src", action="append", default=[], help="NAME=path to a screen recording")
    ap.add_argument("--music", type=int, default=2)
    a = ap.parse_args()
    spec = json.load(open(a.spec))
    srcs = dict(s.split("=", 1) for s in a.src)
    tmp = tempfile.mkdtemp()

    chapters = spec.get("chapters") or [{"screen": "phone", "crop_top": spec.get("crop_top", 150), "segments": spec["segments"]}]
    lang = spec["lang"]
    segs = [render_chapter(ch, spec["label"], srcs, tmp, i) for i, ch in enumerate(chapters)]

    # 3. end card + music (same as the verse reels)
    joined = os.path.join(tmp, "joined.mp4")
    ins = []; fcj = ""
    for k, sp_ in enumerate(segs):
        ins += ["-i", sp_]; fcj += f"[{k}:v]setsar=1,fps=30[x{k}];"
    n = len(segs)
    ins += ["-i", A(f"endcard_{lang}.mp4")]
    fcj += f"[{n}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30[x{n}];"
    fcj += "".join(f"[x{k}]" for k in range(n + 1)) + f"concat=n={n + 1}:v=1[v]"
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", *ins, "-filter_complex", fcj, "-map", "[v]", "-c:v", "libx264",
         "-crf", "18", "-pix_fmt", "yuv420p", joined])
    dur = dur_of(joined)
    if a.music:
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", joined, "-stream_loop", "-1", "-i", A(f"music/track{a.music}.m4a"),
             "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", f"afade=t=in:d=1.0,afade=t=out:st={dur - 2.5:.2f}:d=2.5",
             "-c:a", "aac", "-b:a", "160k", "-t", f"{dur:.3f}", "-movflags", "+faststart", a.out])
    else:
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", joined, "-c", "copy", "-movflags", "+faststart", a.out])
    w, h = (int(v) for v in subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
            "stream=width,height", "-of", "csv=p=0", a.out], capture_output=True, text=True, check=True).stdout.strip().split(",")[:2])
    if (w, h) != (W, H):
        os.remove(a.out); raise SystemExit(f"Rendered {w}x{h}, expected {W}x{H}; output deleted")
    print(a.out, f"{w}x{h}", f"{dur:.1f}s")


if __name__ == "__main__":
    main()
