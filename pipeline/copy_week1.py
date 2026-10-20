"""Per-platform copy for Oct 21-26 (days 2-7), in the approved Day 1 style. Emits Metricool payload lines."""
import json, re, batch

RAW = "https://raw.githubusercontent.com/praycrewsergio/PrayCrew-social-media/main/videos/"
EN, ES = "5449351", "5454893"

C = {
2: dict(
  hook_en="Joy starts with where you take refuge. 🙏",
  reflect_en="God doesn't just shelter us; He surrounds us with His favor like a shield.",
  q_en="Where do you need His covering today?",
  x_en=("let them ever shout for joy… You surround them with the shield of Your favor.", "Psalm 5:11–12"),
  tiktok="God surrounds you with His favor like a shield 🛡️ Psalm 5:11–12 — where do you need His covering today?",
  yt_title="God Surrounds You Like a Shield | Psalm 5:11–12 #Shorts",
  yt_line="Take refuge in Him today.",
  li_open="Midweek, and the load can feel heavy.",
  li_quote=("For surely You, O LORD, bless the righteous; You surround them with the shield of Your favor.", "Psalm 5:12 (BSB)"),
  li_body="Leaders carry a lot for others. Today's verse is a reminder that we are carried too: surrounded, not exposed. Teams and congregations notice when their leaders lead from that kind of security.",
  hook_es="La alegría comienza donde buscas refugio. 🙏",
  reflect_es="Dios no solo nos protege; nos rodea con Su favor como un escudo.",
  q_es="¿Dónde necesitas Su protección hoy?",
  x_es=("para siempre darán voces de júbilo… lo cercarás de benevolencia como con un escudo.", "Salmo 5:11–12"),
),
3: dict(
  hook_en="When everything feels uncertain, this doesn't change. 🙏",
  reflect_en="Thrones fall and headlines shift, but the LORD abides forever, and He is a stronghold for anyone who is hurting.",
  q_en="Who do you know who needs a refuge right now?",
  x_en=("The LORD is a refuge for the oppressed, a stronghold in times of trouble.", "Psalm 9:9"),
  tiktok="When life feels uncertain, He is still a stronghold 🙏 Psalm 9:7–9 — tag someone who needs this today",
  yt_title="A Stronghold in Times of Trouble | Psalm 9:7–9 #Shorts",
  yt_line="Bring your trouble to Him today.",
  li_open="Some seasons test every plan we've made.",
  li_quote=("The LORD is a refuge for the oppressed, a stronghold in times of trouble.", "Psalm 9:9 (BSB)"),
  li_body="Ministry leaders are often the first call when someone's world falls apart. Pointing people to a refuge starts with knowing where ours is, and making sure no one's need slips through the cracks.",
  hook_es="Cuando todo parece incierto, esto no cambia. 🙏",
  reflect_es="Los tiempos cambian, pero Jehová permanece para siempre, y es refugio para el que sufre.",
  q_es="¿Conoces a alguien que necesite un refugio hoy?",
  x_es=("Y será Jehová refugio al pobre, refugio para el tiempo de angustia.", "Salmo 9:9"),
),
4: dict(
  hook_en="You have never been forgotten. 🙏",
  reflect_en="Knowing God's name means knowing His character, and His track record is this: He has never forsaken those who seek Him.",
  q_en="How has God been faithful to you this year?",
  x_en=("for You, O LORD, have not forsaken those who seek You.", "Psalm 9:10"),
  tiktok="You have never been forgotten 🙏 Psalm 9:10 — He has not forsaken those who seek Him",
  yt_title="God Has Not Forsaken You | Psalm 9:10 #Shorts",
  yt_line="Seek Him today.",
  li_open="Trust is built on a track record.",
  li_quote=("Those who know Your name trust in You, for You, O LORD, have not forsaken those who seek You.", "Psalm 9:10 (BSB)"),
  li_body="The same is true in our churches and teams: people trust leaders who follow through. Remembering and praying for every request your community shares is one of the simplest ways to show them they are not forgotten.",
  hook_es="Nunca has sido olvidado. 🙏",
  reflect_es="Conocer el nombre de Dios es conocer Su carácter: Él nunca ha desamparado a los que le buscan.",
  q_es="¿Cómo te ha mostrado Dios Su fidelidad este año?",
  x_es=("por cuanto tú, oh Jehová, no desamparaste a los que te buscaron.", "Salmo 9:10"),
),
5: dict(
  hook_en="Everything good in your life has one Source. 🙏",
  reflect_en="Before the weekend fills up, pause and thank Him. Every good thing points back to Him.",
  q_en="What good thing are you thankful for today?",
  x_en=("Preserve me, O God, for in You I take refuge.", "Psalm 16:1"),
  tiktok="Apart from Him I have no good thing 🙏 Psalm 16:1–2 — what are you thankful for today?",
  yt_title="Apart From You I Have No Good Thing | Psalm 16:1–2 #Shorts",
  yt_line="Take a moment to thank Him today.",
  li_open="Saturday is a good day to take stock.",
  li_quote=("I said to the LORD, “You are my Lord; apart from You I have no good thing.”", "Psalm 16:2 (BSB)"),
  li_body="Every win this week, every answered prayer in your congregation, every team member who showed up: gratitude keeps leaders humble and keeps the focus on the Source.",
  hook_es="Todo lo bueno en tu vida tiene una sola Fuente. 🙏",
  reflect_es="Antes de que se llene el fin de semana, haz una pausa y dale gracias.",
  q_es="¿Por qué estás agradecido hoy?",
  x_es=("Guárdame, oh Dios, porque en ti he confiado.", "Salmo 16:1"),
),
6: dict(
  hook_en="A steady heart for the week ahead. 🙏",
  reflect_en="This Sunday, set Him before you. With the LORD at your right hand, you will not be shaken.",
  q_en="What do you want to place before Him this week?",
  x_en=("I have set the LORD always before me. Because He is at my right hand, I will not be shaken.", "Psalm 16:8"),
  tiktok="With Him at your right hand you will not be shaken 🙏 Psalm 16:8–9 — Sunday reset for the week ahead",
  yt_title="I Will Not Be Shaken | Psalm 16:8–9 #Shorts",
  yt_line="Set Him before you this week.",
  li_open="Before the week begins, one question: what's in front of you?",
  li_quote=("I have set the LORD always before me. Because He is at my right hand, I will not be shaken.", "Psalm 16:8 (BSB)"),
  li_body="Steady leaders aren't the ones with the fewest problems. They're the ones who decided ahead of time what they'd keep in front of them. Whether you lead a church, a ministry, or a business, that choice shapes the week.",
  hook_es="Un corazón firme para la semana que viene. 🙏",
  reflect_es="Este domingo, pon a Jehová delante de ti. Con Él a tu diestra, no serás conmovido.",
  q_es="¿Qué quieres poner delante de Él esta semana?",
  x_es=("A Jehová he puesto siempre delante de mí: porque está a mi diestra no seré conmovido.", "Salmo 16:8"),
),
7: dict(
  hook_en="You are the apple of His eye. 🙏",
  reflect_en="Start the week knowing you are seen, treasured, and covered in the shadow of His wings.",
  q_en="Who needs to hear this today? Tag them below.",
  x_en=("Keep me as the apple of Your eye; hide me in the shadow of Your wings", "Psalm 17:8"),
  tiktok="You are the apple of His eye 🙏 Psalm 17:7–8 — send this to someone who needs to hear it",
  yt_title="Hide Me in the Shadow of Your Wings | Psalm 17:7–8 #Shorts",
  yt_line="Rest in His care this week.",
  li_open="New week. Same faithful God.",
  li_quote=("Keep me as the apple of Your eye; hide me in the shadow of Your wings", "Psalm 17:8 (BSB)"),
  li_body="The people we lead want to know they are seen. Today's verse reminds us that God sees each one of us that way, and invites leaders to make every person in their care feel seen too.",
  hook_es="Eres la niña de Sus ojos. 🙏",
  reflect_es="Comienza la semana sabiendo que eres visto, amado y protegido bajo la sombra de Sus alas.",
  q_es="¿Quién necesita escuchar esto hoy? Etiquétalo abajo.",
  x_es=("Guárdame como lo negro de la niñeta del ojo, escóndeme con la sombra de tus alas", "Salmo 17:8"),
),
}


