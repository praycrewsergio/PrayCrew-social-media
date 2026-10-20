"""Build the 7 Metricool post payloads for one day from copy/YYYY-MM-DD.json.

usage: python3 posts_from_copy.py YYYY-MM-DD   -> prints one JSON line per post:
       {"blogId", "date", "network", "info"}   (info is the JSON string for createScheduledPost)

Copy file keys (see COPY_GUIDE.md):
  hook_en, reflect_en, q_en, x_en:[quote, ref], tiktok, yt_title, yt_line,
  li_open, li_quote:[quote, ref], li_body, hook_es, reflect_es, q_es, x_es:[quote, ref]
"""
import json, os, re, sys, datetime
import batch

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = "https://raw.githubusercontent.com/praycrewsergio/PrayCrew-social-media/media/videos/"
EN, ES = "5449351", "5454893"
POST_TIME = "10:00:00"
FIRST_COMMENT = {"en": "Drop your prayer request below 🙏 Our PrayCrew community will pray with you.",
                 "es": "Deja tu petición de oración aquí abajo 🙏 Nuestra comunidad de PrayCrew orará contigo."}
FIRST_COMMENT_NETS = {"instagram", "linkedin", "youtube"}


def nested(t):
    """Inner quotations use single curly quotes so the outer “ ” stay unambiguous."""
    return re.sub(r"“([^”]*)”", r"‘\1’", t)


def full(t):
    return re.sub(r"[,;:]$", "…", nested(t.strip()))


