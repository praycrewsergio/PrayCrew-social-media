"""Render a range of days. Day 1 = 2026-10-20 = verse v001. One loop per day (shared by EN and ES).
usage: batch.py START_DAY END_DAY   -> writes ../videos/YYYY-MM-DD_{en,es}.mp4"""
import json, os, subprocess, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "videos")
START = datetime.date(2026, 10, 20)
EXCLUDED_LOOPS = {7, 22, 29, 30, 34, 35, 36}   # ruins, cars, CGI planet, cars, buildings, person, town lights
LOOPS = [n for n in range(1, 39) if n not in EXCLUDED_LOOPS]

verses = json.load(open(os.path.join(HERE, "verses.json")))


def day_info(day):
    v = verses[(day - 1) % len(verses)]
    loop = LOOPS[(day - 1) % len(LOOPS)]
    date = START + datetime.timedelta(days=day - 1)
    return v, loop, date


def main(a, b):
    os.makedirs(OUT, exist_ok=True)
    for day in range(a, b + 1):
        v, loop, date = day_info(day)
        bg = os.path.join(HERE, "loops", f"loop{loop:02d}.mp4")
        for lang in ("en", "es"):
            out = os.path.join(OUT, f"{date}_{lang}.mp4")
            if os.path.exists(out):
                continue
            text = v[lang]
            ref = (v["ref_en"] if lang == "en" else v["ref_es"]).replace("-", "–")
            ref += " BSB" if lang == "en" else " RVR1909"
            subprocess.run(["python3", os.path.join(HERE, "render.py"), bg, text, ref, out, "--lang", lang], check=True)
        print(f"day {day} {date} {v['ref_en']} loop{loop:02d}", flush=True)


if __name__ == "__main__":
    main(int(sys.argv[1]), int(sys.argv[2]))
