import type { BlogSection } from '../types/blog';

/** URL-safe slug of a heading's text. */
function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'section';
}

/**
 * Stable, unique id for every heading section, by section index (undefined for other blocks). Repeats get a -2, -3
 * suffix. The renderer puts these on the h2/h3 elements and the table of contents links to them, so both read this.
 */
export function headingIds(sections: BlogSection[]): (string | undefined)[] {
  const seen = new Map<string, number>();
  return sections.map((sec) => {
    if (sec.type !== 'heading') return undefined;
    const base = slugify(sec.text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

export interface TocEntry {
  id: string;
  text: string;
}

/** Table of contents entries: the H2 headings, at most `max` of them. */
export function tocEntries(sections: BlogSection[], max = 14): TocEntry[] {
  const ids = headingIds(sections);
  const out: TocEntry[] = [];
  sections.forEach((sec, i) => {
    if (sec.type === 'heading' && sec.level === 2 && out.length < max) out.push({ id: ids[i]!, text: sec.text });
  });
  return out;
}
