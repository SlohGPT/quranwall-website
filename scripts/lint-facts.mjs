/**
 * Fact lint for quranwall.com: catches copy and markup that contradicts the product facts
 * (src/data/facts.json), the App Store listing rules in CLAUDE.md, or the Apple link rules the site follows.
 * Ported from the FaithWall gate (faithwall-website scripts/lint-facts.mjs) with QuranWall's values.
 *
 * No dependencies. Node 18+.
 *
 * Modes (combine freely):
 *   --diff <base> [--worktree]  lint whole changed files, report only hits that overlap lines added in
 *                               `git diff <base>...HEAD -U0`; --worktree adds uncommitted and untracked work
 *   --dist [dir]                check the built site (default dist/): App Store links, JSON-LD, NUL bytes,
 *                               404, sitemap, Smart App Banner, public/llms.txt vs facts.json
 *                               plus the visible text of every built page (same prose rules) and the email check
 *   --prompts [files...]        lint ~/.claude/scheduled-tasks/quranwall-* /SKILL.md (read-only) and
 *                               .claude/skills/quranwall-blog/SKILL.md, plus any extra files given
 *   --self-test                 run the embedded table of probes (must-FAIL and must-PASS) through the same code paths
 *   --all                       lint every source file (src, index.html, public/*.txt|md, .claude/skills/**)
 *                               and check that every email address equals facts.contactEmail
 *
 * pricing-mention / free-download-prose / free-use-bare (Karol, 2026-11-17): the website never mentions the subscription, paywall, trial or
 * price, and never says that using QuranWall is free; legal pages are exempt (PRICING_EXEMPT). "Free to download.", "Download for free" and
 * "Free download" are allowed only as a standalone line (a button, an install card, a CTA), never inside running prose.
 *
 * Exit code 1 on any FAIL. WARN never fails.
 *
 * Text rules fire on a sentence that names QuranWall (or, for a few phrases, on the bare phrase). A sentence
 * that states the ban itself ("never write ...", "NOT CONFIRMED ...", "no Android app") is not a violation.
 * Product facts and the campaign-token list are read from src/data/facts.json and src/lib/app-store.ts,
 * so this file never holds its own copy of them.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve, sep } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const facts = JSON.parse(readFileSync(join(ROOT, 'src/data/facts.json'), 'utf8'));
const APP_ID = facts.appId;
const PT = facts.providerToken;

/** Campaign tokens, parsed from the CAMPAIGNS object in src/lib/app-store.ts (single source of truth). */
function readCampaigns() {
  const src = readFileSync(join(ROOT, 'src/lib/app-store.ts'), 'utf8');
  const block = /\bCAMPAIGNS\s*=\s*\{([\s\S]*?)\}\s*as const/.exec(src);
  if (!block) throw new Error('lint-facts: cannot find the CAMPAIGNS object in src/lib/app-store.ts');
  const map = {};
  for (const m of block[1].replace(/\/\/.*$/gm, '').matchAll(/(\w+)\s*:\s*'([^']+)'/g)) map[m[1]] = m[2];
  if (Object.keys(map).length === 0) throw new Error('lint-facts: CAMPAIGNS in src/lib/app-store.ts is empty');
  return map;
}
const CAMPAIGNS = readCampaigns();
const CAMPAIGN_TOKENS = Object.values(CAMPAIGNS);

// ---------------------------------------------------------------- text rules

const escRe = (t) => String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
if (!facts.downloadsFloor || !facts.downloadsAsOf) throw new Error('lint-facts: facts.json needs downloadsFloor and downloadsAsOf');

