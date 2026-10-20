# PrayCrew daily verse pipeline

Renders the daily "Verse of the Day" / "Versículo del día" videos and the Metricool post payloads.

- Day 1 = 2026-10-20 = verse #1 in `verses.json` (117 passages, BSB English / RVR1909 Spanish; cycles after 117).
- One nature loop per day from `loops/` (loops 07, 22, 29, 30, 34, 35, 36 are excluded: man-made, cars, people).
- Output: `../videos/YYYY-MM-DD_en.mp4` and `_es.mp4`, always 1080x1920, then the QR card and the "Available on" card.
- Videos are served to Metricool from
  `https://raw.githubusercontent.com/praycrewsergio/PrayCrew-social-media/main/videos/<file>`.

## Weekly run

Requirements: `ffmpeg`, Python 3 with Pillow (`pip install --break-system-packages pillow`).

1. `day = (date - 2026-10-20).days + 1` for the first day to schedule.
2. `python3 batch.py FIRST_DAY LAST_DAY` (about 1–2 min per video).
3. Commit and push `videos/` to `main`.
4. `python3 posts.py FIRST_DAY LAST_DAY` prints one JSON line per post: `blogId`, `date`, `info`.
   Call Metricool `createScheduledPost(blogId, date, info)` for every line (4 posts per day):
   - PrayCrew Espanol (5454893): Instagram Reel; X
   - PrayCrew English (5449351): Instagram Reel + LinkedIn + TikTok + YouTube Short; X
5. Before scheduling, call `getScheduledPosts` for the range and skip any day that already has posts.

Posting time: 10:00 America/Chicago (Metricool's best hour for both brands).
