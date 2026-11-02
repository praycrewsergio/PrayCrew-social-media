#!/usr/bin/env python3
"""Feature recap videos, cut from the finished feature reels (videos/feature_<name>_<lang>.mp4).

usage: recap_video.py vertical|horizontal en|es OUT.mp4

vertical   1080x1920, ~60 s: intro card, 13 x 3.2 s clips (new header: section + one-line caption),
           small-groups outro ("Wherever two or three gather…"), QR / "Available on" end card. Music bed.
horizontal 1920x1080, ~3 min demo for YouTube / website: the reel plays on the right (whole frame),
           section, title and description on the left; intro, section cards, outro and end card.
"""
import os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFilter
from render import A, W, H, font, fit, white_logo
from feature import background, SAND

HERE = os.path.dirname(os.path.abspath(__file__))
VID = os.path.join(HERE, "..", "videos")
HEADER_H = 380          # feature reels: logo, label and caption live above y=380; the screen starts at y=400
CLIP = 3.2

SECTIONS = {"pray": {"en": "PRAY", "es": "ORA"}, "together": {"en": "TOGETHER", "es": "JUNTOS"},
            "grow": {"en": "GROW", "es": "CRECE"}}
SECTION_SUB = {"pray": {"en": "Never forget a prayer request", "es": "Ninguna petición se olvida"},
               "together": {"en": "Pray as a crew", "es": "Oren como grupo"},
               "grow": {"en": "Remember, measure and reach more people", "es": "Recuerda, mide y alcanza a más personas"}}

