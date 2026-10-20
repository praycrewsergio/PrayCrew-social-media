"""Post text per language/network. X gets a short version (the verse itself is in the video)."""

TAGS = {
    "en": "#VerseOfTheDay #BibleVerse #Prayer #PrayCrew #Faith",
    "es": "#VersículoDelDía #Biblia #Oración #PrayCrew #Fe",
}


def ref_label(v, lang):
    r = (v["ref_en"] if lang == "en" else v["ref_es"]).replace("-", "–")
    return f"{r} ({'BSB' if lang == 'en' else 'RVR1909'})"


def long_caption(v, lang):
    if lang == "en":
        return (f"“{v['en']}”\n— {ref_label(v, 'en')}\n\n"
                "How can we pray for you? Share your prayer request on PrayCrew 🙏\n"
                "Available on the App Store and Google Play.\n\n" + TAGS["en"])
    return (f"“{v['es']}”\n— {ref_label(v, 'es')}\n\n"
            "¿Cómo podemos orar por ti? Comparte tu petición de oración en PrayCrew 🙏\n"
            "Disponible en App Store y Google Play.\n\n" + TAGS["es"])


def x_caption(v, lang):
    if lang == "en":
        return f"Verse of the Day: {ref_label(v, 'en')} 🙏\n\nShare your prayer requests on PrayCrew.\n#VerseOfTheDay #PrayCrew"
    return f"Versículo del día: {ref_label(v, 'es')} 🙏\n\nComparte tus peticiones de oración en PrayCrew.\n#VersículoDelDía #PrayCrew"


def yt_title(v):
    return f"Verse of the Day – {v['ref_en'].replace('-', '–')} | PrayCrew"
