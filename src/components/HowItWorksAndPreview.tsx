import { motion } from 'framer-motion';

const steps = [
    {
        number: '01',
        title: 'Download',
        description: 'Get QuranWall free from the App Store. No sign-up or account needed.',
    },
    {
        number: '02',
        title: 'Personalize',
        description: 'Add your favorite verses, duas, or daily reminders.',
    },
    {
        number: '03',
        title: 'Transform',
        description: 'Your lock screen becomes a daily source of faith and peace.',
    },
];

export default function HowItWorksAndPreview() {
    return (
        <section id="how-it-works" className="section-space relative bg-surface-elevated overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="container-main relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                    {/* LEFT COLUMN: How It Works */}
                    <div className="space-y-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="text-brand font-medium mb-3 tracking-wide uppercase text-sm">How It Works</p>
                            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                                Set up in under
                                <br />
                                <span className="text-white/40">2 minutes</span>
                            </h2>
                        </motion.div>

                        <div className="space-y-12 relative">
                            {/* Vertical Connector Line */}
                            <div className="absolute top-4 bottom-4 left-[2.5rem] w-px bg-gradient-to-b from-brand/30 via-brand/10 to-transparent hidden sm:block" />

                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: i * 0.2, duration: 0.6 }}
                                    className="relative flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center group"
                                >
                                    {/* Number Badge */}
                                    <div className="relative z-10 flex-shrink-0 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-surface-elevated border border-white/10 shadow-xl group-hover:border-brand/40 transition-colors duration-300">
                                        <span className="text-3xl font-bold text-brand">{step.number}</span>
                                        <div className="absolute inset-0 rounded-3xl bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <div className="pt-2 sm:pt-0">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-light transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-lg text-white/60 leading-relaxed max-w-sm">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Preview */}
                    <div className="relative pt-8 lg:pt-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8 }}
                            className=""
                        >
                            <div className="text-center mb-8">
                                <p className="text-brand font-medium tracking-wide uppercase text-xs mb-2">Preview</p>
                                <h3 className="text-2xl font-bold text-white">See it in action</h3>
                            </div>

                            <div className="flex flex-col items-center">
                                {/* Demo video — the clip already renders its own iPhone, so
                                    it plays edge-to-edge over a soft brand glow rather than
                                    being wrapped in a second CSS phone frame. */}
                                <div className="relative w-[250px] sm:w-[290px]">
                                    <div className="absolute -inset-6 bg-brand/10 rounded-full blur-[70px] pointer-events-none" aria-hidden="true" />
                                    <video
                                        className="relative w-full rounded-[2rem] border border-white/10 shadow-2xl bg-surface"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="auto"
                                        poster="/quranwall-demo-poster.webp"
                                        aria-label="QuranWall app demo: choosing a Quran verse and setting it as a daily iPhone lock screen"
                                    >
                                        <source src="/quranwall-demo.mp4" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>

                                <p className="mt-6 text-sm text-white/50 text-center max-w-xs">
                                    Pick an ayah and QuranWall sets it as your lock screen in seconds.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