def payloads(date_str):
    date = datetime.date.fromisoformat(date_str)
    day = (date - batch.START).days + 1
    v, _, _ = batch.day_info(day)
    c = json.load(open(os.path.join(HERE, "copy", f"{date_str}.json")))
    when = f"{date_str}T{POST_TIME}"
    from zoneinfo import ZoneInfo
    d = datetime.datetime.fromisoformat(when).replace(tzinfo=ZoneInfo("America/Chicago")).isoformat()

    def base(lang, net, text):
        return {"autoPublish": True, "draft": False, "descendants": [],
                "firstCommentText": FIRST_COMMENT[lang] if net in FIRST_COMMENT_NETS else "", "hasNotReadNotes": False,
                "media": [f"{RAW}{date_str}_{lang}.mp4"], "mediaAltText": [], "providers": [{"network": net}],
                "publicationDate": {"dateTime": when, "timezone": "America/Chicago"}, "shortener": False,
                "smartLinkData": {"ids": []}, "text": text}

    ref_en = v["ref_en"].replace("-", "–"); ref_es = v["ref_es"].replace("-", "–")
    reel = {"type": "REEL", "showReelOnFeed": True, "collaborators": [], "isAiGenerated": False}
    out = []
    t = (f"{c['hook_en']}\n\n“{full(v['en'])}” — {ref_en} (BSB)\n\n{c['reflect_en']} {c['q_en']} {c.get('ig_cta_en', "Share it in the comments and we'll pray with you.")}\n\n"
         "Send this to someone who needs it today. 💙\n📲 Share prayer requests with your church on PrayCrew, available on the App Store and Google Play.\n\n"
         "#VerseOfTheDay #BibleVerse #Prayer #Faith #PrayCrew")
    p = base("en", "instagram", t); p["instagramData"] = reel; out.append((EN, "instagram", p))
    q, r = c["x_en"]
    p = base("en", "twitter", f"“{nested(q)}” — {r}\n\n{c['q_en']} {c.get('x_cta_en', "Reply and we'll pray with you.")} 🙏\n#VerseOfTheDay"); p["twitterData"] = {"tags": []}; out.append((EN, "twitter", p))
    tk = c["tiktok"] + " #BibleVerse #ChristianTikTok #Prayer #VerseOfTheDay #PrayCrew"
    p = base("en", "tiktok", tk)
    p["tiktokData"] = {"title": tk, "disableComment": False, "disableDuet": False, "disableStitch": False, "privacyOption": "PUBLIC_TO_EVERYONE",
                       "commercialContentThirdParty": False, "commercialContentOwnBrand": False, "autoAddMusic": False, "isAigc": False}
    out.append((EN, "tiktok", p))
    yt = (f"“{full(v['en'])}” — {ref_en} (BSB)\n\n{c['yt_line']} Subscribe for a daily Bible verse.\n\n"
          "📲 Share prayer requests with your church on PrayCrew, available on the App Store and Google Play.\n\n#Shorts #BibleVerse #VerseOfTheDay")
    p = base("en", "youtube", yt)
    p["youtubeData"] = {"title": c["yt_title"][:100], "type": "short", "privacy": "public",
                        "tags": ["Bible verse", "Verse of the Day", ref_en.split(":")[0], "Prayer", "PrayCrew", "Christian"],
                        "category": "NONPROFITS_ACTIVISM", "madeForKids": False, "isAiGeneratedContent": False}
    out.append((EN, "youtube", p))
    lq, lr = c["li_quote"]
    li = (f"{c['li_open']}\n\n“{nested(lq)}” — {lr}\n\n{c['li_body']}\n\n"
          "At PrayCrew, we help churches and ministries organize prayer requests so every need is seen and prayed for.\n\n"
          "How can we pray for you this week?\n\n#VerseOfTheDay #FaithAtWork #ChurchLeadership")
    p = base("en", "linkedin", li); p["linkedinData"] = {"type": "post", "previewIncluded": True, "publishImagesAsPDF": False}
    out.append((EN, "linkedin", p))
    t = (f"{c['hook_es']}\n\n“{full(v['es'])}” — {ref_es} (RVR1909)\n\n{c['reflect_es']} {c['q_es']} {c.get('ig_cta_es', 'Escríbelo en los comentarios y oraremos contigo.')}\n\n"
         "Comparte este versículo con alguien que lo necesite hoy. 💙\n📲 Comparte tus peticiones de oración con tu iglesia en PrayCrew, disponible en App Store y Google Play.\n\n"
         "#VersículoDelDía #Biblia #Oración #Fe #PrayCrew")
    p = base("es", "instagram", t); p["instagramData"] = reel; out.append((ES, "instagram", p))
    q, r = c["x_es"]
    p = base("es", "twitter", f"“{q}” — {r}\n\n{c['q_es']} {c.get('x_cta_es', 'Respóndenos y oraremos contigo.')} 🙏\n#VersículoDelDía"); p["twitterData"] = {"tags": []}; out.append((ES, "twitter", p))
    return d, out


def check(date_str):
    """Fail loudly if any quoted excerpt is not word-for-word from the verse, or an X post is too long."""
    date = datetime.date.fromisoformat(date_str)
    v, _, _ = batch.day_info((date - batch.START).days + 1)
    c = json.load(open(os.path.join(HERE, "copy", f"{date_str}.json")))
    errs = []
    for key, lang in (("x_en", "en"), ("li_quote", "en"), ("x_es", "es")):
        for frag in c[key][0].split("…"):
            if frag.strip() and frag.strip() not in v[lang]:
                errs.append(f"{key}: '{frag.strip()}' is not in the {lang} verse text")
    _, posts = payloads(date_str)
    for blog, net, p in posts:
        if net == "twitter" and len(p["text"]) > 280:
            errs.append(f"X post for {blog} is {len(p['text'])} chars")
    return errs


if __name__ == "__main__":
    ds = sys.argv[1]
    errs = check(ds)
    if errs:
        sys.exit("COPY CHECK FAILED:\n" + "\n".join(errs))
    d, posts = payloads(ds)
    for blog, net, p in posts:
        print(json.dumps({"blogId": blog, "date": d, "network": net, "info": json.dumps(p, ensure_ascii=False)}, ensure_ascii=False))
