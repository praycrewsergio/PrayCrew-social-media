"""Sunday recap carousel: the week's verses (Mon–Sun) as 1080x1350 slides, EN and ES.

usage: python3 recap.py SUNDAY_DATE            -> renders ../videos/recap/<date>_<lang>/NN.jpg
       python3 recap.py SUNDAY_DATE --posts    -> prints Metricool payload lines (blogId, date, network, info)

Posts at 18:00 America/Chicago: Instagram carousel (EN + ES), LinkedIn document carousel (EN), TikTok photo carousel (EN).
"""
import json, os, sys, subprocess, datetime
from zoneinfo import ZoneInfo
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import batch
from render import font, wrap_words, fit, white_logo, A
from posts_from_copy import nested

W, H = 1080, 1350
OUT = os.path.join(HERE, "..", "videos", "recap")
RAW = "https://raw.githubusercontent.com/praycrewsergio/PrayCrew-social-media/media/videos/recap/"
EN, ES = "5449351", "5454893"
DAYS = {"en": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        "es": ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"]}
MONTHS = {"en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          "es": ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]}


def week(sunday):
    out = []
    for i in range(7):
        d = sunday - datetime.timedelta(days=6 - i)
        day = (d - batch.START).days + 1
        if day >= 1:
            v, loop, _ = batch.day_info(day)
            out.append((d, v, loop))
    return out


def bg(loop):
    p = os.path.join(OUT, f"_bg{loop:02d}.png")
    if not os.path.exists(p):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "3", "-i", os.path.join(HERE, "loops", f"loop{loop:02d}.mp4"),
                        "-frames:v", "1", "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}", p], check=True)
    return Image.open(p).convert("RGBA")


def shade(img, a=150):
    img.alpha_composite(Image.new("RGBA", img.size, (0, 0, 0, a)))
    return img


