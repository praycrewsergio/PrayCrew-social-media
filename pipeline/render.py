#!/usr/bin/env python3
"""Render a PrayCrew 'Verse of the Day' reel in one of five rotating styles.

usage: render.py BACKGROUND.mp4 "VERSE TEXT" "REFERENCE" OUT.mp4 --lang en|es
                 [--style card|cinematic|highlight|glass|keyphrase] [--key "exact phrase from verse"]
                 [--music N]

Output: always 1080x1920 / 30fps / AAC audio. Verse segment on the moving loop, then the QR card
and the "Available on" card (assets/endcard_<lang>.mp4), with an original calm music bed.
"""
import argparse, os, re, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda p: os.path.join(HERE, "assets", p)
W, H = 1080, 1920
NAVY = (23, 62, 79)
YELLOW = (255, 196, 0)
STYLES = ["card", "cinematic", "highlight", "glass", "keyphrase"]
# Monday=0 ... Sunday=6
WEEKDAY_STYLE = {0: "cinematic", 1: "highlight", 2: "glass", 3: "keyphrase", 4: "card", 5: "cinematic", 6: "glass"}
HEADER = {"en": "VERSE OF THE DAY", "es": "VERSÍCULO DEL DÍA"}
MIN_VERSE_SECONDS = 8.067
PER_WORD = 0.22
FADE_STEPS = (0.34, 0.67)  # intermediate opacities for a fade-in (each 0.1 s)


def font(name, size):
    return ImageFont.truetype(A(name), size)


def wrap_words(words, f, width):
    lines, cur = [], []
    for w in words:
        if cur and f.getlength(" ".join(cur + [w])) > width:
            lines.append(cur); cur = [w]
        else:
            cur.append(w)
    return lines + ([cur] if cur else [])


def fit(words, fname, start, stop, width, max_h, lh_ratio):
    for size in range(start, stop - 1, -2):
        f = font(fname, size)
        lines = wrap_words(words, f, width)
        lh = int(size * lh_ratio)
        if len(lines) * lh <= max_h:
            return f, lines, lh
    return f, lines, lh


def white_logo(width=280):
    lg = Image.open(A("logo.png")).convert("RGBA")
    w = Image.new("RGBA", lg.size, (255, 255, 255, 0)); w.putalpha(lg.getchannel("A"))
    return w.resize((width, round(width * lg.height / lg.width)), Image.LANCZOS)


def gradient(top, bottom, power=1.2):
    g = Image.new("L", (1, H))
    for y in range(H):
        g.putpixel((0, y), int(255 * (top + (bottom - top) * (y / H) ** power)))
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 255)); shade.putalpha(g.resize((W, H)))
    return shade


def with_alpha(layer, a):
    if a >= 1: return layer
    out = layer.copy(); out.putalpha(layer.getchannel("A").point(lambda v: int(v * a))); return out


def shadow_text(d_layer, xy, text, f, fill="white", anchor="mm", blur_layer=None):
    d_layer.text(xy, text, font=f, fill=fill, anchor=anchor)


def soft_shadow(layer, radius=6, alpha=0.55):
    """Return layer with a soft dark shadow underneath its (white) text."""
    from PIL import ImageFilter
    a = layer.getchannel("A").filter(ImageFilter.GaussianBlur(radius)).point(lambda v: int(v * alpha))
    sh = Image.new("RGBA", layer.size, (0, 0, 0, 0)); sh.putalpha(a)
    sh.alpha_composite(layer); return sh


def key_word_indexes(text, key):
    """Indexes of words (split on spaces) that overlap the key phrase (case-insensitive)."""
    if not key: return set()
    i = text.lower().find(key.lower().strip())
    if i < 0: return set()
    j = i + len(key.strip()); out, pos = set(), 0
    for n, w in enumerate(text.split()):
        s = text.find(w, pos); e = s + len(w); pos = e
        if s < j and e > i: out.add(n)
    return out


def default_key(text):
    """Fallback key phrase: the last clause of the first sentence (≤ 6 words)."""
    first = re.split(r"(?<=[.;:!?])\s", text.strip())[0]
    clause = re.split(r"[,;:]\s", first)[-1]
    return " ".join(clause.split()[-6:]).rstrip(".,;:!?")


# ---------------------------------------------------------------- styles
# Each returns (states, total_seconds, glass_box_or_None); states = [(RGBA full frame, duration)].

def timeline(units, start=0.4):
    """Given word-counts per reveal unit, return start times for each unit and the end time."""
    t, out = start, []
    for n in units:
        out.append(t); t += max(0.6, n * PER_WORD)
    return out, t


