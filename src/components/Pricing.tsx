import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import AppStoreButton from './AppStoreButton';
import { appStoreUrl, CAMPAIGNS } from '../lib/app-store';

// Feature list mirrors the live App Store listing. No prices, plan names or trial lengths:
// the App Store shows the price before you subscribe.
const features = [
  'An ayah on your Lock Screen wallpaper and Home Screen widget',
  'Uthmani Arabic beside a translation, in 10 languages',
  'Your own background (a preset or your own photo), font and colours',
  'All 114 surahs searchable by surah, ayah or keyword',
  'No ads',
  'Works offline',
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-space bg-surface-elevated">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-brand font-medium mb-3 tracking-wide uppercase text-sm">Pricing</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
            Free to download.
            <br />
            <span className="text-white/40">With an in-app subscription.</span>
          </h2>
          <p className="text-white/60 text-lg mt-4 max-w-2xl mx-auto">
            The App Store shows the price and billing period before you subscribe.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto rounded-3xl p-8 bg-surface-card border-2 border-brand shadow-xl shadow-brand/10"
        >
          <p className="text-white font-bold text-lg mb-5">What QuranWall does</p>
          <ul className="space-y-4 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center mt-0.5">
                  <Check size={14} className="text-brand" />
                </div>
                <span className="text-white/80 text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center">
            <AppStoreButton size="lg" href={appStoreUrl(CAMPAIGNS.pricing)} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
