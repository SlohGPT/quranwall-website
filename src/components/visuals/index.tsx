import { useInView } from '../../lib/inview';
import type { BlogCluster } from '../../types/blog';
import { SCENES, type SceneName } from './scenes';

/** One scene per post, picked by slug; the post's cluster is the fallback for a new slug. */
const BY_SLUG: Record<string, SceneName> = {
  'quran-verse-iphone-lock-screen': 'lockscreen',
  'quran-focus-mode-iphone': 'focus',
  'how-to-set-dhikr-reminders-iphone': 'dhikr',
  'best-dhikr-app-for-iphone': 'dhikrApps',
  'muslim-morning-routine-iphone': 'morning',
  'quran-reading-plan-app-iphone': 'reading',
  'best-islamic-lock-screen-app-iphone': 'fan',
  'best-muslim-app-for-iphone-2026': 'grid',
};

const BY_CLUSTER: Record<BlogCluster, SceneName> = {
  'daily-quran-lock-screen': 'lockscreen',
  'dua-and-dhikr-iphone': 'dhikr',
  'muslim-productivity-iphone': 'morning',
  'quran-study-tools-ios': 'reading',
  'muslim-app-comparisons': 'fan',
};

export function pickScene(slug: string, cluster: BlogCluster): SceneName {
  return BY_SLUG[slug] ?? BY_CLUSTER[cluster] ?? 'lockscreen';
}

/** A decorative scene in a fixed 4:3 box. aria-hidden: the page text carries all the meaning. */
export function Scene({ name, className = '' }: { name: SceneName; className?: string }) {
  const ref = useInView<HTMLDivElement>();
  const Svg = SCENES[name];
  return (
    <div ref={ref} aria-hidden="true" className={`qa-vis ${className}`}>
      <Svg />
    </div>
  );
}

/** Spot scene inside a post, after the opening paragraph(s). */
export default function SpotScene({ slug, cluster }: { slug: string; cluster: BlogCluster }) {
  return <Scene name={pickScene(slug, cluster)} className="mx-auto my-8 w-full max-w-[340px] md:max-w-[380px]" />;
}
