import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { CLUSTER_LABEL, listingsByCluster } from '../lib/clusters';
import { useInView } from '../lib/inview';
import { starPath, GOLD } from './visuals/primitives';

/**
 * The blog hub drawn as a diagram: the hub as a khatam star in the middle, each topic around it, each post a node
 * on the outer ring. Every node is a real HTML link (to the post, or to the topic's section on this page), so the
 * text is crawlable. One DOM, two layouts: from 1024 px a radial map (nodes absolutely placed over an SVG of thin
 * lines, in the same 960x560 coordinates); below that a horizontal mini-map, a swipeable row of topic cards.
 */
const W = 960;
const H = 560;
const CX = W / 2;
const CY = H / 2;
const pct = (v: number, of: number) => `${Math.round((v / of) * 1000) / 10}%`;
const at = (rx: number, ry: number, deg: number) => ({
  x: CX + rx * Math.cos((deg * Math.PI) / 180),
  y: CY + ry * Math.sin((deg * Math.PI) / 180),
});

const groups = listingsByCluster();
const nodes = groups.map((g, i) => {
  const deg = -90 + (i * 360) / groups.length;
  const hub = at(185, 138, deg);
  const spread = 27;
  const posts = g.posts.map((p, k) => ({ ...p, ...at(345, 232, deg + (k - (g.posts.length - 1) / 2) * spread) }));
  // The line to the hub starts at the star's edge, not at its centre.
  const len = Math.hypot(hub.x - CX, hub.y - CY);
  const edge = { x: CX + ((hub.x - CX) / len) * 60, y: CY + ((hub.y - CY) / len) * 60 };
  return { ...g, ...hub, edge, posts };
});

const pos = (x: number, y: number) => ({ '--x': pct(x, W), '--y': pct(y, H) }) as CSSProperties;
const NODE = 'lg:absolute lg:left-[var(--x)] lg:top-[var(--y)] lg:-translate-x-1/2 lg:-translate-y-1/2';
const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

export default function ClusterMap() {
  const ref = useInView<HTMLDivElement>();
  return (
    <section aria-labelledby="topic-map" className="my-8 md:my-14">
      <h2 id="topic-map" className="sr-only">
        Blog topic map
      </h2>
      <div ref={ref} className="relative lg:mx-auto lg:aspect-[960/560] lg:max-w-[960px]">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 hidden h-full w-full lg:block"
          fill="none"
          stroke={GOLD}
          strokeLinecap="round"
          strokeWidth="1.5"
        >
          <ellipse cx={CX} cy={CY} rx="185" ry="138" strokeOpacity=".15" strokeDasharray="2 8" />
          <ellipse cx={CX} cy={CY} rx="345" ry="232" strokeOpacity=".15" strokeDasharray="2 8" />
          {nodes.map((n) => (
            <g key={n.cluster} strokeOpacity=".4">
              <path d={`M${n.edge.x.toFixed(1)} ${n.edge.y.toFixed(1)}L${n.x} ${n.y}`} />
              {n.posts.map((p) => (
                <path key={p.slug} d={`M${n.x} ${n.y}L${p.x} ${p.y}`} strokeOpacity=".7" />
              ))}
            </g>
          ))}
        </svg>

        <a
          href="#all"
          className={`hidden h-[112px] w-[112px] items-center justify-center rounded-full text-[14px] font-bold text-white lg:absolute lg:left-1/2 lg:top-1/2 lg:flex lg:-translate-x-1/2 lg:-translate-y-1/2 ${FOCUS}`}
        >
          <svg aria-hidden="true" focusable="false" viewBox="0 0 112 112" className="qa-loop qa-glow absolute inset-0 h-full w-full" fill="rgba(217,185,104,.15)" stroke={GOLD} strokeWidth="2" strokeLinejoin="round">
            <path d={starPath(56, 56, 54)} />
          </svg>
          <span className="relative max-w-[64px] text-center leading-tight">All posts</span>
        </a>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scroll-px-4 sm:scroll-px-6 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:contents [&::-webkit-scrollbar]:hidden">
          {nodes.map((n) => (
            <li
              key={n.cluster}
              className="relative w-[236px] shrink-0 snap-start rounded-2xl border border-surface-border bg-surface-card p-3 lg:contents"
            >
              <a
                href={`#${n.cluster}`}
                style={pos(n.x, n.y)}
                className={`flex min-h-[44px] items-center gap-2 text-[15px] font-bold text-white hover:text-brand lg:z-[1] lg:min-h-0 lg:whitespace-nowrap lg:rounded-full lg:border lg:border-brand/50 lg:bg-surface-elevated lg:px-4 lg:py-2 ${NODE} ${FOCUS}`}
              >
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="rgba(217,185,104,.15)" stroke={GOLD} strokeWidth="1.5" strokeLinejoin="round">
                  <path d={starPath(12, 12, 10)} />
                </svg>
                {CLUSTER_LABEL[n.cluster]}
              </a>
              <ul className="mt-1 space-y-1 border-l border-brand/30 pl-3 lg:contents">
                {n.posts.map((p) => (
                  <li key={p.slug} className="lg:contents">
                    <Link
                      to={`/blog/${p.slug}`}
                      style={pos(p.x, p.y)}
                      className={`flex min-h-[44px] items-center text-[14px] leading-snug text-white/85 hover:text-brand lg:z-[1] lg:min-h-0 lg:w-[150px] lg:justify-center lg:rounded-xl lg:border lg:border-white/10 lg:bg-surface lg:px-3 lg:py-2 lg:text-center lg:text-[13px] ${NODE} ${FOCUS}`}
                    >
                      <span className="line-clamp-2 lg:line-clamp-3">{p.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
