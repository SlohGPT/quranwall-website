import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';
import StarPattern from './ui/StarPattern';
import { glassCardClass } from './ui/GlassCard';

const steps = [
    {
        number: '01',
        title: 'Download',
        description: 'Get QuranWall from the App Store. The download is free, with an in-app subscription.',
    },
    {
        number: '02',
        title: 'Personalize',
        description: 'Pick a translation, a background (a preset or your own photo), and your font and colours.',
    },
    {
        number: '03',
        title: 'Transform',
        description: 'An ayah appears on your Lock Screen wallpaper and Home Screen widget.',
    },
];

// The verses keep their exact text and references. `tone` only picks a drawn background that echoes the
// app's wallpapers (indigo night, emerald, dusk, plum); there are no photos.
const screenshots = [
    {
        id: 1,
        title: 'Lock Screen Quran',
        tone: 'from-[#241a52] via-[#1b1445] to-[#120d30]',
        glow: 'rgba(120,110,255,0.22)',
        quote: '"Indeed, with hardship [will be] ease."',
        sub: 'Quran 94:6 (Sahih International)'
    },
    {
        id: 2,
        title: 'Beautiful Wallpapers',
        tone: 'from-[#0f4a3d] via-[#0b3a31] to-[#082820]',
        glow: 'rgba(52,211,153,0.18)',
        quote: '"Unquestionably, by the remembrance of Allah hearts are assured."',
        sub: 'Quran 13:28 (Sahih International)'
    },
    {
        id: 3,
        title: 'Nature & Faith',
        tone: 'from-[#6b3a2a] via-[#4a2a45] to-[#2a1c4a]',
        glow: 'rgba(251,191,36,0.20)',
        quote: '"And when you have decided, then rely upon Allah."',
        sub: 'Quran 3:159 (Sahih International)'
    },
    {
        id: 4,
        title: 'Peaceful Moments',
        tone: 'from-[#2c1c58] via-[#2a1850] to-[#1a1038]',
        glow: 'rgba(217,185,104,0.18)',
        quote: '"Allah does not charge a soul except [with that within] its capacity."',
        sub: 'Quran 2:286 (Sahih International)'
    },
];

export default function HowItWorksAndPreview() {
    return (
        <section id="how-it-works" className="section-space relative overflow-hidden bg-gradient-to-b from-surface via-surface-elevated to-surface">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/3 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(217,185,104,0.08),transparent)]" />
            <StarPattern opacity={0.025} fade="right" />

            <div className="container-main relative z-10">
                <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">

                    {/* LEFT COLUMN: How It Works */}
                    <div>
                        <SectionHeading eyebrow="How It Works" title="From the App Store" muted="to your Lock Screen" />

                        <ol className="relative mt-12 space-y-10 sm:mt-14">
                            {/* progression line behind the number badges */}
                            <div aria-hidden="true" className="absolute bottom-6 left-[27px] top-6 w-px bg-gradient-to-b from-brand/60 via-brand/20 to-transparent" />

                            {steps.map((step, i) => (
                                <li key={step.number}>
                                    <Reveal delay={i * 0.12} y={16} className="group relative flex items-start gap-5 sm:gap-6">
                                        <div className="relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-brand/40 bg-surface-elevated shadow-[0_0_0_6px_#2C1C58,0_0_24px_rgba(217,185,104,0.15)] transition-colors duration-300 group-hover:border-brand">
                                            <span className="text-lg font-bold tracking-wide text-brand">{step.number}</span>
                                        </div>
                                        <div className="pt-1">
                                            <h3 className="mb-1.5 text-xl font-bold text-white sm:text-2xl">{step.title}</h3>
                                            <p className="max-w-sm text-base leading-relaxed text-white/60 sm:text-lg">{step.description}</p>
                                        </div>
                                    </Reveal>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* RIGHT COLUMN: Preview, verses styled like the app's Lock Screen text */}
                    <div>
                        <Reveal>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Preview</p>
                            <h3 className="mb-8 text-2xl font-bold text-white sm:text-3xl">See it in action</h3>
                        </Reveal>

                        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                            {screenshots.map((shot, i) => (
                                <li key={shot.id} className={i % 2 === 1 ? 'sm:translate-y-8' : ''}>
                                    <Reveal delay={i * 0.1}>
                                        <figure
                                            className={`${glassCardClass} group relative flex min-h-[15rem] flex-col justify-between overflow-hidden bg-gradient-to-b ${shot.tone} p-6 transition duration-300 hover:-translate-y-0.5 hover:border-brand/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[18rem] sm:p-7`}
                                        >
                                            <div
                                                aria-hidden="true"
                                                className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full"
                                                style={{ background: `radial-gradient(closest-side, ${shot.glow}, transparent)` }}
                                            />
                                            <figcaption className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                                                {shot.title}
                                            </figcaption>
                                            <blockquote className="relative my-6">
                                                <p className="font-serif text-lg font-medium leading-relaxed text-white sm:text-xl">
                                                    {shot.quote}
                                                </p>
                                                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-light">
                                                    {shot.sub}
                                                </p>
                                            </blockquote>
                                        </figure>
                                    </Reveal>
                                </li>
                            ))}
                        </ul>
                        {/* room for the staggered second column */}
                        <div aria-hidden="true" className="hidden h-8 sm:block" />
                    </div>

                </div>
            </div>
        </section>
    );
}
