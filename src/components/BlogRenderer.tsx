import { Fragment, createElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Icon, { type IconName } from './visuals/icons';
import { StatBlock, VerseCard, VerseQuote } from './visuals/blocks';
import AppStoreButton from './AppStoreButton';
import AppNudge from './AppNudge';
import { APP_STORE_ID, CAMPAIGNS, appStoreUrl } from '../lib/app-store';
import { headingIds } from '../lib/headings';
import { leadItems, pickIcon } from '../lib/postIcons';
import { bigFlexIndexes, type RhythmItem } from '../lib/visualRhythm';
import { renderMarkdown, type MdComponents } from '../lib/markdown';
import type { BlogSection } from '../types/blog';

/**
 * Reading measure is set once, on the post column (BlogPostContent), not per block. Only the figures that earn the
 * width break out of it: stat cards, verse cards, tables (and the hero, in BlogPostContent). The breakout is 60 px each
 * side from md (the 720 px a 768 px screen leaves), 84 px each side from lg (768 px wide), and from 1180 px the right
 * side is limited to 64 px so it stays 32 px clear of the table-of-contents rail.
 */
const BREAKOUT = 'md:-mx-[60px] lg:-mx-[84px] min-[1180px]:-mr-16';

/** Body copy: one size token for paragraphs, list items, steps, callout text and table cells. */
const BODY = 'text-[18px] leading-[1.7] min-[1180px]:text-[19px] min-[1180px]:leading-[1.65]';

/** Callout family: 16 px padding on phones, 24 px from md up. */
const CALLOUT_PAD = 'p-4 md:p-6';

/** Icon tile of a callout: one 24-grid line icon per block type, gold on a soft gold tile. */
function IconTile({ name }: { name: IconName }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/15 text-brand">
      <Icon name={name} className="h-6 w-6" />
    </span>
  );
}

const MD: MdComponents = {
  a: ({ href, children }) => {
    const isInternal = href.startsWith('/') || href.startsWith('https://quranwall.com');
    const internalPath = isInternal ? href.replace(/^https:\/\/quranwall\.com/, '') : href;
    if (isInternal) {
      return (
        <Link to={internalPath} className="text-brand hover:text-brand-light underline underline-offset-2">
          {children}
        </Link>
      );
    }
    // An in-body link to this app on the App Store gets the in-body token (qw-web-blog), built in code,
    // whatever query string the post JSON carries.
    const outHref = href.includes('apps.apple.com') && href.includes(`id${APP_STORE_ID}`) ? appStoreUrl(CAMPAIGNS.blog) : href;
    return (
      <a href={outHref} target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand-light underline underline-offset-2">
        {children}
      </a>
    );
  },
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  p: ({ children }) => <p className="text-white/80">{children}</p>,
  // Elements the posts do not use yet. Styled now so a future table, list or quote renders properly.
  h: ({ level, children }) =>
    level === 3 ? (
      <h3 className="!mt-9 mb-2 text-[21px] font-bold leading-[1.3] text-white min-[1180px]:text-[23px]">{children}</h3>
    ) : (
      createElement(`h${level}`, { className: 'font-bold text-white' }, children)
    ),
  ul: ({ children }) => <ul className="my-3 list-disc space-y-2 pl-6 marker:text-brand">{children}</ul>,
  ol: ({ start, children }) => <ol start={start} className="my-3 list-decimal space-y-2 pl-6 marker:text-brand">{children}</ol>,
  li: ({ children }) => <li className="pl-1 text-inherit [&>ul]:mt-1.5 [&>ol]:mt-1.5 [&>ul]:space-y-1.5 [&>ol]:space-y-1.5">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-brand pl-5 font-serif text-[20px] leading-[1.5] text-white min-[1180px]:text-[22px]">{children}</blockquote>
  ),
  code: ({ children }) => <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[15px] text-white">{children}</code>,
  // From 640 px up a scrolling table; under 640 px every row is a stacked card (cells carry their column header).
  table: ({ label, children }) => (
    <div className="relative my-4">
      <div
        role="region"
        tabIndex={0}
        aria-label={label}
        className="overflow-x-auto rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <table className="min-w-[520px] w-full border-collapse text-left text-[16px] leading-[1.5] max-sm:block max-sm:min-w-0 min-[1180px]:text-[17px]">{children}</table>
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface to-transparent max-sm:hidden" />
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface-elevated max-sm:sr-only">{children}</thead>,
  tbody: ({ children }) => <tbody className="[&>tr:nth-child(even)]:bg-white/[0.03] max-sm:block">{children}</tbody>,
  tr: ({ children }) => (
    <tr className="max-sm:mb-3 max-sm:block max-sm:rounded-xl max-sm:border max-sm:border-white/10 max-sm:bg-surface-card max-sm:p-3">{children}</tr>
  ),
  th: ({ align, children }) => (
    <th style={align ? { textAlign: align } : undefined} className="sticky left-0 border-b border-white/10 bg-surface-elevated px-[14px] py-3 font-semibold text-white first:z-10">{children}</th>
  ),
  td: ({ align, label, children }) => (
    <td
      data-label={label}
      style={align ? { textAlign: align } : undefined}
      className="border-b border-white/[0.06] px-[14px] py-3 text-white/80 first:sticky first:left-0 first:z-10 first:bg-surface max-sm:static max-sm:flex max-sm:justify-between max-sm:gap-4 max-sm:border-0 max-sm:bg-transparent max-sm:px-1 max-sm:py-1.5 max-sm:text-right max-sm:before:shrink-0 max-sm:before:text-left max-sm:before:font-semibold max-sm:before:text-white max-sm:before:content-[attr(data-label)] max-sm:first:bg-transparent"
    >
      {children}
    </td>
  ),
};