def build_line_states(static, lines_layers, starts, total):
    """static: RGBA always visible; lines_layers: list of RGBA layers revealed at starts[i] with a short fade."""
    events = []
    for i, st in enumerate(starts):
        for k, a in enumerate(FADE_STEPS):
            events.append((st + k * 0.1, i, a))
        events.append((st + len(FADE_STEPS) * 0.1, i, 1.0))
    events.sort()
    states, shown, t_prev = [], {}, 0.0
    cur = static.copy()
    states.append([cur, 0.0])
    for t, i, a in events:
        states[-1][1] = t - t_prev; t_prev = t
        shown[i] = a
        img = static.copy()
        for j, al in shown.items():
            img.alpha_composite(with_alpha(lines_layers[j], al))
        states.append([img, 0.0])
    states[-1][1] = total - t_prev
    return [(s, d) for s, d in states if d > 0.001]


def header_layer(lang, y_logo=150, caption=True):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    lg = white_logo(); layer.alpha_composite(lg, ((W - lg.width) // 2, y_logo))
    if caption:
        d = ImageDraw.Draw(layer)
        d.text((W / 2, y_logo + lg.height + 40), HEADER[lang], font=font("sans.woff", 30), fill=(255, 255, 255, 230), anchor="mm")
    return soft_shadow(layer, 5, 0.5)


def quoted(text):
    """Wrap in curly quotes; inner quotes become single; trailing , ; : becomes …"""
    t = re.sub(r"“([^”]*)”", r"‘\1’", text.strip())
    return "“" + re.sub(r"[,;:]$", "…", t) + "”"


def style_cinematic(text, ref, lang, key):
    static = gradient(0.25, 0.8); static.alpha_composite(header_layer(lang))
    f, lines, lh = fit(quoted(text).split(), "serif.woff", 80, 46, 900, 980, 1.28)
    y0 = 1000 - len(lines) * lh / 2
    layers, units = [], []
    for n, ln in enumerate(lines):
        L = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(L).text((W / 2, y0 + n * lh), " ".join(ln), font=f, fill="white", anchor="mm")
        layers.append(soft_shadow(L)); units.append(len(ln))
    R = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(R).text((W / 2, y0 + len(lines) * lh + 30), ref.upper(), font=font("sans.woff", 32), fill="white", anchor="mm")
    layers.append(soft_shadow(R)); units.append(2)
    starts, end = timeline(units)
    total = max(MIN_VERSE_SECONDS, end + 2.5)
    return build_line_states(static, layers, starts, total), total, None


def style_glass(text, ref, lang, key):
    f, lines, lh = fit(text.split(), "serif.woff", 74, 42, 740, 900, 1.27)
    block = len(lines) * lh
    bh = int(block + 300) // 2 * 2; bx0, bx1 = 110, 970      # even sizes for yuv420 blur crop
    by0 = int(960 - bh / 2) // 2 * 2; by1 = by0 + bh
    static = gradient(0.1, 0.35)
    tint = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(tint)
    d.rounded_rectangle((bx0, by0, bx1, by1), 48, fill=(255, 255, 255, 55), outline=(255, 255, 255, 150), width=3)
    static.alpha_composite(tint)
    hl = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dh = ImageDraw.Draw(hl)
    dh.text((W / 2, by0 + 80), HEADER[lang], font=font("sans.woff", 30), fill="white", anchor="mm")
    lg = white_logo(300); hl.alpha_composite(lg, ((W - lg.width) // 2, by1 + 70))
    static.alpha_composite(soft_shadow(hl, 4, 0.4))
    layers, units = [], []
    y0 = by0 + 150 + lh / 2
    for n, ln in enumerate(lines):
        L = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(L).text((W / 2, y0 + n * lh), " ".join(ln), font=f, fill="white", anchor="mm")
        layers.append(soft_shadow(L, 4, 0.45)); units.append(len(ln))
    R = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(R).text((W / 2, by1 - 70), ref.upper(), font=font("sans.woff", 28), fill="white", anchor="mm")
    layers.append(soft_shadow(R, 4, 0.45)); units.append(2)
    starts, end = timeline(units)
    total = max(MIN_VERSE_SECONDS, end + 2.5)
    return build_line_states(static, layers, starts, total), total, (bx0, by0, bx1, by1)


def style_keyphrase(text, ref, lang, key):
    key = key or default_key(text)
    static = gradient(0.45, 0.72); static.alpha_composite(header_layer(lang))
    kf, klines, klh = fit(key.upper().split(), "sans_bold.woff", 150, 70, 940, 560, 1.08)
    vf, vlines, vlh = fit(text.split(), "serif_italic.woff", 58, 36, 840, 620, 1.25)
    ky0 = 470 + klh / 2
    K = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dk = ImageDraw.Draw(K)
    for n, ln in enumerate(klines):
        dk.text((W / 2, ky0 + n * klh), " ".join(ln), font=kf, fill="white", anchor="mm")
    layers, units = [soft_shadow(K, 8, 0.6)], [8]
    vy0 = ky0 + len(klines) * klh + 70
    for n, ln in enumerate(vlines):
        L = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(L).text((W / 2, vy0 + n * vlh), " ".join(ln), font=vf, fill=(255, 255, 255, 235), anchor="mm")
        layers.append(soft_shadow(L, 5, 0.5)); units.append(len(ln))
    R = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(R).text((W / 2, vy0 + len(vlines) * vlh + 40), ref.upper(), font=font("sans.woff", 30), fill="white", anchor="mm")
    layers.append(soft_shadow(R)); units.append(2)
    starts, end = timeline(units)
    total = max(MIN_VERSE_SECONDS, end + 2.5)
    return build_line_states(static, layers, starts, total), total, None


def style_highlight(text, ref, lang, key):
    key = key or default_key(text)
    hi = key_word_indexes(text, key)
    words = text.upper().split()
    f, lines, lh = fit(words, "sans_bold.woff", 76, 40, 920, 1000, 1.42)
    static = gradient(0.35, 0.6); static.alpha_composite(header_layer(lang))
    y0 = 980 - len(lines) * lh / 2
    space = f.getlength(" ")
    # word boxes
    pos, n = [], 0
    for li, ln in enumerate(lines):
        x = W / 2 - f.getlength(" ".join(ln)) / 2
        for w in ln:
            pos.append((x, y0 + li * lh, w, n in hi)); x += f.getlength(w) + space; n += 1
    states, t = [], 0.0
    reveal = 0.4
    def draw(k, with_ref):
        img = static.copy(); L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
        for i in range(k):
            x, y, w, h = pos[i]
            if h:
                wl = f.getlength(w)
                joined = i + 1 < k and pos[i + 1][3] and pos[i + 1][1] == y   # next word highlighted on same line
                right = pos[i + 1][0] + 10 if joined else x + wl + 10
                d.rounded_rectangle((x - 10, y - lh * 0.36, right, y + lh * 0.36), 14, fill=YELLOW)
        for i in range(k):
            x, y, w, h = pos[i]
            d.text((x, y), w, font=f, fill=(20, 20, 20) if h else "white", anchor="lm")
        if with_ref:
            d.text((W / 2, y0 + len(lines) * lh + 20), ref.upper(), font=font("sans.woff", 32), fill="white", anchor="mm")
        img.alpha_composite(soft_shadow(L, 5, 0.45)); return img
    states.append((draw(0, False), reveal))
    for k in range(1, len(pos) + 1):
        states.append((draw(k, k == len(pos)), PER_WORD))
    end = reveal + PER_WORD * len(pos)
    total = max(MIN_VERSE_SECONDS, end + 2.5)
    states[-1] = (states[-1][0], total - end + PER_WORD)
    return states, total, None


# --- original paper-card style --------------------------------------------------------------
CARD_X, CARD_Y = 130, 265
TEXT_LEFT, TEXT_RIGHT, TEXT_TOP, TEXT_BOTTOM, REF_Y = 215, 900, 330, 1180, 1290


def draw_card_header(img, text):
    fade_h = 330
    fade = Image.new("L", (1, fade_h))
    for y in range(fade_h):
        fade.putpixel((0, y), int(175 * (1 - (y / fade_h)) ** 1.6))
    band = Image.new("RGBA", (W, fade_h), (255, 255, 255, 0)); band.putalpha(fade.resize((W, fade_h)))
    under = Image.new("RGBA", img.size, (0, 0, 0, 0)); under.paste(band, (0, 0))
    under.alpha_composite(img); img.paste(under)
    d = ImageDraw.Draw(img)
    d.text((W / 2, 72), text, font=font("header.woff", 66), fill=(0, 0, 0), anchor="mm")
    logo = Image.open(A("logo.png")).convert("RGBA")
    img.alpha_composite(logo, ((W - logo.width) // 2, 112))


def style_card(text, ref, lang, key):
    card = Image.open(A("card.png")).convert("RGBA")
    words = text.upper().split()
    f, lines, lh = fit(words, "verse.woff", 64, 30, TEXT_RIGHT - TEXT_LEFT, TEXT_BOTTOM - TEXT_TOP, 1.55)
    rf = font("ref.woff", 30)
    nwords = sum(len(l) for l in lines)
    reveal_end = max(6.6, 0.4 + nwords * PER_WORD)
    total = max(MIN_VERSE_SECONDS, reveal_end + 2.5)
    step = (reveal_end - 0.4) / nwords
    header = "Verse of the Day" if lang == "en" else "Versículo del día"
    states = []
    for k in range(nwords + 1):
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); img.paste(card, (CARD_X, CARD_Y))
        d = ImageDraw.Draw(img); n, y = 0, TEXT_TOP
        for ln in lines:
            x = (TEXT_LEFT + TEXT_RIGHT) / 2 - f.getlength(" ".join(ln)) / 2
            vis = ln[: max(0, min(len(ln), k - n))]
            if vis: d.text((x, y), " ".join(vis), font=f, fill=(25, 25, 25))
            n += len(ln); y += lh
        if k == nwords: d.text((W / 2, REF_Y), ref.upper(), font=rf, fill=(25, 25, 25), anchor="mm")
        draw_card_header(img, header)
        dur = 0.4 if k == 0 else (step if k < nwords else total - reveal_end)
        states.append((img, dur))
    return states, total, None


BUILD = {"card": style_card, "cinematic": style_cinematic, "highlight": style_highlight,
         "glass": style_glass, "keyphrase": style_keyphrase}


# ---------------------------------------------------------------- render
def run(cmd):
    subprocess.run(cmd, check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("background"); ap.add_argument("verse"); ap.add_argument("reference"); ap.add_argument("out")
    ap.add_argument("--lang", choices=["en", "es"], default="es")
    ap.add_argument("--style", choices=STYLES, default="card")
    ap.add_argument("--key", default="", help="exact phrase from the verse to emphasize (highlight / keyphrase)")
    ap.add_argument("--music", type=int, default=1, help="assets/music/trackN.m4a; 0 = silent")
    a = ap.parse_args()

    states, total, glass = BUILD[a.style](a.verse, a.reference, a.lang, a.key)
    tmp = tempfile.mkdtemp()
    listing = []
    for i, (img, dur) in enumerate(states):
        p = os.path.join(tmp, f"s{i:04d}.png"); img.save(p)
        listing.append(f"file '{p}'\nduration {dur:.3f}")
    listing.append(f"file '{p}'")
    lst = os.path.join(tmp, "list.txt"); open(lst, "w").write("\n".join(listing))

    seg = os.path.join(tmp, "verse.mp4")
    bgf = f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30,setsar=1"
    inputs = ["-stream_loop", "-1", "-i", a.background, "-f", "concat", "-safe", "0", "-i", lst]
    if glass:
        x0, y0, x1, y1 = glass; gw, gh = x1 - x0, y1 - y0
        m = Image.new("L", (gw, gh), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, gw - 1, gh - 1), 48, fill=255)
        mp = os.path.join(tmp, "mask.png"); m.save(mp)
        inputs += ["-loop", "1", "-i", mp]
        fc = (f"{bgf},split[b0][b1];[b1]crop={gw}:{gh}:{x0}:{y0},boxblur=24:3,format=rgba[bl];"
              f"[2:v]format=gray,scale={gw}:{gh}[m];[bl][m]alphamerge[g];[b0][g]overlay={x0}:{y0}:shortest=1[bg];")
    else:
        fc = f"{bgf}[bg];"
    fc += "[1:v]format=rgba[ov];[bg][ov]overlay=0:0:shortest=1,format=yuv420p[v]"
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-t", f"{total:.3f}",
         "-c:v", "libx264", "-crf", "18", "-an", seg])

    joined = os.path.join(tmp, "joined.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-i", seg, "-i", A(f"endcard_{a.lang}.mp4"), "-filter_complex",
         f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30[x];"
         f"[1:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30[y];[x][y]concat=n=2:v=1[v]",
         "-map", "[v]", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", joined])
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", joined],
                               capture_output=True, text=True).stdout)
    if a.music:
        track = A(f"music/track{a.music}.m4a")
        run(["ffmpeg", "-v", "error", "-y", "-i", joined, "-stream_loop", "-1", "-i", track, "-map", "0:v", "-map", "1:a",
             "-c:v", "copy", "-af", f"afade=t=in:d=1.5,afade=t=out:st={dur - 2.5:.2f}:d=2.5", "-c:a", "aac", "-b:a", "160k",
             "-t", f"{dur:.3f}", "-movflags", "+faststart", a.out])
    else:
        run(["ffmpeg", "-v", "error", "-y", "-i", joined, "-c", "copy", "-movflags", "+faststart", a.out])

    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                            "-of", "csv=p=0", a.out], capture_output=True, text=True, check=True).stdout.strip()
    w, h = (int(x) for x in probe.split(",")[:2])
    if (w, h) != (W, H):
        os.remove(a.out); raise SystemExit(f"Rendered {w}x{h}, expected {W}x{H}; output deleted")
    print(a.out, f"{w}x{h}", a.style)


if __name__ == "__main__":
    main()
