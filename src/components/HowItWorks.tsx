import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Download',
    description: 'Get QuranWall from the App Store.',
  },
  {
    number: '02',
    title: 'Choose your ayah',
    description: 'Search all 114 surahs and pick an ayah, in Arabic or a translation. Edit the text and pick a font, colour and background.',
  },
  {
    number: '03',
    title: 'Make It Mine',
    description: 'Tap Make It Mine and the Shortcuts app sets it as your Lock Screen wallpaper. Change it whenever you like.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-space relative bg-surface-elevated overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-main relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-brand font-medium mb-3 tracking-wide uppercase text-sm">How It Works</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              From the App Store
              <br />
              <span className="text-white/40">to your Lock Screen</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[2.25rem] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="relative text-center"
            >
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-surface-card border border-white/10 shadow-xl mb-8 group hover:border-brand/40 transition-colors duration-300">
                <span className="text-3xl font-bold text-brand">{step.number}</span>
                <div className="absolute inset-0 rounded-3xl bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                {step.title}
              </h3>
              <p className="text-lg text-white/60 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
