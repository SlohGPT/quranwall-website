import { Beads, Crescent, GOLD2, Lock, Phone, PLUM, SceneSvg, Star, FILL } from './primitives';

/**
 * The spot scenes: one per post (picked by slug, cluster as fallback) plus the /support header. Each sits in the
 * pointed arch. Loops are the .qa-loop classes in index.css (opacity glow, slow drift): paused until the shared
 * observer marks the figure .is-inview, off under prefers-reduced-motion.
 */

const W = 84;

/** 1. iPhone lock screen with ayah lines and a crescent above. */
function LockScreen() {
  return (
    <SceneSvg>
      <Crescent cx={160} cy={42} r={11} className="qa-loop qa-glow" />
      <Phone x={120} y={64} w={80}>
        <Lock w={80} />
      </Phone>
    </SceneSvg>
  );
}

/** 2. iPhone with a moon badge and a quiet clock. */
function Focus() {
  return (
    <SceneSvg>
      <Star cx={86} cy={96} R={7} className="qa-loop qa-glow" />
      <Star cx={236} cy={150} R={5} />
      <Phone x={118} y={50} w={W}>
        <Lock w={W} lines={false} />
        <path d="M30 108h24M30 118h16" stroke="#fff" strokeOpacity=".4" strokeWidth="2" />
      </Phone>
      <g className="qa-loop qa-drift">
        <circle cx={214} cy={72} r={20} fill={PLUM} />
        <Crescent cx={212} cy={72} r={11} className="qa-loop qa-glow" />
      </g>
    </SceneSvg>
  );
}

/** 3. A loop of tasbih beads around an iPhone. */
function Dhikr() {
  return (
    <SceneSvg>
      <g className="qa-loop qa-sway">
        <circle cx={160} cy={124} r={86} strokeOpacity=".3" strokeWidth="1" />
        <Beads cx={160} cy={124} R={86} n={28} from={-85} to={275} closed />
        <rect x={152} y={30} width={16} height={9} rx={4.5} fill={FILL} />
        <path d="M160 214v10M154 224l-3 8M160 224v9M166 224l3 8" strokeWidth="1.5" />
      </g>
      <Phone x={130} y={74} w={60}>
        <Lock w={60} clock={false} />
      </Phone>
    </SceneSvg>
  );
}

const TILES = [
  { x: 82, star: true },
  { x: 138, star: false },
  { x: 194, star: false },
];

/** 4. Beads over three plain app tiles, the first marked with a star. */
function DhikrApps() {
  return (
    <SceneSvg>
      <g className="qa-loop qa-sway" style={{ transformOrigin: '160px 150px' }}>
        <path d="M80 112A84 84 0 0 1 240 112" strokeOpacity=".3" strokeWidth="1" />
        <Beads cx={160} cy={140} R={84} n={13} from={-168} to={-12} />
      </g>
      {TILES.map((t) => (
        <g key={t.x}>
          <rect x={t.x} y={156} width={44} height={44} rx={11} fill={t.star ? 'rgba(217,185,104,.18)' : PLUM} stroke={t.star ? undefined : GOLD2} />
          {t.star ? (
            <Star cx={t.x + 22} cy={178} R={11} fill="none" className="qa-loop qa-glow" />
          ) : (
            <path d={`M${t.x + 13} 172h18M${t.x + 13} 180h12`} strokeOpacity=".6" />
          )}
        </g>
      ))}
    </SceneSvg>
  );
}

/** 5. Horizon and a rising sun behind an iPhone. */
function Morning() {
  return (
    <SceneSvg
      clipped={
        <>
          <g className="qa-loop qa-rise">
            <path d="M96 176A64 64 0 0 1 224 176Z" fill={FILL} />
            <path d="M160 92v-9M118 108l-6-6M202 108l6-6M96 150l-9-2M224 150l9-2" strokeOpacity=".7" />
          </g>
          <path d="M40 176h240" />
          <path d="M70 192h60M190 192h60M110 206h100M130 220h60" strokeOpacity=".45" />
        </>
      }
    >
      <Phone x={130} y={66} w={60}>
        <Lock w={60} clock={false} />
      </Phone>
    </SceneSvg>
  );
}

/** 6. An open mushaf on a rehal (stand), with a progress arc. No text on the pages. */
function Reading() {
  return (
    <SceneSvg>
      <circle cx={160} cy={74} r={30} strokeOpacity=".3" />
      <path d="M160 44A30 30 0 1 1 131 82" strokeWidth="3" />
      <Star cx={160} cy={74} R={11} className="qa-loop qa-glow" />
      <path d="M160 140C140 130 112 130 92 136V190C112 184 140 184 160 194ZM160 140C180 130 208 130 228 136V190C208 184 180 184 160 194Z" fill={PLUM} />
      <path d="M160 140V194" />
      <path d="M106 152c12-3 24-3 40 1M106 163c12-3 24-3 40 1M106 174c12-3 24-3 40 1M174 153c16-4 28-4 40-1M174 164c16-4 28-4 40-1M174 175c16-4 28-4 40-1" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
      <path d="M124 196l72 32M196 196l-72 32M118 228h84" />
    </SceneSvg>
  );
}

/** 7. Three iPhones fanned, the middle one in front. */
function Fan() {
  return (
    <SceneSvg>
      <g transform="rotate(-15 160 215)">
        <Phone x={129} y={74} w={62} fill={PLUM}>
          <Lock w={62} />
        </Phone>
      </g>
      <g transform="rotate(15 160 215)">
        <Phone x={129} y={74} w={62} fill={PLUM}>
          <Lock w={62} />
        </Phone>
      </g>
      <Star cx={160} cy={42} R={9} className="qa-loop qa-glow" />
      <Phone x={127} y={64} w={66}>
        <Lock w={66} />
      </Phone>
    </SceneSvg>
  );
}

const GRID = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => ({ x: 88 + c * 52, y: 70 + r * 52, k: r * 3 + c })));

/** 8. A grid of app tiles, one with a star. */
function Grid() {
  return (
    <SceneSvg>
      {GRID.map((t) => (
        <g key={t.k}>
          <rect x={t.x} y={t.y} width={40} height={40} rx={10} fill={t.k === 4 ? 'rgba(217,185,104,.18)' : PLUM} stroke={t.k === 4 ? undefined : GOLD2} />
          {t.k === 4 ? (
            <Star cx={t.x + 20} cy={t.y + 20} R={10} fill="none" className="qa-loop qa-glow" />
          ) : (
            <path d={`M${t.x + 11} ${t.y + 16}h18M${t.x + 11} ${t.y + 24}h${t.k % 2 ? 10 : 14}`} strokeOpacity=".55" />
          )}
        </g>
      ))}
    </SceneSvg>
  );
}

/** 9. /support header: an iPhone and an envelope. */
function Support() {
  return (
    <SceneSvg>
      <Star cx={236} cy={92} R={7} className="qa-loop qa-glow" />
      <Phone x={104} y={46} w={70}>
        <Lock w={70} clock={false} />
      </Phone>
      <g className="qa-loop qa-drift">
        <rect x={150} y={146} width={90} height={58} rx={8} fill={PLUM} />
        <path d="M152 150l43 31 43-31" />
        <Star cx={195} cy={190} R={5} fill="none" />
      </g>
    </SceneSvg>
  );
}

export const SCENES = {
  lockscreen: LockScreen,
  focus: Focus,
  dhikr: Dhikr,
  dhikrApps: DhikrApps,
  morning: Morning,
  reading: Reading,
  fan: Fan,
  grid: Grid,
  support: Support,
} as const;

export type SceneName = keyof typeof SCENES;
