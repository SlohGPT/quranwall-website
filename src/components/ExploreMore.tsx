import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// In-body links from Home to the pages that answer the questions people ask before installing.
const links = [
  {
    to: '/features',
    anchor: 'Everything QuranWall does',
    body: 'The Lock Screen wallpaper, the Home Screen widget, translations in 10 languages and how you can customise the look.',
  },
  {
    to: '/blog/quran-verse-iphone-lock-screen',
    anchor: 'How to put a Quran verse on your iPhone Lock Screen',
    body: 'A guide to getting an ayah onto the screen you see most.',
  },
  {
    to: '/blog/best-islamic-lock-screen-app-iphone',
    anchor: 'The best Islamic lock screen app for iPhone',
    body: 'A ranking of the apps that put Islamic content on your Lock Screen.',
  },
  {
    to: '/blog/best-muslim-app-for-iphone-2026',
    anchor: 'The best Muslim app for iPhone in 2026',
    body: 'An honest ranking of Muslim apps, and what each one is good for.',
  },
];

export default function ExploreMore() {
  return (
    <section id="learn-more" className="section-space bg-surface-elevated">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-brand font-medium mb-3 tracking-wide uppercase text-sm">Learn more</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            Before you download
          </h2>
        </motion.div>

        <ul className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {links.map((link, i) => (
            <motion.li
              key={link.to}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                to={link.to}
                className="group block h-full rounded-2xl p-6 bg-surface-card border border-white/5 hover:border-brand/30 transition-colors duration-300"
              >
                <span className="flex items-start justify-between gap-3 text-white font-semibold text-lg leading-snug">
                  {link.anchor}
                  <ArrowRight
                    size={18}
                    className="mt-1 flex-shrink-0 text-brand transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
                <span className="block mt-2 text-white/60 text-sm leading-relaxed">{link.body}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