def full(t):
    t = t.strip()
    return re.sub(r"[,;:]$", "…", t)


def payloads(day):
    v, loop, date = batch.day_info(day)
    c = C[day]
    when = f"{date}T10:00:00"; d = f"{when}-05:00"
    def base(lang, net, text):
        return {"autoPublish": True, "draft": False, "descendants": [], "firstCommentText": "", "hasNotReadNotes": False,
                "media": [f"{RAW}{date}_{lang}.mp4"], "mediaAltText": [], "providers": [{"network": net}],
                "publicationDate": {"dateTime": when, "timezone": "America/Chicago"}, "shortener": False,
                "smartLinkData": {"ids": []}, "text": text}
    ref_en = v["ref_en"].replace("-", "–"); ref_es = v["ref_es"].replace("-", "–")
    reel = {"type": "REEL", "showReelOnFeed": True, "collaborators": [], "isAiGenerated": False}
    out = {}
    t = (f"{c['hook_en']}\n\n“{full(v['en'])}” — {ref_en} (BSB)\n\n{c['reflect_en']} {c['q_en']} Share it in the comments and we'll pray with you.\n\n"
         "Send this to someone who needs it today. 💙\n📲 Share prayer requests with your church on PrayCrew, available on the App Store and Google Play.\n\n"
         "#VerseOfTheDay #BibleVerse #Psalms #Prayer #PrayCrew")
    p = base("en", "instagram", t); p["instagramData"] = reel; out["en_ig"] = (EN, d, p)
    q, r = c["x_en"]
    p = base("en", "twitter", f"“{q}” — {r}\n\n{c['q_en']} Reply and we'll pray with you. 🙏\n#VerseOfTheDay"); p["twitterData"] = {"tags": []}; out["en_x"] = (EN, d, p)
    tk = c["tiktok"] + " #BibleVerse #ChristianTikTok #Prayer #VerseOfTheDay #PrayCrew"
    p = base("en", "tiktok", tk)
    p["tiktokData"] = {"title": tk, "disableComment": False, "disableDuet": False, "disableStitch": False, "privacyOption": "PUBLIC_TO_EVERYONE",
                       "commercialContentThirdParty": False, "commercialContentOwnBrand": False, "autoAddMusic": False, "isAigc": False}
    out["en_tt"] = (EN, d, p)
    yt = (f"“{full(v['en'])}” — {ref_en} (BSB)\n\n{c['yt_line']} Subscribe for a daily Bible verse.\n\n"
          "📲 Share prayer requests with your church on PrayCrew, available on the App Store and Google Play.\n\n#Shorts #BibleVerse #VerseOfTheDay")
    p = base("en", "youtube", yt)
    p["youtubeData"] = {"title": c["yt_title"], "type": "short", "privacy": "public",
                        "tags": ["Bible verse", "Verse of the Day", ref_en.split(":")[0], "Prayer", "PrayCrew", "Christian"],
                        "category": "NONPROFITS_ACTIVISM", "madeForKids": False, "isAiGeneratedContent": False}
    out["en_yt"] = (EN, d, p)
    lq, lr = c["li_quote"]
    li = (f"{c['li_open']}\n\n“{lq}” — {lr}\n\n{c['li_body']}\n\n"
          "At PrayCrew, we help churches and ministries organize prayer requests so every need is seen and prayed for.\n\n"
          "How can we pray for you this week?\n\n#VerseOfTheDay #FaithAtWork #ChurchLeadership")
    p = base("en", "linkedin", li); p["linkedinData"] = {"type": "post", "previewIncluded": True, "publishImagesAsPDF": False}; out["en_li"] = (EN, d, p)
    t = (f"{c['hook_es']}\n\n“{full(v['es'])}” — {ref_es} (RVR1909)\n\n{c['reflect_es']} {c['q_es']} Escríbelo en los comentarios y oraremos contigo.\n\n"
         "Comparte este versículo con alguien que lo necesite hoy. 💙\n📲 Comparte tus peticiones de oración con tu iglesia en PrayCrew, disponible en App Store y Google Play.\n\n"
         "#VersículoDelDía #Biblia #Salmos #Oración #PrayCrew")
    p = base("es", "instagram", t); p["instagramData"] = reel; out["es_ig"] = (ES, d, p)
    q, r = c["x_es"]
    p = base("es", "twitter", f"“{q}” — {r}\n\n{c['q_es']} Respóndenos y oraremos contigo. 🙏\n#VersículoDelDía"); p["twitterData"] = {"tags": []}; out["es_x"] = (ES, d, p)
    return out