function Markdown({ text }: { text: string }) {
  return renderMarkdown(text, MD);
}

/** Characters of reader-facing text in a section (links do not count). */
function textLength(section: BlogSection): number {
  switch (section.type) {
    case 'heading':
    case 'paragraph':
      return section.text.length;
    case 'callout':
      return (section.title?.length ?? 0) + section.content.length;
    case 'tip':
    case 'highlight':
    case 'important':
      return section.content.length;
    case 'stat':
      return section.number.length + section.label.length + (section.description?.length ?? 0);
    case 'steps':
    case 'list':
      return section.items.reduce((n, item) => n + item.length, 0);
    case 'verse':
      return section.text.length + section.reference.length;
    case 'cta':
      return section.title.length + section.description.length;
    default:
      return 0;
  }
}

/**
 * Where the one mid-article install card goes (the section index it sits in front of), or -1.
 * Candidates are the H2s from the third one on; the card goes before the first candidate s where
 * (a) it is at least 3 sections after the illustration, (b) the section before it is not an image,
 * (c) every 'cta' block is more than 3 sections away, and (d) at least 30 % of the article's text
 * comes before it. QuranWall posts have no illustration blocks; the illustration is the hero photo above the
 * article, which counts as sitting before section 0 (index -1). There is no image block type yet, so (b) only
 * guards a future one.
 */
function midCardIndex(sections: BlogSection[], h2Indexes: number[]): number {
  const illustrationAt = -1;
  const total = sections.reduce((n, sec) => n + textLength(sec), 0);
  const ctaIndexes = sections.flatMap((sec, i) => (sec.type === 'cta' ? [i] : []));
  let before = 0;
  let counted = 0; // sections[0..counted-1] are in `before`
  for (const s of h2Indexes.slice(2)) {
    for (; counted < s; counted++) before += textLength(sections[counted]);
    if (
      s - illustrationAt >= 3 &&
      (sections[s - 1]?.type as string | undefined) !== 'image' &&
      ctaIndexes.every((c) => Math.abs(c - s) > 3) &&
      before >= 0.3 * total
    ) {
      return s;
    }
  }
  return -1;
}

type CalloutSection = Extract<BlogSection, { type: 'callout' }>;

/** The "Quick Answer" callout. Exported so the post page can lift it above the cover. */
export function Callout({ section, className = 'my-8' }: { section: CalloutSection; className?: string }) {
  return (
    <div className={`${className} ${CALLOUT_PAD} flex gap-3 rounded-2xl border border-brand/30 bg-brand/10 sm:gap-4`}>
      <IconTile name="answer" />
      <div className="min-w-0 flex-1">
        {section.title && <p className="mb-2 text-lg font-bold text-white">{section.title}</p>}
        <div className={`text-white/85 ${BODY}`}>
          <Markdown text={section.content} />
        </div>
      </div>
    </div>
  );
}