# name, section, vertical clip start (en, es), horizontal window start (en, es),
# vertical caption, horizontal title, horizontal description
F = [
 ("prayerrequest", "pray", (5.5, 4.5), (4.5, 3.5),
  {"en": "Know who's praying for you", "es": "Sabe quién ora por ti"},
  {"en": "Prayer requests", "es": "Peticiones de oración"},
  {"en": "See how many times you've been prayed for and by whom. Every request gets a Bible verse and a prayer.",
   "es": "Mira cuántas veces han orado por ti y quiénes. Cada petición recibe un versículo y una oración."}),
 ("followup", "pray", (29.5, 26.0), (6.0, 6.4),
  {"en": "Follow up with a selfie,\nvoice note or video", "es": "Da seguimiento con una selfie,\nnota de voz o video"},
  {"en": "Follow-up", "es": "Seguimiento"},
  {"en": "Tap the hands so they know you prayed, then follow up with a message, voice note, picture or video.",
   "es": "Toca las manos para que sepan que oraste y da seguimiento con mensaje, nota de voz, foto o video."}),
 ("notifications", "pray", (6.3, 6.4), (2.2, 2.2),
  {"en": "Know every time\nsomeone prays for you", "es": "Entérate cada vez\nque oran por ti"},
  {"en": "Prayer notifications", "es": "Notificaciones de oración"},
  {"en": "Every time someone prays for you or sends encouragement, your phone lets you know.",
   "es": "Cada vez que alguien ora por ti o te envía ánimo, tu teléfono te avisa."}),
 ("guided", "pray", (4.6, 4.6), (4.6, 4.6),
  {"en": "A verse and a guided prayer,\nevery day", "es": "Un versículo y una oración guiada,\ncada día"},
  {"en": "Verse of the Day & guided prayer", "es": "Versículo del día y oración guiada"},
  {"en": "A new verse and a new guided prayer every day, written and prayed over by our team.",
   "es": "Un versículo y una oración guiada nuevos cada día, escritos y orados por nuestro equipo."}),
 ("crews", "together", (3.6, 3.8), (1.8, 1.8),
  {"en": "Start a crew in under a minute", "es": "Crea un grupo en menos de un minuto"},
  {"en": "Crews", "es": "Grupos"},
  {"en": "Create a prayer crew for any group, choose how requests are shared and invite your people.",
   "es": "Crea un grupo de oración para cualquier comunidad, elige cómo se comparten las peticiones e invita a tu gente."}),
 ("addmembers", "together", (5.2, 4.0), (1.8, 1.8),
  {"en": "Invite members with a QR code", "es": "Invita miembros con un código QR"},
  {"en": "Add members by QR code", "es": "Agrega miembros con código QR"},
  {"en": "Show your crew's QR code or share the link. They ask to join and you approve with one tap.",
   "es": "Muestra el código QR de tu grupo o comparte el enlace. Piden unirse y los apruebas con un toque."}),
 ("sso", "together", (1.6, 1.6), (1.6, 1.6),
  {"en": "Sign in with Apple or Gmail", "es": "Entra con Apple o Gmail"},
  {"en": "Single sign-on", "es": "Inicio de sesión rápido"},
  {"en": "No new password. Sign in with Apple or Gmail, confirm with Face ID and start praying.",
   "es": "Sin contraseñas nuevas. Entra con Apple o Gmail, confirma con Face ID y empieza a orar."}),
 ("chat", "together", (5.8, 6.6), (5.8, 6.6),
  {"en": "A private chat for every crew", "es": "Un chat privado para cada grupo"},
  {"en": "Crew chat", "es": "Chat del grupo"},
  {"en": "Messages, reactions, pinned announcements, voice notes, photos, videos, documents and polls. Only your crew can see it.",
   "es": "Mensajes, reacciones, avisos fijados, notas de voz, fotos, videos, documentos y encuestas. Solo tu grupo lo ve."}),
 ("unread", "together", (2.0, 2.0), (2.0, 2.0),
  {"en": "Never miss a prayer update", "es": "No te pierdas ninguna actualización"},
  {"en": "Unread messages", "es": "Mensajes sin leer"},
  {"en": "Red circles show which crew and which prayer request has new comments.",
   "es": "Los círculos rojos muestran qué grupo y qué petición tienen comentarios nuevos."}),
 ("remember", "grow", (11.1, 11.1), (5.4, 5.4),
  {"en": "Remember every answered prayer", "es": "Recuerda cada oración contestada"},
  {"en": "Remember", "es": "Recordando"},
  {"en": "Every month, a video of your crew's answered prayers paired with Scripture, and one for the whole year.",
   "es": "Cada mes, un video de las oraciones contestadas de tu grupo con la Escritura, y uno de todo el año."}),
 ("metrics", "grow", (4.3, 4.0), (2.0, 2.0),
  {"en": "See your prayer life in numbers", "es": "Tu vida de oración en números"},
  {"en": "Personal metrics", "es": "Métricas personales"},
  {"en": "Your answered prayers, your daily prayer habit, and how many times you prayed for others.",
   "es": "Tus oraciones contestadas, tu hábito diario y cuántas veces oraste por otros."}),
 ("groupmetrics", "grow", (17.5, 17.2), (2.2, 2.2),
  {"en": "Get a pulse of your community", "es": "Conoce el pulso de tu comunidad"},
  {"en": "Group metrics", "es": "Métricas del grupo"},
  {"en": "What your crew is praying about, answered prayers month by month and your most faithful prayer warriors.",
   "es": "Por qué ora tu grupo, oraciones contestadas mes a mes y tus guerreros de oración más fieles."}),
 ("landing", "grow", (24.2, 21.7), (15.7, 15.9),
  {"en": "A branded prayer page\nfor your church", "es": "Una página de oración\ncon tu marca"},
  {"en": "Branded prayer page", "es": "Página de oración con tu marca"},
  {"en": "Collect prayer requests from anyone, no app or account needed. Share the link or embed it on your website.",
   "es": "Recibe peticiones de cualquier persona, sin app ni cuenta. Comparte el enlace o insértala en tu sitio web."}),
]
H_WIN = 11.0
INTRO = {"en": ("Everything PrayCrew does", "in 60 seconds"), "es": ("Todo lo que hace PrayCrew", "en 60 segundos")}
INTRO_H = {"en": ("PrayCrew", "A quick tour of every feature"), "es": ("PrayCrew", "Un recorrido por todas las funciones")}
OUTRO_H = {"en": ("Wherever two or three gather,\nthere's a PrayCrew.", "Download PrayCrew free on the\nApp Store and Google Play."),
           "es": ("Donde se reúnan dos o tres,\nhay un PrayCrew.", "Descarga PrayCrew gratis en\nApp Store y Google Play.")}
SG_OUTRO = [(16.0, 19.6), (21.6, 25.2)]   # "Wherever two or three gather…" / "What's your crew?"
FPS = 30
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS)]


def run(cmd):
    subprocess.run(cmd, check=True)


def encode(args, out):
    tmp = out[:-4] + ".part.mp4"
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args, *ENC, "-an", tmp])
    os.replace(tmp, out)


