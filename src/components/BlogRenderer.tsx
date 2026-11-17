import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Lightbulb, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import AppStoreButton from './AppStoreButton';
import AppNudge from './AppNudge';
import { APP_STORE_ID, CAMPAIGNS, appStoreUrl } from '../lib/app-store';
import type { BlogSection } from '../types/blog';

/**
 * Reading measure: text blocks stop at about 68 characters per line (35rem holds 66-70 characters of DM Sans at 18 px;
 * a literal 68ch is about 770 px in this font, which is the whole column). Stats, verses and the CTA use the full column.
 */
const MEASURE = 'max-w-[35rem]';

/** Body copy: 17 px on phones, 18 px from md up, for paragraphs, list items, steps and callout text alike. */
const BODY = 'text-[17px] md:text-[18px] leading-[1.7]';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  lightbulb: Lightbulb,
  book: BookOpen,
  alert: AlertCircle,
  sparkles: Sparkles,
};

function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href = '', children }) => {
          const isInternal = href.startsWith('/') || href.startsWith('https://quranwall.com');
          const internalPath = isInternal
            ? href.replace(/^https:\/\/quranwall\.com/, '')
            : href;
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
        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
        p: ({ children }) => <p className="text-white/80">{children}</p>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
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

interface Props {
  sections: BlogSection[];
  /**
   * 'blog' = posts: a mid card and the post's closing CTA as an install card.
   * 'pillar' = guide pages: the closing CTA keeps the plain block, no mid card.
   */
  pageType?: 'blog' | 'pillar';
}

export default function BlogRenderer({ sections, pageType = 'blog' }: Props) {
  const isPost = pageType === 'blog';
  const h2Indexes = sections.flatMap((sec, i) => (sec.type === 'heading' && sec.level === 2 ? [i] : []));
  const midAt = isPost ? midCardIndex(sections, h2Indexes) : -1;

  return (
    <div className="space-y-6">
      {sections.map((section, i) => {
        const block = (() => {
          switch (section.type) {
            case 'heading': {
              const Tag = section.level === 2 ? 'h2' : 'h3';
              const size = section.level === 2 ? 'text-2xl md:text-3xl mt-10' : 'text-xl md:text-2xl mt-6';
              return <Tag className={`${size} font-bold text-white tracking-tight`}>{section.text}</Tag>;
            }

            case 'paragraph':
              return (
                <div className={`text-white/80 ${BODY} ${MEASURE}`}>
                  <Markdown text={section.text} />
                </div>
              );

            case 'callout': {
              const Icon = ICONS[section.icon || 'sparkles'] || Sparkles;
              return (
                <div className={`my-8 p-6 rounded-2xl bg-brand/10 border border-brand/30 flex gap-4 ${MEASURE}`}>
                  <Icon className="w-6 h-6 text-brand shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    {section.title && <p className="font-bold text-white text-lg mb-2">{section.title}</p>}
                    <div className={`text-white/85 ${BODY}`}>
                      <Markdown text={section.content} />
                    </div>
                  </div>
                </div>
              );
            }

            case 'tip':
              return (
                <div className={`my-6 p-5 rounded-xl bg-surface-card border-l-4 border-brand ${MEASURE}`}>
                  <p className="text-xs uppercase tracking-widest text-brand font-bold mb-2">Tip</p>
                  <div className={`text-white/85 ${BODY}`}>
                    <Markdown text={section.content} />
                  </div>
                </div>
              );

            case 'highlight':
              return (
                <div
                  className={`my-6 p-5 rounded-xl bg-gradient-to-br from-brand/15 to-brand-dark/10 border border-brand/20 ${MEASURE}`}
                >
                  <div className={`text-white/90 ${BODY}`}>
                    <Markdown text={section.content} />
                  </div>
                </div>
              );

            case 'important':
              return (
                <div className={`my-6 p-5 rounded-xl bg-surface-card border-l-4 border-yellow-500/70 ${MEASURE}`}>
                  <p className="text-xs uppercase tracking-widest text-yellow-400 font-bold mb-2">Important</p>
                  <div className={`text-white/85 ${BODY}`}>
                    <Markdown text={section.content} />
                  </div>
                </div>
              );

            case 'stat':
              return (
                <div className="my-6 p-6 rounded-2xl bg-surface-card border border-surface-border text-center">
                  <p className="text-4xl md:text-5xl font-black text-brand">{section.number}</p>
                  <p className="text-white font-semibold mt-2">{section.label}</p>
                  {section.description && <p className="text-white/60 text-sm mt-2">{section.description}</p>}
                </div>
              );

            case 'steps':
              return (
                <ol className={`my-4 space-y-3 list-none pl-0 counter-reset-steps ${MEASURE}`}>
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-brand text-brand-ink font-bold flex items-center justify-center text-sm">
                        {idx + 1}
                      </span>
                      <div className={`text-white/85 ${BODY} pt-0.5 flex-1 min-w-0`}>
                        <Markdown text={item} />
                      </div>
                    </li>
                  ))}
                </ol>
              );

            case 'list':
              return (
                <ul className={`my-4 space-y-2 list-disc list-outside pl-6 marker:text-brand ${MEASURE}`}>
                  {section.items.map((item, idx) => (
                    <li key={idx} className={`text-white/85 ${BODY} pl-1`}>
                      <Markdown text={item} />
                    </li>
                  ))}
                </ul>
              );

            case 'verse':
              return (
                <blockquote className="my-8 p-6 rounded-2xl bg-surface-card border-l-4 border-brand/60 italic">
                  <p className="text-white text-xl md:text-2xl leading-relaxed font-serif">"{section.text}"</p>
                  <footer className="mt-3 text-brand/90 text-sm font-semibold not-italic tracking-wide">
                    , {section.reference}
                  </footer>
                </blockquote>
              );

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
            {i === midAt && <AppNudge placement="mid" campaign={CAMPAIGNS.blogMid} className="!mt-10 mb-10" />}
            {block}
          </Fragment>
        );
      })}
    </div>
  );
}
