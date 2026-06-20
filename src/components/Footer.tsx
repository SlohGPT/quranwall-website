import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AppStoreButton from './AppStoreButton';

const footerLinks = {
  about: [
    { name: 'Features', href: '/features' },
    { name: 'Download', href: 'https://apps.apple.com/us/app/quran-verse-lock-screen/id6781802080' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Support', href: '/support' },
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'How it works', href: '/#how-it-works' },
    { name: 'FAQ', href: '/support#faq' },
  ],
  company: [
    { name: 'About Karol', href: '/about/karol-billik' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Use', href: '/terms-of-use' },
    { name: 'EULA', href: '/eula' },
    { name: 'Contact', href: 'mailto:iosnotewall@gmail.com' },
  ],
  socials: [
    { name: 'Instagram', href: '#' },
    { name: 'TikTok', href: '#' },
    { name: 'X', href: '#' },
  ],
};

export default function Footer() {
  const [showModal, setShowModal] = useState(false);

  return (
    <footer className="bg-surface border-t border-surface-border relative">
      <div className="container-main py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/icon-app-256.png"
                alt="QuranWall"
                width={256}
                height={256}
                className="w-12 h-12 rounded-[22%] ring-1 ring-white/10 shadow-lg shadow-black/30"
                loading="lazy"
              />
              <span className="text-xl font-semibold text-white tracking-tight">
                QuranWall
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Daily Quran and inspiration on your lock screen.
            </p>

            <div className="mt-6">
              <AppStoreButton href="https://apps.apple.com/us/app/quran-verse-lock-screen/id6781802080" />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">About</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-white/50 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/50 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-white/50 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-white/50 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Socials</h4>
            <ul className="space-y-3">
              {footerLinks.socials.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-white/50 hover:text-white transition-colors text-sm text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full overflow-hidden flex items-center justify-center">
          <div className="text-[14vw] sm:text-[12vw] lg:text-[10vw] font-black text-white leading-none tracking-[-0.08em] select-none whitespace-nowrap text-center" style={{ letterSpacing: '-0.04em' }}>
            QURANWALL
          </div>
        </div>

        <div className="pt-8 border-t border-surface-border mt-8 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <p className="text-white/40 text-sm text-center md:text-left">
            &copy; 2026 QuranWall. Made with love for Allah.
          </p>
          <div className="flex items-baseline justify-center md:justify-end gap-2 sm:gap-3">
            <span className="text-white/30 font-light text-2xl sm:text-3xl lg:text-4xl tracking-tight">Built by</span>
            <a
              href="https://www.karchi.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors duration-300 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
              aria-label="karchi. digital agency"
            >
              karchi.
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-surface-card border border-white/10 p-8 rounded-3xl shadow-2xl text-center"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌱</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                Growing Together
              </h3>
              <p className="text-white/70 leading-relaxed mb-6">
                We're a new app and haven't launched our social channels just yet. Check back soon!
              </p>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-brand hover:bg-brand-light text-white font-bold rounded-xl transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
