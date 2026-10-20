"""Build the closing cards: the template's QR card (6s) + a new 'Available on' card with icon and store badges.
Writes assets/endcard_en.mp4 and assets/endcard_es.mp4 (1080x1920, 30fps)."""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda p: os.path.join(HERE, "assets", p)
W, H = 1080, 1920
NAVY = (23, 62, 79)
TEMPLATE = sys.argv[1]          # original Canva export, used only for the QR card
QR_START, QR_END = 8.067, 14.067
FINAL_SECONDS = 3.5


def rounded(im, r):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r, fill=255)
    out = im.convert("RGBA"); out.putalpha(m); return out


def logo(width):
    src = Image.open(A("logo_src.jpg")).convert("RGB")
    a = ImageOps.invert(src.convert("L")).point(lambda v: 0 if v < 12 else min(255, int((v - 12) * 255 / 203)))
    out = Image.new("RGBA", src.size, NAVY + (0,)); out.putalpha(a)
    out = out.crop(out.getbbox())
    return out.resize((width, round(width * out.height / out.width)), Image.LANCZOS)


def card(caption):
    img = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    d = ImageDraw.Draw(img)
    lg = logo(760); y = 240
    img.alpha_composite(lg, ((W - lg.width) // 2, y)); y += lg.height + 110
    icon = rounded(Image.open(A("icon.jpg")).convert("RGB").resize((470, 470), Image.LANCZOS), 96)
    img.alpha_composite(icon, ((W - 470) // 2, y)); y += 470 + 120
    f = ImageFont.truetype(A("cta.woff"), 96)
    d.text((W / 2, y), caption, font=f, fill=(17, 17, 17), anchor="mt"); y += 96 + 95
    for name in ("badge_apple.png", "badge_google.png"):
        b = Image.open(A(name)).convert("RGBA")
        b = b.resize((600, round(600 * b.height / b.width)), Image.LANCZOS)
        img.alpha_composite(b, ((W - b.width) // 2, y)); y += b.height + 40
    return img.convert("RGB")


def build(lang, caption):
    png = A(f"final_{lang}.png"); card(caption).save(png)
    out = A(f"endcard_{lang}.mp4")
    subprocess.run([
        "ffmpeg", "-v", "error", "-y",
        "-ss", str(QR_START), "-t", f"{QR_END - QR_START:.3f}", "-i", TEMPLATE,
        "-loop", "1", "-t", str(FINAL_SECONDS), "-i", png,
        "-filter_complex",
        f"[0:v]scale={W}:{H},setsar=1,fps=30,format=yuv420p[q];"
        f"[1:v]scale={W}:{H},setsar=1,fps=30,format=yuv420p[f];[q][f]concat=n=2:v=1[v]",
        "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "18", out], check=True)
    print(out)


if __name__ == "__main__":
    build("en", "Available on")
    build("es", "Disponible en")
