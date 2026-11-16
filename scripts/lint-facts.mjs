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
 *                               404, sitemap, Smart App Banner, public/llms.txt + public/pricing.md vs facts.json
 *                               plus the visible text of every built page (same prose rules) and the email check
 *   --prompts [files...]        lint ~/.claude/scheduled-tasks/quranwall-* /SKILL.md (read-only) and
 *                               .claude/skills/quranwall-blog/SKILL.md, plus any extra files given
 *   --self-test                 run the embedded table of probes (must-FAIL and must-PASS) through the same code paths
 *   --all                       lint every source file (src, index.html, public/*.txt|md, .claude/skills/**)
 *                               and check that every email address equals facts.contactEmail
 *
 * pricing-mention: QuranWall's price model is never described on the website (see PRICING_EXEMPT for the files that may).
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
const QTY = String.raw`(?:(?:a|an|a couple of|a few|couple of)\s+(?:seconds?|secs?|minutes?|mins?)|${NUM}\s?(?:seconds?|secs?|minutes?|mins?|s))\b`;
// Words that may sit between a setup phrase and its time quantity ("in under", "takes just", "within about").
const QLEAD = String.raw`(?:(?:in|within|under|just|only|about|around|roughly|less than|takes?|take)\s+)+`;
// What counts as "setting up" in the setup-time rule.
// Objects that may sit between "set" and "up" ("Set it up", "set QuranWall up").
const SETOBJ = String.raw`(?:it|this|everything|Quran ?Wall|the app|your lock screen)`;
const SETUPV = String.raw`(?:set(?:s|ting)?[- ]?up|set(?:s|ting)?\s+${SETOBJ}\s+up|install\w*|ready|get(?:ting)? started|up and running)`;
// A head count: "1,000+", "50,000", "10k", "3 million" (social-proof rules).
const COUNT = String.raw`\d[\d,.]*\+?(?:\s?(?:k|m|million|thousand)\b)?`;
// A count in words: "a thousand", "one million", "a hundred thousand", "5 thousand", "thousands of", "hundreds of".
const WCOUNT = String.raw`(?:(?:a few|several|a|one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(?:hundred\s+)?(?:thousand|million)|(?:thousands|hundreds|millions) of)`;
// Optional qualifier before a count.
const QUAL = String.raw`(?:(?:over|more than|nearly|almost)\s+)?`;
const PEOPLE = String.raw`(?:believers|muslims|users|people)`;
// Local negation inside a sentence: a sentence that denies a feature is the opposite of a claim. Real negations
// only. "only", "unlike", "except", "instead of", "rather than" are NOT negations ("QuranWall is the only app with
// tafsir on your lock screen" is an invented claim), and "not only" is an addition, not a denial.
const DENY = /\b(?:no|not(?!\s+only\b)|never|without|lacks?|has no|(?:don|doesn|didn|isn|aren|wasn|weren|won|can|couldn|hasn|haven)'?t|do not|does not|did not|cannot|not confirmed)\b/i;

// Each rule: [id, regex, unused, allow?]. `allow` rescues a sentence that matches it.
const rules = [
  // A stated price, trial length or plan name about QuranWall.
  ['price-or-trial', new RegExp(`\\b${BRAND}\\b[^.]{0,120}(?:\\$\\s?\\d|€\\s?\\d|£\\s?\\d|\\b\\d+[- ]days?\\s+(?:free\\s+)?trial|\\bfree trial\\b|\\b\\d+\\s+days?\\s+free\\b|\\bper (?:week|month|year)\\b|/(?:wk|week|mo|month|yr|year)\\b|\\b(?:weekly|monthly|yearly|annual|lifetime)\\s+(?:plan|subscription|premium|pass|membership)\\b)`, 'i'), null],
  // "free" on its own about QuranWall ("free to download" is the one allowed phrasing).
  ['free-claim', new RegExp(`\\b${BRAND}\\b(?:'s)?\\s+(?:is|are|was|stays|remains)\\s+(?:a\\s+|an\\s+)?(?:completely\\s+|totally\\s+|100%\\s+|truly\\s+|also\\s+|entirely\\s+|always\\s+)?free\\b(?!\\s+to\\s+(?:download|install|get))|\\bfree\\s+(?:\\w+\\s+){0,3}app\\b[^.]{0,30}\\b${BRAND}\\b|\\b${BRAND}\\b[^.?]{0,40}\\b(?:for free|free of charge|at no cost|free forever|free tier|free version|free plan|free app|no paywall|freemium|completely free|totally free|100% free|entirely free)\\b|\\b${BRAND}\\b[^.?]{0,40}\\bcosts? nothing\\b|\\bno cost\\b[^.]{0,30}\\b${BRAND}\\b`, 'i'), null, /\bno free tier\b|there is no free\b|has no free\b|not free\b|isn'?t free\b/i],
  // "is a free app" with no brand in the sentence (a bare claim in a QuranWall page or post; search-intent
  // wording such as "looking for a free Quran app" is not a claim).
  ['free-app-bare', /\b(?:is|it'?s|it is|this is|that'?s|was|are)\s+(?:a|an)\s+(?:totally\s+|completely\s+|100%\s+)?free\s+(?:\w+\s+){0,2}app\b/i, null],
  // No pricing on the website at all (Karol, 2026-11-16): QuranWall's own price model is never described on a page,
  // post, CTA or install card; the App Store shows it. Bare phrases (every page and post is about QuranWall).
  // Exempt, by file (see PRICING_EXEMPT): public/llms.txt, public/pricing.md (machine files), the legal pages and
  // src/data/facts.json (feeds those machine files). JSON-LD is not visible text and is never scanned.
  ['pricing-mention', /\bfree to (?:download|install|get)\b|\bfree downloads?\b|\bin-app subscriptions?\b|\bwith (?:a|an) (?:in-app )?subscription\b|\b(?:app store|apple) (?:listing )?shows (?:you )?(?:what is offered|the price|the prices|pricing)\b|\bshows? the price\b|\bbefore you (?:subscribe|pay)\b/i, null],
  // NOT CONFIRMED by the listing: installing through iOS Focus modes.
  ['focus-install', new RegExp(`\\b${BRAND}\\b${CL}{0,80}\\bFocus(?:\\s+(?:modes?|filters?))?\\b|\\bFocus modes?\\b${CL}{0,60}\\b${BRAND}\\b`, 'i'), null, /\blink(?:ed|s)?\b|\bpair(?:ed|s)?\b|\bswitch(?:es|ing)?\b/i],
  // NOT CONFIRMED: verse packs or any named pack.
  ['verse-packs', new RegExp(`\\b${BRAND}\\b${CL}{0,80}\\b(?:packs?|bundles?|collections? of (?:verses|ayat|ayahs))\\b`, 'i'), null],
  ['verse-packs-bare', /\b(?:verse|ayah|ayat|surah|themed|wallpaper|theme|dua|dhikr|starter|bonus) packs?\b/i, null],
  // NOT CONFIRMED: "Premium" unlocks or "unlimited" anything. The listing never says "Premium" at all.
  ['premium-unlock', new RegExp(`\\bPremium\\b[^.]{0,60}\\b(?:unlock\\w*|includes?|gives?|adds?|removes?|enables?|grants?)\\b|\\bunlock\\w*\\b[^.]{0,40}\\bPremium\\b|\\b${BRAND}\\b${CL}{0,80}\\bunlimited\\b|\\bunlimited\\s+(?:verses?|ayat|ayahs?|wallpapers?|widgets?|backgrounds?|fonts?|themes?|translations?|surahs?|access)\\b`, 'i'), null],
  // NOT CONFIRMED: the name "Premium". The listing's in-app purchases are called QuranWall+ Weekly / Yearly;
  // write "an in-app subscription" instead. Case-sensitive on purpose ("premium" as an adjective is fine).
  ['premium-name', /\bPremium\s+is\s+(?:a|an|the)\s+(?:in-app\s+)?(?:[Ss]ubscription|[Pp]lan)\b|\bPremium\s+(?:[Ss]ubscription|[Pp]lan|[Tt]ier|[Vv]ersion|SUBSCRIPTION|PLAN|TIER|VERSION)\b/, null],
  // NOT CONFIRMED: duas inside QuranWall.
  ['duas', new RegExp(`\\b${BRAND}\\b${CL}{0,80}\\b(?:du'?as?|du'?aa|supplications?|adhkar|adhkaar)\\b|\\b(?:personal|custom|your own|saved|favou?rite)\\s+(?:du'?as?|du'?aa|supplications?)\\b`, 'i'), null, /\b(?:read|reading|recit\w+|write|writing|praying|pray|make|making|about|topic|post|guide|article)\b/i],
  // NOT CONFIRMED: a "60-second setup".
  ['setup-60s', new RegExp(`\\b(?:60|sixty)[- ]?seconds?\\b[^.]{0,30}\\b(?:set[- ]?up|install\\w*|ready|get started|to set)\\b|\\b${SETUPV}\\b[^.]{0,30}\\b(?:in|within|under|just|takes?)\\s+(?:about\\s+|only\\s+|just\\s+)?(?:60|sixty)[- ]?seconds?\\b|\\b(?:a|one|1)[- ]minute\\s+set[- ]?up\\b`, 'i'), null],
  // NOT CONFIRMED: any stated setup time ("Seconds to set up", "2-minute setup", "Set up in under 2 minutes",
  // "under 2 minutes to install"). Bare phrases: the page or post is about QuranWall. Stat blocks reach this
  // rule as "<number><suffix> <label>" (see statText), built HTML as concatenated text (see htmlToText).
  ['setup-time', new RegExp(`\\b(?:seconds?|secs?|minutes?|mins?)\\s+to\\s+(?:set[- ]?up|install\\w*)\\b|\\b${NUM}[- ](?:seconds?|secs?|minutes?|mins?)[- ](?:set[- ]?up|install\\w*)\\b|\\b\\d+s[- ]?set[- ]?up\\b|\\b(?:a[- ]|an[- ])?(?:second|minute|sec|min)[- ]set[- ]?up\\b|\\b${SETUPV}\\b[^.]{0,30}?\\b${QLEAD}${QTY}|\\b(?:under|within|less than|in just|in only)\\s+${QTY}[^.]{0,30}\\b(?:set[- ]?up|install\\w*)\\b`, 'i'), null],
  // NOT CONFIRMED: "no account" (bare phrase, no brand needed).
  ['no-account-bare', /\bno (?:user )?accounts?\b[^.]{0,30}\b(?:required|needed|necessary)\b|\bwithout (?:creating |signing up for |making )?an account\b|\bno (?:sign-?up|log-?in|sign-?in)s?\b[^.]{0,20}\b(?:required|needed|necessary)\b/i, null],
  // NOT CONFIRMED: iOS 16 as the minimum (the listing says iOS 15.0). OS-feature facts (Lock Screen widgets
  // arrived in iOS 16) are allowed through the widget/Lock Screen/Focus wording.
  ['ios16-as-min', new RegExp(`\\b(?:${BRAND}|the app)\\b[^.]{0,100}\\biOS\\s?16(?:\\.0)?(?:\\+|\\s+or\\s+(?:later|newer|higher)|\\s+and\\s+(?:later|newer|up))|\\b(?:requires?|needs?|minimum|min\\.?)\\s+(?:iOS\\s*)?16(?:\\.0)?\\b|Platform\\W{1,8}iOS 16|Minimum iOS\\W{1,8}16|operatingSystem"?\\W{1,6}iOS 16|^[-*\\s]*iOS 16(?:\\.0)?(?:\\+|\\s+or later|\\s+and later)?\\s*$`, 'i'), null, /widget|Lock Screen|Focus|competitor|customi[sz]|introduced|\bsince\b/i],
  // Invented features (about QuranWall). A denial in the same sentence ("no audio", "doesn't have") is fine.
  ['invented-android-web', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:Android|Google Play|Play Store|web app|web version|browser version|desktop app|Windows|Chrome extension)\\b|\\b(?:Android|web app|web version|browser version)\\b${CL}{0,40}\\b(?:of|for|from|in|on|with)\\s+${BRAND}\\b`, 'i'), null, DENY],
  ['invented-audio', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:audio(?: recitation)?|recitations?|recited|reciters?|qari|qaris|listen(?:ing)? to|hear)\\b|\\b(?:audio(?: recitation)?|recitations?|reciters?)\\b${CL}{0,40}\\b(?:of|for|from|in|on|with|inside)\\s+${BRAND}\\b`, 'i'), null, DENY],
  ['invented-tafsir', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:tafs[iī]rs?|commentar(?:y|ies)|exegesis)\\b|\\b(?:tafs[iī]rs?|commentar(?:y|ies))\\b${CL}{0,40}\\b(?:of|for|from|in|on|with|inside)\\s+${BRAND}\\b`, 'i'), null, DENY],
  ['invented-prayer-times', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:prayer times?|salah times?|salat times?|adhan|azan|qibla|qiblah|prayer reminders?|athan)\\b|\\b(?:prayer times?|qibla|qiblah|adhan)\\b${CL}{0,40}\\b(?:of|for|from|in|on|with|inside)\\s+${BRAND}\\b`, 'i'), null, DENY],
  ['invented-hifz', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:hifz|hifdh|memori[sz]ation (?:tracking|tracker|tools?|progress|plans?|features?|mode)|memori[sz]ing (?:progress|tools?)|track\\w*\\s+(?:your\\s+)?(?:hifz|memori[sz]ation|memori[sz]ing|progress)|hifz (?:tracker|tools?|plans?|mode|features?))\\b`, 'i'), null, DENY],
  ['invented-ai', new RegExp(`\\b${BRAND}\\b${CL}{0,70}\\b(?:AI|A\\.I\\.|artificial intelligence|machine learning|chatbot|AI-powered|AI-assisted)\\b|\\b(?:AI|artificial intelligence|chatbot)\\b${CL}{0,40}\\b(?:of|for|from|in|on|with|inside)\\s+${BRAND}\\b`, 'i'), null, DENY],
  // NOT CONFIRMED: any social proof or user count. The site carries none (queue item p5 removed the old
  // "1,000+ believers" lines; see GRANDFATHER below). The one allowed number is the App Store Connect downloads floor
  // from facts.json ("Downloaded <downloadsFloor> times", rule social-proof-downloads). Stats whose label names users,
  // believers, people or Muslims are linted separately (lintStat); this rule covers prose and tag-stripped HTML.
  ['social-proof', new RegExp(`\\b(?:(?:tens|hundreds) of )?(?:thousands|hundreds|millions)(?: of)?\\s+(?:\\w+\\s+){0,2}?${PEOPLE}\\b|\\btrusted by\\s+${QUAL}(?:${COUNT}|${WCOUNT}|thousands|millions)|\\bjoin(?:ed|ing|s)?\\s+${QUAL}(?:${COUNT}|${WCOUNT})(?:\\s+\\w+){0,2}?\\s+${PEOPLE}\\b|\\b${QUAL}${WCOUNT}(?:\\s+(?!of\\b)\\w+){0,2}?\\s+${PEOPLE}\\b|(?:\\b\\d[\\d,.]*\\s?(?:\\+|%|k\\b)|\\b\\d{1,3}(?:,\\d{3})+|\\b\\d{3,}\\+?)(?:\\s+(?!of\\b)\\w+)?\\s+${PEOPLE}\\b|\\b\\d[\\d,.]*\\s?(?:million|thousand|k)\\s+(?:\\w+\\s+)?(?:users|believers)\\b|\\b\\d[\\d,.]*\\s+(?:active|daily|monthly|early|happy|total|registered)\\s+${PEOPLE}\\b`, 'i'), null],
  // Two phrasings are allowed, both only with exactly facts.downloadsFloor (commas ignored, the "+" must match):
  // "Downloaded <floor> times" and "<floor> downloads". Any other download count FAILs (see downloadHits).
  ['social-proof-downloads', null, null],
  // NOT CONFIRMED: "Premium" as a plan name ("QuranWall Premium", "upgrade to Premium", "go Premium",
  // "Premium needs ..."). Case-sensitive on Premium on purpose; "premium" as an adjective is fine.
  ['premium-plan-word', /\bQuran ?Wall\+?\s+Premium\b|\b(?:[Uu]pgrad(?:e|es|ed|ing)|[Gg]o(?:es|ing)?|[Gg]et(?:s|ting)?)\s+(?:to\s+)?(?:Quran ?Wall\+?\s+)?Premium\b|\bPremium\s+(?:[Pp]lan|[Ss]ubscription|[Tt]ier)\b|\bPremium\s+(?:needs|requires|costs|unlocks|includes|features|members|access|users)\b/, null],
];

// A sentence that states the ban itself ("never write ...", "NOT CONFIRMED ...") is not a violation.
const NEG = /\b(?:never|don'?t|do not|doesn'?t|does not|banned|avoid|no claim|not confirmed|unconfirmed|not claim|must not|mustn'?t|forbidden|ruled out)\b|\bno\b[^.;]{0,100}\bclaims?\b/i;

// JSON keys that hold identifiers, not prose.
const SKIPKEYS = new Set(['keywords', 'keyword', 'slug', 'image', 'thumbnail', 'url', 'href', 'id', 'imageAlt', 'alternateName', 'related', 'featured', 'cluster', 'target_keyword', 'query', 'queries']);

// A list item about another app ("**Muslim Pro** — ...") that never names QuranWall can't make a QuranWall
// claim through a bare phrase, so the bare-phrase rules skip it.
const OTHER_APP_ITEM = /^\s*(?:[-*]\s+)?\*\*(?!Quran ?Wall\b)[^*]{2,60}\*\*/;
// Files where the pricing-mention rule does not apply: the machine files read by AI answer engines (they keep the
// factual "free to download, with an in-app subscription, no prices" line on purpose), the legal pages, and the
// facts file that feeds the machine files. Built legal pages: dist/terms-of-use, dist/eula, dist/privacy-policy.
const PRICING_EXEMPT = /^(?:public\/(?:llms\.txt|pricing\.md)|src\/pages\/(?:TermsOfUse|EULA|PrivacyPolicy)\.tsx|src\/data\/facts\.json|dist\/(?:terms-of-use|eula|privacy-policy)(?:\/index)?\.html)$/;
const BARE_RULES = new Set(['pricing-mention', 'no-account-bare', 'setup-60s', 'setup-time', 'premium-name', 'premium-plan-word', 'social-proof', 'social-proof-downloads', 'verse-packs-bare', 'free-app-bare']);

/**
 * Files whose negations are rule text, not copy: skills and the SEO queue/keyword notes say "NOT CONFIRMED: do not
 * add claims about verse packs" on purpose, so they keep whole-sentence NEG like the prompt files. Everything else
 * (posts, components, pages, public/*.txt|md, built HTML) is site content and is linted per clause.
 */
const negOpts = (file) => {
  const f = String(file);
  if (/seo-(?:priorities|keywords)\.json$/.test(f)) return { wholeSentenceNeg: true, planText: true };
  return /(?:^|[\\/])\.claude[\\/]/.test(f) ? { wholeSentenceNeg: true } : {};
};
// Queue notes quote the strings they tell the executor to remove ("reword every '1,000+ believers' claim ..."): in
// planText files a sentence that orders a removal is a mention, not a claim.
const PLAN_VERBS = /\b(?:reword|rewrite|remove[sd]?|delete[sd]?|replace[sd]?|grandfather\w*|strip(?:ped)?)\b/i;

/** A download count as a comparable string: commas and spaces dropped, so "1,000+" == "1000+" but "1,000" != "1,000+". */
const normCount = (v) => String(v).replace(/[,\s]/g, '').toLowerCase();

const DL_NUM = String.raw`\d[\d,.]*\+?`;
const DL_RE_TIMES = new RegExp(String.raw`\bdownloaded\s+(${QUAL})(${DL_NUM}|${WCOUNT})\s+times\b`, 'gi');
const DL_RE_COUNT = new RegExp(String.raw`(?<![\w.,])(${QUAL})(${DL_NUM}|${WCOUNT})\s+(?:\w+\s+)?downloads\b`, 'gi');

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
      const qual = m[1];
      const tok = m[2];
      const isDigits = /^\d[\d,.]*\+?$/.test(tok);
      if (!qual && isDigits && normCount(tok) === floor) continue;
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
      if (id === 'pricing-mention' && PRICING_EXEMPT.test(opts.relPath || '')) continue;
      let found;
      if (id === 'social-proof-downloads') found = downloadHits(s);
      else { const m = re.exec(s); found = m ? [m] : []; }
      for (const m of found) {
        // Scope for negations: the matched clause (site content) or the whole sentence (prompts).
        const scope = opts.wholeSentenceNeg ? s : s.slice(clauseStart(s, m.index), m.index + m[0].length);
        if (allow) {
          if (allow === DENY ? DENY.test(scope) : allow.test(s)) continue;
        }
        if (NEG.test(scope)) continue;
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
const STAT_SETUP_LABEL = /\b(?:seconds?|secs?|minutes?|mins?)\b[^.]{0,12}\b(?:set[- ]?up|install\w*|get(?:ting)? started|ready|up and running)\b|\b(?:set[- ]?up|install\w*)\s+(?:time|speed|in)\b|\btime to (?:set[- ]?up|install|start|get started|be ready|ready)\b|\b(?:set[- ]?up|install\w*|get(?:ting)? started|ready|up and running)\b[^.]{0,12}\b(?:seconds?|secs?|minutes?|mins?)\b/i;
/** A stat label about downloads: the value must be the downloads floor from facts.json. */
const STAT_DOWNLOADS_LABEL = /\bdownload(?:s|ed)\b/i;

/** Stat-specific rules on {value|number, suffix, label}; `joined` is the rendered "<n><suffix> <label>". */
function lintStat(label, joined, out) {
  const s = joined.replace(/\s+/g, ' ').slice(0, 190);
  if (STAT_PEOPLE_LABEL.test(label)) out.push({ id: 'social-proof', s });
  if (STAT_SETUP_LABEL.test(label)) out.push({ id: 'setup-time', s });
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
  if (abs.endsWith('.json')) {
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

const LINTABLE = /\.(tsx?|json|html|md|txt)$/;
const rel = (abs) => relative(ROOT, abs).split(sep).join('/');

function isLintable(relPath) {
  if (!LINTABLE.test(relPath)) return false;
  if (relPath.startsWith('src/') || relPath.startsWith('.claude/skills/')) return true;
  if (relPath === 'index.html') return true;
  return /^public\/[^/]+\.(txt|md)$/.test(relPath);
}

function allFiles() {
  return [
    ...walk(join(ROOT, 'src')),
    join(ROOT, 'index.html'),
    ...walk(join(ROOT, 'public')).filter((f) => /^public\/[^/]+\.(txt|md)$/.test(rel(f))),
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
    join(ROOT, 'public/pricing.md'),
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

/**
 * GRANDFATHERED social proof. The live site still carries these lines until queue item p5 (seo-priorities.json)
 * removes them on 2026-11-23: Hero.tsx "Trusted by 1,000+ believers", FinalCTA.tsx "Join 1,000+ believers"
 * (rendered on / and /features), and two SocialProof.tsx stats. Until GRANDFATHER_UNTIL a hit that is exactly one
 * of these (matched in source and in built HTML) is a WARN naming p5; from that date it is a FAIL. p5 deletes these
 * entries together with the copy. If Karol's dated answer in TODO-KAROL.md keeps one of them, p5 moves that entry
 * to a documented permanent allowlist with his date instead. LINT_FACTS_TODAY=YYYY-MM-DD overrides the clock (tests).
 */
const GRANDFATHER_UNTIL = '2026-11-23';
const GRANDFATHER = [
  /Trusted by 1,000\+ believers/i,                  // src/components/Hero.tsx
  /Join 1,000\+ believers/i,                        // src/components/FinalCTA.tsx
  /(?:1,?000\+?\s+)?Believers using QuranWall/i,    // src/components/SocialProof.tsx stat {1000, '+'}
  /(?:92%?\s+)?Early users feel closer to Allah/i,  // src/components/SocialProof.tsx stat {92, '%'}
];
const todayIso = () => process.env.LINT_FACTS_TODAY || new Date().toISOString().slice(0, 10);

/** Report a text hit; a social-proof hit that is only grandfathered copy is a WARN until GRANDFATHER_UNTIL. */
function emit(h, where) {
  if (h.id === 'social-proof' && GRANDFATHER.some((g) => g.test(h.s))) {
    let rest = h.s;
    for (const g of GRANDFATHER) rest = rest.replace(new RegExp(g.source, 'gi'), ' ');
    const left = [];
    lintText(rest, left);
    if (!left.some((x) => x.id === 'social-proof')) {
      if (todayIso() < GRANDFATHER_UNTIL) {
        warn('social-proof', where, `${h.s}  [grandfathered until ${GRANDFATHER_UNTIL}: queue item p5 removes it]`);
      } else {
        fail('social-proof', where, `${h.s}  [grandfather expired ${GRANDFATHER_UNTIL}: queue item p5 should have removed it]`);
      }
      return;
    }
  }
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
      emit(h, `${r} ${h.loc}`);
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

/** public/llms.txt and public/pricing.md must agree with facts.json: minimum iOS, no price, own campaign token. */
function checkMachineFiles() {
  const files = [['public/llms.txt', CAMPAIGNS.llms], ['public/pricing.md', CAMPAIGNS.pricing]];
  const minNum = parseFloat(facts.minIOS);
  for (const [r, expectCt] of files) {
    const abs = join(ROOT, r);
    if (!existsSync(abs)) { fail('dist-machine-file', r, 'missing'); continue; }
    const txt = readFileSync(abs, 'utf8');
    if (!txt.includes(facts.minIOSText)) fail('dist-machine-file', r, `does not say "${facts.minIOSText}"`);
    for (const m of txt.matchAll(/\biOS\s?(\d+(?:\.\d+)?)/g)) {
      if (parseFloat(m[1]) !== minNum) fail('dist-machine-file', r, `names iOS ${m[1]}, facts.json minIOS is ${facts.minIOS}`);
    }
    txt.split('\n').forEach((ln, i) => {
      if (/[$€£]\s?\d|\b\d+(?:[.,]\d+)?\s?(?:USD|EUR|GBP)\b|\b\d+[- ]days?\s+(?:free\s+)?trial\b|\bfree trial\b|\bper (?:week|month|year)\b|\/(?:wk|week|mo|month|yr|year)\b/i.test(ln)) {
        fail('dist-machine-file', `${r} L${i + 1}`, `states a price or trial length: ${ln.trim().slice(0, 120)}`);
      }
      for (const m of ln.matchAll(/https:\/\/apps\.apple\.com\/[^\s)<>"']+/g)) checkAppLink(m[0], `${r} L${i + 1}`, expectCt);
    });
    if (!txt.includes(facts.installLine.replace(/\.$/, '')) && !/free to download, with an in-app subscription/i.test(txt)) {
      warn('dist-machine-file', r, `does not state "${facts.installLine}"`);
    }
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
 * (lintPromptLines: whole-sentence NEG). expect FAIL = at least one hit (and one with id "rule" when given), PASS = no hit.
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
  ['FAIL', 'site', 'We never claim this, but QuranWall has audio recitation.', 'invented-audio'],
  ['FAIL', 'site', 'We do not claim this, yet QuranWall has audio recitation.', 'invented-audio'],
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
  // must PASS
  ['PASS', 'site', 'QuranWall is free to download, with an in-app subscription.', null, 'public/llms.txt'],
  ['PASS', 'site', 'Downloaded 1,000+ times'],
  ['PASS', 'site', 'Downloaded 1000+ times'],
  ['PASS', 'site', '1,000+ downloads'],
  ['PASS', 'stat', { value: 1000, suffix: '+', label: 'Downloads' }],
  ['PASS', 'stat', { value: '1,000+', label: 'Downloads' }],
  ['PASS', 'tsx', "{ value: 1000, suffix: '+', label: 'Downloads' }"],
  ['PASS', 'site', 'QuranWall has no audio recitation.'],
  ['PASS', 'site', 'QuranWall has no audio recitation, but it puts a verse on your Lock Screen.'],
  ['PASS', 'site', 'Never miss a verse.'],
  ['PASS', 'site', 'a translation in 10 languages'],
  ['PASS', 'site', 'All 114 surahs, searchable'],
  ['PASS', 'stat', { value: 114, suffix: '', label: 'Surahs, all searchable' }],
  ['PASS', 'site', 'Over 1.8 billion Muslims read the Quran.'],
  ['PASS', 'site', '90% of people forget what they read.'],
  ['PASS', 'site', 'Better than a thousand months.'],
  ['PASS', 'site', 'This premium wallpaper look suits a Lock Screen.'],
  ['PASS', 'prompt', ['Never call the subscription "Premium".']],
  ['PASS', 'prompt', ['Never claim this, but QuranWall has audio recitation.']],
];

function runSelfTest() {
  let bad = 0;
  for (const [expect, kind, input, rule, path] of SELF_TEST) {
    const found = [];
    if (kind === 'site') walkJson(input, '', join(ROOT, path || 'src/data/selftest.json'), found);
    else if (kind === 'stat') walkJson(input, '', join(ROOT, 'src/data/selftest.json'), found);
    else if (kind === 'tsx') found.push(...lintSourceLine(input, join(ROOT, 'src/components/SelfTest.tsx')));
    else if (kind === 'prompt') found.push(...lintPromptLines(input));
    const got = found.length ? 'FAIL' : 'PASS';
    const ruleOk = !rule || expect !== 'FAIL' || found.some((h) => h.id === rule);
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
