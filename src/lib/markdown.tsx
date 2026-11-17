import { createElement, Fragment, type ReactElement, type ReactNode } from 'react';

/**
 * A small dependency-free Markdown renderer for blog text fields (replaces react-markdown + remark-gfm, ~40 KB gzip).
 *
 * Inline: paragraphs, soft and hard breaks, **bold**, *italic*, ~~strike~~, `code`, [links](url "title"), <autolinks>,
 * bare http(s) URLs, backslash escapes, a few HTML entities.
 * Blocks: paragraphs, # headings, > blockquotes, - / 1. lists (nested, tight or loose), GFM pipe tables, --- rules.
 * Not supported on purpose: raw HTML, fenced code, setext headings, reference links, images (posts use their own
 * image section type).
 *
 * Output matches what react-markdown produced for the existing posts: blocks are joined by a "\n" text node and a
 * soft line break stays a "\n" inside the paragraph.
 */

type Kids = { children?: ReactNode };
export interface MdComponents {
  a?: (p: Kids & { href: string }) => ReactElement;
  p?: (p: Kids) => ReactElement;
  strong?: (p: Kids) => ReactElement;
  em?: (p: Kids) => ReactElement;
  del?: (p: Kids) => ReactElement;
  code?: (p: Kids) => ReactElement;
  h?: (p: Kids & { level: number }) => ReactElement;
  ul?: (p: Kids) => ReactElement;
  ol?: (p: Kids & { start?: number }) => ReactElement;
  li?: (p: Kids) => ReactElement;
  blockquote?: (p: Kids) => ReactElement;
  hr?: () => ReactElement;
  /** `label` is the plain text of the header cells, for an aria-label. */
  table?: (p: Kids & { label: string }) => ReactElement;
  thead?: (p: Kids) => ReactElement;
  tbody?: (p: Kids) => ReactElement;
  tr?: (p: Kids) => ReactElement;
  th?: (p: Kids & { align?: Align }) => ReactElement;
  td?: (p: Kids & { align?: Align }) => ReactElement;
}
type Align = 'left' | 'right' | 'center';

const tag =
  (name: string) =>
  ({ children }: Kids) =>
    createElement(name, null, children);

const DEFAULTS: Required<MdComponents> = {
  a: ({ href, children }) => createElement('a', { href }, children),
  p: tag('p'),
  strong: tag('strong'),
  em: tag('em'),
  del: tag('del'),
  code: tag('code'),
  h: ({ level, children }) => createElement(`h${level}`, null, children),
  ul: tag('ul'),
  ol: ({ start, children }) => createElement('ol', start && start !== 1 ? { start } : null, children),
  li: tag('li'),
  blockquote: tag('blockquote'),
  hr: () => createElement('hr'),
  table: ({ children }) => createElement('table', null, children),
  thead: tag('thead'),
  tbody: tag('tbody'),
  tr: tag('tr'),
  th: ({ align, children }) => createElement('th', align ? { style: { textAlign: align } } : null, children),
  td: ({ align, children }) => createElement('td', align ? { style: { textAlign: align } } : null, children),
};

type Ctx = Required<MdComponents>;
const el = <P extends object>(C: (p: P) => ReactElement, props: P, key: number, children?: ReactNode) =>
  createElement(C as (p: P & Kids) => ReactElement, { ...props, key } as P & Kids, children);

// ---------------------------------------------------------------------------------------------------- inline

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '\u00a9', reg: '\u00ae', trade: '\u2122',
  mdash: '\u2014', ndash: '\u2013', hellip: '\u2026', middot: '\u00b7', lsquo: '\u2018', rsquo: '\u2019',
  ldquo: '\u201c', rdquo: '\u201d', laquo: '\u00ab', raquo: '\u00bb',
};
const SAFE_URL = /^(https?|ircs?|mailto|xmpp):/i;

