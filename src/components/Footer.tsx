import { Link } from 'react-router-dom';
import AppStoreButton from './AppStoreButton';
import { appStoreUrl, CAMPAIGNS } from '../lib/app-store';
import { CLUSTER_HEADING, clusterHref, listingsByCluster } from '../lib/clusters';

const guideGroups = listingsByCluster();

const footerLinks = {
  about: [
    { name: 'Start here', href: clusterHref('daily-quran-lock-screen') },
    { name: 'Features', href: '/features' },
    { name: 'Download', href: appStoreUrl(CAMPAIGNS.footer) },
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
};

export default function Footer() {
  return (
    <footer data-site-footer className="bg-surface border-t border-surface-border relative">
      <div className="container-main py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/icon-app-96.webp"
                alt=""
                width={96}
                height={96}
                className="w-12 h-12 rounded-[22%] ring-1 ring-white/10 shadow-lg shadow-black/30"
                loading="lazy"
              />
              <span className="text-xl font-semibold text-white tracking-tight">
                QuranWall
              </span>
            </div>
            <p className="text-white/65 text-sm leading-relaxed max-w-xs">
              An ayah of the Quran on your iPhone Lock Screen.
            </p>

            <div className="mt-6">
              <AppStoreButton href={appStoreUrl(CAMPAIGNS.footer)} />
            </div>
          </div>

          <nav aria-label="Footer: About">
            <p className="font-semibold text-white mb-4">About</p>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-white/65 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/65 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer: Resources">
            <p className="font-semibold text-white mb-4">Resources</p>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/65 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer: Company">
            <p className="font-semibold text-white mb-4">Company</p>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-white/65 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-white/65 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <nav aria-label="Guides" className="mb-16 pt-12 border-t border-surface-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10">
            {guideGroups.map(({ cluster, posts }) => (
              <div key={cluster}>
                <p className="font-semibold text-white mb-4">
                  <Link to={clusterHref(cluster)} className="hover:text-brand transition-colors">
                    {CLUSTER_HEADING[cluster]}
                  </Link>
                </p>
                <ul className="space-y-3">
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-white/65 hover:text-white transition-colors text-sm leading-snug block"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="w-full overflow-hidden flex items-center justify-center">
          <div className="text-[14vw] sm:text-[12vw] lg:text-[10vw] font-black text-white leading-none tracking-[-0.08em] select-none whitespace-nowrap text-center" style={{ letterSpacing: '-0.04em' }}>
            QURANWALL
          </div>
        </div>

        <p className="mt-8 text-center md:text-left text-white/65 text-xs leading-relaxed">
          Apple, the Apple logo, iPhone and App Store are trademarks of Apple Inc., registered in the U.S. and other countries and regions.
        </p>

        <div className="pt-6 border-t border-surface-border mt-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <p className="text-white/65 text-sm text-center md:text-left">
            &copy; 2026 QuranWall. Made with love for Allah.
          </p>
          <div className="flex items-baseline justify-center md:justify-end gap-2 sm:gap-3">
            <span className="text-white/65 font-light text-2xl sm:text-3xl lg:text-4xl tracking-tight">Built by</span>
            <a
              href="https://www.karchi.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/65 hover:text-white transition-colors duration-300 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
              aria-label="karchi. digital agency"
            >
              karchi.
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