interface Props {
  sections: BlogSection[];
  /** The post page already rendered sections[0] (a callout) above the cover: skip it here, indexes stay the same. */
  skipLead?: boolean;
  /** Spot scene: drawn right before the first H2, i.e. after the opening paragraph(s), never before the first one. */
  scene?: ReactNode;
  /**
   * 'blog' = posts: a mid card and the post's closing CTA as an install card.
   * 'pillar' = guide pages: the closing CTA keeps the plain block, no mid card.
   */
  pageType?: 'blog' | 'pillar';
}

export default function BlogRenderer({ sections, skipLead = false, scene, pageType = 'blog' }: Props) {
  const isPost = pageType === 'blog';
  const h2Indexes = sections.flatMap((sec, i) => (sec.type === 'heading' && sec.level === 2 ? [i] : []));
  const midAt = isPost ? midCardIndex(sections, h2Indexes) : -1;
  // Verses and stats draw as a phone or a figure only with enough reading text around them; the rest render quiet
  // (src/lib/visualRhythm.ts). A verse that fits as a Lock Screen phone is the post's own picture, so it takes the
  // place of the generic spot scene; posts with no such verse keep the scene before the first H2.
  const rhythm = sections.map((sec, i): RhythmItem => ({
    kind: sec.type === 'verse' || sec.type === 'stat' ? 'flex' : sec.type === 'cta' ? 'end' : 'text',
    chars: skipLead && i === 0 ? 0 : textLength(sec),
    rank: sec.type === 'stat' ? 1 : 0,
  }));
  const withoutScene = bigFlexIndexes(rhythm, [midAt]);
  const verseCarries = [...withoutScene].some((i) => sections[i].type === 'verse');
  const sceneAt = scene && !verseCarries ? (h2Indexes[0] ?? -1) : -1;
  const bigFlex = sceneAt === -1 ? withoutScene : bigFlexIndexes(rhythm, [sceneAt, midAt]);
  const ids = headingIds(sections);

  // Heading margins (both sides) are !important so they beat the wrapper's space-y; the first block after a heading sits 16 px under it.
  return (
    <div className="post-prose space-y-[22px] min-[1180px]:space-y-6 [&>:is(h2,h3)+*:not(h2,h3)]:!mt-0">
      {sections.map((section, i) => {
        const block = (() => {
          switch (section.type) {
            case 'heading': {
              const Tag = section.level === 2 ? 'h2' : 'h3';
              const size =
                section.level === 2
                  ? 'text-[26px] leading-[1.25] md:text-[29px] min-[1180px]:text-[32px] min-[1180px]:leading-[1.2] !mt-14 !mb-4'
                  : 'text-[21px] leading-[1.3] md:text-[22px] min-[1180px]:text-[23px] !mt-9 !mb-2';
              return (
                <Tag id={ids[i]} className={`${size} scroll-mt-24 font-bold tracking-tight text-white`}>
                  {section.text}
                </Tag>
              );
            }

            case 'paragraph':
              return (
                <div className={`text-white/80 ${BODY}`}>
                  <Markdown text={section.text} />
                </div>
              );

            case 'callout':
              if (skipLead && i === 0) return null;
              return <Callout section={section} />;

            case 'tip':
              return (
                <div className={`my-6 flex gap-3 ${CALLOUT_PAD} rounded-xl border-l-4 border-brand bg-surface-card sm:gap-4`}>
                  <IconTile name="tip" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-widest text-brand font-bold mb-2">Tip</p>
                    <div className={`text-white/85 ${BODY}`}>
                      <Markdown text={section.content} />
                    </div>
                  </div>
                </div>
              );

            case 'highlight':
              return (
                <div className={`my-6 flex gap-3 ${CALLOUT_PAD} rounded-xl border border-brand/20 bg-brand/10 sm:gap-4`}>
                  <IconTile name="highlight" />
                  <div className={`min-w-0 flex-1 text-white/90 ${BODY}`}>
                    <Markdown text={section.content} />
                  </div>
                </div>
              );

            case 'important':
              return (
                <div className={`my-6 flex gap-3 ${CALLOUT_PAD} rounded-xl border-l-4 border-yellow-500/70 bg-surface-card sm:gap-4`}>
                  <IconTile name="important" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-widest text-yellow-400 font-bold mb-2">Important</p>
                    <div className={`text-white/85 ${BODY}`}>
                      <Markdown text={section.content} />
                    </div>
                  </div>
                </div>
              );

            case 'stat':
              return (
                <StatBlock
                  section={section}
                  quiet={!bigFlex.has(i)}
                  className={`my-6 p-6 rounded-2xl bg-surface-card border border-surface-border text-center ${BREAKOUT}`}
                />
              );

            case 'steps':
              // A numbered rail: the steps are a real sequence, so a line runs from badge to badge.
              return (
                <ol className="my-4 list-none pl-0">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="relative flex items-start gap-4 pb-5 last:pb-0">
                      {idx < section.items.length - 1 && (
                        <span aria-hidden="true" className="absolute bottom-0 left-4 top-9 -ml-px w-0.5 rounded-full bg-brand/45" />
                      )}
                      <span className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-ink">
                        {idx + 1}
                      </span>
                      <div className={`text-white/85 ${BODY} pt-0.5 flex-1 min-w-0`}>
                        <Markdown text={item} />
                      </div>
                    </li>
                  ))}
                </ol>
              );

            case 'list': {
              // Items that start with a bold label ("**Widget:** text") render as icon rows (2026-11-18 design pass).
              const rows = leadItems(section.items);
              if (rows) {
                return (
                  <ul className="post-keylist my-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                    {rows.map((row, idx) => {
                      const RowIcon = pickIcon(row.label, row.text);
                      return (
                        <li key={idx} className="flex gap-4 border-t border-white/[0.07] p-4 first:border-t-0 md:gap-5 md:px-6 md:py-5">
                          <span
                            aria-hidden="true"
                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-inset ring-brand/30"
                          >
                            <RowIcon className="h-5 w-5" strokeWidth={1.75} />
                          </span>
                          <div className="min-w-0 flex-1">
                            {row.label && (
                              <div className="text-[17px] font-bold leading-snug text-white md:text-[18px] [&_strong]:font-bold">
                                <Markdown text={row.label} />
                              </div>
                            )}
                            {row.text && (
                              <div className={`${row.label ? 'mt-1' : ''} text-[16px] leading-[1.6] text-white/75 md:text-[17px]`}>
                                <Markdown text={row.text} />
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                );
              }
              return (
                <ul className="my-4 space-y-2 list-disc list-outside pl-6 marker:text-brand">
                  {section.items.map((item, idx) => (
                    <li key={idx} className={`text-white/85 ${BODY} pl-1`}>
                      <Markdown text={item} />
                    </li>
                  ))}
                </ul>
              );
            }

            case 'verse':
              return bigFlex.has(i) ? <VerseCard section={section} /> : <VerseQuote section={section} />;

            case 'cta':
              if (isPost) {
                // The post's own closing copy, as an install card (no price line: no pricing on the website).
                return (
                  <AppNudge
                    placement="end"
                    campaign={CAMPAIGNS.blogEnd}
                    title={section.title}
                    description={section.description}
                    className="my-10"
                  />
                );
              }
              // Guide pages keep the plain closing block; it is not an install card, so it hides the sticky bar.
              return (
                <div
                  data-hides-sticky
                  className="my-10 p-8 rounded-3xl bg-gradient-to-br from-brand/20 to-brand-dark/10 border border-brand/30 text-center"
                >
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-3">{section.title}</h3>
                  <p className="text-white/80 mb-6 max-w-xl mx-auto">{section.description}</p>
                  <div className="flex justify-center">
                    <AppStoreButton href={appStoreUrl(CAMPAIGNS.pillar)} theme="light" size="lg" />
                  </div>
                </div>
              );

            default:
              return null;
          }
        })();

        return (
          <Fragment key={i}>
            {i === sceneAt && scene}
            {i === midAt && <AppNudge placement="mid" campaign={CAMPAIGNS.blogMid} className="!mt-10 mb-10" />}
            {block}
          </Fragment>
        );
      })}
    </div>
  );
}