def logo_top(img, y=70):
    lg = white_logo(240); img.alpha_composite(lg, ((W - lg.width) // 2, y))


def slides(sunday, lang):
    wk = week(sunday)
    d0, d1 = wk[0][0], wk[-1][0]
    rng = f"{d0.day}–{d1.day} {MONTHS[lang][d1.month - 1]}" if d0.month == d1.month else \
          f"{d0.day} {MONTHS[lang][d0.month - 1]} – {d1.day} {MONTHS[lang][d1.month - 1]}"
    out = []
    # cover
    img = shade(bg(wk[-1][2]).filter(ImageFilter.GaussianBlur(6)), 120); d = ImageDraw.Draw(img); logo_top(img)
    title = ["THIS WEEK'S", "VERSES"] if lang == "en" else ["LOS VERSÍCULOS", "DE LA SEMANA"]
    tf = fit(" ".join(title).split(), "sans_bold.woff", 120, 60, 940, 400, 1.1)[0]
    d.text((W / 2, 560), title[0], font=tf, fill="white", anchor="mm"); d.text((W / 2, 690), title[1], font=tf, fill="white", anchor="mm")
    d.text((W / 2, 820), rng, font=font("serif_italic.woff", 64), fill="white", anchor="mm")
    d.text((W / 2, 1220), "Swipe  ›" if lang == "en" else "Desliza  ›", font=font("sans.woff", 36), fill="white", anchor="mm")
    out.append(img)
    # one slide per day
    for dt, v, loop in wk:
        img = shade(bg(loop), 140); d = ImageDraw.Draw(img); logo_top(img)
        d.text((W / 2, 230), DAYS[lang][dt.weekday()], font=font("sans.woff", 34), fill=(255, 255, 255, 220), anchor="mm")
        f, lines, lh = fit(("“" + nested(v[lang]) + "”").split(), "serif.woff", 70, 34, 900, 820, 1.27)
        y = 700 - len(lines) * lh / 2 + lh / 2
        for ln in lines:
            d.text((W / 2, y), " ".join(ln), font=f, fill="white", anchor="mm"); y += lh
        ref = (v["ref_en"] if lang == "en" else v["ref_es"]).replace("-", "–") + (" · BSB" if lang == "en" else " · RVR1909")
        d.text((W / 2, y + 40), ref.upper(), font=font("sans.woff", 32), fill="white", anchor="mm")
        out.append(img)
    # closing slide
    img = Image.new("RGBA", (W, H), (255, 255, 255, 255)); d = ImageDraw.Draw(img)
    lg = Image.open(A("logo.png")).convert("RGBA"); lg = lg.resize((560, round(560 * lg.height / lg.width)), Image.LANCZOS)
    img.alpha_composite(lg, ((W - lg.width) // 2, 170))
    q = "Which verse spoke to you this week?" if lang == "en" else "¿Qué versículo te habló esta semana?"
    qf, ql, qlh = fit(q.split(), "sans_bold.woff", 72, 40, 900, 300, 1.2)
    y = 420
    for ln in ql:
        d.text((W / 2, y), " ".join(ln), font=qf, fill=(17, 17, 17), anchor="mm"); y += qlh
    sub = "Share your prayer requests with your church on PrayCrew." if lang == "en" else "Comparte tus peticiones de oración con tu iglesia en PrayCrew."
    sf, sl, slh = fit(sub.split(), "sans.woff", 40, 28, 860, 200, 1.3)
    y += 40
    for ln in sl:
        d.text((W / 2, y), " ".join(ln), font=sf, fill=(60, 60, 60), anchor="mm"); y += slh
    d.text((W / 2, y + 70), "Available on" if lang == "en" else "Disponible en", font=font("cta.woff", 60), fill=(17, 17, 17), anchor="mm")
    y += 150
    for name in ("badge_apple.png", "badge_google.png"):
        b = Image.open(A(name)).convert("RGBA"); b = b.resize((460, round(460 * b.height / b.width)), Image.LANCZOS)
        img.alpha_composite(b, ((W - b.width) // 2, int(y))); y += b.height + 30
    out.append(img)
    return out


def render(sunday):
    paths = {}
    for lang in ("en", "es"):
        d = os.path.join(OUT, f"{sunday}_{lang}"); os.makedirs(d, exist_ok=True)
        paths[lang] = []
        for i, img in enumerate(slides(sunday, lang), 1):
            p = os.path.join(d, f"{i:02d}.jpg"); img.convert("RGB").save(p, quality=92); paths[lang].append(p)
    return paths


def posts(sunday):
    wk = week(sunday)
    n = len(wk) + 2
    urls = {lang: [f"{RAW}{sunday}_{lang}/{i:02d}.jpg" for i in range(1, n + 1)] for lang in ("en", "es")}
    when = f"{sunday}T18:00:00"
    date = datetime.datetime.fromisoformat(when).replace(tzinfo=ZoneInfo("America/Chicago")).isoformat()
    ab = {"en": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "es": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]}
    lst = {lang: "\n".join(f"{ab[lang][dt.weekday()]} — {(v['ref_en'] if lang == 'en' else v['ref_es']).replace('-', '–')}"
                           for dt, v, _ in wk) for lang in ("en", "es")}
    en = (f"Your week in Scripture 📖🙏\n\n{lst['en']}\n\nWhich verse spoke to you most? Tell us in the comments and we'll pray with you.\n\n"
          "Save this to come back to it this week. 💙\n📲 Share prayer requests with your church on PrayCrew, available on the App Store and Google Play.\n\n"
          "#VerseOfTheDay #BibleVerse #WeeklyDevotional #Prayer #PrayCrew")
    es = (f"Tu semana en la Palabra 📖🙏\n\n{lst['es']}\n\n¿Qué versículo te habló más? Cuéntanos en los comentarios y oraremos contigo.\n\n"
          "Guárdalo para volver a leerlo esta semana. 💙\n📲 Comparte tus peticiones de oración con tu iglesia en PrayCrew, disponible en App Store y Google Play.\n\n"
          "#VersículoDelDía #Biblia #Devocional #Oración #PrayCrew")
    li = (f"This week in Scripture, in one place.\n\n{lst['en']}\n\nA verse a day is a simple rhythm for leaders: a few minutes of perspective before the decisions start. "
          "Which one do you want to carry into next week?\n\n"
          "At PrayCrew, we help churches and ministries organize prayer requests so every need is seen and prayed for.\n\n"
          "#VerseOfTheDay #FaithAtWork #ChurchLeadership")
    tk = "Your week in Scripture 📖🙏 which verse spoke to you most? #BibleVerse #ChristianTikTok #Prayer #VerseOfTheDay #PrayCrew"
    fc = {"en": "Drop your prayer request below 🙏 Our PrayCrew community will pray with you.",
          "es": "Deja tu petición de oración aquí abajo 🙏 Nuestra comunidad de PrayCrew orará contigo."}

    def base(lang, net, text, comment=True):
        return {"autoPublish": True, "draft": False, "descendants": [], "firstCommentText": fc[lang] if comment else "",
                "hasNotReadNotes": False, "media": urls[lang], "mediaAltText": [], "providers": [{"network": net}],
                "publicationDate": {"dateTime": when, "timezone": "America/Chicago"}, "shortener": False,
                "smartLinkData": {"ids": []}, "text": text}
    out = []
    p = base("en", "instagram", en); p["instagramData"] = {"type": "POST", "collaborators": [], "isAiGenerated": False}; out.append((EN, "instagram", p))
    p = base("es", "instagram", es); p["instagramData"] = {"type": "POST", "collaborators": [], "isAiGenerated": False}; out.append((ES, "instagram", p))
    p = base("en", "linkedin", li)
    p["linkedinData"] = {"type": "post", "previewIncluded": True, "publishImagesAsPDF": True,
                         "documentTitle": f"This week in Scripture — PrayCrew"}
    out.append((EN, "linkedin", p))
    p = base("en", "tiktok", tk, comment=False)
    p["tiktokData"] = {"title": "Your week in Scripture 📖🙏", "disableComment": False, "disableDuet": False, "disableStitch": False,
                       "privacyOption": "PUBLIC_TO_EVERYONE", "commercialContentThirdParty": False, "commercialContentOwnBrand": False,
                       "autoAddMusic": True, "photoCoverIndex": 0, "isAigc": False}
    out.append((EN, "tiktok", p))
    return date, out


if __name__ == "__main__":
    sunday = datetime.date.fromisoformat(sys.argv[1])
    assert sunday.weekday() == 6, "date must be a Sunday"
    if "--posts" in sys.argv:
        date, ps = posts(sunday)
        for blog, net, p in ps:
            print(json.dumps({"blogId": blog, "date": date, "network": net, "info": json.dumps(p, ensure_ascii=False)}, ensure_ascii=False))
    else:
        r = render(sunday); print({k: len(v) for k, v in r.items()})
