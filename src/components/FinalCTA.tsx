import AppStoreButton from './AppStoreButton';
import { appStoreUrl, CAMPAIGNS } from '../lib/app-store';
const avatars = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
];

export default function FinalCTA() {
  return (
    <section data-hides-sticky className="section-space bg-surface">
      <div className="container-main">
        <div className="relative rounded-[2rem] overflow-hidden border-2 border-brand/30">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/1064162/pexels-photo-1064162.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/80 to-surface/60" />
          </div>

          <div className="relative px-8 py-20 sm:px-12 sm:py-28 lg:px-20">
            <div className="max-w-xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
                Start every day
                <br />
                <span className="text-white/40">with purpose</span>
              </h2>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                Transform your phone into a tool for spiritual growth. Join thousands of believers who begin each day with inspiration.
              </p>

              <AppStoreButton href={appStoreUrl(CAMPAIGNS.home)} />

              <div className="flex items-center gap-4 mt-8">
                <div className="flex -space-x-2">
                  {avatars.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-9 h-9 rounded-full border-2 border-surface object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </div>
                <p className="text-white/60 text-sm">
                  Join <span className="text-white font-semibold">1,000+</span> believers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