def centered(d, text, f, cx, y, fill, lh=None):
    rows = text.split("\n"); lh = lh or int(f.size * 1.2)
    y0 = y - (len(rows) - 1) * lh / 2
    for i, r in enumerate(rows):
        d.text((cx, y0 + i * lh), r, font=f, fill=fill, anchor="mm")


def fit_lines(text, fname, start, stop, width):
    rows = text.split("\n")
    for size in range(start, stop - 1, -2):
        f = font(fname, size)
        if max(f.getlength(r) for r in rows) <= width: return f
    return f


# ---------- vertical ----------
def v_background(path):
    background(1000, path)   # gradient + logo; the screen outline sits below y=380 and is never used here


def v_header(bg, section, lang, caption, path):
    im = Image.open(bg).convert("RGBA").crop((0, 0, W, HEADER_H))
    d = ImageDraw.Draw(im)
    d.text((W / 2, 170), " ".join(SECTIONS[section][lang]), font=font("sans_bold.woff", 30), fill=SAND + (255,), anchor="mm")
    f = fit_lines(caption, "sans_bold.woff", 74, 46, 960)
    centered(d, caption, f, W / 2, 285, "white", int(f.size * 1.18))
    full = Image.new("RGBA", (W, H), (0, 0, 0, 0)); full.paste(im, (0, 0)); full.save(path)


