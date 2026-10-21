"""Re-render feature reels from features/<name>.json with the recordings listed in features/sources.json.
usage: render_features.py name [name ...]   (e.g. chat_en landing_es)"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = json.load(open(os.path.join(HERE, "features", "sources.json")))
MUSIC = {"sso": 2, "crews": 3, "addmembers": 4, "prayerrequest": 1, "followup": 2, "notifications": 3, "unread": 4,
         "chat": 1, "landing": 3, "guided": 4, "metrics": 2, "groupmetrics": 3, "remember": 1}
for name in sys.argv[1:]:
    args = ["python3", os.path.join(HERE, "feature.py"), os.path.join(HERE, "features", f"{name}.json"),
            os.path.join(HERE, "..", "videos", f"feature_{name}.mp4"), "--music", str(MUSIC[name.rsplit("_", 1)[0]])]
    for k, v in SRC[name].items():
        args += ["--src", f"{k}={v}"]
    subprocess.run(args, check=True)
