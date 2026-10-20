# PrayCrew daily verse — copy guide

Approved by Sergio on Oct 19, 2026. The week of Oct 20–26 (see `copy_week1.py`) is the reference.
Write one `copy/YYYY-MM-DD.json` per day; `posts_from_copy.py` turns it into the 7 posts.

## Voice
- Warm, pastoral, hopeful. Speak to one person ("you"). Never preachy, never political.
- PrayCrew = a prayer app that helps churches and ministries share and organize prayer requests.
- Tie the reflection to the verse's actual meaning. Do not add theology the verse doesn't say.
- Match the day: Mon = start of week, Wed = midweek, Fri/Sat = weekend/gratitude, Sun = worship/reset.

## Scripture rules (non-negotiable)
- The video and full-verse captions use the text from `verses.json` exactly (BSB English, RVR1909 Spanish).
- `x_en`, `x_es` and `li_quote` excerpts must be copied word-for-word from that day's verse.
  Use "…" to join two pieces. `posts_from_copy.py` refuses to run if an excerpt doesn't match.
- Reference format: "Psalm 9:9" in excerpts; the script adds "(BSB)" / "(RVR1909)" where needed.

## Fields
| key | where | guidance |
|---|---|---|
| hook_en / hook_es | IG first line | ≤ 8 words + 🙏. A promise or truth from the verse. |
| reflect_en / reflect_es | IG | 1–2 sentences applying the verse to today. |
| q_en / q_es | IG + X | One open question that invites a comment / prayer request. |
| x_en / x_es | X | [excerpt, "Psalm 9:9"] — keep total X post < 280 chars. |
| tiktok | TikTok caption | ≤ 120 chars, conversational, includes the reference; hashtags are added. |
| yt_title | YouTube Short title | Keyword phrase from the verse + " \| Psalm 9:9 #Shorts" (≤ 100 chars). |
| yt_line | YouTube description | One short call to action, e.g. "Seek Him today." |
| li_open | LinkedIn first line | A leadership/workday observation (≤ 12 words). |
| li_quote | LinkedIn | [excerpt, "Psalm 9:9 (BSB)"]. |
| li_body | LinkedIn | 2–3 sentences connecting the verse to leading a church, ministry, team or business. Mention prayer/care for people. |
| key_en / key_es | video | 3–7 words copied EXACTLY from that day's verse (BSB / RVR1909) — the heart of the verse. Shown huge on key-phrase days and highlighted in yellow on word-highlight days. Required. |
| optional ig_cta_en, x_cta_en, ig_cta_es, x_cta_es | | Override the default comment prompt when the question already contains one (e.g. "Tag them below…"). |

Spanish copy is written natively (not a word-for-word translation), using "tú".

## Example (Oct 23, Psalm 9:10)
```json
{
 "hook_en": "You have never been forgotten. 🙏",
 "reflect_en": "Knowing God's name means knowing His character, and His track record is this: He has never forsaken those who seek Him.",
 "q_en": "How has God been faithful to you this year?",
 "x_en": ["for You, O LORD, have not forsaken those who seek You.", "Psalm 9:10"],
 "tiktok": "You have never been forgotten 🙏 Psalm 9:10 — He has not forsaken those who seek Him",
 "yt_title": "God Has Not Forsaken You | Psalm 9:10 #Shorts",
 "yt_line": "Seek Him today.",
 "li_open": "Trust is built on a track record.",
 "li_quote": ["Those who know Your name trust in You, for You, O LORD, have not forsaken those who seek You.", "Psalm 9:10 (BSB)"],
 "li_body": "The same is true in our churches and teams: people trust leaders who follow through. Remembering and praying for every request your community shares is one of the simplest ways to show them they are not forgotten.",
 "hook_es": "Nunca has sido olvidado. 🙏",
 "reflect_es": "Conocer el nombre de Dios es conocer Su carácter: Él nunca ha desamparado a los que le buscan.",
 "q_es": "¿Cómo te ha mostrado Dios Su fidelidad este año?",
 "x_es": ["por cuanto tú, oh Jehová, no desamparaste a los que te buscaron.", "Salmo 9:10"],
 "key_en": "have not forsaken those who seek You",
 "key_es": "no desamparaste a los que te buscaron"
}
```

## Automatic extras (no copy needed)
- First comment on Instagram, LinkedIn and YouTube: "Drop your prayer request below 🙏 …" / "Deja tu petición de oración aquí abajo 🙏 …".
- Every video has an original calm music bed (assets/music, rotates daily). Instagram's music library is not available
  for these accounts (needs Instagram Business linked to a Facebook Page), so the music is built into the video.
- Video style rotates by weekday: Mon Cinematic, Tue Word highlight, Wed Frosted glass, Thu Key phrase,
  Fri Paper card, Sat Cinematic, Sun Frosted glass.
- Sundays also get the weekly recap carousel at 18:00 (`recap.py`), captions are automatic.
