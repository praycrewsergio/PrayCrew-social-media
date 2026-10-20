#!/usr/bin/env python3
"""Render a PrayCrew 'Versículo del día' reel.

usage: render.py BACKGROUND.mp4 "VERSE TEXT" "REFERENCE" OUT.mp4 [--header "Versículo del día"]

Layout matches the Canva template: paper card over a nature loop, verse types in
word by word, reference at the bottom of the card, then the PrayCrew end cards.
"""
import argparse, os, subprocess, tempfile, textwrap
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda p: os.path.join(HERE, "assets", p)

W, H = 1080, 1920
CARD_X, CARD_Y = 130, 265            # paper card position (from template)
TEXT_LEFT, TEXT_RIGHT = 215, 900     # inside the drawn border
TEXT_TOP, TEXT_BOTTOM = 330, 1180
REF_Y = 1290
VERSE_SECONDS = 8.067                # length of verse segment in template
REVEAL_START, REVEAL_END = 0.4, 6.6  # words appear across this window


def layout(words, font, max_w):
    lines, cur = [], []
    for w in words:
        trial = " ".join(cur + [w])
        if cur and font.getlength(trial) > max_w:
            lines.append(cur); cur = [w]
        else:
            cur.append(w)
    if cur: lines.append(cur)
    return lines


def fit(text):
    words = text.upper().split()
    for size in range(64, 30, -2):
        font = ImageFont.truetype(A("verse.woff"), size)
        lines = layout(words, font, TEXT_RIGHT - TEXT_LEFT)
        lh = int(size * 1.55)
        if len(lines) * lh <= TEXT_BOTTOM - TEXT_TOP:
            return font, lines, lh
    return font, lines, lh


def frame(card, font, lines, lh, shown, ref, ref_font):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    img.paste(card, (CARD_X, CARD_Y))
    d = ImageDraw.Draw(img)
    n, y = 0, TEXT_TOP
    cx = (TEXT_LEFT + TEXT_RIGHT) / 2
    for line in lines:
        full = " ".join(line)
        x = cx - font.getlength(full) / 2          # center on the full line
        vis = line[: max(0, min(len(line), shown - n))]
        if vis:
            d.text((x, y), " ".join(vis), font=font, fill=(25, 25, 25))
        n += len(line); y += lh
    if ref:
        d.text((W / 2, REF_Y), ref.upper(), font=ref_font, fill=(25, 25, 25), anchor="mm")
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("background"); ap.add_argument("verse"); ap.add_argument("reference"); ap.add_argument("out")
    ap.add_argument("--keep-header", action="store_true", help="background already has the header (demo only)")
    ap.add_argument("--header", default=None)
    ap.add_argument("--lang", choices=["en", "es"], default="es")
    a = ap.parse_args()
    if a.header is None:
        a.header = "Verse of the Day" if a.lang == "en" else "Versículo del día"

    card = Image.open(A("card.png")).convert("RGBA")
    font, lines, lh = fit(a.verse)
    ref_font = ImageFont.truetype(A("ref.woff"), 30)
    words = sum(len(l) for l in lines)
    # short verses keep the template timing; long ones get ~0.22s per word plus a 2.5s hold
    reveal_end = max(REVEAL_END, REVEAL_START + words * 0.22)
    total = max(VERSE_SECONDS, reveal_end + 2.5)
    step = (reveal_end - REVEAL_START) / words

    tmp = tempfile.mkdtemp()
    listing, t = [], 0.0
    for k in range(words + 1):
        start = 0.0 if k == 0 else REVEAL_START + (k - 1) * step
        end = REVEAL_START + k * step if k < words else total
        img = frame(card, font, lines, lh, k, a.reference if k == words else "", ref_font)
        if not a.keep_header:
            draw_header(img, a.header)
        p = os.path.join(tmp, f"s{k:03d}.png"); img.save(p)
        listing.append(f"file '{p}'\nduration {end - start:.3f}")
    listing.append(f"file '{p}'")
    lst = os.path.join(tmp, "list.txt"); open(lst, "w").write("\n".join(listing))

    seg = os.path.join(tmp, "verse.mp4")
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-stream_loop", "-1", "-i", a.background,
        "-f", "concat", "-safe", "0", "-i", lst,
        "-filter_complex",
        f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30,setsar=1[bg];"
        f"[1:v]format=rgba[ov];[bg][ov]overlay=0:0:shortest=1,format=yuv420p[v]",
        "-map", "[v]", "-t", f"{total:.3f}", "-c:v", "libx264", "-crf", "18", "-an", seg], check=True)
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", seg, "-i", A(f"endcard_{a.lang}.mp4"),
        "-filter_complex",
        # force both parts to exactly 1080x1920 (9:16), square pixels, 30fps before joining
        f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30[a];"
        f"[1:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30[b];"
        f"[a][b]concat=n=2:v=1[v]", "-map", "[v]",
        "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.out], check=True)
    # hard check: refuse to output anything that isn't 1080x1920
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                            "stream=width,height,sample_aspect_ratio", "-of", "csv=p=0", a.out],
                           capture_output=True, text=True, check=True).stdout.strip()
    w, h = (int(x) for x in probe.split(",")[:2])
    if (w, h) != (W, H):
        os.remove(a.out)
        raise SystemExit(f"Rendered {w}x{h}, expected {W}x{H}; output deleted")
    print(a.out, f"{w}x{h}")


def draw_header(img, text):
    """'Versículo del día' + PrayCrew logo on top of the loop."""
    # soft white fade at the top so the title and logo read on dark or busy footage
    fade = Image.new("L", (1, 330))
    for y in range(330):
        fade.putpixel((0, y), int(175 * (1 - (y / 330)) ** 1.6))
    band = Image.new("RGBA", (W, 330), (255, 255, 255, 0))
    band.putalpha(fade.resize((W, 330)))
    under = Image.new("RGBA", img.size, (0, 0, 0, 0)); under.paste(band, (0, 0))
    under.alpha_composite(img); img.paste(under)
    d = ImageDraw.Draw(img)
    hf = ImageFont.truetype(A("header.woff"), 66)
    d.text((W / 2, 72), text, font=hf, fill=(0, 0, 0), anchor="mm")
    logo = Image.open(A("logo.png")).convert("RGBA")
    img.alpha_composite(logo, ((W - logo.width) // 2, 112))


if __name__ == "__main__":
    main()