def v_intro(bg, lang, path):
    top, bot = (36, 65, 81), (14, 25, 31)
    im = Image.new("RGB", (W, H)); dd = ImageDraw.Draw(im)
    for y in range(H):
        t = y / H; dd.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    glow = Image.new("L", (W, H), 0); ImageDraw.Draw(glow).ellipse((W / 2 - 560, 650, W / 2 + 560, 1450), fill=60)
    im = Image.composite(Image.new("RGB", (W, H), SAND), im, glow.filter(ImageFilter.GaussianBlur(170)))
    lg = white_logo(230); im.paste(lg, ((W - lg.width) // 2, 64), lg)
    d = ImageDraw.Draw(im)
    a, b = INTRO[lang]
    fa = fit_lines(a, "sans_bold.woff", 96, 60, 960)
    d.text((W / 2, 860), a, font=fa, fill="white", anchor="mm")
    d.text((W / 2, 985), b, font=font("sans_bold.woff", 84), fill=SAND, anchor="mm")
    y = 1150
    for s in ("pray", "together", "grow"):
        d.text((W / 2, y), " ".join(SECTIONS[s][lang]), font=font("sans_bold.woff", 40), fill=(255, 255, 255), anchor="mm")
        y += 80
    im.save(path)


def vertical(lang, out, tmp):
    bg = os.path.join(tmp, "bg.png"); v_background(bg)
    parts = []
    ip = os.path.join(tmp, "intro.png"); v_intro(bg, lang, ip)
    p = os.path.join(tmp, "00_intro.mp4")
    encode(["-framerate", str(FPS), "-i", ip, "-vf", "format=yuv420p,loop=-1:1,trim=duration=2.4,fade=t=in:d=0.3"], p)
    parts.append(p)
    li = 0 if lang == "en" else 1
    for k, (name, sec, vst, _, cap, _, _) in enumerate(F):
        hp = os.path.join(tmp, f"h{k}.png"); v_header(bg, sec, lang, cap[lang], hp)
        src = os.path.join(VID, f"feature_{name}_{lang}.mp4")
        p = os.path.join(tmp, f"{k + 1:02d}_{name}.mp4")
        encode(["-ss", f"{vst[li]:.2f}", "-t", f"{CLIP:.2f}", "-i", src, "-i", hp, "-filter_complex",
                "[0:v]fps=30,setpts=PTS-STARTPTS[a];[a][1:v]overlay=0:0,format=yuv420p"], p)
        parts.append(p)
    sg = os.path.join(VID, f"feature_smallgroups_{lang}.mp4")
    for j, (a, b) in enumerate(SG_OUTRO):
        p = os.path.join(tmp, f"20_outro{j}.mp4")
        encode(["-ss", str(a), "-t", f"{b - a:.2f}", "-i", sg, "-vf", "fps=30,setpts=PTS-STARTPTS,format=yuv420p"], p)
        parts.append(p)
    p = os.path.join(tmp, "30_end.mp4")
    encode(["-i", A(f"endcard_{lang}.mp4"), "-vf", f"scale={W}:{H},setsar=1,fps=30,format=yuv420p"], p)
    parts.append(p)
    finish(parts, out, tmp, music=2)


# ---------- horizontal ----------
HW, HH = 1920, 1080
PH_W = 608               # 1080x1920 reel scaled to 608x1080
PH_X = 1180


def h_background():
    top, bot = (36, 65, 81), (14, 25, 31)
    bg = Image.new("RGB", (HW, HH)); d = ImageDraw.Draw(bg)
    for y in range(HH):
        t = y / HH; d.line([(0, y), (HW, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    glow = Image.new("L", (HW, HH), 0)
    ImageDraw.Draw(glow).ellipse((PH_X - 260, 180, PH_X + PH_W + 260, 1000), fill=55)
    glow = glow.filter(ImageFilter.GaussianBlur(140))
    bg = Image.composite(Image.new("RGB", (HW, HH), SAND), bg, glow)
    lg = white_logo(250); bg.paste(lg, (120, 90), lg)
    return bg


def h_frame(bg):
    """Background with a soft shadow + thin outline where the reel goes."""
    im = bg.copy()
    sh = Image.new("L", (HW, HH), 0)
    ImageDraw.Draw(sh).rounded_rectangle((PH_X + 8, 30, PH_X + PH_W + 8, 30 + 1020 + 12), 36, fill=170)
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    im = Image.composite(Image.new("RGB", (HW, HH), (0, 0, 0)), im, sh)
    return im


def wrap(text, f, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if cur and f.getlength(cur + " " + w) > width: lines.append(cur); cur = w
        else: cur = (cur + " " + w).strip()
    return lines + [cur]


def h_panel(bg, section, lang, idx, title, desc, path):
    im = h_frame(bg); d = ImageDraw.Draw(im)
    x = 120
    d.text((x, 360), f"{' '.join(SECTIONS[section][lang])}   ·   {idx:02d} / {len(F):02d}", font=font("sans_bold.woff", 30),
           fill=SAND, anchor="lm")
    ft = font("sans_bold.woff", 80)
    while ft.getlength(title) > 940 and ft.size > 50: ft = font("sans_bold.woff", ft.size - 2)
    d.text((x, 450), title, font=ft, fill="white", anchor="lm")
    fd = font("sans.woff", 42); y = 560
    for ln in wrap(desc, fd, 900):
        d.text((x, y), ln, font=fd, fill=(220, 228, 232), anchor="lm"); y += 60
    im.save(path)


def h_card(bg, lines, path, with_frame=False):
    """lines: [(text, size, color, y)] drawn centered in the left area (or full width)."""
    im = h_frame(bg) if with_frame else bg.copy(); d = ImageDraw.Draw(im)
    for text, size, color, y, cx in lines:
        f = font("sans_bold.woff", size)
        centered(d, text, f, cx, y, color, int(size * 1.22))
    im.save(path)


def h_clip(panel, src, ss, dur, out, fade_in=True):
    m = Image.new("L", (PH_W, 1080), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, PH_W - 1, 1079), 36, fill=255)
    mp = out[:-4] + "_m.png"; m.save(mp)
    fi = ",fade=t=in:d=0.35" if fade_in else ""
    encode(["-framerate", str(FPS), "-i", panel, "-ss", f"{ss:.2f}", "-t", f"{dur:.2f}", "-i", src, "-i", mp, "-filter_complex",
            f"[0:v]loop=-1:1,trim=duration={dur:.2f},format=rgba[bg];"
            f"[1:v]fps=30,setpts=PTS-STARTPTS,scale={PH_W}:1080,format=rgba[ph];[2:v]format=gray[m];[ph][m]alphamerge[r];"
            f"[bg][r]overlay={PH_X}:0,format=yuv420p{fi},fade=t=out:st={dur - 0.3:.2f}:d=0.3"], out)


def h_still(png, dur, out):
    encode(["-framerate", str(FPS), "-i", png, "-vf",
            f"format=yuv420p,loop=-1:1,trim=duration={dur:.2f},fade=t=in:d=0.4,fade=t=out:st={dur - 0.4:.2f}:d=0.4"], out)


def horizontal(lang, out, tmp):
    bg = h_background(); parts = []
    li = 0 if lang == "en" else 1
    a, b = INTRO_H[lang]
    ip = os.path.join(tmp, "intro.png")
    h_card(bg, [(a, 130, (255, 255, 255), 470, HW / 2), (b, 54, SAND, 600, HW / 2)], ip)
    # the intro covers the logo position with the big title, so redraw without the corner logo
    im = Image.open(ip); bg_nologo = h_background_nologo(); im = bg_nologo.copy(); d = ImageDraw.Draw(im)
    lg = white_logo(560); im.paste(lg, ((HW - lg.width) // 2, 360), lg)
    d.text((HW / 2, 610), b, font=font("sans_bold.woff", 56), fill=SAND, anchor="mm")
    y = 740; secs = "   ·   ".join(SECTIONS[s][lang] for s in ("pray", "together", "grow"))
    d.text((HW / 2, y), secs, font=font("sans_bold.woff", 38), fill="white", anchor="mm"); im.save(ip)
    p = os.path.join(tmp, "000_intro.mp4"); h_still(ip, 4.0, p); parts.append(p)
    cur = None; n = 0
    for k, (name, sec, _, hst, _, title, desc) in enumerate(F):
        if sec != cur:
            cur = sec; n += 1
            cp = os.path.join(tmp, f"s{n}.png")
            h_card(bg, [(f"{n}", 64, SAND, 430, HW / 2), (SECTIONS[sec][lang], 140, (255, 255, 255), 540, HW / 2),
                        (SECTION_SUB[sec][lang], 50, (220, 228, 232), 670, HW / 2)], cp)
            p = os.path.join(tmp, f"{k + 1:02d}0_section.mp4"); h_still(cp, 2.2, p); parts.append(p)
        pp = os.path.join(tmp, f"p{k}.png"); h_panel(bg, sec, lang, k + 1, title[lang], desc[lang], pp)
        src = os.path.join(VID, f"feature_{name}_{lang}.mp4")
        total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src],
                                     capture_output=True, text=True).stdout) - 9.6   # stop before the reel's end card
        dur = min(H_WIN, total - hst[li])
        p = os.path.join(tmp, f"{k + 1:02d}1_{name}.mp4"); h_clip(pp, src, hst[li], dur, p); parts.append(p)
    # outro: small-groups line on the left, the end card (QR + stores) on the right
    o1, o2 = OUTRO_H[lang]
    op = os.path.join(tmp, "outro.png")
    h_card(bg, [(o1, 58, (255, 255, 255), 450, 590), (o2, 42, SAND, 640, 590)], op, with_frame=True)
    p = os.path.join(tmp, "900_outro.mp4"); h_clip(op, A(f"endcard_{lang}.mp4"), 0, 9.5, p); parts.append(p)
    finish(parts, out, tmp, music=3, w=HW, h=HH)


def h_background_nologo():
    top, bot = (36, 65, 81), (14, 25, 31)
    bg = Image.new("RGB", (HW, HH)); d = ImageDraw.Draw(bg)
    for y in range(HH):
        t = y / HH; d.line([(0, y), (HW, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    glow = Image.new("L", (HW, HH), 0)
    ImageDraw.Draw(glow).ellipse((HW / 2 - 700, 250, HW / 2 + 700, 950), fill=55)
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    return Image.composite(Image.new("RGB", (HW, HH), SAND), bg, glow)


def finish(parts, out, tmp, music, w=W, h=H):
    lst = os.path.join(tmp, "list.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    joined = os.path.join(tmp, "joined.mp4")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", joined])
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", joined],
                               capture_output=True, text=True).stdout)
    tmpout = out[:-4] + ".part.mp4"
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", joined, "-stream_loop", "-1", "-i", A(f"music/track{music}.m4a"),
         "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", f"afade=t=in:d=1.0,afade=t=out:st={dur - 2.5:.2f}:d=2.5",
         "-c:a", "aac", "-b:a", "160k", "-t", f"{dur:.3f}", "-movflags", "+faststart", tmpout])
    os.replace(tmpout, out)
    print(out, f"{dur:.1f}s")


if __name__ == "__main__":
    kind, lang, out = sys.argv[1:4]
    tmp = tempfile.mkdtemp()
    (vertical if kind == "vertical" else horizontal)(lang, os.path.abspath(out), tmp)