IDS = {  # existing posts to update (id, uuid)
2: {"es_ig": ("400660115", "-6217939986107905036"), "es_x": ("400660135", "-4787101191427175396"), "en_ig": ("400662492", "5748650342709742211"), "en_x": ("400663434", "2107756424509671443")},
3: {"es_ig": ("400660258", "7889574910814341460"), "es_x": ("400660277", "6342917144082335968"), "en_ig": ("400662551", "4140671164186970899"), "en_x": ("400662604", "-3634487404446594462")},
4: {"es_ig": ("400660427", "-2217602339178724836"), "es_x": ("400660460", "-7080591786418944845"), "en_ig": ("400662830", "-2159703237320291112"), "en_x": ("400662885", "-6859846418273579499")},
5: {"es_ig": ("400660585", "-5736033176929615733"), "es_x": ("400660606", "6882045228454463526"), "en_ig": ("400662990", "-6395290997698117598"), "en_x": ("400663009", "-7120529272312870770")},
6: {"es_ig": ("400660738", "-2254330212151836457"), "es_x": ("400660756", "-277542261652240801"), "en_ig": ("400663137", "4115002066442014092"), "en_x": ("400663322", "-7803134492617064429")},
7: {"es_ig": ("400660869", "6191843061812708808"), "es_x": ("400660892", "-3090172348802841388"), "en_ig": ("400663243", "-5387740958759892752"), "en_x": ("400663281", "-1486617097966825632")},
}

if __name__ == "__main__":
    import sys
    for day in range(int(sys.argv[1]), int(sys.argv[2]) + 1):
        for k, (blog, d, info) in payloads(day).items():
            rec = {"day": day, "key": k, "blogId": blog, "date": d, "info": json.dumps(info, ensure_ascii=False)}
            if k in IDS[day]:
                rec["op"] = "update"; rec["id"], rec["uuid"] = IDS[day][k]
            else:
                rec["op"] = "create"
            print(json.dumps(rec, ensure_ascii=False))