/** react-markdown's default URL policy: relative URLs and a short protocol allow-list, anything else becomes empty. */
function safeUrl(url: string): string {
  const colon = url.indexOf(':');
  const cut = ['?', '#', '/'].map((c) => url.indexOf(c)).filter((n) => n >= 0);
  if (colon < 0 || cut.some((n) => n < colon) || SAFE_URL.test(url)) return url;
  return '';
}

const isSpace = (c: string | undefined) => c === undefined || /\s/.test(c);
const isPunct = (c: string | undefined) => c !== undefined && /[!-/:-@[-`{-~]/.test(c);
const isWord = (c: string | undefined) => c !== undefined && /[\p{L}\p{N}]/u.test(c);

/** Index just past the code span that opens at `i` (a backtick run), or -1 when it never closes. */
function codeSpanEnd(s: string, i: number): number {
  let n = 0;
  while (s[i + n] === '`') n++;
  let j = i + n;
  while (j < s.length) {
    if (s[j] !== '`') {
      j++;
      continue;
    }
    let m = 0;
    while (s[j + m] === '`') m++;
    if (m === n) return j + m;
    j += m;
  }
  return -1;
}

/** `[text](dest "title")` starting at `i`: the closing bracket, destination and end index. */
function matchLink(s: string, i: number): { text: string; href: string; end: number } | null {
  let depth = 0;
  let j = i;
  for (; j < s.length; j++) {
    const ch = s[j];
    if (ch === '\\') j++;
    else if (ch === '`') {
      const e = codeSpanEnd(s, j);
      if (e > 0) j = e - 1;
    } else if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) break;
  }
  if (j >= s.length || s[j + 1] !== '(') return null;
  const text = s.slice(i + 1, j);
  let k = j + 2;
  while (/\s/.test(s[k] ?? '')) k++;
  let href = '';
  if (s[k] === '<') {
    const e = s.indexOf('>', k);
    if (e < 0) return null;
    href = s.slice(k + 1, e);
    k = e + 1;
  } else {
    let parens = 0;
    const start = k;
    for (; k < s.length; k++) {
      const ch = s[k];
      if (ch === '\\') k++;
      else if (ch === '(') parens++;
      else if (ch === ')') {
        if (parens === 0) break;
        parens--;
      } else if (/\s/.test(ch)) break;
    }
    href = s.slice(start, k);
  }
  while (/\s/.test(s[k] ?? '')) k++;
  if (s[k] === '"' || s[k] === "'" || s[k] === '(') {
    const close = s[k] === '(' ? ')' : s[k];
    const e = s.indexOf(close, k + 1);
    if (e < 0) return null;
    k = e + 1;
    while (/\s/.test(s[k] ?? '')) k++;
  }
  if (s[k] !== ')') return null;
  href = href.replace(/\\([!-/:-@[-`{-~])/g, '$1');
  return { text, href, end: k + 1 };
}

/** Where the emphasis that opened with `m` markers of `c` closes, starting the search at `from`. -1 if it doesn't. */
function findClose(s: string, from: number, c: string, m: number): number {
  for (let j = from; j < s.length; j++) {
    const ch = s[j];
    if (ch === '\\') {
      j++;
      continue;
    }
    if (ch === '`') {
      const e = codeSpanEnd(s, j);
      if (e > 0) j = e - 1;
      continue;
    }
    if (ch !== c) continue;
    let L = 0;
    while (s[j + L] === c) L++;
    const prev = s[j - 1];
    const next = s[j + L];
    const canClose = !isSpace(prev) && (c === '*' || !isWord(next)) && j > from;
    const canOpen = !isSpace(next) && (isSpace(prev) || isPunct(prev) || c === '*') && !canClose;
    if (canClose && L >= m) return j;
    if (canOpen) {
      const inner = findClose(s, j + L, c, L >= 2 ? 2 : 1);
      if (inner >= 0) {
        j = inner + (L >= 2 ? 2 : 1) - 1;
        continue;
      }
    }
    j += L - 1;
  }
  return -1;
}

function inline(s: string, c: Ctx): ReactNode[] {
  const out: ReactNode[] = [];
  let buf = '';
  let key = 0;
  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = '';
    }
  };
  const push = (node: ReactNode) => {
    flush();
    out.push(node);
  };
  const wrap = <P extends object>(C: (p: P & Kids) => ReactElement, props: P, inner: string) =>
    push(el(C as (p: P) => ReactElement, props, key++, inline(inner, c)));

  let i = 0;
  while (i < s.length) {
    const ch = s[i];

    if (ch === '\\') {
      const n = s[i + 1];
      if (n === '\n') {
        push(createElement('br', { key: key++ }));
        buf += '\n';
        i += 2;
        while (s[i] === ' ') i++;
      } else if (n !== undefined && isPunct(n)) {
        buf += n;
        i += 2;
      } else {
        buf += ch;
        i++;
      }
      continue;
    }

    if (ch === '`') {
      const e = codeSpanEnd(s, i);
      let n = 0;
      while (s[i + n] === '`') n++;
      if (e > 0) {
        let code = s.slice(i + n, e - n).replace(/\n/g, ' ');
        if (code.length > 2 && code.startsWith(' ') && code.endsWith(' ') && code.trim()) code = code.slice(1, -1);
        push(el(c.code, {}, key++, code));
        i = e;
      } else {
        buf += '`'.repeat(n);
        i += n;
      }
      continue;
    }

    if (ch === '[') {
      const l = matchLink(s, i);
      if (l) {
        push(el(c.a, { href: safeUrl(l.href) }, key++, inline(l.text, c)));
        i = l.end;
        continue;
      }
    }

    if (ch === '<') {
      const m = /^<([A-Za-z][A-Za-z0-9+.-]{1,31}:[^\s<>]*)>/.exec(s.slice(i));
      if (m) {
        push(el(c.a, { href: safeUrl(m[1]) }, key++, m[1]));
        i += m[0].length;
        continue;
      }
    }

    if (ch === '&') {
      const m = /^&(#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-z]+);/.exec(s.slice(i, i + 12));
      if (m) {
        const v = m[1];
        const decoded = v[0] === '#' ? String.fromCodePoint(v[1].toLowerCase() === 'x' ? parseInt(v.slice(2), 16) : +v.slice(1)) : ENTITIES[v];
        if (decoded) {
          buf += decoded;
          i += m[0].length;
          continue;
        }
      }
    }

    if (ch === '\n') {
      const hard = / {2,}$/.test(buf);
      buf = buf.replace(/ +$/, '');
      if (hard) push(createElement('br', { key: key++ }));
      buf += '\n';
      i++;
      while (s[i] === ' ') i++;
      continue;
    }

    if (ch === '~' && s[i + 1] === '~' && !isSpace(s[i + 2])) {
      const e = s.indexOf('~~', i + 2);
      if (e > 0 && !isSpace(s[e - 1])) {
        wrap(c.del, {}, s.slice(i + 2, e));
        i = e + 2;
        continue;
      }
    }

    if (ch === '*' || ch === '_') {
      let n = 0;
      while (s[i + n] === ch) n++;
      const prev = s[i - 1];
      const next = s[i + n];
      const canOpen = !isSpace(next) && (ch === '*' || !isWord(prev));
      if (canOpen) {
        let m = Math.min(n, 3);
        let close = -1;
        for (; m >= 1; m--) {
          close = findClose(s, i + n, ch, m);
          if (close >= 0) break;
        }
        if (close >= 0) {
          buf += ch.repeat(n - m);
          const inner = s.slice(i + n, close);
          if (m === 3) push(el(c.em, {}, key++, el(c.strong, {}, 0, inline(inner, c))));
          else if (m === 2) wrap(c.strong, {}, inner);
          else wrap(c.em, {}, inner);
          i = close + m;
          continue;
        }
      }
      buf += ch.repeat(n);
      i += n;
      continue;
    }

    // GFM bare URL: http(s)://... up to whitespace, minus trailing punctuation and an unbalanced ")".
    if (ch === 'h' && !isWord(s[i - 1]) && /^https?:\/\/[^\s<]/.test(s.slice(i, i + 9))) {
      let end = i;
      while (end < s.length && !/[\s<]/.test(s[end])) end++;
      let url = s.slice(i, end);
      for (;;) {
        const last = url[url.length - 1];
        if (/[?!.,:*_~'";]/.test(last)) url = url.slice(0, -1);
        else if (last === ')' && (url.match(/\)/g) ?? []).length > (url.match(/\(/g) ?? []).length) url = url.slice(0, -1);
        else break;
      }
      push(el(c.a, { href: url }, key++, url));
      i += url.length;
      continue;
    }

    buf += ch;
    i++;
  }
  flush();
  return out;
}

function plainText(nodes: ReactNode): string {
  if (typeof nodes === 'string') return nodes;
  if (Array.isArray(nodes)) return nodes.map(plainText).join('');
  if (nodes && typeof nodes === 'object' && 'props' in nodes) return plainText((nodes as ReactElement<Kids>).props.children);
  return '';
}

// ----------------------------------------------------------------------------------------------------- blocks

const HEADING = /^ {0,3}(#{1,6})(?: +|$)(.*?)(?: +#+)? *$/;
const QUOTE = /^ {0,3}>/;
const RULE = /^ {0,3}([-*_])(?: *\1){2,} *$/;
const ITEM = /^( {0,3})([-*+]|\d{1,9}[.)])( +|$)/;
const TABLE_RULE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

/** mdast-to-hast puts a "\n" text node before, between and after the children of lists, quotes and tables. */
const nl = (nodes: ReactNode[]): ReactNode[] => ['\n', ...nodes.flatMap((n) => [n, '\n'])];

const blank = (l: string) => !l.trim();
const indentOf = (l: string) => /^ */.exec(l)![0].length;

/** A line that can interrupt a paragraph. */
function startsBlock(l: string): boolean {
  if (HEADING.test(l) || QUOTE.test(l) || RULE.test(l)) return true;
  const m = ITEM.exec(l);
  return !!m && l.slice(m[0].length).trim() !== '' && (/^[-*+]/.test(m[2]) || m[2].startsWith('1'));
}

function splitRow(line: string): string[] {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1);
  const cells: string[] = [];
  let cur = '';
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '\\' && t[i + 1] === '|') {
      cur += '|';
      i++;
    } else if (t[i] === '|') {
      cells.push(cur.trim());
      cur = '';
    } else cur += t[i];
  }
  cells.push(cur.trim());
  return cells;
}

