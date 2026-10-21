#!/bin/bash
# Publish rendered videos for today and later to the `media` branch (force-pushed, no history),
# so Metricool can fetch them from:
#   https://raw.githubusercontent.com/praycrewsergio/PrayCrew-social-media/media/videos/<YYYY-MM-DD>_<en|es>.mp4
# Metricool copies each video into its own storage when the post is scheduled, so older files are not kept.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO/videos"
TODAY=$(TZ=America/Chicago date +%F)
WORK=$(mktemp -d)
git -C "$REPO" worktree add --detach "$WORK" >/dev/null 2>&1
cd "$WORK"
BR="media-tmp-$$"
git checkout -q --orphan "$BR"
git rm -rq --cached . >/dev/null 2>&1 || true
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
mkdir -p videos
n=0
for f in "$SRC"/*.mp4; do
  b=$(basename "$f"); d=${b%%_*}
  [[ "$d" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || continue
  if [[ "$d" > "$TODAY" || "$d" == "$TODAY" ]]; then cp "$f" videos/; n=$((n+1)); fi
done
if [ -d "$SRC/recap" ]; then
  mkdir -p videos/recap
  for dir in "$SRC"/recap/*_en "$SRC"/recap/*_es; do
    [ -d "$dir" ] || continue
    b=$(basename "$dir"); d=${b%%_*}
    if [[ "$d" > "$TODAY" || "$d" == "$TODAY" ]]; then cp -r "$dir" videos/recap/; n=$((n+1)); fi
  done
fi
# Feature-education series (one-off scheduling): FEATURES=1 bash publish_media.sh
if [ "${FEATURES:-0}" = "1" ]; then
  mkdir -p videos/features
  for f in "$SRC"/feature_*.mp4; do b=$(basename "$f" .mp4); cp "$f" "videos/features/${b#feature_}.mp4"; n=$((n+1)); done
  for f in "$SRC"/story_*.mp4; do cp "$f" videos/features/; n=$((n+1)); done
fi
echo "Upcoming videos for Metricool (auto-published by the daily verse task)." > videos/README.md
git add videos
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "Upcoming verse videos ($n files)"
git push -q -f origin HEAD:media
git rev-parse HEAD > /tmp/media_sha
cd "$REPO"; git worktree remove --force "$WORK"; git branch -D "$BR" >/dev/null 2>&1 || true
echo "published $n videos to media branch at $(cat /tmp/media_sha)"
