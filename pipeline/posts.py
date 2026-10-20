"""Emit the 4 Metricool post payloads for a day as JSON (blogId, date, info)."""
import json, sys, batch, captions
RAW = "https://raw.githubusercontent.com/praycrewsergio/PrayCrew-social-media/main/videos/"
EN, ES = "5449351", "5454893"

def posts(day):
    v, loop, date = batch.day_info(day)
    when = f"{date}T10:00:00"
    base = lambda lang, providers, text: {"autoPublish": True, "draft": False, "descendants": [], "firstCommentText": "",
        "hasNotReadNotes": False, "media": [f"{RAW}{date}_{lang}.mp4"], "mediaAltText": [], "providers": [{"network": p} for p in providers],
        "publicationDate": {"dateTime": when, "timezone": "America/Chicago"}, "shortener": False, "smartLinkData": {"ids": []}, "text": text}
    reel = {"type": "REEL", "showReelOnFeed": True, "collaborators": [], "isAiGenerated": False}
    es_ig = base("es", ["instagram"], captions.long_caption(v, "es")); es_ig["instagramData"] = reel
    es_x = base("es", ["twitter"], captions.x_caption(v, "es")); es_x["twitterData"] = {"tags": []}
    ref = v["ref_en"].replace("-", "–")
    en_main = base("en", ["instagram", "linkedin", "tiktok", "youtube"], captions.long_caption(v, "en"))
    en_main["instagramData"] = reel
    en_main["linkedinData"] = {"type": "post", "previewIncluded": True, "publishImagesAsPDF": False}
    en_main["tiktokData"] = {"title": f"Verse of the Day – {ref} 🙏 #VerseOfTheDay #PrayCrew", "disableComment": False, "disableDuet": False,
        "disableStitch": False, "privacyOption": "PUBLIC_TO_EVERYONE", "commercialContentThirdParty": False,
        "commercialContentOwnBrand": False, "autoAddMusic": False, "isAigc": False}
    en_main["youtubeData"] = {"title": captions.yt_title(v), "type": "short", "privacy": "public",
        "tags": ["Verse of the Day", "Bible", "Prayer", "PrayCrew"], "category": "NONPROFITS_ACTIVISM", "madeForKids": False, "isAiGeneratedContent": False}
    en_x = base("en", ["twitter"], captions.x_caption(v, "en")); en_x["twitterData"] = {"tags": []}
    d = f"{when}-05:00"
    return [(ES, d, es_ig), (ES, d, es_x), (EN, d, en_main), (EN, d, en_x)]

if __name__ == "__main__":
    for day in range(int(sys.argv[1]), int(sys.argv[2]) + 1):
        for blog, d, info in posts(day):
            print(json.dumps({"blogId": blog, "date": d, "info": json.dumps(info, ensure_ascii=False)}, ensure_ascii=False))
