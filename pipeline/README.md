# PrayCrew daily verse — runbook

Goal: every day has a "Verse of the Day" post at 10:00 America/Chicago on all 7 accounts:
- PrayCrew English (Metricool blogId 5449351): Instagram Reel, X, TikTok, YouTube Short, LinkedIn — one post each
- PrayCrew Espanol (blogId 5454893): Instagram Reel, X — one post each

Day 1 = 2026-10-20 = verse #1 of `verses.json` (117 passages, cycles). One loop video per day from `loops/` (all 43).
Videos: 1080x1920, verse types in on the loop, then QR card, then "Available on" card.

## Daily run (keep the next 7 days covered)
1. Setup: `pip install --break-system-packages pillow` if missing; `ffmpeg` must exist.
2. For each date D from today through today+7 (America/Chicago):
   call Metricool `getScheduledPosts` for both brands for D. A day is covered when there are
   10:00 posts for EN instagram, twitter, tiktok, youtube, linkedin and ES instagram, twitter.
   Collect the uncovered dates (usually just today+7).
3. For each uncovered date: `day = (D - 2026-10-20).days + 1`
   - `python3 batch.py DAY DAY` → `../videos/D_en.mp4`, `../videos/D_es.mp4` (prints 1080x1920 check).
   - Write `copy/D.json` following `COPY_GUIDE.md` (read the verse from `batch.day_info(day)`).
   - `python3 posts_from_copy.py D > /tmp/posts_D.jsonl` (fails if an excerpt isn't word-for-word — fix the copy).
4. `bash publish_media.sh` (force-pushes upcoming videos to the `media` branch). Confirm
   `curl -sI https://raw.githubusercontent.com/praycrewsergio/PrayCrew-social-media/media/videos/D_en.mp4` → 200.
5. For each line in each posts file, call `createScheduledPost(blogId, date, info)`, only for networks still missing that day.
6. Commit `copy/*.json` to `main` and push.
7. Re-check with `getScheduledPosts`; report any day/network still missing.

Never edit or delete posts the user created themselves (posts not at 10:00 or not made by this pipeline).
