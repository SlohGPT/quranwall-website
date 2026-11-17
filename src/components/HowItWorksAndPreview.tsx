import type { ReactNode } from 'react';
import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';
import StarPattern from './ui/StarPattern';
import { glassCardClass } from './ui/GlassCard';
import { LockScreen, PhoneFrame, QuranWidget, Wallpaper } from './mockup';
import { AppStoreScreen, ChooseAyahScreen, ReviewScreen } from './mockup/AppScreens';
import { SHOWCASE_VERSES } from '../data/showcaseVerses';
import StepDiagram from './visuals/StepDiagram';

// The four beats of the real app flow. Each one is shown as a coded mini screen of the app.
const steps: { number: string; title: string; description: string; label: string; screen: ReactNode }[] = [
    {
        number: '01',
        title: 'Get QuranWall',
        description: 'Get QuranWall from the App Store. The first time, the app walks you through adding the QuranWall shortcut to Apple\'s Shortcuts app. You do this once.',
        label: 'An illustration of the QuranWall App Store page, listing the app as Quran Widget: QuranWall',
        screen: <AppStoreScreen />,
    },
    {
        number: '02',
        title: 'Choose your ayah',
        description: 'Search all 114 surahs by surah, ayah or keyword, then read it in Arabic or in a translation.',
        label: 'The QuranWall "Choose Your Ayah" screen with the Search tab open and Ash-Sharh 6 selected',
        screen: <ChooseAyahScreen />,
    },
    {
        number: '03',
        title: 'Make it yours',
        description: 'Edit the text, pick a font and a colour, check the preview, then tap Make It Mine.',
        label: 'The QuranWall review screen with the ayah text, styling options and the Make It Mine button',
        screen: <ReviewScreen />,
    },
    {
        number: '04',
        title: 'It\'s on your Lock Screen',
        description: 'The Shortcuts app sets it as your Lock Screen wallpaper and brings you back to QuranWall. Change it whenever you like.',
        label: 'An iPhone Lock Screen showing Quran 94:6 in English under the clock',
        screen: <LockScreen verse={SHOWCASE_VERSES[0]} wallpaper="night" edition="translation" />,
    },
];

const WIDGET_TITLE = 'Add the widget';
const WIDGET_TEXT =
    'Add the QuranWall widget to your Home Screen or Lock Screen. It shows your ayah, and with auto-rotate on it brings a new one every day, every 8 hours or every hour.';

export default function HowItWorksAndPreview() {
    return (
        <section id="how-it-works" className="section-space relative overflow-hidden bg-gradient-to-b from-surface via-surface-elevated to-surface">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/3 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(217,185,104,0.08),transparent)]" />
            <StarPattern opacity={0.025} fade="right" />

            <div className="container-main relative z-10">
                <SectionHeading eyebrow="How It Works" title="From the App Store" muted="to your Lock Screen">
                    Here is what happens in the app, screen by screen.
                </SectionHeading>

                <StepDiagram className="mx-auto mt-10 w-full max-w-[520px]" />

                {/* Storyboard: four columns from lg, a swipeable row of cards below that (the row bleeds to the screen edge). */}
                <ol
                    className="-mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 [scroll-padding-inline:1rem] [scrollbar-width:none] sm:-mx-6 sm:px-6 sm:[scroll-padding-inline:1.5rem] lg:mx-0 lg:mt-16 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
                    aria-label="How QuranWall works, step by step"
                >
                    {steps.map((step, i) => (
                        <li key={step.number} className="w-[72vw] max-w-[270px] flex-none snap-center lg:w-auto lg:max-w-none">
                            <Reveal delay={i * 0.1} y={16}>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-brand/40 bg-surface-elevated text-base font-bold tracking-wide text-brand shadow-[0_0_20px_rgba(217,185,104,0.15)]">
                                        {step.number}
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className={`h-px flex-1 bg-gradient-to-r from-brand/50 to-transparent ${i === steps.length - 1 ? 'opacity-0' : ''}`}
                                    />
                                </div>

                                <div role="img" aria-label={step.label} className="mx-auto mt-6 w-full max-w-[232px]">
                                    <PhoneFrame>{step.screen}</PhoneFrame>
                                </div>

                                <h3 className="mt-7 text-xl font-bold text-white sm:text-[22px]">{step.title}</h3>
                                <p className="mt-2 text-base leading-relaxed text-white/60">{step.description}</p>
                            </Reveal>
                        </li>
                    ))}
                </ol>

                {/* The widget: what can change by itself after setup */}
                <Reveal className="mt-10 lg:mt-16" y={16}>
                    <div className={`${glassCardClass} grid items-center gap-8 overflow-hidden p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-12 lg:p-10`}>
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Then</p>
                            <h3 className="text-2xl font-bold text-white sm:text-3xl">{WIDGET_TITLE}</h3>
                            <p className="mt-3 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">{WIDGET_TEXT}</p>
                        </div>

                        <div
                            role="img"
                            aria-label="The QuranWall widget on a Home Screen, in a medium and a small size, each showing a Quran ayah and its reference"
                            className="relative mx-auto w-full max-w-[500px] overflow-hidden rounded-[28px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                        >
                            <Wallpaper variant="emerald" />
                            <div className="relative flex items-stretch gap-[3%] px-[5%] py-[6%]">
                                <div className="w-[64%] flex-none">
                                    <QuranWidget size="medium" verse={SHOWCASE_VERSES[1]} />
                                </div>
                                <div className="w-[30%] flex-none">
                                    <QuranWidget size="small" verse={SHOWCASE_VERSES[3]} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
