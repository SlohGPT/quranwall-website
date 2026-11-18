---
name: quranwall-covers
description: Make or redo the cover (thumbnail) of a quranwall.com blog post — the image on the blog grid, the post hero and the og:image. Use when a new post needs its cover (the quranwall-blog skill and the SEO autopilot call this step), when the user says "make a cover", "new thumbnail", "redo the thumbnail", or when a cover breaks a rule below. Generated in-repo with headless Chrome; never stock photos, never paid AI images.
---

# QuranWall blog covers

A cover is one 1600x1067 jpg, rendered by `scripts/build-covers.mjs` on top of `scripts/cover-engine.mjs` (the
same engine file on FaithWall, QuranWall and NoteWall; ENGINE_VERSION in it). It shows a short **hook** with one
gold accent word, a topic **pill** (icon + tag, optional badge), the app mark (icon + "QuranWall"), and an iPhone
whose lock screen is QuranWall's own mockup (the Wallpaper art of `src/components/mockup/Wallpaper.tsx`) with one
ayah in English. Cards and the post hero crop it to 16:9, so everything important sits in the centre band.

People click covers that say one clear thing and look different from their neighbours. Same style, different
idea: the layout, the wallpaper and the float card change from post to post.

## 1. Write the entry

Append to `covers` in `src/data/blogCovers.json`:

```json
{ "slug": "best-dhikr-app-for-iphone", "wallpaper": "emerald",
  "ayah": { "key": "13:28", "text": "Unquestionably, by the remembrance of Allāh hearts are assured." },
  "hook": "Dhikr that *stays* with you", "tag": "Dhikr apps", "icon": "Sparkles", "badge": "Ranked for 2026",
  "layout": "right" }
```

- `ayah`: one short ayah (or one sentence of it) in Saheeh International, **word for word** as the post's own
  `verse` section or `src/data/showcaseVerses.ts` quotes it. The script fails otherwise. Never type or reword
  scripture. **No Arabic on covers** (the Uthmani text needs its own credit line).
- `wallpaper`: `night`, `emerald`, `dusk` or `photo`, different from the two newest covers.
- `hook`: 2-6 words, exactly one `*accent*` word, never the post title.
- `tag` + `icon` (a lucide-react name) + optional `badge` (a true fact from the post).
- **Banned on covers and floats:** free, price, cost, trial, subscribe, subscription, paywall, premium, $ amounts,
  cure/guaranteed. Nothing the app does not do (TODO-KAROL.md lists the unconfirmed claims).

## 2. Pick the layout (no three neighbours alike)

The blog grid shows posts in `src/data/blogPosts.json` order. Pick a layout none of the 3 posts next to the new
one uses:

| layout | use it for |
|---|---|
| `duo` | "X vs Y", comparisons, alternatives |
| `number` | the hook starts with a count: set `"number": "7"`; the numeral is drawn big and stripped from the hook |
| `closeup` | how-to / setup / widget posts (big phone, no float) |
| `fan` | style or collection posts (three phones; the back two show the same ayah on other wallpapers) |
| `right` / `left` | everything else; alternate them |

**Float card** (optional, `right` / `left` / `number` only): `"float": {"icon": "AlarmClock", "title": "Alarm,
5:12 AM", "text": "Fajr"}`, each field at most 24 characters. Only a generic iOS thing that fits the post (an
alarm, a Focus, a calendar day, a reminder). Never an app feature claim.

## 3. Render and check

```bash
node scripts/build-covers.mjs --dry       # check the entries; fails on a layout repeated next to its grid neighbour
node scripts/build-covers.mjs <slug>
node scripts/build-blog-thumbnails.mjs     # avif/webp variants + src/data/cover-sizes.json (needs sharp: npm install)
```

`build-covers.mjs` writes `public/blog-thumbnails/<slug>-cover.jpg` and points the post's `meta.image` and the
listing's `thumbnail` at it. Look at it before committing, downscaled (`sips -Z 800 <jpg> --out /tmp/c.jpg`), next to
its grid neighbours: the hook reads at a glance, nothing is cut off in the 16:9 centre band, the phone looks like an
iPhone, the float card does not cover the ayah, the layout differs from the neighbours.

Commit the jpg, its variants, `cover-sizes.json`, `blogCovers.json`, the post JSON and `blogPosts.json`.

## Cloud runs (no Chrome)

Write the entry (steps 1-2), point `meta.image` and `thumbnail` at `/og-image.png` for now and add a TODO line for
the next local run. Never ship a post without an image; never use Unsplash or a paid generator.

## In-post pictures

The post template draws the pictures in the body by itself: a `verse` block becomes the ayah on a real iPhone Lock
Screen (the homepage mockup) and then takes the place of the spot scene; `stat` blocks get a figure. It keeps a
healthy ratio (`src/lib/visualRhythm.ts`): about one big picture per 250 words, none within about 110 words of
another; the rest render as quiet quotes and plain numbers. Put the verse block where it helps the text, with at
least two paragraphs between it and the mid install card's heading, and add no images just to fill space.
