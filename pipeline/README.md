# PrayCrew daily verse — runbook

Goal: every day has a "Verse of the Day" post at 10:00 America/Chicago on all 7 accounts:
- PrayCrew English (Metricool blogId 5449351): Instagram Reel, X, TikTok, YouTube Short, LinkedIn — one post each
- PrayCrew Espanol (blogId 5454893): Instagram Reel, X — one post each

Day 1 = 2026-10-20 = verse #1 of `verses.json` (117 passages, cycles). One loop video per day from `loops/` (all 43).
Videos: 1080x1920, weekday style (see COPY_GUIDE.md), original music bed, then QR card, then "Available on" card.
Sundays: weekly recap carousel at 18:00 (Instagram EN+ES, LinkedIn document, TikTok photos).

## Daily run (keep the next 7 days covered)
1. Setup: `pip install --break-system-packages pillow` if missing; `ffmpeg` must exist.
2. For each date D from today through today+7 (America/Chicago):
   call Metricool `getScheduledPosts` for both brands for D. A day is covered when there are
   10:00 posts for EN instagram, twitter, tiktok, youtube, linkedin and ES instagram, twitter.
   Collect the uncovered dates (usually just today+7).
3. For each uncovered date: `day = (D - 2026-10-20).days + 1`
   - FIRST write `copy/D.json` following `COPY_GUIDE.md` (read the verse from `batch.day_info(day)`), including key_en/key_es.
   - `python3 posts_from_copy.py D > /dev/null` to validate the copy (fails if an excerpt isn't word-for-word — fix it).
   - `python3 batch.py DAY DAY` → `../videos/D_en.mp4`, `../videos/D_es.mp4` in that weekday's style with music
     (prints the 1080x1920 check; fails if key_en/key_es is not an exact phrase of the verse).
   - If D is a Sunday, also check for the 18:00 recap posts (EN instagram, linkedin, tiktok; ES instagram). If missing:
     `python3 recap.py D`.
4. `bash publish_media.sh` (force-pushes upcoming videos to the `media` branch and writes the commit SHA to /tmp/media_sha).
   THEN generate the payloads (they embed SHA-pinned media URLs): `python3 posts_from_copy.py D > /tmp/posts_D.jsonl`
   and on Sundays `python3 recap.py D --posts > /tmp/recap_D.jsonl`. Confirm one media URL from the file returns 200 with curl.
5. For each line in each posts/recap file, call `createScheduledPost(blogId, date, info)`, only for posts still missing.
6. Commit `copy/*.json` to `main` and push.
7. Re-check with `getScheduledPosts`; report any day/network still missing.

Never edit or delete posts the user created themselves (posts not at 10:00 or not made by this pipeline).