const BRAND = String.raw`Quran ?Wall`;
// A clause about the app, without crossing a sentence, comma, semicolon, colon, dash, bar (title separator) or bracket (keeps a
// competitor's feature in "Muslim Pro has qibla, while QuranWall ..." from being read as ours).
const CL = String.raw`[^.,;:—–()|]`;
// A number as digits or a small number word (setup-time rule).
const NUM = String.raw`(?:\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|forty-five|sixty|ninety)`;
// A time quantity: "60 seconds", "60s", "2 minutes", "a minute", "a couple of minutes", "a few seconds".
// A bare plural unit ("in seconds", "in minutes") is a time claim too.
const QTY = String.raw`(?:(?:a|an|a couple of|a few|couple of)\s+(?:seconds?|secs?|minutes?|mins?)|${NUM}\s?(?:seconds?|secs?|minutes?|mins?|s)|(?:seconds|secs|minutes|mins))\b`;
// Words that may sit between a setup phrase and its time quantity ("in under", "takes just", "within about").
const QLEAD = String.raw`(?:(?:in|within|under|just|only|about|around|roughly|less than|takes?|take)\s+)+`;
// What counts as "setting up" in the setup-time rule.
// Objects that may sit between "set" and "up" ("Set it up", "set QuranWall up").
const SETOBJ = String.raw`(?:it|this|everything|Quran ?Wall|the app|your lock screen)`;
// 2026-11-17: the "<time> with QuranWall" branch of setup-time needs a setup verb in the clause ("Done in 2 minutes with
// QuranWall" is a setup claim, "Just 5 minutes with QuranWall each morning" is a habit).
const SETVERB = String.raw`(?:done|ready|set(?:[- ]?up)?|finished|installed|started|sorted)`;
const SETUPV =String.raw`(?:set(?:s|ting)?[- ]?up|set(?:s|ting)?\s+${SETOBJ}\s+up|install\w*|ready|get(?:ting)? started|up and running)`;
// A head count: "1,000+", "50,000", "10k", "3 million" (social-proof rules).
const COUNT = String.raw`\d[\d,.]*(?:\s?(?:k|m|million|thousand)\b)?\+?`;
// A count in words: "a thousand", "one million", "a hundred thousand", "5 thousand", "thousands of", "hundreds of".
const NUMW = String.raw`(?:a few|several|a|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|\d+)`;
const WCOUNT = String.raw`(?:${NUMW}\s+(?:hundred\s+)?(?:thousand|million)|(?:thousands|hundreds|millions) of|${NUMW}\s+hundred\b|hundred\s+(?:thousand|million))`;
// Optional qualifier before a count.
const QUAL = String.raw`(?:(?:over|more than|nearly|almost)\s+)?`;
const PEOPLE = String.raw`(?:believers|muslims|users|people)`;
// Local negation inside a sentence: a sentence that denies a feature is the opposite of a claim. Real negations
// only. "only", "unlike", "except", "instead of", "rather than" are NOT negations ("QuranWall is the only app with
// tafsir on your lock screen" is an invented claim), and "not only" is an addition, not a denial.
const DENY = /\b(?:no|not(?!\s+only\b)|never|without|lacks?|has no|(?:don|doesn|didn|isn|aren|wasn|weren|won|can|couldn|hasn|haven)'?t|do not|does not|did not|cannot|not confirmed)\b/i;

// ---- wallpaper-automatic (2026-11-17), the idea of FaithWall's wallpaper-automatic / wallpaper-widget-combo rules.
// App truth (iOS source): the user picks an ayah, taps "Make It Mine", and Apple's Shortcuts app applies it to the Lock Screen
// wallpaper, which then NEVER changes by itself. Only the widget can rotate, and only if the user turns on auto-rotate
// (daily / every 8 hours / hourly). So "a new ayah each day", "automatic", "on its own", "nothing to change by hand" about the
// wallpaper or Lock Screen are wrong; the same words about the widget with the opt-in are true. The rule is a detector object
// (exec like a RegExp) because it needs per-clause logic: a clause is a sentence part between ';'.
const TIME_S = String.raw`(?:every|each)\s+(?:day|morning|night|evening|hour|few\s+(?:hours|minutes)|\d+\s*(?:minutes?|mins?|hours?|hrs?))\b|\bdaily\b|\bonce\s+(?:a|per)\s+day\b|\bat\s+night\b|\bovernight\b|\bnightly\b|\bhourly\b|\bwhile\s+you(?:['’]re|\s+are)?\s+(?:sleep\w*|asleep)\b`;
const AUTO_TIME = new RegExp(String.raw`\b(?:${TIME_S})`, 'i');
// "a new ayah", "fresh verse", "the next ayah", "a different wallpaper".
const NEW_AYAH = new RegExp(String.raw`\b(?:brand[- ]new|new|fresh|different|next|another)\s+(?:(?:Quran|Quranic|lock[- ]?screen|wallpaper)\s+)*(?:ayah|ayahs|ayat|verse|verses|passage|surah|wallpaper)\b`, 'i');
// Clear claims of an automatic change, in any QuranWall-ish clause (the widget opt-in does not rescue them).
const AUTO_STRONG = new RegExp(String.raw`\bnothing to (?:change|update|swap|refresh|do)\b[^.;]{0,15}\b(?:by hand|manually|yourself)\b|\bno opening required\b|\b(?:runs?|works?|updates?|changes?|refreshes|rotates?|applies|sets?|swaps?)\b[^.;]{0,50}\b(?:in the background|behind the scenes)\b|\bwhile the app is closed\b|\bShortcuts?\s+automations?\b[^.;]{0,60}\b(?:change|swap|update|new (?:ayah|verse)|different (?:ayah|verse)|rotat)`, 'i');
// "nothing to tap/open" is only a claim about the wallpaper, the app or the ayah.
const AUTO_STRONG_CTX = /\bnothing to (?:tap|open)\b/i;
// Weak phrases: a claim only when the clause is about QuranWall, the Lock Screen, the wallpaper, an ayah or verse, AND
// says something appears or changes ("The Quran shows up on its own", "a lock screen that changes automatically").
const AUTO_WEAK = /\bautomatic(?:ally)?\b|\bautomated\b|\bon auto-?pilot\b|\bset[- ]and[- ]forget\b|\bset it and forget it\b|\bhands[- ](?:free|off)\b|\bby itself\b|\bon its own\b(?!\s+(?:lock|home)[- ]screen)|\bon a schedule\b|\b(?:updates?|changes?|refreshes|swaps?|rotates?|renews?)\s+itself\b|\bself-(?:updating|refreshing|changing)\b|\bkeeps?\s+(?:rotating|changing|updating|refreshing|cycling|shuffling|swapping)\b|\bstays\s+fresh\b|\bnever\s+(?:gets?|goes|grows?|becomes?)\s+(?:stale|old|boring)\b|\bwhile\s+you(?:['’]re|\s+are)?\s+(?:sleep\w*|asleep)\b|\bwithout\s+(?:you\s+)?lifting a finger\b/i;
const AUTO_CTX = new RegExp(String.raw`\b(?:${BRAND}|lock[- ]?screens?|wallpapers?|ayah|ayahs|ayat|verses?|Quran)\b`, 'i');
const AUTO_CHANGEISH = /\b(?:appears?|shows?|displays?|chang\w*|updat\w*|refresh\w*|swaps?|swapp\w*|rotat\w*|switch\w*|renew\w*|replac\w*|shuffl\w*|cycl\w*|arriv\w*|deliver\w*|sends?|pushe?s?|puts?|places?|appl(?:y|ies|ied)|loads?|comes?|pops?|sets?)\b/i;
// A subject-verb-time claim with no QuranWall in the sentence: "your lock screen changes every day".
const WP_SUBJ = String.raw`(?:lock[- ]?screen|wallpaper)(?:\s+(?:ayah|verse))?`;
const AUTO_CHG = String.raw`(?:changes?|updates?|shuffles?|cycles?|rotates?|refreshes|switches|swaps?|renews?|replaces?)`;
const AUTO_SUBJ_TIMED = new RegExp(String.raw`\b${WP_SUBJ}\s+(?:(?:is|gets?)\s+(?:automatically\s+)?)?(?:${AUTO_CHG}|updated|refreshed|changed|swapped|replaced|renewed|rotated)\b[^.;]{0,40}\b(?:${TIME_S})|\b(?:${TIME_S})[^.;]{0,50}\b${WP_SUBJ}\s+(?:is|looks|feels)\s+(?:different|new|fresh)\b|\b${AUTO_CHG}\s+(?:your|the)\s+(?:${WP_SUBJ}|ayah|verse)s?\b[^.;]{0,40}\b(?:${TIME_S})|\b(?:${TIME_S})[^.;]{0,40}\b${AUTO_CHG}\s+(?:your|the)\s+${WP_SUBJ}\b`, 'i');
// The user acts first or the copy is about the user's own reading habit: the time phrase belongs to the user.
const AUTO_USER_ACTS = /\b(?:when|after|once|whenever|until|if)\s+you\b|\byou\s+(?:(?:can|could|may|might|should|would|will|must|need\s+to|want\s+to)\s+|['’]ll\s+)?(?:pick|choose|select|edit|tap|open|change|switch|update|set|read|recite|memori[sz]e|reflect|learn|study)\b|\byou['’]ll\s+(?:pick|choose|select|edit|tap|open|change|switch|update|set)\b|^\W*(?:pick|choose|select|edit|tap|save|change|read|recite|memori[sz]e|reflect|learn|study|spend|try|aim|commit|start|begin|take)\b|\b(?:read(?:ing)?|recit(?:e|ing)|memori[sz](?:e|ing)|reflect(?:ing)?|ponder(?:ing)?|study(?:ing)?|learn(?:ing)?)\b/i;
// "after you pick, QuranWall applies it automatically" is true: the app runs the Shortcut itself after a pick or edit.
const AUTO_USER_LEAD = /\b(?:after|when|once|whenever|if)\s+you\b|^\W*(?:pick|edit|choose|select|save|change|tap)\b|\b(?:pick|edit|choose|select|save|tap)s?\s+(?:a|an|the|your|another|new|that|it|Make It Mine)\b[^.;]{0,40}\b(?:and|then)\b|\bMake It Mine\b|\byou\s+(?:might\s+|may\s+|can\s+)?(?:pick|edit|choose|select|save|tap)\b/i;
const AUTO_NEGATED = /\b(?:is\s+not|isn['’]t|not|never|far\s+from)\s+(?:fully\s+|completely\s+|totally\s+)?(?:hands[- ](?:free|off)|automatic(?:ally)?|automated|set[- ]and[- ]forget)\b/gi;
// Legal, billing, privacy and sync words: "renews automatically", "collected automatically" are not about the wallpaper.
const AUTO_SKIP = /\b(?:renew\w*\b(?!\s+(?:your|the|a)\s+(?:\w+\s+)?(?:wallpaper|lock|ayah|verse))|subscri\w+|billed|billing|cancel\w*|trial|sync\w*|iCloud|backup|terminat\w*|licen[sc]e\w*|collect\w*|privacy|cookies?|analytics|crash)\b/i;
// iOS Focus modes and OS behaviour switch things on by themselves; that is iOS, not QuranWall.
const AUTO_OS = /\b(?:Focus|iOS|Apple)\b/i;
const AUTO_OTHER_APPS = /\b(?:Muslim Pro|Quran Majeed|Quran\.com|Tarteel|Athan|Quranly|iQuran|Al-?Quran|YouVersion|Hallow|competitors?|other apps?|another app|most apps)\b/i;
// A widget clause is exempt when it states the opt-in, or when it does not talk about the wallpaper
// ("The widget can switch to a new ayah every day"; "Turn on auto-rotate and the widget shows ...").
const WIDGET_OPT_IN = /\b(?:turn(?:s|ed)?\s+on|turning\s+on|switch(?:es|ed)?\s+on|enable[sd]?|opt(?:s|ed)?[- ]in|optional(?:ly)?(?!\?)|off by default|toggle|auto-?rotate|(?:only\s+)?(?:if|when)\s+you\s+(?:want|choose|decide|ask)|only\s+(?:if|when))\b/i;
function autoClaimInClause(c) {
  if (AUTO_SKIP.test(c)) return null;
  if (AUTO_OTHER_APPS.test(c) && !new RegExp(BRAND, 'i').test(c)) return null;
  const cc = c.replace(/\b(?:lock|home)[- ]?screen\s+widgets?\b/gi, 'widget');
  const widget = /\bwidgets?\b/i.test(cc);
  const wall = /\bwallpapers?\b/i.test(cc);
  const lock = /\block[- ]?screens?\b/i.test(cc);
  const optIn = WIDGET_OPT_IN.test(cc);
  // exempt from the timed and weak phrases: a widget clause (opt-in, or no wallpaper) or an opt-in clause about neither wallpaper nor Lock Screen
  const exempt = (widget && (optIn || !wall)) || (optIn && !wall && !lock);
  const userLed = AUTO_USER_ACTS.test(c);
  const ctx = AUTO_CTX.test(c);
  let m = AUTO_STRONG.exec(c);
  if (m) return m.index;
  if (ctx && (m = AUTO_STRONG_CTX.exec(c))) return m.index;
  if (exempt) return null;
  if (ctx && !AUTO_OS.test(c) && AUTO_CHANGEISH.test(c)) {
    let t = c.replace(AUTO_NEGATED, (x) => ' '.repeat(x.length));
    if (AUTO_USER_LEAD.test(t)) t = t.replace(/\bautomatic(?:ally)?\b/gi, (x) => ' '.repeat(x.length));
    if ((m = AUTO_WEAK.exec(t))) return m.index;
  }
  if (userLed) return null;
  const a = NEW_AYAH.exec(c);
  const t = AUTO_TIME.exec(c);
  if (a && t) return Math.min(a.index, t.index);
  if ((m = AUTO_SUBJ_TIMED.exec(c))) return m.index;
  return null;
}
const WALLPAPER_AUTOMATIC = {
  exec(s) {
    if (/\?["'’)\]}`,\s]*$/.test(s)) return null; // a question (also one quoted in a TS/JSON string: 'Does it ...?',)
    let from = 0;
    for (const c of s.split(/;\s+/)) {
      const base = s.indexOf(c, from);
      from = base + c.length;
      const at = autoClaimInClause(c);
      if (at !== null) return Object.assign([s.slice(base + at, from)], { index: base + at });
    }
    return null;
  },
};
// ---- arabic-beside-translation (2026-11-17): the wallpaper shows ONE edition per ayah, Uthmani Arabic OR a translation,
// never both. Strong phrases ("beside / alongside / next to a translation", "Arabic and English side by side") are bare;
// the weak connector ("Arabic with / and a translation") counts only in a sentence about the wallpaper, Lock Screen,
// widget or QuranWall (a blog post may say "read the Arabic with a translation" about reading).
const TRANS = String.raw`(?:(?:a|an|the|its|your|one|each|every)\s+)?(?:\w+\s+){0,2}translations?\b`;
const ARABIC_BESIDE = new RegExp(String.raw`\b(?:beside|alongside|next to|together with)\s+(?:a|an|the|its|your|one)\s+(?:\w+\s+){0,2}translations?\b|\b(?:Uthmani\s+)?Arabic\b[^.;]{0,40}\b(?:beside|alongside|next to)\s+(?:${TRANS}|English\b)|\bArabic\b[^.;]{0,30}\b(?:and|with|plus)\s+(?:${TRANS}|English\b)[^.;]{0,30}\bside[- ]by[- ]side\b|\bArabic\b[^.;]{0,30}\bside[- ]by[- ]side\b[^.;]{0,30}\b(?:${TRANS}|English\b)|\bArabic\b[^.;]{0,30}\b(?:and|with|plus|&)\s+(?:English|an? English|its English)\b[^.;]{0,20}\bside[- ]by[- ]side\b|^(?=[\s\S]*\b(?:lock[- ]?screen|wallpaper|widget|Quran ?Wall)\b)[\s\S]*?\bArabic\b[^.;]{0,25}\b(?:and|with|plus|&|together with)\s+${TRANS}`, 'i');
// Another app's feature ("Muslim Pro shows Arabic beside a translation") is not a QuranWall claim.
const ARABIC_OTHER = /\b(?:Muslim Pro|Quran Majeed|Quran\.com|Tarteel|Athan|iQuran|Al-?Quran|competitors?|other apps?|another app|most apps|many apps|print(?:ed)? mushafs?|mushafs?)\b/i;

// 2026-11-20 (app source, docs/app-knowledge): read-along recitation per ayah is real (Mishary Alafasy, word highlight, speed, repeat,
// streamed from Quran.com on first play). Saying so is fine; DENYING audio is the FAIL (audio-denied), and so is claiming more than
// exists (invented-audio: full-surah player, several reciters, offline audio). Nothing WARNs on audio any more.
const WARN_RULES = new Set();
// A sentence about another app, not QuranWall ("Quran.com has no audio ...", "Ayat has no widget"): not a QuranWall claim.
// The brand check mirrors OTHER_APP_ONLY, which is defined further down (hence the late binding).
const ABOUT_OTHER_APP = { test: (s) => !/Quran ?Wall/i.test(s) && (OTHER_APP_ONLY.test(s) || ARABIC_OTHER.test(s) || COMPETITOR_EXTRA.test(s)) };
// Competitor names the posts use besides the ones in OTHER_APP_NAME / ARABIC_OTHER.
const COMPETITOR_EXTRA = /\b(?:Ayat|Noor|Quran Quotes|Quran Widgets?|IslamicFinder|Quran Focus)\b/;

// A sentence that is only a download CTA (JSX tags, quotes and punctuation around it are ignored).
const STANDALONE_DOWNLOAD = /^(?:\s|<[^>]*>|[{}'"`*_.!:|-])*(?:free to download|download for free|free download)(?:\s|<[^>]*>|[{}'"`*_.!:|-])*$/i;

// A sentence that names another app and not QuranWall ("Athan is free to download", "Tarteel has a free plan") is a fact about
// that app: the three free rules (free-download-prose, free-use-bare and the free parts of pricing-mention) skip it.
const OTHER_APP_NAME = /\b(?:Muslim Pro|Quran Majeed|Quran\.com|Tarteel|Athan|iQuran|Al-?Quran|Pillars|Quranly|Logos|competitors?|other apps?|another app|most apps|many apps)\b/i;
// 2026-11-17 (third pass): a comparison or a first-person pointer back at us ("Unlike Athan, it is free to download", "Better than
// Tarteel and free to download", "Athan is free, and so is this app") is a claim about QuranWall without the brand: not exempt.
const OTHER_APP_POINTS_BACK = /\b(?:unlike|instead of|compared (?:to|with)|versus|vs\.?|whereas|so (?:is|are|does|do)|this app|our app|my app|this one|ours|we|our|us)\b|\b(?:better|cheaper|freer|more affordable) than\b|\bthan\b[^.]{0,40}\b(?:free|cost|price)\b/i;
const OTHER_APP_ONLY = { test: (s) => OTHER_APP_NAME.test(s) && !/Quran ?Wall/i.test(s) && !OTHER_APP_POINTS_BACK.test(s) };

// pricing-mention, 2026-11-17 second pass: subscription/billing/price wording of any kind (NON_FREE) and the "free" phrasings (FREE).
// Only the FREE parts are skipped for a sentence about another app (PRICING_OTHER_APP_OK).
const PRICING_NON_FREE = [
  String.raw`\bsubscri(?:ption|bing|be|bed|ber)s?\b[^.]{0,40}\b(?:required|needed|necessary|unlocks?|unlocked)\b`,
  String.raw`\b(?:requires?|needs?|needed|requiring)\s+(?:a|an|the)\s+(?:\w+\s+)?subscription\b`,
  String.raw`\bwith (?:a|an) (?:in-app )?subscription\b`,
  String.raw`\bin-app (?:subscriptions?|purchases?)\b`,
  String.raw`\b\d+[- ]days?\s+(?:free\s+)?trial\b|\btrial (?:period|offer)\b`,
  String.raw`\bsee (?:the )?(?:prices?|pricing)\b|\bprices? (?:in|on|inside) (?:the )?app\b`,
  String.raw`\b(?:app store|apple) (?:listing )?shows? (?:you )?(?:what is offered|the (?:exact )?prices?|pricing)\b|\bshows? the (?:exact )?price\b`,
  String.raw`\btoday['’]?s terms\b`,
  String.raw`\bbefore you (?:subscribe|pay)\b`,
  String.raw`\bauto-?renew\w*`,
  String.raw`\bpaywall\b`,
  String.raw`\b(?:costs?|prices?|priced|billed|pay|paid|charged?|plans?|subscriptions?)\b[^.]{0,40}\bper (?:week|month|year)\b|\bper (?:week|month|year)\b[^.]{0,20}\b(?:billed|after)\b|\b(?:weekly|monthly|yearly|annual)\s+(?:plan|subscription|billing)\b|\d\s?/\s?(?:wk|week|mo|month|yr|year)\b`,
  String.raw`(?<![\w'"\x60])[$€£]\s?\d`,
  // 2026-11-17 second pass (holes closed): a bare billing / subscribe / cancel-anytime / QuranWall+ / unlock-everything / see-pricing,
  // and a price with no currency symbol ("4.99 a week", "just 2.99/month", "29.99 per year").
  String.raw`\bbilling\b|\bsubscribe\b|\bcancel(?:l?ing|led)?\s+(?:it\s+)?(?:any ?time|at any time)\b|\bQuran ?Wall\+|\bunlock(?:s|ed|ing)?\s+everything\b`,
  String.raw`(?<![\w.,])\d{1,3}[.,]\d{2}\s*(?:/|(?:a|per|each|every|\/)\s*)\s*(?:wk|week|mo|month|yr|year)s?\b`,
  // 2026-11-17 third pass (13 evasions): one-time purchase / pay once / lifetime access / upgrade-to-unlock / ad removal by supporting
  // the developer / a price written in words ("costs 5 dollars a month", "costs zero dollars").
  String.raw`\bone[- ]?time\s+(?:purchase|payment|fee|buy|unlock|cost|charge)\b|\bsingle\s+(?:payment|purchase)\b|\bpa(?:y|ys|ying|id)\s+(?:just\s+|only\s+|a\s+single\s+time\s+|one\s+time\s+)?once\b|\bpay\s+(?:one|a single)\s+time\b`,
  String.raw`\blifetime\s+(?:access|licen[cs]e|plan|deal|unlock|purchase|membership|subscription|pass|offer)\b`,
  String.raw`\bupgrad(?:e|es|ed|ing)\b[^.]{0,30}\b(?:unlock\w*|full|all|more|extra|features?|access|premium|pro|plus)\b|\bupgrad(?:e|es|ed|ing)\s+(?:now|today)\b|\bunlock(?:s|ed|ing)?\s+(?:all|more|the full|full|extra|premium|every|additional|the rest|everything)\b`,
  String.raw`\bgo(?:es|ing)?\s+ad[- ]?free\b|\b(?:remove|get rid of|hide|disable|turn off)\s+(?:the\s+)?ads\b|\bsupport(?:s|ing)?\s+(?:the\s+|our\s+|this\s+|its\s+)?(?:developers?|devs?|creators?|makers?)\b`,
  String.raw`\b(?:zero|\d[\d.,]*|(?:one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|thirty|fifty|hundred))\s+(?:dollars?|euros?|bucks|cents|USD|EUR|GBP)\b|\b(?:costs?|priced?|charges?)\b[^.]{0,30}\b(?:dollars?|euros?|bucks)\b`,
];
const PRICING_FREE = [
  String.raw`\bfree trials?\b`,
  String.raw`\bfree forever\b|\bfree of charge\b|\bfree (?:on|in|from|at) (?:the )?(?:app store|apple)\b`,
  // 2026-11-17 third pass: bare "trial", "gratis", "at no charge", "ad-free and free", "free for a week", lowercase "premium".
  String.raw`(?<![/\w])\btrials?\b(?![\s-]+and[\s-]+error\b|\/)`, // not a slash-separated grep list (\"free/trial/subscri\" in the agent prompts)
  String.raw`\bgratis\b`,
  String.raw`\bat no (?:extra |additional )?(?:charge|cost|fee)\b|\bno[- ](?:charge|fee)s?\b|\bwithout (?:a charge|any charge|any fee|a fee)\b|\bzero (?:cost|charge|fees?)\b`, // bare \"without paying\" is real copy about another app (best-muslim-app post); only the download form is a rule
  String.raw`\bad[- ]?free\s*(?:,|and|&|\+)\s*(?:completely\s+|totally\s+|100%\s+)?free(?![-\w])|(?<![-\w])free\s*(?:,|and|&|\+)\s*ad[- ]?free\b`,
  String.raw`\bfree\s+(?:for|during|over)\s+(?:a|an|the|one|two|three|four|five|seven|ten|\d+|your first|the first)\s+(?:\w+\s+)?(?:days?|weeks?|months?|years?)\b|\b(?:a|one|first|\d+)[- ](?:days?|weeks?|months?)\s+free\b|\b(?:try|use|get|start|test)\s+(?:it|this app|the app|Quran ?Wall|them)\s+free(?![-\w])`,
  // "premium" as a plan word, in any case ("premium fonts", "go premium", "with premium"). The adjective for looks and quality
  // ("a premium wallpaper look", "premium feel") still passes.
  String.raw`(?<!\/)\bpremium\b(?!\/|\s+(?:wallpapers?|looks?|feel|design|quality|finish|aesthetic|style|touch|typography|paper|print|materials?|edition of the mushaf))`,
];
const PRICING_NON_FREE_RE = new RegExp(PRICING_NON_FREE.join('|'), 'i');
const PRICING_OTHER_APP_OK = { test: (s) => OTHER_APP_ONLY.test(s) && !PRICING_NON_FREE_RE.test(s) };

// Each rule: [id, regex, unused, allow?]. `allow` rescues a sentence that matches it (a RegExp, DENY for a clause-scoped
// negation, or an array of them).
const rules = [
  // A stated price, trial length or plan name about QuranWall.
  ['price-or-trial', new RegExp(`\\b${BRAND}\\b[^.]{0,120}(?:\\$\\s?\\d|€\\s?\\d|£\\s?\\d|\\b\\d+[- ]days?\\s+(?:free\\s+)?trial|\\bfree trial\\b|\\b\\d+\\s+days?\\s+free\\b|\\bper (?:week|month|year)\\b|/(?:wk|week|mo|month|yr|year)\\b|\\b(?:weekly|monthly|yearly|annual|lifetime)\\s+(?:plan|subscription|premium|pass|membership)\\b)`, 'i'), null],
  // "free" on its own about QuranWall ("free to download" is the one allowed phrasing).
  ['free-claim', new RegExp(`\\b${BRAND}\\b(?:'s)?\\s+(?:is|are|was|stays|remains)\\s+(?:a\\s+|an\\s+)?(?:completely\\s+|totally\\s+|100%\\s+|truly\\s+|also\\s+|entirely\\s+|always\\s+)?free\\b(?!\\s+to\\s+(?:download|install|get))|\\bfree\\s+(?:\\w+\\s+){0,3}app\\b[^.]{0,30}\\b${BRAND}\\b|\\b${BRAND}\\b[^.?]{0,40}\\b(?:for free|free of charge|at no cost|free forever|free tier|free version|free plan|free app|no paywall|freemium|completely free|totally free|100% free|entirely free)\\b|\\b${BRAND}\\b[^.?]{0,40}\\bcosts? nothing\\b|\\bno cost\\b[^.]{0,30}\\b${BRAND}\\b`, 'i'), null, /\bno free tier\b|there is no free\b|has no free\b|not free\b|isn'?t free\b/i],
  // "is a free app" with no brand in the sentence (a bare claim in a QuranWall page or post; search-intent
  // wording such as "looking for a free Quran app" is not a claim).
  ['free-app-bare', /\b(?:is|it'?s|it is|this is|that'?s|was|are)\s+(?:a|an)\s+(?:totally\s+|completely\s+|100%\s+)?free\s+(?:\w+\s+){0,2}app\b/i, null],
  // No subscription, paywall, trial or price wording on the website (Karol, 2026-11-16, widened 2026-11-17). Bare phrases
  // (every page and post is about QuranWall). Competitor facts ("Logos sells packs by subscription") do not match: the patterns
  // need "required/needed/unlocks", "in-app", a trial, a price or a billing period. Exempt, by file: the legal pages only
  // (see PRICING_EXEMPT). JSON-LD is not visible text and is never scanned.
  ['pricing-mention', new RegExp([...PRICING_NON_FREE, ...PRICING_FREE].join('|'), 'i'), null, PRICING_OTHER_APP_OK],
  // "Free to download", "Download for free", "Free download": allowed only as a standalone line (App Store button, install card, hero
  // or final CTA). Inside running prose (a post paragraph, a guide, an FAQ answer, a sentence with other words) it is a FAIL.
  ['free-download-prose', /\bfree to (?:download|install|get)\b|\bdownload (?:it |the app |quranwall )?for free\b|\bfree downloads?\b|\bdownload\s+(?:it|this app|the app|quranwall|them)\s+free\b|\bfree (?:on|in|from|at) (?:the )?(?:app store|apple)\b|\bdownload\b[^.]{0,20}\b(?:gratis|at no (?:charge|cost|fee)|without paying)\b|\bgratis (?:download|app)s?\b/i, null, [STANDALONE_DOWNLOAD, OTHER_APP_ONLY]],
  // Saying that using the app is free, without naming it ("all features for free", "use it for free").
  ['free-use-bare', /\b(?:all|every|full|any|the)\s+(?:the\s+|of the\s+)?(?:\w+\s+){0,2}(?:features?|functionality|access)\b[^.]{0,30}\b(?:for free|free of charge|at no cost|free)\b|\b(?:use|using|try|get|unlock|access|enjoy)\b[^.]{0,30}\b(?:for free|free of charge)\b|\bfree (?:version|tier|plan)\b|\bno[- ]cost\b|\bcosts? nothing\b|\bfree forever\b|\bfree of charge\b|\bgratis\b|\bat no (?:extra |additional )?(?:charge|cost|fee)\b|\bad[- ]?free\s*(?:,|and|&|\+)\s*(?:completely\s+|totally\s+|100%\s+)?free(?![-\w])|(?<![-\w])free\s*(?:,|and|&|\+)\s*ad[- ]?free\b|\b(?:try|use|get|start|test)\s+(?:it|this app|the app|Quran ?Wall|them)\s+free(?![-\w])/i, null, OTHER_APP_ONLY],
  // CONFIRMED ABSENT in the app code (2026-11-20): installing through iOS Focus modes (only an unreferenced Shortcuts tip mentions Focus).
  ['focus-install', new RegExp(`\\b${BRAND}\\b${CL}{0,80}\\bFocus(?:\\s+(?:modes?|filters?))?\\b|\\bFocus modes?\\b${CL}{0,60}\\b${BRAND}\\b`, 'i'), null, /\blink(?:ed|s)?\b|\bpair(?:ed|s)?\b|\bswitch(?:es|ing)?\b/i],
  // CONFIRMED ABSENT in the app code (2026-11-20): verse packs, themed packs or any named pack.
  ['verse-packs', new RegExp(`\\b${BRAND}\\b${CL}{0,80}\\b(?:packs?|bundles?|collections? of (?:verses|ayat|ayahs))\\b`, 'i'), null],
  ['verse-packs-bare', /\b(?:verse|ayah|ayat|surah|themed|wallpaper|theme|dua|dhikr|starter|bonus) packs?\b|\bthemed\s+(?:collections?|bundles?|sets?)\b|\b(?:anxiety|patience|gratitude|mercy)\b[^.]{0,25}\b(?:packs?|collections?)\b/i, null],
  // NOT CONFIRMED: "Premium" unlocks or "unlimited" anything. The listing never says "Premium" at all.
  ['premium-unlock', new RegExp(`\\bPremium\\b[^.]{0,60}\\b(?:unlock\\w*|includes?|gives?|adds?|removes?|enables?|grants?)\\b|\\bunlock\\w*\\b[^.]{0,40}\\bPremium\\b|\\b${BRAND}\\b${CL}{0,80}\\bunlimited\\b|\\bunlimited\\s+(?:verses?|ayat|ayahs?|wallpapers?|widgets?|backgrounds?|fonts?|themes?|translations?|surahs?|access)\\b`, 'i'), null],
  // NOT CONFIRMED: the name "Premium". The listing's in-app purchases are called QuranWall+ Weekly / Yearly;
  // write "an in-app subscription" instead. Case-sensitive on purpose ("premium" as an adjective is fine).
  ['premium-name', /\bPremium\s+is\s+(?:a|an|the)\s+(?:in-app\s+)?(?:[Ss]ubscription|[Pp]lan)\b|\bPremium\s+(?:[Ss]ubscription|[Pp]lan|[Tt]ier|[Vv]ersion|[Ee]dition|[Mm]embership|SUBSCRIPTION|PLAN|TIER|VERSION|EDITION|MEMBERSHIP)\b/, null],
  // NOT CONFIRMED: duas inside QuranWall.
  ['duas', new RegExp(`\\b${BRAND}\\b${CL}{0,80}\\b(?:du'?as?|du'?aa|supplications?|adhkar|adhkaar)\\b|\\b(?:personal|custom|your own|saved|favou?rite)\\s+(?:du'?as?|du'?aa|supplications?)\\b`, 'i'), null, /\b(?:read|reading|recit\w+|write|writing|praying|pray|make|making|about|topic|post|guide|article)\b/i],
  // NOT CONFIRMED: a "60-second setup".
  ['setup-60s', new RegExp(`\\b(?:60|sixty)[- ]?seconds?\\b[^.]{0,30}\\b(?:set[- ]?up|install\\w*|ready|get started|to set)\\b|\\b${SETUPV}\\b[^.]{0,30}\\b(?:in|within|under|just|takes?)\\s+(?:about\\s+|only\\s+|just\\s+)?(?:60|sixty)[- ]?seconds?\\b|\\b(?:a|one|1)[- ]minute\\s+set[- ]?up\\b`, 'i'), null],
  // NOT CONFIRMED: any stated setup time ("Seconds to set up", "2-minute setup", "Set up in under 2 minutes",
  // "under 2 minutes to install"). Bare phrases: the page or post is about QuranWall. Stat blocks reach this
  // rule as "<number><suffix> <label>" (see statText), built HTML as concatenated text (see htmlToText).
  ['setup-time', new RegExp(`\\b(?:seconds?|secs?|minutes?|mins?)\\s+to\\s+(?:set[- ]?up|install\\w*)\\b|\\b${NUM}[- ](?:seconds?|secs?|minutes?|mins?)[- ](?:set[- ]?up|install\\w*)\\b|\\b\\d+s[- ]?set[- ]?up\\b|\\b(?:a[- ]|an[- ])?(?:second|minute|sec|min)[- ]set[- ]?up\\b|\\b${SETUPV}\\b[^.]{0,30}?\\b${QLEAD}${QTY}|\\b(?:under|within|less than|in just|in only)\\s+${QTY}[^.]{0,30}\\b(?:set[- ]?up|install\\w*)\\b|\\b${SETVERB}\\b${CL}{0,30}?\\b${QLEAD}${QTY}\\s+with\\s+${BRAND}\\b|\\b${QLEAD}${QTY}\\s+with\\s+${BRAND}\\b${CL}{0,40}\\b${SETVERB}\\b`, 'i'), null],
  // 2026-11-20: "no account or sign-in needed" is CONFIRMED by the app code (no accounts, no sign-in), so the old no-account-bare FAIL is gone.
  ['focus-install-bare', /\bFocus[- ](?:mode[- ])?(?:install\w*|setup|set-up)\b|\binstall\w*\s+(?:it\s+|the app\s+|the widget\s+)?(?:through|via|with|using|from)\s+(?:an?\s+|your\s+)?(?:iOS\s+)?Focus\b/i, null, [DENY, ABOUT_OTHER_APP]],
  // CONFIRMED ABSENT (2026-11-20): a dhikr, tasbih or counter widget; themed collections; Pin or favourites; iPad, Mac, Watch, iCloud sync; large or circular widgets.
  ['dhikr-widget', new RegExp(`\\b${BRAND}\\b${CL}{0,80}\\b(?:dhikr|tasbih|tasbeeh|zikr|adhkar)\\s+(?:widgets?|counters?|trackers?)\\b|\\b(?:dhikr|tasbih|tasbeeh|zikr|adhkar)\\s+(?:widgets?|counters?|trackers?)\\b${CL}{0,40}\\b(?:of|for|from|in|on|with|inside)\\s+${BRAND}\\b`, 'i'), null, DENY],
  ['pin-favourites', /\b(?:pin|pins|pinned|pinning)\s+(?:an?\s+|the\s+|your\s+|any\s+)?(?:favou?rite\s+)?(?:ayah|ayat|verse|surah)s?\b|\bpinned\s+(?:ayah|ayat|verse|favou?rite)s?\b|\bfavou?rites?\s+(?:list|tab|screen|collection)\b|\bsave\s+(?:your\s+)?favou?rite\s+(?:ayah|ayat|verses?)\b/i, null, [DENY, ABOUT_OTHER_APP]],
  ['invented-platform', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:iPads?|iPadOS|macOS|Mac app|Apple Watch|watchOS|Apple TV|Vision Pro|CarPlay|iCloud|syncs? across|sync(?:s|ing)? (?:between|with)|large widgets?|circular widgets?|StandBy)\\b`, 'i'), null, DENY],
  // CONFIRMED (2026-11-20): the Quran text works offline; recitation (first play), purchases and support need internet. A bare "works offline" claims too much.
  ['offline-unqualified', /\b(?:works?|working|runs?)\s+(?:fully\s+|completely\s+|entirely\s+|100%\s+|totally\s+)?offline\b/i, null, [/\b(?:not|n['’]t|never)\s+(?:\w+\s+)?(?:work|run)/i, ABOUT_OTHER_APP, /\b(?:Quran text|text|browsing|browse|search|widget|surahs?)\b/i]],
  // CONFIRMED (2026-11-20): anonymous product analytics (Mixpanel) and RevenueCat are in the app, and support messages carry the saved ayah and first name. Supported: no ads, no ad SDK,
  // no account or sign-in, no tracking prompt, no cross-app tracking. Legal pages are exempt (PRIVACY_EXEMPT = PRICING_EXEMPT); NEG does not rescue these in site content (see NEG_BYPASS).
  ['privacy-claims', new RegExp([
    String.raw`\bno\s+(?:user\s+|usage\s+|personal\s+)?(?:tracking|analytics|trackers?)\b(?!\s+(?:prompt|across|between))`,
    String.raw`\bno\s+(?:personal\s+|user\s+)?data\s+(?:is\s+|are\s+|gets\s+)?(?:collected|collection|stored|shared)\b|\bno\s+data\s+collection\b`,
    String.raw`\b(?:we|it|the app|Quran ?Wall)\s+(?:do(?:es)?\s+not|don['’]t|doesn['’]t|never)\s+(?:track|collect|store|share)\b`,
    String.raw`\bnothing\s+(?:ever\s+)?leaves\s+(?:your|the)\s+(?:phone|device|iPhone)\b|\b(?:never|doesn['’]t|does not)\s+leaves?\s+(?:your|the)\s+(?:phone|device|iPhone)\b`,
    String.raw`\b(?:selections?|choices?|verses?|ayat|ayahs?|data|information)\s+(?:stay|stays|remain|remains|is kept|are kept|is stored|are stored)\s+(?:only\s+)?(?:on|in)\s+(?:your|the)\s+(?:device|phone|iPhone)\b`,
    String.raw`\btracker-free\b|\bzero\s+tracking\b|\bwithout\s+(?:any\s+)?(?:tracking|analytics|data collection)\b(?!\s+you\s+across)`,
    String.raw`\b(?:100%|completely|fully|totally)\s+private\b`,
  ].join('|'), 'i'), null, ABOUT_OTHER_APP],
  // CONFIRMED (2026-11-20): QuranWall installs on iOS 15.0, but the wallpaper, the wallpaper picker and the Lock Screen widgets need iOS 16. "Works on / needs iOS 15" without the
  // iOS 16 caveat over-promises the main feature (SettingsView.swift:743-780; QuranWallWallpaperIntent.swift:25).
  ['ios15-wallpaper', { exec(s) {
    if (!/\biOS\s?15\b/i.test(s)) return null;
    if (/\biOS\s?16\b|\binstall\w*\b|\bHome Screen widget\b|\bminimum\b|\blist(?:ing|s|ed)\b|\bor later\b[^.]{0,30}\bor later\b/i.test(s)) return null;
    const m = /\b(?:works?|working|runs?|needs?|needed|requires?|required|supports?|compatible|only)\b[^.;]{0,40}\biOS\s?15\b/i.exec(s)
      || (/\b(?:wallpapers?|lock[- ]?screens?)\b/i.test(s) ? /\biOS\s?15\b/i.exec(s) : null);
    return m;
  } }, null, [ABOUT_OTHER_APP, DENY]],
  // NOT CONFIRMED: iOS 16 as the minimum (the listing says iOS 15.0). OS-feature facts (Lock Screen widgets
  // arrived in iOS 16) are allowed through the widget/Lock Screen/Focus wording.
  ['ios16-as-min', new RegExp(`\\b(?:${BRAND}|the app)\\b[^.]{0,100}\\biOS\\s?16(?:\\.0)?(?:\\+|\\s+or\\s+(?:later|newer|higher)|\\s+and\\s+(?:later|newer|up))|\\b(?:requires?|needs?|minimum|min\\.?)\\s+(?:iOS\\s*)?16(?:\\.0)?\\b|Platform\\W{1,8}iOS 16|Minimum iOS\\W{1,8}16|operatingSystem"?\\W{1,6}iOS 16|^[-*\\s]*iOS 16(?:\\.0)?(?:\\+|\\s+or later|\\s+and later)?\\s*$`, 'i'), null, /widget|Lock Screen|Focus|wallpaper|iOS\s?15|competitor|customi[sz]|introduced|\bsince\b/i],
  // Invented features (about QuranWall). A denial in the same sentence ("no audio", "doesn't have") is fine.
  ['invented-android-web', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:Android|Google Play|Play Store|web app|web version|browser version|desktop app|Windows|Chrome extension)\\b|\\b(?:Android|web app|web version|browser version)\\b${CL}{0,40}\\b(?:of|for|from|in|on|with)\\s+${BRAND}\\b`, 'i'), null, DENY],
  // Audio: the app HAS read-along recitation per ayah (Mishary Alafasy; first play needs internet). Denying it is the FAIL; so is claiming a full-surah player,
  // several reciters, a reciter picker, or offline audio. A sentence about another app is not a claim about ours.
  ['audio-denied', /\b(?:no|without|lacks?|lacking|missing|minus)\s+(?:any\s+|built-in\s+|in-app\s+)?(?:audio|recitations?|reciters?|qari)\b|\b(?:doesn['’]t|does not|don['’]t|do not|isn['’]t|aren['’]t|not)\s+(?:have|has|include|offer|play|support|come with|provide|feature)\s+(?:any\s+)?(?:audio|recitations?)\b/i, null, [ABOUT_OTHER_APP]],
  ['invented-audio', new RegExp(`\\b${BRAND}\\b${CL}{0,80}\\b(?:(?:full|whole|complete)[- ](?:surah|chapter)\\s+(?:audio|recitations?|player)|audio players?|(?:choose|pick|select|switch)\\s+(?:between\\s+|your\\s+|a\\s+|the\\s+)?(?:\\w+\\s+)?(?:reciters?|qaris?)|(?:several|multiple|many|different|famous|top|popular|favou?rite|your favou?rite)\\s+(?:\\w+\\s+)?(?:reciters?|qaris?)|(?:offline|downloadable|downloaded) (?:audio|recitations?)|(?:audio|recitations?)\\s+(?:offline|without (?:an? )?internet)|download\\s+(?:the\\s+)?(?:audio|recitations?)|playlists?)\\b|\\b(?:(?:full|whole|complete)[- ](?:surah|chapter)\\s+(?:audio|recitations?|player)|audio players?)\\b${CL}{0,40}\\b(?:of|for|from|in|on|with|inside)\\s+${BRAND}\\b`, 'i'), null, [DENY, ABOUT_OTHER_APP]],
  ['invented-tafsir', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:tafs[iī]rs?|commentar(?:y|ies)|exegesis)\\b|\\b(?:tafs[iī]rs?|commentar(?:y|ies))\\b${CL}{0,40}\\b(?:of|for|from|in|on|with|inside)\\s+${BRAND}\\b`, 'i'), null, DENY],
  ['invented-prayer-times', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:prayer times?|salah times?|salat times?|adhan|azan|qibla|qiblah|prayer reminders?|athan)\\b|\\b(?:prayer times?|qibla|qiblah|adhan)\\b${CL}{0,40}\\b(?:of|for|from|in|on|with|inside)\\s+${BRAND}\\b`, 'i'), null, DENY],
  ['invented-hifz', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:hifz|hifdh|memori[sz]ation (?:tracking|tracker|tools?|progress|plans?|features?|mode)|memori[sz]ing (?:progress|tools?)|track\\w*\\s+(?:your\\s+)?(?:hifz|memori[sz]ation|memori[sz]ing|progress)|hifz (?:tracker|tools?|plans?|mode|features?))\\b`, 'i'), null, DENY],
  ['invented-ai', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:AI|A\\.I\\.|artificial intelligence|machine learning|chatbot|AI-powered|AI-assisted)\\b|\\b(?:AI|artificial intelligence|chatbot)\\b${CL}{0,40}\\b(?:of|for|from|in|on|with|inside)\\s+${BRAND}\\b`, 'i'), null, DENY],
  // NOT CONFIRMED: any social proof or user count. The one allowed number is the App Store Connect downloads floor
  // from facts.json: "Downloaded <downloadsFloor> times" (rule social-proof-downloads) and, since Karol's 2026-11-17
  // decision, "Trusted by <floor> believers", "Join <floor> believers" and the stat "<floor> Believers using QuranWall"
  // (see allowedProofStripped). Stats whose label names users, believers, people or Muslims are linted separately
  // (lintStat); this rule covers prose and tag-stripped HTML.
  ['social-proof', new RegExp(`\\b(?:(?:tens|hundreds) of )?(?:thousands|hundreds|millions)(?: of)?\\s+(?:\\w+\\s+){0,2}?${PEOPLE}\\b|\\btrusted by\\s+${QUAL}(?:${COUNT}|${WCOUNT}|thousands|millions)|\\b(?:used|loved|trusted|chosen|relied on|picked) by\\s+${QUAL}(?:(?:tens|hundreds) of\\s+)?(?:thousands|millions|hundreds)\\b|\\b(?:used|loved|chosen|relied on|picked) by\\s+${QUAL}(?:${COUNT}|${WCOUNT})|\\bjoin(?:ed|ing|s)?\\s+${QUAL}(?:${COUNT}|${WCOUNT})(?:\\s+\\w+){0,2}?\\s+${PEOPLE}\\b|\\b${QUAL}${WCOUNT}(?:\\s+(?!of\\b)\\w+){0,2}?\\s+${PEOPLE}\\b|(?:\\b\\d[\\d,.]*\\s?(?:\\+|%|[km]\\b\\+?)|\\b\\d{1,3}(?:,\\d{3})+|\\b\\d{3,}\\+?)(?:\\s+(?!of\\b)\\w+)?\\s+${PEOPLE}\\b|\\b\\d[\\d,.]*\\s?(?:million|thousand|[km]\\b\\+?)\\s+(?:\\w+\\s+)?(?:users|believers)\\b|\\b\\d[\\d,.]*\\s+(?:active|daily|monthly|early|happy|total|registered)\\s+${PEOPLE}\\b`, 'i'), null],
  // Two phrasings are allowed, both only with exactly facts.downloadsFloor (commas ignored, the "+" must match):
  // "Downloaded <floor> times" and "<floor> downloads". Any other download count FAILs (see downloadHits).
  ['social-proof-downloads', null, null],
  // NOT CONFIRMED: "Premium" as a plan name ("QuranWall Premium", "upgrade to Premium", "go Premium",
  // "Premium needs ..."). Case-sensitive on Premium on purpose; "premium" as an adjective is fine.
  ['premium-plan-word', /\bQuran ?Wall\+?\s+(?:Premium|Pro|Plus)\b|\b[Uu]pgrad(?:e|es|ed|ing)\s+to\s+(?:Pro|Plus)\b|\b(?:Pro|Plus)\s+(?:[Pp]lan|[Ss]ubscription|[Tt]ier|[Mm]embership)\b|\b(?:[Uu]pgrad(?:e|es|ed|ing)|[Gg]o(?:es|ing)?|[Gg]et(?:s|ting)?)\s+(?:to\s+)?(?:Quran ?Wall\+?\s+)?Premium\b|\bPremium\s+(?:[Pp]lan|[Ss]ubscription|[Tt]ier|[Mm]embership)\b|\bPremium\s+(?:needs|requires|costs|unlocks|includes|features|members|access|users)\b|\bPremium\s+(?:[Vv]ersion|[Ee]dition)\b|\b(?:[Qq][Uu][Rr][Aa][Nn] ?[Ww][Aa][Ll][Ll])\+?\s+(?:Pro|PRO|pro|Plus|PLUS|PREMIUM)\b(?![-\w])|\bquranwall\+?\s+plus\b|\b[Gg][Oo]\s+(?:Pro|PRO)\b(?![-\w]|\s+tips?\b)|\b[Gg]et\s+(?:Pro|PRO|Plus)\b(?![-\w]|\s+(?:tips?|size)\b)/, null],
  // 2026-11-17: the plan-name rule above is case-insensitive on the brand ("quranwall pro", "QuranWall PLUS") and also catches
  // "Go Pro", "Get Pro", "Get Plus" and "Pro/Plus/Premium Version/Edition". Hyphenated words ("Pro-Quran") and "Pro tip" pass.
  // The wallpaper shows ONE edition per ayah (Uthmani Arabic OR a translation), so "Arabic beside a translation" is wrong.
  ['arabic-beside-translation', ARABIC_BESIDE, null, [ARABIC_OTHER, DENY]],
  // The wallpaper never changes by itself; only the widget can rotate, and only after the user turns on auto-rotate.
  ['wallpaper-automatic', WALLPAPER_AUTOMATIC, null, DENY],
];

// A sentence that states the ban itself ("never write ...", "NOT CONFIRMED ...") is not a violation.
const NEG = /\b(?:never|don'?t|do not|doesn'?t|does not|banned|avoid|no claim|not confirmed|unconfirmed|not claim|must not|mustn'?t|forbidden|ruled out)\b|\bno\b[^.;]{0,100}\bclaims?\b/i;

// JSON keys that hold identifiers, not prose.
const SKIPKEYS = new Set(['keywords', 'keyword', 'slug', 'image', 'thumbnail', 'url', 'href', 'id', 'imageAlt', 'alternateName', 'related', 'featured', 'cluster', 'target_keyword', 'query', 'queries', 'minIOS', 'minIOSText', 'wallpaperMinIOS', 'wallpaperMinIOSText']);

// A list item about another app ("**Muslim Pro** — ...") that never names QuranWall can't make a QuranWall
// claim through a bare phrase, so the bare-phrase rules skip it.
const OTHER_APP_ITEM = /^\s*(?:[-*]\s+)?\*\*(?!Quran ?Wall\b)[^*]{2,60}\*\*/;
// Files where the pricing rules do not apply: the legal pages only (Apple requires their subscription and billing text).
// Built legal pages: dist/terms-of-use, dist/eula, dist/privacy-policy.
const PRICING_EXEMPT = /^(?:src\/pages\/(?:TermsOfUse|EULA|PrivacyPolicy)\.tsx|dist\/(?:terms-of-use|eula|privacy-policy)(?:\/index)?\.html)$/;
const PRICING_RULES = new Set(['pricing-mention', 'free-download-prose', 'free-use-bare', 'privacy-claims']); // privacy-claims: the legal pages describe the data practices (2026-11-20)
// Rules whose phrase IS a denial ("no tracking", "does not have audio", "we never track"): NEG ("never", "does not") must not rescue them in site content.
// Skills and prompts (wholeSentenceNeg) still treat a sentence that states the ban as a mention.
const NEG_BYPASS = new Set(['audio-denied', 'privacy-claims']);
const BARE_RULES = new Set(['pricing-mention', 'free-download-prose', 'free-use-bare', 'audio-denied', 'privacy-claims', 'ios15-wallpaper', 'offline-unqualified', 'pin-favourites', 'focus-install-bare', 'setup-60s', 'setup-time', 'premium-name', 'premium-plan-word', 'social-proof', 'social-proof-downloads', 'verse-packs-bare', 'free-app-bare', 'arabic-beside-translation', 'wallpaper-automatic']);

/**
 * Files whose negations are rule text, not copy: skills and the SEO queue/keyword notes say "NOT CONFIRMED: do not
 * add claims about verse packs" on purpose, so they keep whole-sentence NEG like the prompt files. Everything else
 * (posts, components, pages, public/*.txt|md, built HTML) is site content and is linted per clause.
 */
const negOpts = (file) => {
  const f = String(file).startsWith(ROOT) ? rel(file) : String(file); // relative: a worktree lives under <repo>/.claude/worktrees/
  if (/seo-(?:priorities|keywords)\.json$/.test(f)) return { wholeSentenceNeg: true, planText: true };
  return /(?:^|[\\/])\.claude[\\/]/.test(f) ? { wholeSentenceNeg: true } : {};
};
// Queue notes quote the strings they tell the executor to remove ("reword every '1,000+ believers' claim ..."): in
// planText files a sentence that orders a removal is a mention, not a claim.
const PLAN_VERBS = /\b(?:reword|rewrite|remove[sd]?|delete[sd]?|replace[sd]?|grandfather\w*|strip(?:ped)?)\b/i;

/** A download count as a comparable string: commas and spaces dropped, so "1,000+" == "1000+" but "1,000" != "1,000+". */
const normCount = (v) => String(v).replace(/[,\s]/g, '').toLowerCase();

/**
 * Allowed social proof, all tied to facts.downloadsFloor (Karol decided on 2026-11-17 to keep these lines; before that they were
 * grandfathered until queue item p5 would have removed them). Returns `s` with the allowed phrasings blanked out (same length,
 * so match indexes still line up), so the social-proof rule only sees what is left. The number must equal the floor exactly
 * (normCount: commas ignored, the "+" must match) and nothing may sit between the verb and the number ("Trusted by over
 * 1,000+ believers" and "Join 1,000 believers" stay FAIL):
 *   "Trusted by <floor> believers", "Join <floor> believers", the stat "<floor> Believers using QuranWall",
 *   and the stat "92% Early users feel closer to Allah" (real waitlist responses, Karol confirmed 2026-11-17).
 */
function allowedProofStripped(s) {
  const floor = normCount(facts.downloadsFloor);
  const blank = (m) => ' '.repeat(m.length);
  return s
    .replace(/\b(?:trusted by|join)\s+(\d[\d,]*\+?)\s+believers\b/gi, (m, n) => (normCount(n) === floor ? blank(m) : m))
    // Built HTML (SocialProof.tsx renders <dt> label, then <dd> value) reads label first: "Early users feel closer to Allah 92%".
    .replace(/\bBelievers using QuranWall\s+(\d[\d,]*\+?)(?![\w%,.+])/gi, (m, n) => (normCount(n) === floor ? blank(m) : m))
    .replace(/\bEarly users feel closer to Allah\s+92%(?!\w)/gi, blank)
    .replace(/(?<![\w.,])(\d[\d,]*\+?)\s+Believers using QuranWall\b/gi, (m, n) => (normCount(n) === floor ? blank(m) : m))
    .replace(/(?<![\w.,])92%\s+Early users feel closer to Allah\b/gi, blank);
}
/** The two kept stats with a drifted value after the label (built-HTML order): "Believers using QuranWall 2,000+", "Early users feel closer to Allah 93%". */
const STAT_LABEL_FIRST_DRIFT = /\b(?:Believers using QuranWall|Early users feel closer to Allah)\s+\d[\d,.]*\s?(?:\+|%)?/i;

const DL_NUM = String.raw`\d[\d,.]*(?:[km]\b)?\+?`;
// Installs are counted like downloads, but never allowed (even the floor: the floor is a download count).
// "Step 2 installs the widget" is a verb, not a count.
const NOT_ORDINAL = String.raw`(?<!\b(?:step|tap|option|method|part|stage|page|no\.?|number|#)\s)`;
const DL_RE_TIMES = new RegExp(String.raw`\b(downloaded|installed)\s+(${QUAL})(${DL_NUM}|${WCOUNT})\s+times\b`, 'gi');
const DL_RE_COUNT = new RegExp(String.raw`(?<![\w.,])${NOT_ORDINAL}(${QUAL})(${DL_NUM}|${WCOUNT})\s+(?:\w+\s+)?(downloads|installs|installations)\b`, 'gi'); // 2026-11-17: "installations" counts like "installs"

/**
 * Download counts in one sentence that are not the allowed phrasings. Allowed: "Downloaded <floor> times" and
 * "<floor> downloads" with exactly facts.downloadsFloor (commas ignored, "+" must match, no "over"/"nearly"
 * qualifier). A count in words ("a thousand") never matches the floor. Returns match-like arrays with .index.
 */
function downloadHits(s) {
  const floor = normCount(facts.downloadsFloor);
  const out = [];
  for (const re of [DL_RE_TIMES, DL_RE_COUNT]) {
    for (const m of s.matchAll(re)) {
      const [verb, qual, tok] = re === DL_RE_TIMES ? [m[1], m[2], m[3]] : [m[3], m[1], m[2]];
      const isDigits = /^\d[\d,.]*\+?$/.test(tok);
      if (!/^install/i.test(verb) && !qual && isDigits && normCount(tok) === floor) continue;
      out.push(Object.assign([m[0]], { index: m.index }));
    }
  }
  return out;
}

/** Start of the clause that holds position `idx` in sentence `s`: after the last ':' ';' ', but' ', yet' ', while' ', although' before it. */
const CLAUSE_BREAK = /[:;]|,\s*(?:but|yet|while|although)\b|\s(?:but|although)\b/gi;
function clauseStart(s, idx) {
  let start = 0;
  for (const b of s.slice(0, idx).matchAll(CLAUSE_BREAK)) start = b.index + b[0].length;
  return start;
}

/**
 * Lint one piece of text. Pushes { id, s } into `out`.
 * NEG/DENY (a sentence that states the ban) is applied per clause for site content: only the clause that holds the
 * matched phrase counts, from its start up to the end of the match (clauses end at ':' and ';' and at ', but',
 * ', yet', ', while', ', although'). So "Never miss a verse: set up in 60 seconds." and "We never claim this, but
 * QuranWall has audio recitation." still fail. Prompt and skill files pass { wholeSentenceNeg: true }: their rule
 * text legitimately says "never write X" anywhere in the sentence.
 */
function lintText(text, out, opts = {}) {
  const aboutOtherApp = OTHER_APP_ITEM.test(text) && !/Quran ?Wall/i.test(text);
  for (const s of text.split(/(?<=[.!?])["']?\s+/)) {
    for (const [id, re, , allow] of rules) {
      if (aboutOtherApp && BARE_RULES.has(id)) continue;
      if (PRICING_RULES.has(id) && PRICING_EXEMPT.test(opts.relPath || '')) continue;
      let found;
      if (id === 'social-proof-downloads') found = downloadHits(s);
      else { const sp = id === 'social-proof' ? allowedProofStripped(s) : s; const m = re.exec(sp) || (id === 'social-proof' ? STAT_LABEL_FIRST_DRIFT.exec(sp) : null); found = m ? [m] : []; }
      for (const m of found) {
        // Scope for negations: the matched clause (site content) or the whole sentence (prompts).
        const scope = opts.wholeSentenceNeg ? s : s.slice(clauseStart(s, m.index), m.index + m[0].length);
        if (allow) {
          if ([].concat(allow).some((a) => (a === DENY ? DENY.test(scope) : a.test(s)))) continue;
        }
        if (!(NEG_BYPASS.has(id) && !opts.wholeSentenceNeg) && NEG.test(scope)) continue;
        if (opts.planText && PLAN_VERBS.test(s)) continue;
        out.push({ id, s: s.replace(/\s+/g, ' ').slice(0, 190) });
        break;
      }
    }
  }
}

/** A stat label that names a head count (users, believers, people, Muslims) is social proof whatever the value. */
const STAT_PEOPLE_LABEL = /\b(?:users?|believers?|muslims?|people)\b/i;
/** A stat label about setup or install time ("Seconds to set up", "Minute setup", "Setup time") fails whatever the value. */
const STAT_SETUP_LABEL = /\b(?:seconds?|secs?|minutes?|mins?|taps?|clicks?|steps?)\b[^.]{0,12}\b(?:set[- ]?up|install\w*|start(?:ed|ing)?|get(?:ting)? (?:started|going)|going|ready|up and running)\b|\b(?:set[- ]?up|install\w*)\s+(?:time|speed|in)\b|\btime to (?:set[- ]?up|install|start|get started|get going|be ready|ready)\b|\b(?:set[- ]?up|install\w*|start(?:ed|ing)?|get(?:ting)? (?:started|going)|going|ready|up and running)\b[^.]{0,12}\b(?:seconds?|secs?|minutes?|mins?|taps?|clicks?|steps?)\b/i;
/** A stat label about downloads: the value must be the downloads floor from facts.json. */
const STAT_DOWNLOADS_LABEL = /\bdownload(?:s|ed)\b/i;
/** A stat label about installs: any value fails (the floor is a download count, not an install count). */
const STAT_INSTALLS_LABEL = /\binstall(?:s|ed|ations?)\b/i;

/** Stat-specific rules on {value|number, suffix, label}; `joined` is the rendered "<n><suffix> <label>". */
function lintStat(label, joined, out) {
  const s = joined.replace(/\s+/g, ' ').slice(0, 190);
  // Karol's 2026-11-17 decision: these two stats stay. "Believers using QuranWall" only with the downloads floor as its value;
  // "Early users feel closer to Allah" only as 92% (real waitlist responses). Any other value or label is social proof.
  const shownValue = joined.slice(0, Math.max(0, joined.length - label.length)).trim();
  const keptStat = (/^Believers using QuranWall$/i.test(label) && normCount(shownValue) === normCount(facts.downloadsFloor))
    || (/^Early users feel closer to Allah$/i.test(label) && normCount(shownValue) === '92%');
  if (STAT_PEOPLE_LABEL.test(label) && !keptStat) out.push({ id: 'social-proof', s });
  if (STAT_SETUP_LABEL.test(label)) out.push({ id: 'setup-time', s });
  if (STAT_INSTALLS_LABEL.test(label)) out.push({ id: 'social-proof-downloads', s });
  if (STAT_DOWNLOADS_LABEL.test(label)) {
    const shown = joined.slice(0, Math.max(0, joined.length - label.length)).trim(); // "<value><suffix>"
    if (normCount(shown) !== normCount(facts.downloadsFloor)) out.push({ id: 'social-proof-downloads', s });
  }
}

/** Stat objects written on one source line ("{ value: 1000, label: '...', suffix: '+' }") as { label, joined }. */
function statsInSourceLine(ln) {
  const res = [];
  for (const m of ln.matchAll(/\{[^{}]*\}/g)) {
    const obj = m[0];
    const label = /\blabel\s*:\s*(['"`])((?:(?!\1).)*)\1/.exec(obj);
    const val = /\b(?:value|number)\s*:\s*(?:(['"`])((?:(?!\1).)*)\1|(-?\d+(?:[.,]\d+)*))/.exec(obj);
    if (!label || !val) continue;
    const suf = /\bsuffix\s*:\s*(['"`])((?:(?!\1).)*)\1/.exec(obj);
    res.push({ label: label[2], joined: `${val[2] ?? val[3]}${suf ? suf[2] : ''} ${label[2]}` });
  }
  return res;
}

/** "60s Seconds to set up ..." for {value|number: 60, suffix: 's', label: '...'} (post stat blocks and TSX-like data). */
function statText(node) {
  const n = node.number ?? node.value;
  if (typeof node.label !== 'string' || !(typeof n === 'number' || typeof n === 'string')) return null;
  const suffix = typeof node.suffix === 'string' ? node.suffix : '';
  return `${n}${suffix} ${node.label}`;
}

/** Walk a parsed JSON value, linting every prose string. */
function walkJson(node, loc, file, out) {
  if (typeof node === 'string') {
    const found = [];
    lintText(node, found, { ...negOpts(file), relPath: rel(file) });
    for (const h of found) out.push({ ...h, loc });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((n, i) => walkJson(n, `${loc}[${i}]`, file, out));
    return;
  }
  if (node && typeof node === 'object') {
    // seo-priorities.json: only pending items are future copy; done/closed items are history.
    if (file.endsWith('seo-priorities.json') && 'status' in node && node.status !== 'pending') return;
    // A stat is split over fields ({number|value, suffix, label}); lint the rendered text too, and the label
    // alone is linted by the loop below.
    const stat = statText(node);
    if (stat) {
      const found = [];
      lintText(stat, found, { ...negOpts(file), relPath: rel(file) });
      lintStat(node.label, stat, found);
      for (const h of found.filter((x, i) => found.findIndex((y) => y.id === x.id && y.s === x.s) === i)) out.push({ ...h, loc: `${loc} (stat)` });
    }
    for (const k of Object.keys(node)) {
      if (k.startsWith('_')) continue;
      if (SKIPKEYS.has(k)) continue;
      walkJson(node[k], `${loc}.${k}`, file, out);
    }
  }
}

/** Lint a whole file. Returns hits { id, loc, s, lines: number[] | null } (lines: 1-based candidate lines). */
function lintFile(abs) {
  const txt = readFileSync(abs, 'utf8');
  const hits = [];
  if (abs.endsWith('.json') || abs.endsWith('.webmanifest')) {
    let data;
    try { data = JSON.parse(txt); } catch (e) {
      return [{ id: 'json-parse', loc: '', s: `JSON does not parse: ${e.message}`, lines: null }];
    }
    const found = [];
    walkJson(data, '', abs, found);
    for (const h of found) hits.push({ ...h, lines: jsonLines(txt, h.s) });
  } else {
    txt.split('\n').forEach((ln, i) => {
      for (const h of lintSourceLine(ln, abs)) hits.push({ ...h, loc: `L${i + 1}`, lines: [i + 1] });
    });
  }
  return hits;
}

/** Lint one line of a source file (tsx, md, txt, html). Returns de-duplicated { id, s } hits. */
function lintSourceLine(ln, abs) {
  const found = [];
  const no = { ...negOpts(abs), relPath: rel(abs) };
  lintText(ln, found, no);
  // JSX splits a phrase over tags ("Join <span ...>1,000+</span> believers"): lint the tag-stripped line for social proof
  // and download counts.
  if (ln.includes('<')) {
    const stripped = ln.replace(/<\/?[A-Za-z][^<>]*>/g, ' ').replace(/\s+/g, ' ');
    const extra = [];
    lintText(stripped, extra, no);
    const sp = extra.filter((h) => SPLIT_TAG_RULES.has(h.id));
    if (sp.length) {
      for (let k = found.length - 1; k >= 0; k--) if (SPLIT_TAG_RULES.has(found[k].id)) found.splice(k, 1);
      found.push(...sp);
    }
  }
  // A stat object on one line is linted as the text it renders.
  for (const st of statsInSourceLine(ln)) {
    lintText(st.joined, found, no);
    lintStat(st.label, st.joined, found);
  }
  return found.filter((x, k) => found.findIndex((y) => y.id === x.id && y.s === x.s) === k);
}
const SPLIT_TAG_RULES = new Set(['social-proof', 'social-proof-downloads']);

/** Candidate 1-based line numbers where a JSON string value containing `sentence` sits in the raw file. */
function jsonLines(raw, sentence) {
  const needles = [JSON.stringify(sentence).slice(1, -1)];
  // The hit text was whitespace-collapsed and truncated; also try a prefix without risky characters.
  const safe = sentence.slice(0, 60).replace(/[^\x20-\x7e]/g, '\0').split('\0')[0].trim();
  if (safe.length >= 12) needles.push(JSON.stringify(safe).slice(1, -1));
  const lines = new Set();
  for (const n of needles) {
    let from = 0;
    for (;;) {
      const at = raw.indexOf(n, from);
      if (at < 0) break;
      lines.add(raw.slice(0, at).split('\n').length);
      from = at + n.length;
    }
    if (lines.size) break;
  }
  return lines.size ? [...lines] : null; // null: could not locate, treat as overlapping
}

// ---------------------------------------------------------------- file sets

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const LINTABLE = /\.(tsx?|json|html|md|txt|webmanifest)$/; // 2026-11-17: public/manifest.webmanifest has a description shown at install
const rel = (abs) => relative(ROOT, abs).split(sep).join('/');

// Code, not copy: regex replacement strings such as '$1\\$2$3' read as a price (pricing-mention). 2026-11-20: a false positive that failed --all.
const LINT_SKIP = new Set(['src/lib/postIcons.ts']);
function isLintable(relPath) {
  if (!LINTABLE.test(relPath)) return false;
  if (LINT_SKIP.has(relPath)) return false;
  if (relPath.startsWith('src/') || relPath.startsWith('.claude/skills/')) return true;
  if (relPath === 'index.html') return true;
  return /^public\/[^/]+\.(txt|md|webmanifest)$/.test(relPath);
}

function allFiles() {
  return [
    ...walk(join(ROOT, 'src')),
    join(ROOT, 'index.html'),
    ...walk(join(ROOT, 'public')).filter((f) => /^public\/[^/]+\.(txt|md|webmanifest)$/.test(rel(f))),
    ...walk(join(ROOT, '.claude/skills')),
  ].filter((f) => existsSync(f) && isLintable(rel(f)));
}

// ---------------------------------------------------------------- diff mode

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

/** Parse `git diff -U0` output into Map<relPath, Array<[start, end]>> of added line ranges. */
function parseAdded(diffText, into) {
  let file = null;
  for (const ln of diffText.split('\n')) {
    if (ln.startsWith('+++ ')) {
      file = ln === '+++ /dev/null' ? null : ln.replace(/^\+\+\+ b\//, '');
    } else if (file && ln.startsWith('@@')) {
      const m = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(ln);
      if (!m) continue;
      const start = Number(m[1]);
      const count = m[2] === undefined ? 1 : Number(m[2]);
      if (count === 0) continue;
      if (!into.has(file)) into.set(file, []);
      into.get(file).push([start, start + count - 1]);
    }
  }
}

function addedRanges(base, worktree) {
  const map = new Map();
  parseAdded(git(['diff', `${base}...HEAD`, '-U0', '--no-color', '--no-ext-diff']), map);
  if (worktree) {
    parseAdded(git(['diff', 'HEAD', '-U0', '--no-color', '--no-ext-diff']), map);
    for (const f of git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean)) {
      if (!isLintable(f)) continue;
      const n = readFileSync(join(ROOT, f), 'utf8').split('\n').length;
      if (!map.has(f)) map.set(f, []);
      map.get(f).push([1, n]);
    }
  }
  return map;
}

// ---------------------------------------------------------------- email consistency

/**
 * Every email address in the site must be facts.contactEmail. Third-party addresses are allowed by DOMAIN only
 * (never by full address, so a typo of our own address cannot hide here):
 *   inforegulator.org.za  the South African Information Regulator, named in the legal pages (POPIA/PAIA).
 */
const EMAIL_DOMAIN_ALLOW = ['inforegulator.org.za'];
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const FILE_TLD = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|json|tsx?|woff2?|map)$/i;

function checkEmailText(txt, where) {
  const own = String(facts.contactEmail || '').toLowerCase();
  if (!own) { fail('email-consistency', where, 'facts.json has no contactEmail'); return; }
  for (const m of txt.matchAll(EMAIL_RE)) {
    const e = m[0].toLowerCase();
    if (FILE_TLD.test(e)) continue; // icon@2x.png and the like
    if (e === own) continue;
    const domain = e.slice(e.indexOf('@') + 1);
    if (EMAIL_DOMAIN_ALLOW.some((d) => domain === d || domain.endsWith('.' + d))) continue;
    const line = txt.slice(0, m.index).split('\n').length;
    fail('email-consistency', `${where} L${line}`, `${m[0]} is not facts.contactEmail (${facts.contactEmail})`);
  }
}

let sourceEmailsChecked = false;
function checkSourceEmails() {
  if (sourceEmailsChecked) return;
  sourceEmailsChecked = true;
  const files = [
    join(ROOT, 'index.html'),
    join(ROOT, 'public/llms.txt'),
    ...walk(join(ROOT, 'src')).filter((f) => /\.tsx?$/.test(f) || (/\.json$/.test(f) && rel(f).startsWith('src/data/'))),
  ];
  for (const abs of files) {
    if (existsSync(abs)) checkEmailText(readFileSync(abs, 'utf8'), rel(abs));
  }
}

// ---------------------------------------------------------------- reporting

const results = []; // { level: 'FAIL' | 'WARN', rule, where, msg }
const fail = (rule, where, msg) => results.push({ level: 'FAIL', rule, where, msg });
const warn = (rule, where, msg) => results.push({ level: 'WARN', rule, where, msg });

/** Legal pages (Karol's own text): the two 2026-11-17 wallpaper rules WARN there instead of FAIL, so a wrong sentence stays visible. */
const LEGAL_PAGES = /^(?:src\/pages\/(?:TermsOfUse|EULA|PrivacyPolicy)\.tsx|dist\/(?:terms-of-use|eula|privacy-policy)(?:\/index)?\.html)(?:\s|$)/;
const WARN_IN_LEGAL = new Set(['arabic-beside-translation', 'wallpaper-automatic']);
function emit(h, where) {
  if (WARN_RULES.has(h.id) || (WARN_IN_LEGAL.has(h.id) && LEGAL_PAGES.test(where))) { warn(h.id, where, h.s); return; }
  fail(h.id, where, h.s);
}

function report() {
  const byRule = new Map();
  for (const r of results) {
    const k = `${r.level} ${r.rule}`;
    if (!byRule.has(k)) byRule.set(k, []);
    byRule.get(k).push(r);
  }
  for (const [k, list] of [...byRule].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`\n## ${k} (${list.length})`);
    for (const r of list) console.log(`${r.where}${r.where ? '  ' : ''}${r.msg}`);
  }
  const nFail = results.filter((r) => r.level === 'FAIL').length;
  const nWarn = results.length - nFail;
  console.log(`\nlint-facts: ${nFail} FAIL, ${nWarn} WARN`);
  process.exit(nFail > 0 ? 1 : 0);
}

// ---------------------------------------------------------------- text modes

let textFilesChecked = 0;

function runText(files, rangesByFile) {
  for (const abs of files) {
    const r = rel(abs);
    const ranges = rangesByFile ? rangesByFile.get(r) : null;
    if (rangesByFile && !ranges) continue; // not changed
    if (!existsSync(abs)) continue; // deleted in the worktree
    textFilesChecked += 1;
    for (const h of lintFile(abs)) {
      if (ranges) {
        const inAdded = h.lines === null || h.lines.some((l) => ranges.some(([a, b]) => l >= a && l <= b));
        if (!inAdded) continue;
      }
      // JSON hits also name the candidate source line(s), so a hit can be found as file:line
      emit(h, `${r} ${h.loc}${h.lines && !h.loc.startsWith('L') ? ` (L${h.lines.join(',')})` : ''}`);
    }
  }
}

/**
 * Prompt and skill files name the banned phrases on purpose. Same text rules as the content, with two
 * exemptions that mirror how the files are written: (1) a sentence that states the ban (NEG) is skipped,
 * as in content; (2) a list item under a heading or label that itself states a ban ("Not confirmed ...",
 * "Never ...", "Banned ...") is skipped, so a bulleted never-claim list needs no per-line "never".
 */
const BAN_HEADING = /\b(?:never|not confirmed|unconfirmed|banned|forbidden|do not|don'?t|must not|not allowed|ruled out)\b/i;

/** Lint the lines of a prompt or skill file: { id, s, line } hits. */
function lintPromptLines(lines) {
  const hits = [];
  let banSection = false;
  lines.forEach((ln, i) => {
    const isHeading = /^\s*#{1,6}\s/.test(ln);
    const isLabel = /^\s*(?:\*\*[^*]+\*\*|[A-Z][A-Z0-9 /&-]{3,}|[A-Z][^.]{0,60}):\s*$/.test(ln);
    const isItem = /^\s*(?:[-*]|\d+[.)])\s/.test(ln);
    if (isHeading || isLabel) banSection = BAN_HEADING.test(ln);
    else if (!isItem && ln.trim() === '') banSection = false;
    if (banSection && isItem) return;
    const found = [];
    lintText(ln, found, { wholeSentenceNeg: true });
    for (const h of found) hits.push({ ...h, line: i + 1 });
  });
  return hits;
}

function runPrompts(files) {
  let n = 0;
  for (const f of files) {
    const abs = resolve(f);
    const label = abs.startsWith(homedir()) ? '~' + abs.slice(homedir().length) : f;
    if (!existsSync(abs)) { fail('prompt-missing', label, 'file not found'); continue; }
    n += 1;
    for (const h of lintPromptLines(readFileSync(abs, 'utf8').split('\n'))) emit(h, `${label} L${h.line}`);
  }
  console.log(`prompts: ${n} file(s) linted`);
}

// ---------------------------------------------------------------- dist mode

function* walkJsonLdNodes(v) {
  if (Array.isArray(v)) { for (const x of v) yield* walkJsonLdNodes(x); return; }
  if (v && typeof v === 'object') {
    yield v;
    for (const k of Object.keys(v)) yield* walkJsonLdNodes(v[k]);
  }
}

const typesOf = (n) => [].concat(n['@type'] || []);

/** Check one App Store link to our app. `where` is the label used in messages. */
function checkAppLink(href, where, expectCt) {
  if (!href.includes(`/id${APP_ID}`)) return false;
  if (href.includes('apps.apple.com/account/')) return false; // Apple's own subscriptions page
  let u;
  try { u = new URL(href, 'https://quranwall.com'); } catch { fail('dist-link', where, `unparseable App Store link: ${href}`); return true; }
  if (u.searchParams.get('pt') !== PT) fail('dist-link-pt', where, `pt != ${PT}: ${href}`);
  const ct = u.searchParams.get('ct');
  if (!ct) fail('dist-link-ct', where, `no ct: ${href}`);
  else if (!CAMPAIGN_TOKENS.includes(ct)) fail('dist-link-ct', where, `ct "${ct}" is not in CAMPAIGNS (src/lib/app-store.ts): ${href}`);
  else if (expectCt && ct !== expectCt) fail('dist-link-ct', where, `ct "${ct}" should be "${expectCt}": ${href}`);
  return true;
}

/** public/llms.txt must agree with facts.json: minimum iOS, no price, own campaign token. */
function checkMachineFiles() {
  const files = [['public/llms.txt', CAMPAIGNS.llms]];
  const minNum = parseFloat(facts.minIOS);
  for (const [r, expectCt] of files) {
    const abs = join(ROOT, r);
    if (!existsSync(abs)) { fail('dist-machine-file', r, 'missing'); continue; }
    const txt = readFileSync(abs, 'utf8');
    if (!txt.includes(facts.minIOSText)) fail('dist-machine-file', r, `does not say "${facts.minIOSText}"`);
    if (facts.wallpaperMinIOSText && !txt.includes(facts.wallpaperMinIOSText)) fail('dist-machine-file', r, `does not say "${facts.wallpaperMinIOSText}" (the wallpaper and Lock Screen widgets need it)`);
    for (const m of txt.matchAll(/\biOS\s?(\d+(?:\.\d+)?)/g)) {
      if (parseFloat(m[1]) !== minNum && parseFloat(m[1]) !== parseFloat(facts.wallpaperMinIOS)) fail('dist-machine-file', r, `names iOS ${m[1]}, facts.json minIOS is ${facts.minIOS} and wallpaperMinIOS is ${facts.wallpaperMinIOS}`);
    }
    txt.split('\n').forEach((ln, i) => {
      if (/[$€£]\s?\d|\b\d+(?:[.,]\d+)?\s?(?:USD|EUR|GBP)\b|\b\d+[- ]days?\s+(?:free\s+)?trial\b|\bfree trial\b|\bper (?:week|month|year)\b|\/(?:wk|week|mo|month|yr|year)\b/i.test(ln)) {
        fail('dist-machine-file', `${r} L${i + 1}`, `states a price or trial length: ${ln.trim().slice(0, 120)}`);
      }
      for (const m of ln.matchAll(/https:\/\/apps\.apple\.com\/[^\s)<>"']+/g)) checkAppLink(m[0], `${r} L${i + 1}`, expectCt);
    });
  }
}

/** Built HTML to lines of visible text. Tags become a space (so adjacent stat elements concatenate); closing
 *  block tags end a line so unrelated paragraphs do not run into one sentence. */
function htmlToText(html) {
  return html
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(?:title|p|li|h[1-6]|section|article|header|footer|nav|tr|ul|ol|blockquote|details|summary|figcaption)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&(?:#x27|#39|apos);/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n');
}

function runDist(distArg) {
  const DIST = resolve(distArg || join(ROOT, 'dist'));
  const dl = (abs) => 'dist/' + relative(DIST, abs).split(sep).join('/');
  if (!existsSync(DIST)) { fail('dist-missing', distArg || 'dist/', 'directory does not exist: run `npm run build` first'); return; }

  const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));
  const apps = []; // { file, node }
  const bannerMissing = [];
  const bannerWrongCt = [];
  let linkCount = 0;

  for (const abs of htmlFiles) {
    const r = dl(abs);
    const buf = readFileSync(abs);
    // NUL bytes: React 18.3.1 writeStringChunk bug, stripped in prerender.mjs.
    if (buf.includes(0)) fail('dist-nul', r, 'contains NUL bytes');
    const html = buf.toString('utf8');

    // Visible text: the same prose rules as the sources, on tag-stripped text (a stat reads "60s Seconds to ...")
    // and the email check on the raw HTML (mailto: links, JSON-LD).
    const found = [];
    for (const line of htmlToText(html).split('\n')) lintText(line, found, { relPath: r });
    for (const h of found) emit(h, r);
    checkEmailText(html, r);

    // App Store links (anchors only; structured data keeps the plain listing URL on purpose)
    for (const m of html.matchAll(/<a\b[^>]*?\bhref=(?:"([^"]*)"|'([^']*)')/gi)) {
      const href = (m[1] ?? m[2]).replace(/&amp;/g, '&');
      if (checkAppLink(href, r, null)) linkCount += 1;
    }

    // Smart App Banner carries its own campaign token (WARN for now: added in parallel)
    const bm = /<meta\b[^>]*\bname="apple-itunes-app"[^>]*>/i.exec(html);
    if (!bm) bannerMissing.push(r);
    else {
      const content = (/\bcontent="([^"]*)"/i.exec(bm[0])?.[1] ?? '').replace(/&amp;/g, '&');
      const ct = /\bct=([^&,\s]+)/.exec(content)?.[1];
      const pt = /\bpt=([^&,\s]+)/.exec(content)?.[1];
      if (!content.includes(`app-id=${APP_ID}`)) fail('dist-banner', r, `apple-itunes-app does not carry app-id=${APP_ID}: ${content}`);
      if (ct && !CAMPAIGN_TOKENS.includes(ct)) fail('dist-link-ct', r, `apple-itunes-app ct "${ct}" is not in CAMPAIGNS`);
      if (pt && pt !== PT) fail('dist-link-pt', r, `apple-itunes-app pt != ${PT}`);
      if (ct !== CAMPAIGNS.smartBanner || pt !== PT) bannerWrongCt.push(r);
    }

    // JSON-LD
    let websites = 0;
    for (const m of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
      let data;
      try { data = JSON.parse(m[1]); } catch (e) { fail('dist-jsonld', r, `JSON-LD does not parse: ${e.message}`); continue; }
      for (const node of walkJsonLdNodes(data)) {
        const types = typesOf(node);
        if (types.includes('MobileApplication')) apps.push({ file: r, node });
        else if (types.includes('SoftwareApplication')) fail('dist-app-node', r, 'SoftwareApplication node: use the single MobileApplication node on the home page');
        if (types.includes('WebSite')) websites += 1;
        if ('aggregateRating' in node && !facts.rating?.show) {
          fail('dist-aggregate-rating', r, 'aggregateRating in JSON-LD while facts.rating.show is false');
        }
      }
    }
    if (websites !== 1) fail('dist-website', r, `expected exactly one WebSite node, found ${websites}`);
  }

  if (bannerMissing.length) {
    warn('dist-smart-banner', 'dist/', `${bannerMissing.length} page(s) have no apple-itunes-app meta (expected ct=${CAMPAIGNS.smartBanner}): ${bannerMissing.slice(0, 3).join(', ')}${bannerMissing.length > 3 ? ', ...' : ''}`);
  }
  if (bannerWrongCt.length) {
    warn('dist-smart-banner', 'dist/', `${bannerWrongCt.length} page(s) have an apple-itunes-app meta without pt=${PT} and ct=${CAMPAIGNS.smartBanner}: ${bannerWrongCt.slice(0, 3).join(', ')}${bannerWrongCt.length > 3 ? ', ...' : ''}`);
  }

  // One MobileApplication node site-wide, on the home page only.
  if (apps.length !== 1) fail('dist-app-node', 'dist/', `expected exactly one MobileApplication node site-wide, found ${apps.length}${apps.length ? ` (${apps.map((a) => a.file).join(', ')})` : ''}`);
  for (const a of apps) {
    if (a.file !== 'dist/index.html') fail('dist-app-node', a.file, 'MobileApplication node must be on the home page only');
    if (a.node.operatingSystem !== facts.minIOSText) fail('dist-app-node', a.file, `operatingSystem "${a.node.operatingSystem}" != "${facts.minIOSText}"`);
    if (a.node.downloadUrl !== facts.storeUrl) fail('dist-app-node', a.file, `downloadUrl "${a.node.downloadUrl}" != "${facts.storeUrl}"`);
  }

  // 404.html is noindex
  const nf = join(DIST, '404.html');
  if (!existsSync(nf)) fail('dist-404', 'dist/404.html', 'missing');
  else {
    const html = readFileSync(nf, 'utf8');
    const robots = [...html.matchAll(/<meta\b[^>]*\bname="robots"[^>]*>/gi)].map((m) => m[0]);
    if (robots.length !== 1) fail('dist-404', 'dist/404.html', `expected exactly one robots meta, found ${robots.length}`);
    else if (!/noindex/i.test(robots[0])) fail('dist-404', 'dist/404.html', `robots meta is not noindex: ${robots[0]}`);
  }

  // Every sitemap <loc> maps to a built file
  const distSitemap = join(DIST, 'sitemap.xml');
  let sitemapCount = 0;
  if (!existsSync(distSitemap)) fail('dist-sitemap', 'dist/sitemap.xml', 'missing');
  else {
    const xml = readFileSync(distSitemap, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      sitemapCount += 1;
      const u = new URL(m[1].trim());
      const p = u.pathname.replace(/\/$/, '') || '/';
      const file = p === '/' ? join(DIST, 'index.html') : join(DIST, p.slice(1), 'index.html');
      if (!existsSync(file)) fail('dist-sitemap', m[1], `no built file (${dl(file)})`);
    }
  }

  checkMachineFiles();
  checkSourceEmails();

  console.log(`dist: ${htmlFiles.length} html files, ${linkCount} App Store links, ${apps.length} MobileApplication node(s), ${sitemapCount} sitemap URLs, campaigns ${CAMPAIGN_TOKENS.length}`);
}

// ---------------------------------------------------------------- self-test

/**
 * --self-test: a table of probes run through the same code paths as the real modes. kind 'site' = a prose string in site
 * content (walkJson: per-clause NEG), 'stat' = a stat object (walkJson + lintStat), 'tsx' = one source line
 * (lintSourceLine: JSX tag stripping and stat objects written inline), 'prompt' = lines of a prompt/skill file
 * (lintPromptLines: whole-sentence NEG). expect FAIL = at least one non-WARN hit (and one with id "rule" when given), WARN = only WARN-level hits (id "rule"), PASS = no hit.
 */
const SELF_TEST = [
  // must FAIL: items 1-6 of the peer review
  ['FAIL', 'site', 'Set it up in under a minute.', 'setup-time'],
  ['FAIL', 'site', 'Set it up in 60 seconds.', 'setup-60s'],
  ['FAIL', 'site', 'Get it set up in under a minute.', 'setup-time'],
  ['FAIL', 'site', 'Over a thousand downloads.', 'social-proof-downloads'],
  ['FAIL', 'site', 'Join over a thousand believers.', 'social-proof'],
  ['FAIL', 'site', 'Trusted by over a thousand Muslims.', 'social-proof'],
  ['FAIL', 'site', 'A million users worldwide.', 'social-proof'],
  ['FAIL', 'site', 'Hundreds of people already use it.', 'social-proof'],
  ['FAIL', 'site', '5,000+ downloads', 'social-proof-downloads'],
  ['FAIL', 'site', '1,000 downloads', 'social-proof-downloads'],
  ['FAIL', 'site', 'Downloaded 5,000+ times', 'social-proof-downloads'],
  ['FAIL', 'site', 'Downloaded 1,000 times', 'social-proof-downloads'],
  ['FAIL', 'site', 'Downloaded over 1,000+ times', 'social-proof-downloads'],
  ['FAIL', 'site', 'Get QuranWall+ Premium', 'premium-plan-word'],
  ['FAIL', 'site', 'Premium Plan', 'premium-plan-word'],
  ['FAIL', 'site', 'Premium Subscription', 'premium-plan-word'],
  ['FAIL', 'site', 'Premium Tier', 'premium-plan-word'],
  ['FAIL', 'stat', { value: 5, label: 'Minutes to get started' }, 'setup-time'],
  ['FAIL', 'stat', { value: 2, label: 'Minutes to be ready' }, 'setup-time'],
  ['FAIL', 'stat', { value: 5, label: 'Minutes up and running' }, 'setup-time'],
  ['FAIL', 'stat', { value: 5000, suffix: '+', label: 'Downloads' }, 'social-proof-downloads'],
  ['FAIL', 'stat', { value: 1000, label: 'Downloads' }, 'social-proof-downloads'],
  ['FAIL', 'stat', { value: 1000, suffix: '+', label: 'Downloaded by Muslims' }, 'social-proof'],
  ['FAIL', 'stat', { value: 12, label: 'App downloaded' }, 'social-proof-downloads'],
  ['FAIL', 'tsx', "{ value: 5, label: 'Minutes to get started' }", 'setup-time'],
  ['FAIL', 'tsx', "{ value: 2000, suffix: '+', label: 'Downloads' }", 'social-proof-downloads'],
  ['FAIL', 'tsx', 'Over <b>5,000</b> downloads', 'social-proof-downloads'],
  ['FAIL', 'site', 'We never claim this, but QuranWall has no audio recitation.', 'audio-denied'],
  ['FAIL', 'site', 'We do not claim this, yet QuranWall has a full-surah audio player.', 'invented-audio'],
  ['FAIL', 'site', 'Other apps lack it, while QuranWall has tafsir.', 'invented-tafsir'],
  // must FAIL: earlier probes
  ['FAIL', 'site', 'Thousands of believers use QuranWall.', 'social-proof'],
  ['FAIL', 'site', 'Trusted by 10,000+ users.', 'social-proof'],
  ['FAIL', 'site', 'Join 50,000 believers.', 'social-proof'],
  ['FAIL', 'stat', { number: '10,000+', label: 'Active users' }, 'social-proof'],
  ['FAIL', 'site', 'QuranWall: 60s setup.', 'setup-time'],
  ['FAIL', 'site', 'ready in under 2 minutes', 'setup-time'],
  ['FAIL', 'site', 'Setup takes a minute.', 'setup-time'],
  ['FAIL', 'site', 'Get started in 30 seconds.', 'setup-time'],
  ['FAIL', 'site', 'It sets up in under a minute.', 'setup-time'],
  ['FAIL', 'site', 'Never miss a verse: set up in 60 seconds.', 'setup-60s'],
  ['FAIL', 'site', 'Premium needs a subscription.', 'premium-plan-word'],
  ['FAIL', 'site', 'Upgrade to Premium.', 'premium-plan-word'],
  ['FAIL', 'site', 'Go Premium for more fonts.', 'premium-plan-word'],
  ['FAIL', 'site', 'Get QuranWall Premium today.', 'premium-plan-word'],
  // must FAIL: peer review round 3 (k/m counts, installs, longer word counts, setup phrasing, plan names)
  ['FAIL', 'site', '10K downloads', 'social-proof-downloads'],
  ['FAIL', 'site', '1k+ downloads', 'social-proof-downloads'],
  ['FAIL', 'site', 'Used by 1k+ believers', 'social-proof'],
  ['FAIL', 'site', 'Join 1K+ users', 'social-proof'],
  ['FAIL', 'site', '2M users', 'social-proof'],
  ['FAIL', 'stat', { value: '1K+', label: 'Installs' }, 'social-proof-downloads'],
  ['FAIL', 'stat', { value: 5000, suffix: '+', label: 'Installs' }, 'social-proof-downloads'],
  ['FAIL', 'stat', { value: 1000, suffix: '+', label: 'Installs' }, 'social-proof-downloads'],
  ['FAIL', 'tsx', "{ value: 5000, suffix: '+', label: 'Installs' }", 'social-proof-downloads'],
  ['FAIL', 'site', '5,000 installs', 'social-proof-downloads'],
  ['FAIL', 'site', 'Over 5,000 installs', 'social-proof-downloads'],
  ['FAIL', 'site', 'Installed 5,000 times', 'social-proof-downloads'],
  ['FAIL', 'site', 'Installed 1,000+ times', 'social-proof-downloads'],
  ['FAIL', 'site', '1,000+ installs', 'social-proof-downloads'],
  ['FAIL', 'site', 'Thousands of installs', 'social-proof-downloads'],
  ['FAIL', 'site', 'Join twenty thousand believers', 'social-proof'],
  ['FAIL', 'site', 'Over two hundred thousand downloads', 'social-proof-downloads'],
  ['FAIL', 'site', 'Hundreds of thousands of users', 'social-proof'],
  ['FAIL', 'site', 'Join twenty-five thousand believers', 'social-proof'],
  ['FAIL', 'site', 'Over two hundred users', 'social-proof'],
  ['FAIL', 'site', 'QuranWall installs in seconds.', 'setup-time'],
  ['FAIL', 'site', 'Done in 2 minutes with QuranWall.', 'setup-time'],
  ['FAIL', 'site', 'Ready in 30 seconds.', 'setup-time'],
  ['FAIL', 'stat', { value: 5, label: 'Seconds to start' }, 'setup-time'],
  ['FAIL', 'stat', { value: 3, label: 'Taps to get going' }, 'setup-time'],
  ['FAIL', 'site', 'Premium Membership', 'premium-plan-word'],
  ['FAIL', 'site', 'Premium Membership', 'premium-name'],
  ['FAIL', 'site', 'Upgrade to QuranWall Pro', 'premium-plan-word'],
  ['FAIL', 'site', 'QuranWall Plus plan', 'premium-plan-word'],
  ['FAIL', 'site', 'QuranWall Premium', 'premium-plan-word'],
  // must PASS
  ['PASS', 'site', 'Install QuranWall, then choose your ayah.'],
  ['PASS', 'site', 'After you install it, open QuranWall.'],
  ['PASS', 'site', 'Your Lock Screen keeps the ayah you chose until you pick another one in QuranWall, which takes a few taps.'],
  ['PASS', 'site', 'Turn on auto-rotate and it shows a new ayah every day, every 8 hours or every hour.'],
  ['PASS', 'site', "Tap Done when you're finished."],
  ['PASS', 'site', 'Pro tip: pin the widget first.'],
  ['PASS', 'site', 'Search all 114 surahs.'],
  ['PASS', 'site', 'Twenty-four hours a day'],
  ['PASS', 'site', 'in 10 languages'],
  ['PASS', 'site', 'Step 2 installs the widget.'],
  // 2026-11-17 (Karol): no subscription, paywall, trial or price wording on the site; legal pages exempt.
  ['FAIL', 'site', 'A subscription is required to use QuranWall.', 'pricing-mention'],
  ['FAIL', 'site', 'Free to download; a subscription unlocks it.', 'pricing-mention'],
  ['FAIL', 'site', 'QuranWall: See price in app.', 'pricing-mention'],
  ['FAIL', 'site', 'Open the App Store and see today\'s terms in the App Store.', 'pricing-mention'],
  ['FAIL', 'site', 'QuranWall is free to download, with an in-app subscription.', 'pricing-mention'],
  ['FAIL', 'site', 'QuranWall is free to download, with an in-app subscription.', 'pricing-mention', 'public/llms.txt'],
  ['FAIL', 'site', 'QuranWall offers an in-app purchase.', 'pricing-mention'],
  ['FAIL', 'site', 'QuranWall has a 3-day free trial.', 'pricing-mention'],
  ['FAIL', 'site', 'The App Store shows the price before you subscribe.', 'pricing-mention'],
  ['FAIL', 'site', 'QuranWall costs $4.99 per month and auto-renews.', 'pricing-mention'],
  ['FAIL', 'site', 'QuranWall is a free app.', 'free-claim'],
  ['FAIL', 'site', 'You can use QuranWall for free.', 'free-claim'],
  ['FAIL', 'site', 'Get all features for free.', 'free-use-bare'],
  ['FAIL', 'site', 'QuranWall is the free way to see an ayah on your Lock Screen, and it is free to download.', 'free-download-prose'],
  ['FAIL', 'site', 'Set it up in two taps. Free to download on the App Store.', 'free-download-prose'],
  ['FAIL', 'site', 'You can download QuranWall for free and pick an ayah.', 'free-download-prose'],
  ['FAIL', 'tsx', '<p>QuranWall is a free download from the App Store.</p>', 'free-download-prose'],
  ['PASS', 'site', 'Free to download.'],
  ['PASS', 'site', 'Download for free'],
  ['PASS', 'site', 'Free download'],
  ['PASS', 'tsx', '<span className="text-sm">Free to download.</span>'],
  ['PASS', 'site', 'Logos sells resource packs by subscription, and Athan is free.'],
  ['PASS', 'site', '**Athan** gives free prayer-time alerts, so it is a solid pick if you do not want to pay.'],
  ['PASS', 'site', 'Your subscription renews automatically unless you cancel it at least 24 hours before the period ends. Free trial terms are shown in the App Store.', null, 'src/pages/TermsOfUse.tsx'],
  ['PASS', 'site', 'The price, billing period and any free trial are shown in the App Store.', null, 'src/pages/EULA.tsx'],
  ['PASS', 'prompt', ['Never mention the subscription, the paywall, a trial or a price on the site.']],
  ['PASS', 'site', 'Downloaded 1,000+ times'],
  ['PASS', 'site', 'Downloaded 1000+ times'],
  ['PASS', 'site', '1,000+ downloads'],
  ['PASS', 'stat', { value: 1000, suffix: '+', label: 'Downloads' }],
  ['PASS', 'stat', { value: '1,000+', label: 'Downloads' }],
  ['PASS', 'tsx', "{ value: 1000, suffix: '+', label: 'Downloads' }"],
  ['PASS', 'site', 'QuranWall has per-ayah audio recitation by Mishary Alafasy, not a full-surah player.'],
  ['PASS', 'site', 'QuranWall has audio recitation per ayah.'],
  ['PASS', 'site', 'Never miss a verse.'],
  ['PASS', 'site', 'a translation in 10 languages'],
  ['PASS', 'site', 'All 114 surahs, searchable'],
  ['PASS', 'stat', { value: 114, suffix: '', label: 'Surahs, all searchable' }],
  ['PASS', 'site', 'Over 1.8 billion Muslims read the Quran.'],
  ['PASS', 'site', '90% of people forget what they read.'],
  ['PASS', 'site', 'Better than a thousand months.'],
  ['PASS', 'site', 'This premium wallpaper look suits a Lock Screen.'],
  ['PASS', 'prompt', ['Never call the subscription "Premium".']],
  ['PASS', 'prompt', ['Never write that QuranWall has no audio recitation.']],

  // ---- 2026-11-17: facts round (wallpaper shows ONE edition and never changes by itself; read-along exists; plan names; counts)
  // arabic-beside-translation: FAIL
  ['FAIL', 'site', 'QuranWall puts an ayah on your Lock Screen, with the Arabic beside a translation.', 'arabic-beside-translation'],
  ['FAIL', 'site', 'An ayah of the Quran on your iPhone Lock Screen wallpaper and Home Screen widget, with the Arabic beside a translation.', 'arabic-beside-translation'],
  ['FAIL', 'site', 'Uthmani Arabic beside a translation in your choice of 10 languages', 'arabic-beside-translation'],
  ['FAIL', 'site', 'Every wallpaper shows the ayah alongside a translation.', 'arabic-beside-translation'],
  ['FAIL', 'site', 'The Arabic sits next to the translation on your wallpaper.', 'arabic-beside-translation'],
  ['FAIL', 'site', 'QuranWall shows Arabic and English side by side.', 'arabic-beside-translation'],
  ['FAIL', 'site', 'Your Lock Screen shows the Arabic with a translation underneath.', 'arabic-beside-translation'],
  ['FAIL', 'site', 'Put Arabic and a translation on your wallpaper.', 'arabic-beside-translation'],
  ['FAIL', 'tsx', '<p>Arabic beside a translation, in 10 languages</p>', 'arabic-beside-translation'],
  // arabic-beside-translation: PASS
  ['PASS', 'site', 'QuranWall shows the ayah in Uthmani Arabic or a translation.'],
  ['PASS', 'site', 'Choose Arabic or one of 10 translations for each wallpaper.'],
  ['PASS', 'site', 'Each wallpaper shows one edition of the ayah, Arabic or a translation.'],
  ['PASS', 'site', "Never write 'Arabic beside a translation' about the wallpaper."],
  ['PASS', 'site', 'QuranWall does not show Arabic beside a translation.'],
  ['PASS', 'site', 'Muslim Pro shows the Arabic beside a translation.'],
  ['PASS', 'site', 'Read the Arabic with a translation to understand the ayah.'],
  ['PASS', 'prompt', ["Never write 'Arabic beside a translation' or 'Arabic and English side by side'."]],
  // wallpaper-automatic: FAIL
  ['FAIL', 'site', 'QuranWall shows a new ayah each day.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'QuranWall puts a new ayah on your lock screen each day.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'An ayah on your Lock Screen, with a new ayah each day.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'It places an ayah on your Lock Screen wallpaper and Home Screen widget, with a new ayah each day.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'Fresh and automatic. A new verse each day.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'The Quran shows up on its own.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'A lock screen that changes automatically.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'The wallpaper updates itself.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'Every morning a new ayah.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'QuranWall changes your wallpaper every morning.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'Nothing to tap, nothing to open: your Lock Screen has the ayah.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'Pick once, then there is nothing to change by hand.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'So there is nothing to change by hand.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'QuranWall updates your Lock Screen in the background.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'Your wallpaper changes every day.', 'wallpaper-automatic'],
  ['FAIL', 'site', 'QuranWall keeps your wallpaper fresh with a new verse every hour.', 'wallpaper-automatic'],
  ['FAIL', 'tsx', '<p>Fresh and automatic. A new verse each day</p>', 'wallpaper-automatic'],
  ['FAIL', 'site', 'Set it and forget it: QuranWall refreshes your Lock Screen ayah.', 'wallpaper-automatic'],
  // wallpaper-automatic: PASS
  ['PASS', 'site', 'The widget can change on its own: turn on auto-rotate and it shows a new ayah every day, every 8 hours or every hour.'],
  ['PASS', 'site', 'Turn on auto-rotate and the widget shows a new ayah every day.'],
  ['PASS', 'site', 'The widget shows a new ayah every day if you turn on auto-rotate.'],
  ['PASS', 'site', 'Auto-rotate is optional: the Home Screen widget can show a fresh verse each day.'],
  ['PASS', 'site', 'No. Your Lock Screen keeps the ayah you chose until you pick another one in QuranWall, which takes a few taps.'],
  ['PASS', 'site', 'The Lock Screen wallpaper keeps the ayah you chose until you pick another; the widget can switch to a new ayah every day, every 8 hours or every hour', null, 'public/llms.txt'],
  ['PASS', 'site', 'Pair QuranWall with an iOS Focus mode so it appears automatically.'],
  ['PASS', 'site', 'Let iOS turn it on automatically when your Focus starts.'],
  ['PASS', 'site', 'Your subscription renews automatically unless you cancel it in your Apple account.', null, 'src/pages/TermsOfUse.tsx'],
  ['PASS', 'site', 'QuranWall renews automatically.'],
  ['PASS', 'site', 'Usage data is collected automatically by Apple.'],
  ['PASS', 'site', 'The wallpaper never changes by itself.'],
  ['PASS', 'site', "QuranWall doesn't change your wallpaper on its own."],
  ['PASS', 'site', 'Does QuranWall change the ayah every day?'],
  ['PASS', 'site', 'Pick an ayah and tap Make It Mine, and QuranWall applies it automatically through Shortcuts.'],
  ['PASS', 'site', 'Read a new ayah every day and let it sink in.'],
  ['PASS', 'site', 'Memorise a new verse each day with a short daily habit.'],
  ['PASS', 'site', 'Muslim Pro sends a new verse every day.'],
  ['PASS', 'prompt', ["Never write 'automatically' or 'every morning a new ayah' about the wallpaper."]],
  ['PASS', 'prompt', ['- never "a new ayah each day" about the Lock Screen wallpaper']],
  // 2026-11-20: read-along recitation is real (app source). Saying so passes; denying it or inflating it fails.
  ['PASS', 'site', 'Tap Listen in Arabic for read-along recitation in QuranWall.'],
  ['PASS', 'site', 'QuranWall has read-along recitation.'],
  ['PASS', 'site', 'Tap Listen in Arabic to hear the ayah in QuranWall.'],
  ['FAIL', 'site', 'QuranWall has no audio.', 'audio-denied'],
  ['FAIL', 'site', 'QuranWall puts an ayah on your Lock Screen without audio.', 'audio-denied'],
  ['FAIL', 'site', 'QuranWall does not have audio recitation.', 'audio-denied'],
  ['FAIL', 'site', 'It has no audio recitation, tafsir or hifz tools.', 'audio-denied'],
  ['PASS', 'prompt', ['Do not say QuranWall has no audio: it has per-ayah recitation.']],
  ['PASS', 'site', 'Quran.com has audio recitation; QuranWall keeps one ayah on your Lock Screen.'],
  ['PASS', 'site', 'Ayat has no audio recitation.'],
  ['FAIL', 'site', 'QuranWall has a full-surah audio player.', 'invented-audio'],
  ['FAIL', 'site', 'QuranWall lets you choose between reciters.', 'invented-audio'],
  ['FAIL', 'site', 'QuranWall plays audio offline.', 'invented-audio'],
  ['PASS', 'site', 'QuranWall plays a read-along recitation of one ayah; the first play needs internet.'],
  // 2026-11-20 privacy: anonymous analytics and RevenueCat are in the app
  ['FAIL', 'site', 'QuranWall has no tracking.', 'privacy-claims'],
  ['FAIL', 'site', 'No data collected, ever.', 'privacy-claims'],
  ['FAIL', 'site', 'We never track you.', 'privacy-claims'],
  ['FAIL', 'site', 'Your verse selections stay on your device.', 'privacy-claims'],
  ['FAIL', 'site', 'Nothing leaves your phone.', 'privacy-claims'],
  ['FAIL', 'site', 'QuranWall works without tracking or analytics.', 'privacy-claims'],
  ['PASS', 'site', 'QuranWall has no ads, no account and no tracking prompt.'],
  ['PASS', 'site', 'QuranWall has no cross-app tracking and no ad SDK.'],
  ['PASS', 'prompt', ['Never write "no tracking" or "no data collected".']],
  ['PASS', 'site', 'Muslim Pro has no tracking prompt.'],
  // 2026-11-20 no account is confirmed
  ['PASS', 'site', 'No account or sign-in needed.'],
  ['PASS', 'site', 'QuranWall works without creating an account.'],
  // iOS 15 install vs iOS 16 wallpaper
  ['FAIL', 'site', 'QuranWall needs iOS 15.0 or later.', 'ios15-wallpaper'],
  ['FAIL', 'site', 'QuranWall works on iPhones running iOS 15.0 or later.', 'ios15-wallpaper'],
  ['FAIL', 'site', 'Your Lock Screen wallpaper works on iOS 15.', 'ios15-wallpaper'],
  ['PASS', 'site', 'QuranWall installs on iOS 15.0 or later; the wallpaper needs iOS 16 or later.'],
  ['PASS', 'site', 'On iOS 15 you get the Home Screen widget and the in-app Quran.'],
  ['PASS', 'site', 'QuranWall lists iOS 15.0 or later in the App Store.'],
  // offline
  ['FAIL', 'site', 'It shows no ads and works offline.', 'offline-unqualified'],
  ['FAIL', 'site', 'QuranWall works fully offline.', 'offline-unqualified'],
  ['PASS', 'site', 'The Quran text works offline.'],
  ['PASS', 'site', 'Browsing, search and the widget work offline.'],
  // confirmed absent
  ['FAIL', 'site', 'QuranWall has a dhikr widget.', 'dhikr-widget'],
  ['FAIL', 'site', 'QuranWall includes a tasbih counter.', 'dhikr-widget'],
  ['PASS', 'site', 'QuranWall is not a tasbih counter.'],
  ['FAIL', 'site', 'Install QuranWall through a Focus-mode install.', 'focus-install-bare'],
  ['FAIL', 'site', 'Themed packs for anxiety, patience, gratitude and mercy.', 'verse-packs-bare'],
  ['FAIL', 'site', 'Pin an ayah to keep it on your Lock Screen.', 'pin-favourites'],
  ['FAIL', 'site', 'QuranWall works on iPad and syncs across devices with iCloud.', 'invented-platform'],
  ['PASS', 'site', 'QuranWall is for iPhone only, with no iPad or Mac app.'],
  ['FAIL', 'site', 'QuranWall has audio recitation by famous reciters.', 'invented-audio'],
  ['FAIL', 'site', 'QuranWall lets you listen to your favourite qari.', 'invented-audio'],
  // plan names
  ['FAIL', 'site', 'Try quranwall pro today.', 'premium-plan-word'],
  ['FAIL', 'site', 'QuranWall PLUS', 'premium-plan-word'],
  ['FAIL', 'site', 'QuranWall PRO unlocks fonts.', 'premium-plan-word'],
  ['FAIL', 'site', 'Go Pro', 'premium-plan-word'],
  ['FAIL', 'site', 'Get Pro for more fonts.', 'premium-plan-word'],
  ['FAIL', 'site', 'Get Plus today.', 'premium-plan-word'],
  ['FAIL', 'site', 'QuranWall Pro Version', 'premium-plan-word'],
  ['FAIL', 'site', 'QuranWall Plus Edition', 'premium-plan-word'],
  ['FAIL', 'site', 'Premium Edition', 'premium-plan-word'],
  ['FAIL', 'site', 'Premium Edition', 'premium-name'],
  ['PASS', 'site', 'Pro tip: pin the widget first.'],
  ['PASS', 'site', 'Pro-Quran apps exist, but this is not one.'],
  ['PASS', 'site', 'QuranWall plus a Shortcut sets your wallpaper.'],
  ['PASS', 'site', 'Get Pro tips for your Lock Screen.'],
  ['PASS', 'site', 'Muslim Pro is a different app.'],
  // counts
  ['FAIL', 'site', '5,000 installations', 'social-proof-downloads'],
  ['FAIL', 'site', 'Over 2,000 installations worldwide', 'social-proof-downloads'],
  ['FAIL', 'site', 'Loved by thousands.', 'social-proof'],
  ['FAIL', 'site', 'Trusted by millions', 'social-proof'],
  ['FAIL', 'site', 'Used by hundreds of thousands!', 'social-proof'],
  ['FAIL', 'site', 'Chosen by millions.', 'social-proof'],
  ['PASS', 'site', 'Downloaded ' + facts.downloadsFloor + ' times'],
  ['PASS', 'site', facts.downloadsFloor + ' downloads'],
  // Karol's 2026-11-17 decision: "Trusted by / Join <floor> believers" and the stat "<floor> Believers using QuranWall" stay,
  // only with exactly the floor (commas ignored, "+" must match). The 92% waitlist stat stays too.
  ['PASS', 'site', 'Trusted by 1,000+ believers'],
  ['PASS', 'site', 'Join 1,000+ believers'],
  ['PASS', 'site', 'Trusted by ' + facts.downloadsFloor + ' believers'],
  ['PASS', 'site', 'Join ' + facts.downloadsFloor + ' believers.'],
  ['PASS', 'site', 'Join ' + String(facts.downloadsFloor).replace(',', '') + ' believers and set your first ayah.'],
  ['PASS', 'tsx', '<p>Trusted by <span className="font-semibold">1,000+</span> believers</p>'],
  ['PASS', 'tsx', '<p>Join <span className="text-gold">1,000+</span> believers</p>'],
  ['PASS', 'tsx', "{ value: 1000, label: 'Believers using QuranWall', suffix: '+' },"],
  ['PASS', 'tsx', "{ value: 92, label: 'Early users feel closer to Allah', suffix: '%' },"],
  ['PASS', 'stat', { value: 1000, suffix: '+', label: 'Believers using QuranWall' }],
  ['PASS', 'stat', { value: facts.downloadsFloor, label: 'Believers using QuranWall' }],
  ['PASS', 'stat', { value: 92, suffix: '%', label: 'Early users feel closer to Allah' }],
  // Built HTML reads label first (<dt> label, <dd> value), and the stats run together.
  ['PASS', 'site', 'Early users feel closer to Allah 92% Believers using QuranWall 1,000+ Surahs, all searchable 114'],
  ['PASS', 'site', 'Believers using QuranWall 1,000+ Surahs, all searchable 114'],
  ['PASS', 'site', 'Believers using QuranWall ' + facts.downloadsFloor],
  ['FAIL', 'site', 'Early users feel closer to Allah 92% Believers using QuranWall 2,000+ Surahs, all searchable 114', 'social-proof'],
  ['FAIL', 'site', 'Early users feel closer to Allah 93% Believers using QuranWall 1,000+ Surahs, all searchable 114', 'social-proof'],
  ['FAIL', 'site', 'Believers using QuranWall 1,000 Surahs, all searchable 114', 'social-proof'],
  ['FAIL', 'site', 'Believers using QuranWall 10,000+', 'social-proof'],
  ['FAIL', 'site', 'Trusted by 2,000+ believers', 'social-proof'],
  ['FAIL', 'site', 'Join 1,000 believers', 'social-proof'],
  ['FAIL', 'site', 'Join 10,000+ believers', 'social-proof'],
  ['FAIL', 'site', 'Trusted by over 1,000+ believers', 'social-proof'],
  ['FAIL', 'site', 'Join over 1,000+ believers', 'social-proof'],
  ['FAIL', 'site', 'Trusted by 1,000+ Muslims', 'social-proof'],
  ['FAIL', 'site', 'Join 1,000+ users', 'social-proof'],
  ['FAIL', 'site', 'Trusted by 1,000+ believers and loved by 5,000+ users', 'social-proof'],
  ['FAIL', 'site', 'Trusted by ' + facts.downloadsFloor.replace('+', '0+') + ' believers', 'social-proof'],
  ['FAIL', 'site', 'Join ' + facts.downloadsFloor.replace('+', '') + ' believers', 'social-proof'],
  ['FAIL', 'tsx', '<p>Trusted by <span className="font-semibold">2,000+</span> believers</p>', 'social-proof'],
  ['FAIL', 'tsx', '<p>Join <span className="text-gold">1,000</span> believers</p>', 'social-proof'],
  ['FAIL', 'tsx', "{ value: 2000, label: 'Believers using QuranWall', suffix: '+' },", 'social-proof'],
  ['FAIL', 'tsx', "{ value: 1000, label: 'Believers using QuranWall' },", 'social-proof'],
  ['FAIL', 'tsx', "{ value: 1000, label: 'Muslims using QuranWall', suffix: '+' },", 'social-proof'],
  ['FAIL', 'stat', { value: 5000, suffix: '+', label: 'Believers using QuranWall' }, 'social-proof'],
  ['FAIL', 'stat', { value: 1000, label: 'Believers using QuranWall' }, 'social-proof'],
  ['FAIL', 'stat', { value: 93, suffix: '%', label: 'Early users feel closer to Allah' }, 'social-proof'],
  ['FAIL', 'stat', { value: 92, suffix: '%', label: 'Users feel closer to Allah' }, 'social-proof'],
  // setup-time: "<time> with QuranWall" needs a setup verb
  ['FAIL', 'site', 'Done in 2 minutes with QuranWall.', 'setup-time'],
  ['FAIL', 'site', 'Ready in 30 seconds with QuranWall.', 'setup-time'],
  ['FAIL', 'site', 'In 2 minutes with QuranWall you are set up.', 'setup-time'],
  ['PASS', 'site', 'Just 5 minutes with QuranWall each morning.'],
  ['PASS', 'site', 'Spend a few minutes with QuranWall and the ayah you chose.'],
  // manifest-style description
  ['FAIL', 'site', 'An ayah of the Quran on your iPhone Lock Screen wallpaper and Home Screen widget, with the Arabic beside a translation.', 'arabic-beside-translation', 'public/manifest.webmanifest'],
  // ---- 2026-11-17 (Karol): closing the free/price holes. Site context, any page except the legal pages.
  ['FAIL', 'site', 'Download it free.', 'free-download-prose'],
  ['FAIL', 'site', 'Download it free on your iPhone.', 'free-download-prose'],
  ['FAIL', 'site', 'Free forever.', 'pricing-mention'],
  ['FAIL', 'site', 'Free forever.', 'free-use-bare'],
  ['FAIL', 'site', 'Free on the App Store.', 'free-download-prose'],
  ['FAIL', 'site', 'Free on the App Store.', 'pricing-mention'],
  ['FAIL', 'site', 'Get the app free of charge.', 'pricing-mention'],
  ['FAIL', 'site', 'It is free of charge.', 'free-use-bare'],
  ['FAIL', 'site', 'Cancel anytime.', 'pricing-mention'],
  ['FAIL', 'site', 'You can cancel at any time.', 'pricing-mention'],
  ['FAIL', 'site', 'Unlock everything with QuranWall+.', 'pricing-mention'],
  ['FAIL', 'site', 'Subscribe', 'pricing-mention'],
  ['FAIL', 'tsx', '<button>Subscribe</button>', 'pricing-mention'],
  ['FAIL', 'site', 'Billing is handled by Apple.', 'pricing-mention'],
  ['FAIL', 'site', 'Questions about billing?', 'pricing-mention'],
  ['FAIL', 'site', 'See pricing.', 'pricing-mention'],
  ['FAIL', 'site', 'Just 4.99 a week.', 'pricing-mention'],
  ['FAIL', 'site', 'Just 2.99/month.', 'pricing-mention'],
  ['FAIL', 'site', 'Only 29.99 per year.', 'pricing-mention'],
  ['FAIL', 'site', 'Athan is free to download, and so is QuranWall.', 'free-download-prose'],
  ['FAIL', 'site', 'Athan is free to download, but QuranWall is a free app.', 'free-claim'],
  ['FAIL', 'site', 'Tarteel has a free plan, and you can use QuranWall for free.', 'free-claim'],
  ['FAIL', 'site', 'Tarteel has a free plan and billing is handled by Apple.', 'pricing-mention'],
  ['FAIL', 'site', 'Free forever.', 'pricing-mention', 'src/pages/Support.tsx'],
  // a sentence about another app (no QuranWall) is exempt from the free rules
  ['PASS', 'site', 'Athan is free to download.'],
  ['PASS', 'site', 'Tarteel has a free plan.'],
  ['PASS', 'site', 'Muslim Pro is free on the App Store, with a free trial.'],
  ['PASS', 'site', 'Other apps say free forever or free of charge.'],
  // false-positive guards on real copy
  ['PASS', 'site', 'A distraction-free Lock Screen.'],
  ['PASS', 'site', 'Take a free moment to read the ayah.'],
  ['PASS', 'site', 'Billions of Muslims read the Quran, 2.5 times a year.'],
  ['PASS', 'site', 'Surah 2:255 is read 4.5 times a week by some readers.'],
  ['PASS', 'site', 'Free to download.'],
  ['PASS', 'tsx', '<span>Free to download</span>'],
  ['PASS', 'site', 'Free forever.', null, 'src/pages/TermsOfUse.tsx'],
  ['PASS', 'site', 'Billing is handled by Apple. You can cancel anytime and subscribe in the App Store.', null, 'src/pages/PrivacyPolicy.tsx'],
  ['PASS', 'site', 'Billing is handled by Apple.', null, 'dist/eula/index.html'],
  // ---- 2026-11-17 third pass: 13 more price/free evasions. Each FAILs on a site page, a blog post and public/llms.txt
  // (rows are generated below: phrase, rule that must fire). The legal pages stay exempt.
  ...[
    ['QuranWall costs zero dollars.', 'pricing-mention'],
    ['Start your QuranWall trial.', 'pricing-mention'],
    ['QuranWall is a one-time purchase.', 'pricing-mention'],
    ['Get lifetime access to QuranWall.', 'pricing-mention'],
    ['Upgrade to unlock more fonts.', 'pricing-mention'],
    ['QuranWall is gratis.', 'pricing-mention'],
    ['QuranWall is gratis.', 'free-use-bare'],
    ['Pay once and keep it.', 'pricing-mention'],
    ['Choose from premium fonts.', 'pricing-mention'],
    ['QuranWall is ad-free and free.', 'pricing-mention'],
    ['QuranWall is ad-free and free.', 'free-use-bare'],
    ['Try QuranWall free for a week.', 'pricing-mention'],
    ['QuranWall costs 5 dollars a month.', 'pricing-mention'],
    ['QuranWall comes at no charge.', 'pricing-mention'],
    ['QuranWall comes at no charge.', 'free-use-bare'],
    ['Go ad-free by supporting the developer.', 'pricing-mention'],
    // other spellings of the same evasions
    ['Download it gratis.', 'free-download-prose'],
    ['Download QuranWall at no charge.', 'free-download-prose'],
    ['Free and ad-free.', 'pricing-mention'],
    ['Try it free for 7 days.', 'pricing-mention'],
    ['Your first week free.', 'pricing-mention'],
    ['Pay only once.', 'pricing-mention'],
    ['Go premium.', 'pricing-mention'],
    ['It costs five dollars.', 'pricing-mention'],
    ['Unlike Athan, it is free to download.', 'free-download-prose'],
    ['Better than Tarteel and free of charge.', 'free-use-bare'],
    ['Athan is free to download, and so is this app.', 'free-download-prose'],
  ].flatMap(([text, rule]) => [
    ['FAIL', 'site', text, rule],
    ['FAIL', 'site', text, rule, 'src/data/posts/example-post.json'],
    ['FAIL', 'site', text, rule, 'public/llms.txt'],
    ['FAIL', 'tsx', `<p>${text}</p>`, rule],
  ]),
  ['PASS', 'site', 'Start your QuranWall trial.', null, 'src/pages/TermsOfUse.tsx'],
  ['PASS', 'site', 'Start your QuranWall trial.', null, 'dist/eula/index.html'],
  ['PASS', 'site', 'Upgrade to unlock more fonts.', null, 'src/pages/PrivacyPolicy.tsx'],
  // the other-app exemption on the free rules still holds
  ['PASS', 'site', 'Athan is free to download.'],
  ['PASS', 'site', 'Tarteel has a free plan.'],
  ['PASS', 'site', 'Muslim Pro is gratis for the basics, with a free trial and a premium tier.'],
  ['PASS', 'site', 'Athan is ad-free and free.'],
  // false-positive guards on real copy
  ['PASS', 'site', 'No ads.'],
  ['PASS', 'site', 'QuranWall shows no ads. Browse and search all 114 surahs offline.'],
  ['PASS', 'site', 'QuranWall is ad-free.'],
  ['PASS', 'site', 'An ad-free Lock Screen.'],
  ['PASS', 'site', 'Learning by trial and error takes a while.'],
  ['PASS', 'site', 'Memorising by trial-and-error is slow.'],
  ['PASS', 'site', 'Quran 2:255'],
  ['PASS', 'site', 'Read Quran 2:255 once a day.'],
  ['PASS', 'site', 'Surah 2, verse 255'],
  ['PASS', 'site', 'Surah 2, verse 255 is read once.'],
  ['PASS', 'site', 'We read it 2.5 times a day.'],
  ['PASS', 'site', 'A distraction-free Lock Screen, and a clutter-free widget.'],
  ['PASS', 'site', 'Take a free moment to read the ayah.'],
  ['PASS', 'site', 'Spend a free minute on the ayah.'],
  ['PASS', 'site', 'A premium wallpaper look suits a Lock Screen.'],
];

function runSelfTest() {
  let bad = 0;
  for (const [expect, kind, input, rule, path] of SELF_TEST) {
    const found = [];
    if (kind === 'site') walkJson(input, '', join(ROOT, path || 'src/data/selftest.json'), found);
    else if (kind === 'stat') walkJson(input, '', join(ROOT, 'src/data/selftest.json'), found);
    else if (kind === 'tsx') found.push(...lintSourceLine(input, join(ROOT, 'src/components/SelfTest.tsx')));
    else if (kind === 'prompt') found.push(...lintPromptLines(input));
    const got = found.some((h) => !WARN_RULES.has(h.id)) ? 'FAIL' : found.length ? 'WARN' : 'PASS';
    const ruleOk = !rule || expect === 'PASS' || found.some((h) => h.id === rule);
    const ok = got === expect && ruleOk;
    if (!ok) bad += 1;
    const shown = typeof input === 'string' ? input : JSON.stringify(input);
    const ids = [...new Set(found.map((h) => h.id))].join(',');
    console.log(`${ok ? 'ok  ' : 'BAD '} expected ${expect} got ${got}${ids ? ' [' + ids + ']' : ''}${!ok && !ruleOk ? ' (wanted ' + rule + ')' : ''}  ${kind}: ${shown}`);
    if (!ok) fail('self-test', kind, shown);
  }
  console.log(`self-test: ${SELF_TEST.length - bad}/${SELF_TEST.length} cases agree`);
}

// ---------------------------------------------------------------- main

const argv = process.argv.slice(2);
if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
  console.log('Usage: node scripts/lint-facts.mjs [--diff <base> [--worktree]] [--dist [dir]] [--prompts [files...]] [--all] [--self-test]');
  process.exit(argv.length === 0 ? 1 : 0);
}

const flag = (n) => argv.includes(n);
const valueOf = (n) => { const i = argv.indexOf(n); const v = i >= 0 ? argv[i + 1] : undefined; return v && !v.startsWith('--') ? v : undefined; };
/** Positional values after `name`, up to the next flag. */
const valuesAfter = (name) => {
  const i = argv.indexOf(name);
  const out = [];
  for (const a of argv.slice(i + 1)) { if (a.startsWith('--')) break; out.push(a); }
  return out;
};

if (flag('--self-test')) runSelfTest();

if (flag('--all')) { runText(allFiles(), null); checkSourceEmails(); }

if (flag('--diff')) {
  const base = valueOf('--diff');
  if (!base) { console.error('--diff needs a base ref'); process.exit(1); }
  try {
    git(['rev-parse', '--verify', '--quiet', `${base}^{commit}`]);
    const ranges = addedRanges(base, flag('--worktree'));
    runText(allFiles(), ranges);
    console.log(`diff: ${textFilesChecked} changed file(s) linted against ${base}${flag('--worktree') ? ' (+ worktree)' : ''}`);
  } catch (e) {
    fail('diff-base', base, `cannot diff against "${base}": ${String(e.message).split('\n')[0]}`);
  }
}

if (flag('--prompts')) {
  const files = [
    ...readdirSync(join(homedir(), '.claude/scheduled-tasks'), { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.startsWith('quranwall-'))
      .map((e) => join(homedir(), '.claude/scheduled-tasks', e.name, 'SKILL.md'))
      .sort(),
    join(ROOT, '.claude/skills/quranwall-blog/SKILL.md'),
    ...valuesAfter('--prompts'),
  ];
  runPrompts(files);
}

if (flag('--dist')) runDist(valueOf('--dist'));

report();
