"""Build Metricool payloads for the feature-education series (features/feature_copy.py).

usage: python3 features/posts.py [YYYY-MM-DD ...]  -> one JSON line per post: {"blogId","date","network","name","info"}
Times (America/Chicago): X 12:00, LinkedIn 13:00, YouTube 16:00, Instagram + TikTok 18:00.
Media: videos/features/<name>_<lang>.mp4 on the media branch (SHA-pinned like the verse posts)."""
import json, os, sys, datetime
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from feature_copy import SERIES, C

MEDIA_SHA = os.environ.get("MEDIA_SHA") or (open("/tmp/media_sha").read().strip() if os.path.exists("/tmp/media_sha") else "media")
RAW = f"https://raw.githubusercontent.com/praycrewsergio/PrayCrew-social-media/{MEDIA_SHA}/videos/features/"
EN, ES = "5449351", "5454893"
TIME = {"twitter": "12:00:00", "linkedin": "13:00:00", "youtube": "16:00:00", "instagram": "18:00:00", "tiktok": "18:00:00"}
APP_EN = "📲 PrayCrew is available on the App Store and Google Play."
APP_ES = "📲 PrayCrew está disponible en App Store y Google Play."


def payloads(date_str, name):
    c = C[name]
    out = []

    def base(lang, net, text, fc=""):
        when = f"{date_str}T{TIME[net]}"
        return {"autoPublish": True, "draft": False, "descendants": [], "firstCommentText": fc, "hasNotReadNotes": False,
                "media": [f"{RAW}{name}_{lang}.mp4"], "mediaAltText": [], "providers": [{"network": net}],
                "publicationDate": {"dateTime": when, "timezone": "America/Chicago"}, "shortener": False,
                "smartLinkData": {"ids": []}, "text": text}

    reel = {"type": "REEL", "showReelOnFeed": True, "collaborators": [], "isAiGenerated": False}
    p = base("en", "instagram", f"{c['ig_en']}\n\n{APP_EN}\n\n#PrayCrew #Prayer #PrayerRequests #Church #ChurchLeaders", c["q_en"])
    p["instagramData"] = reel; out.append((EN, "instagram", p))
    p = base("en", "twitter", f"{c['x_en']}\n#PrayCrew"); p["twitterData"] = {"tags": []}; out.append((EN, "twitter", p))
    tk = f"{c['tiktok']} #PrayCrew #Prayer #ChristianTikTok #Church #PrayerRequests"
    p = base("en", "tiktok", tk)
    p["tiktokData"] = {"title": tk, "disableComment": False, "disableDuet": False, "disableStitch": False,
                       "privacyOption": "PUBLIC_TO_EVERYONE", "commercialContentThirdParty": False,
                       "commercialContentOwnBrand": False, "autoAddMusic": False, "isAigc": False}
    out.append((EN, "tiktok", p))
    p = base("en", "youtube", f"{c['yt_desc']}\n\n📲 Download PrayCrew on the App Store and Google Play.\n\n#Shorts #PrayCrew #Prayer", c["q_en"])
    p["youtubeData"] = {"title": c["yt_title"][:100], "type": "short", "privacy": "public",
                        "tags": ["PrayCrew", "prayer app", "prayer requests", "church", "prayer group", "Christian"],
                        "category": "NONPROFITS_ACTIVISM", "madeForKids": False, "isAiGeneratedContent": False}
    out.append((EN, "youtube", p))
    p = base("en", "linkedin", f"{c['li']}\n\n{APP_EN}\n\n#ChurchLeadership #Prayer #ChurchTech #PrayCrew", c["q_en"])
    p["linkedinData"] = {"type": "post", "previewIncluded": True, "publishImagesAsPDF": False}
    out.append((EN, "linkedin", p))
    p = base("es", "instagram", f"{c['ig_es']}\n\n{APP_ES}\n\n#PrayCrew #Oración #PeticionesDeOración #Iglesia #Fe", c["q_es"])
    p["instagramData"] = reel; out.append((ES, "instagram", p))
    p = base("es", "twitter", f"{c['x_es']}\n#PrayCrew"); p["twitterData"] = {"tags": []}; out.append((ES, "twitter", p))
    for blog, net, p in out:
        if net == "twitter" and len(p["text"]) > 280:
            sys.exit(f"{date_str} {name}: X post {len(p['text'])} chars")
        if net == "tiktok" and len(p["text"]) > 2200:
            sys.exit(f"{date_str} {name}: TikTok caption too long")
    return out


if __name__ == "__main__":
    want = set(sys.argv[1:])
    for date_str, name in SERIES:
        if want and date_str not in want:
            continue
        for blog, net, p in payloads(date_str, name):
            d = datetime.datetime.fromisoformat(p["publicationDate"]["dateTime"]).replace(tzinfo=ZoneInfo("America/Chicago")).isoformat()
            print(json.dumps({"blogId": blog, "date": d, "network": net, "name": name, "info": json.dumps(p, ensure_ascii=False)}, ensure_ascii=False))
