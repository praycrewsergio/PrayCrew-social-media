"""Render the doodle story. usage: render.py LANG OUT.mp4 [--stills DIR]"""
import subprocess, sys, os, json, tempfile, shutil
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
VID = "/home/claude/praycrew-social-media/videos"
ASSETS = "/home/claude/praycrew-social-media/pipeline/assets"
FPS = 30
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS)]
WIN = dict(x=240, y=520, w=600, h=1220)
PAGE = os.environ.get("PAGE", "index.html")

def page_ctx(p):
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.goto("file://" + os.path.join(HERE, PAGE)); pg.wait_for_function("document.fonts.ready.then(()=>true)")
    pg.evaluate("document.fonts.load('700 80px Caveat')"); pg.evaluate("document.fonts.load('40px \"Patrick Hand\"')")
    pg.evaluate("document.fonts.load('700 80px Caveat', 'áéíóúñ¿¡')")
    return b, pg

def stills(lang, outdir, which=None):
    os.makedirs(outdir, exist_ok=True)
    with sync_playwright() as p:
        b, pg = page_ctx(p)
        n = pg.evaluate("sceneCount()")
        for i in range(n):
            if which and i not in which: continue
            info = pg.evaluate(f"buildScene({i}, '{lang}')")
            pg.evaluate(f"setTime({info['dur'] - 0.05})")
            pg.screenshot(path=f"{outdir}/s{i:02d}.png")
        b.close()

def scene_file(pg, i, lang, tmp):
    info = pg.evaluate(f"buildScene({i}, '{lang}')")
    dur = info["dur"]; nf = int(round(dur * FPS))
    raw = os.path.join(tmp, f"d{i:02d}.mp4")
    ff = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
                           "-vf", f"fade=t=out:st={dur - 0.25:.2f}:d=0.25:color=0xfbf9f4", *ENC, raw], stdin=subprocess.PIPE)
    for f in range(nf):
        pg.evaluate(f"setTime({f / FPS})")
        ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
    ff.stdin.close(); assert ff.wait() == 0
    app = info["app"]
    if not app: return raw
    out = os.path.join(tmp, f"a{i:02d}.mp4")
    src = os.path.join(VID, f"feature_{app['clip']}_{lang}.mp4")
    win = app.get("win") or WIN; cx, cy, cw, chh = app.get("crop") or [186, 400, 708, 1440]
    rad = app.get("radius", 44)
    mask = os.path.join(tmp, f"mask{i}.png")
    from PIL import Image, ImageDraw
    m = Image.new("L", (win["w"], win["h"]), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, win["w"] - 1, win["h"] - 1), rad, fill=255); m.save(mask)
    st = app["st"][lang]; cd = dur - 0.45
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", raw, "-ss", f"{st:.2f}", "-t", f"{cd:.2f}", "-i", src, "-i", mask, "-filter_complex",
        f"[1:v]fps=30,setpts=PTS-STARTPTS+0.45/TB,crop={cw}:{chh}:{cx}:{cy},scale={win['w']}:{win['h']},format=rgba,fade=t=in:st=0.45:d=0.3:alpha=1,"
        f"fade=t=out:st={dur - 0.3:.2f}:d=0.25:alpha=1[c];[2:v]format=gray[m];[c][m]alphamerge[cm];"
        f"[0:v][cm]overlay={win['x']}:{win['y']}:eof_action=pass,format=yuv420p", *ENC, out], check=True)
    return out

def full(lang, out):
    tmp = tempfile.mkdtemp(); parts = []
    with sync_playwright() as p:
        b, pg = page_ctx(p)
        for i in range(pg.evaluate("sceneCount()")):
            parts.append(scene_file(pg, i, lang, tmp)); print("scene", i, flush=True)
        b.close()
    end = os.path.join(tmp, "z_end.mp4")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", f"{ASSETS}/endcard_{lang}.mp4", "-vf", "scale=1080:1920,setsar=1,fps=30,format=yuv420p", *ENC, end], check=True)
    parts.append(end)
    lst = os.path.join(tmp, "l.txt"); open(lst, "w").write("".join(f"file '{x}'\n" for x in parts))
    joined = os.path.join(tmp, "j.mp4")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", joined], check=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", joined], capture_output=True, text=True).stdout)
    part = out[:-4] + ".part.mp4"
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", joined, "-stream_loop", "-1", "-i", f"{ASSETS}/music/track{os.environ.get('MUSIC', '4')}.m4a", "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-af", f"volume=0.8,afade=t=in:d=1,afade=t=out:st={dur - 3:.2f}:d=3", "-c:a", "aac", "-b:a", "160k", "-t", f"{dur:.3f}",
                    "-movflags", "+faststart", part], check=True)
    os.replace(part, out); shutil.rmtree(tmp); print(out, round(dur, 1))

if __name__ == "__main__":
    if "--stills" in sys.argv: stills(sys.argv[1], sys.argv[sys.argv.index("--stills") + 1])
    else: full(sys.argv[1], sys.argv[2])
