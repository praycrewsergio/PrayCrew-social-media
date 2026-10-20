"""Render a range of days. Day 1 = 2026-10-20 = verse v001. One loop per day (shared by EN and ES).
usage: batch.py START_DAY END_DAY   -> writes ../videos/YYYY-MM-DD_{en,es}.mp4

Style rotates by weekday (render.WEEKDAY_STYLE); music rotates through assets/music/track1-4.
Highlight / key-phrase styles use key_en / key_es from copy/YYYY-MM-DD.json (write the copy first);
without it they fall back to an automatic phrase."""
import json, os, subprocess, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
OUT = os.path.join(HERE, "..", "videos")
START = datetime.date(2026, 10, 20)
EXCLUDED_LOOPS = set()   # use every loop (approved by Sergio)
LOOPS = [n for n in range(1, 44) if n not in EXCLUDED_LOOPS]
N_TRACKS = 4

verses = json.load(open(os.path.join(HERE, "verses.json")))


def day_info(day):
    v = verses[(day - 1) % len(verses)]
    loop = LOOPS[(day - 1) % len(LOOPS)]
    date = START + datetime.timedelta(days=day - 1)
    return v, loop, date


def style_for(date):
    from render import WEEKDAY_STYLE
    return WEEKDAY_STYLE[date.weekday()]


def main(a, b):
    os.makedirs(OUT, exist_ok=True)
    for day in range(a, b + 1):
        v, loop, date = day_info(day)
        style = style_for(date); music = (day - 1) % N_TRACKS + 1
        cp = os.path.join(HERE, "copy", f"{date}.json")
        copy = json.load(open(cp)) if os.path.exists(cp) else {}
        bg = os.path.join(HERE, "loops", f"loop{loop:02d}.mp4")
        for lang in ("en", "es"):
            out = os.path.join(OUT, f"{date}_{lang}.mp4")
            if os.path.exists(out):
                continue
            ref = (v["ref_en"] if lang == "en" else v["ref_es"]).replace("-", "–")
            ref += " BSB" if lang == "en" else " RVR1909"
            key = copy.get(f"key_{lang}", "")
            if key and key.lower() not in v[lang].lower():
                sys.exit(f"key_{lang} '{key}' is not an exact phrase from the {lang} verse for {date}")
            subprocess.run(["python3", os.path.join(HERE, "render.py"), bg, v[lang], ref, out, "--lang", lang,
                            "--style", style, "--key", key, "--music", str(music)], check=True)
        print(f"day {day} {date} {v['ref_en']} loop{loop:02d} style={style} music={music}", flush=True)


if __name__ == "__main__":
    main(int(sys.argv[1]), int(sys.argv[2]))