function blocks(lines: string[], c: Ctx): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const add = (node: ReactNode) => {
    if (out.length) out.push('\n');
    out.push(node);
  };

  while (i < lines.length) {
    const line = lines[i];
    if (blank(line)) {
      i++;
      continue;
    }

    const h = HEADING.exec(line);
    if (h) {
      add(el(c.h, { level: h[1].length }, key++, inline(h[2], c)));
      i++;
      continue;
    }

    if (RULE.test(line)) {
      add(createElement(c.hr, { key: key++ }));
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && !blank(lines[i]) && (QUOTE.test(lines[i]) || inner.length)) {
        if (!QUOTE.test(lines[i]) && startsBlock(lines[i])) break;
        inner.push(lines[i].replace(/^ {0,3}> ?/, ''));
        i++;
      }
      add(el(c.blockquote, {}, key++, nl(blocks(inner, c).filter((k) => k !== '\n'))));
      continue;
    }

    const item = ITEM.exec(line);
    if (item) {
      const ordered = /\d/.test(item[2]);
      const marker = ordered ? item[2].slice(-1) : item[2];
      const start = ordered ? parseInt(item[2], 10) : undefined;
      const items: string[][] = [];
      let loose = false;
      while (i < lines.length) {
        const m = ITEM.exec(lines[i]);
        if (!m || /\d/.test(m[2]) !== ordered || (ordered ? m[2].slice(-1) : m[2]) !== marker) break;
        const spaces = m[3].length > 4 || m[3].length === 0 ? 1 : m[3].length;
        const width = m[1].length + m[2].length + spaces;
        const body = [lines[i].slice(width)];
        i++;
        let sawBlank = false;
        while (i < lines.length) {
          const l = lines[i];
          if (blank(l)) {
            let k = i;
            while (k < lines.length && blank(lines[k])) k++;
            if (k < lines.length && indentOf(lines[k]) >= width) {
              for (; i < k; i++) body.push('');
              sawBlank = true;
              continue;
            }
            break;
          }
          if (indentOf(l) >= width) body.push(l.slice(width));
          else if (!sawBlank && body.length && !blank(body[body.length - 1]) && !startsBlock(l) && !ITEM.test(l)) body.push(l.trim());
          else break;
          i++;
        }
        if (sawBlank) loose = true;
        items.push(body);
        let k = i;
        while (k < lines.length && blank(lines[k])) k++;
        const nm = k < lines.length ? ITEM.exec(lines[k]) : null;
        if (nm && /\d/.test(nm[2]) === ordered && (ordered ? nm[2].slice(-1) : nm[2]) === marker) {
          if (k > i) loose = true;
          i = k;
        }
      }
      const lis = items.map((body, n) => {
        const kids = blocks(body, c);
        const first = kids[0];
        // Tight list: a leading paragraph is shown as bare inline content.
        const tight = !loose && first && typeof first === 'object' && 'type' in first && (first as ReactElement).type === c.p;
        const nodes = tight
          ? [...(((first as ReactElement<Kids>).props.children as ReactNode[]) ?? []), ...kids.slice(1), ...(kids.length > 1 ? ['\n'] : [])]
          : nl(kids.filter((k) => k !== '\n'));
        return el(c.li, {}, n, nodes);
      });
      add(ordered ? el(c.ol, { start }, key++, nl(lis)) : el(c.ul, {}, key++, nl(lis)));
      continue;
    }

    // GFM table: a header row, then a delimiter row with the same number of cells.
    if (line.includes('|') && i + 1 < lines.length && TABLE_RULE.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = splitRow(line);
      const rule = splitRow(lines[i + 1]);
      if (head.length === rule.length) {
        const aligns = rule.map((r): Align | undefined => {
          const l = r.startsWith(':');
          const rt = r.endsWith(':');
          return l && rt ? 'center' : rt ? 'right' : l ? 'left' : undefined;
        });
        const label = head.map((h) => plainText(inline(h, c)).trim()).filter(Boolean);
        const rows: string[][] = [];
        i += 2;
        while (i < lines.length && !blank(lines[i]) && !startsBlock(lines[i])) {
          const cells = splitRow(lines[i]);
          rows.push(head.map((_, n) => cells[n] ?? ''));
          i++;
        }
        const cell = (C: typeof c.th, text: string, n: number) => el(C, { align: aligns[n] }, n, inline(text, c));
        const thead = el(c.thead, {}, 0, el(c.tr, {}, 0, head.map((t, n) => cell(c.th, t, n))));
        const tbody = rows.length ? el(c.tbody, {}, 1, rows.map((r, ri) => el(c.tr, {}, ri, r.map((t, n) => cell(c.td, t, n))))) : null;
        add(el(c.table, { label: label.length ? `Table: ${label.join(', ')}` : 'Table' }, key++, tbody ? [thead, tbody] : [thead]));
        continue;
      }
    }

    // Paragraph: runs until a blank line or a line that starts another block.
    const para = [line.replace(/^ +/, '')];
    i++;
    while (i < lines.length && !blank(lines[i]) && !startsBlock(lines[i])) {
      para.push(lines[i].replace(/^ +/, ''));
      i++;
    }
    add(el(c.p, {}, key++, inline(para.join('\n').replace(/ +$/, ''), c)));
  }
  return out;
}

/** Render Markdown text to React elements. `components` styles individual elements; unset ones are plain HTML tags. */
export function renderMarkdown(text: string, components: MdComponents = {}): ReactElement {
  const c: Ctx = { ...DEFAULTS, ...components } as Ctx;
  return createElement(Fragment, null, ...blocks(text.replace(/\r\n?/g, '\n').split('\n'), c));
}
