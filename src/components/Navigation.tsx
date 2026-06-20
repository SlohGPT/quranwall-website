import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { featureNav } from '../data/featureNav';

const APP_STORE_URL = 'https://apps.apple.com/us/app/quran-verse-lock-screen/id6781802080';

export default function Navigation() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFeaturesOpen, setIsMobileFeaturesOpen] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isMobileView, setIsMobileView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Refs for direct DOM mutation of the SVG progress ring. Updating
  // strokeDashoffset via ref every animation frame is dramatically smoother
  // than re-rendering the whole Navigation component (with its SVG, gradient
  // defs, geometry calcs) on every scroll frame.
  const progressRectRef = useRef<SVGRectElement>(null);
  const perimeterRef = useRef(0);

  // iOS Chrome (and iOS 26 Safari Liquid Glass) overlay the URL bar on the
  // layout viewport instead of reserving layout space for it. env(safe-area-inset-top)
  // only covers the hardware notch, not the URL bar. Use the visualViewport API to
  // measure the live URL bar overlap and expose it as --browser-top-inset so fixed
  // top-anchored elements can clear it. On Safari iOS with reserved layout and on
  // desktop, the delta is 0, the variable is a no-op everywhere except the broken
  // environments.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      const overlap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--browser-top-inset', `${overlap}px`);
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    let lastHasScrolled = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollY / docHeight : 0;
        // Mutate the SVG ring directly, no React render, no allocation.
        const rect = progressRectRef.current;
        const perimeter = perimeterRef.current;
        if (rect && perimeter > 0) {
          rect.style.strokeDashoffset = String(perimeter * (1 - progress));
        }
        // hasScrolled only flips once (boolean), cheap to keep in state.
        const next = scrollY > 20;
        if (next !== lastHasScrolled) {
          lastHasScrolled = next;
          setHasScrolled(next);
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
      setIsMobileView(window.innerWidth < 768);
    };
    updateSize();
    const onResize = () => requestAnimationFrame(updateSize);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const showIndicator = hasScrolled;
  const borderRadius = isMobileView ? 16 : 40;
  const strokeWidth = 2;
  const { width, height } = containerSize;

  const inset = strokeWidth / 2;
  const innerWidth = width - strokeWidth;
  const innerHeight = height - strokeWidth;
  const r = borderRadius - inset;

  const getPerimeter = () => {
    if (innerWidth <= 0 || innerHeight <= 0) return 0;
    const straightWidth = innerWidth - 2 * r;
    const straightHeight = innerHeight - 2 * r;
    const cornerCircumference = 2 * Math.PI * r;
    return 2 * straightWidth + 2 * straightHeight + cornerCircumference;
  };

  const perimeter = getPerimeter();

  // Keep perimeterRef in sync and snap the ring to the current scroll position
  // whenever the geometry changes (initial mount, window resize, mobile/desktop
  // breakpoint flip).
  useEffect(() => {
    perimeterRef.current = perimeter;
    const rect = progressRectRef.current;
    if (!rect || perimeter <= 0) return;
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollY / docHeight : 0;
    rect.style.strokeDasharray = String(perimeter);
    rect.style.strokeDashoffset = String(perimeter * (1 - progress));
  }, [perimeter]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileFeaturesOpen(false);
  };

  const mobileLinkClass =
    'px-6 py-5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all text-xl font-semibold';

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 nav-safe-pt"
        style={{ willChange: 'transform' }}
      >
        <div className="relative mx-auto max-w-6xl">
          <div
            ref={containerRef}
            className="absolute inset-0 rounded-2xl md:rounded-[40px] overflow-visible"
            style={{
              // Mobile Safari composites multiple backdrop-filter layers slowly.
              // Use a solid translucent background on mobile, keep the glass look on desktop.
              background: hasScrolled
                ? (isMobileView ? 'rgba(10, 10, 12, 0.92)' : 'rgba(0, 0, 0, 0.25)')
                : 'transparent',
              backdropFilter: hasScrolled && !isMobileView ? 'blur(24px)' : 'none',
              WebkitBackdropFilter: hasScrolled && !isMobileView ? 'blur(24px)' : 'none',
              boxShadow: hasScrolled
                ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                : 'none',
              transition: 'background 0.6s cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {width > 0 && height > 0 && (
              <svg
                className="absolute pointer-events-none"
                style={{
                  top: 0,
                  left: 0,
                  width: width,
                  height: height,
                  overflow: 'visible',
                  opacity: showIndicator ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}
                viewBox={`0 0 ${width} ${height}`}
              >
                <defs>
                  <linearGradient id="borderGradient" gradientUnits="userSpaceOnUse" x1="0" y1={height} x2={width} y2="0">
                    <stop offset="0%" stopColor="rgba(234, 88, 12, 0.15)" />
                    <stop offset="30%" stopColor="rgba(245, 158, 11, 0.6)" />
                    <stop offset="70%" stopColor="rgba(251, 191, 36, 0.9)" />
                    <stop offset="100%" stopColor="rgba(251, 191, 36, 1)" />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect
                  x={inset}
                  y={inset}
                  width={innerWidth}
                  height={innerHeight}
                  rx={r}
                  ry={r}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth={strokeWidth}
                  shapeRendering="geometricPrecision"
                />

                <rect
                  ref={progressRectRef}
                  x={inset}
                  y={inset}
                  width={innerWidth}
                  height={innerHeight}
                  rx={r}
                  ry={r}
                  fill="none"
                  stroke="url(#borderGradient)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  // Skip the expensive Gaussian blur glow on mobile Safari.
                  // Keep the gradient stroke; lose only the soft halo.
                  {...(isMobileView ? {} : { filter: 'url(#glow)' })}
                  shapeRendering="geometricPrecision"
                  // strokeDasharray / strokeDashoffset are mutated imperatively
                  // by the scroll handler (and the perimeter effect for resize).
                  // Initial values: full perimeter dash, fully offset (ring empty).
                  style={{
                    strokeDasharray: perimeter,
                    strokeDashoffset: perimeter,
                  }}
                />
              </svg>
            )}
          </div>

          <div className="relative">
            <div className="flex items-center justify-between pl-5 pr-2 py-1.5 md:pl-7 md:pr-3 md:py-2">
              <Link to="/" className="flex items-center gap-2.5 group pl-1.5">
                <img
                  src="/icon-app-256.png"
                  alt="QuranWall"
                  width={256}
                  height={256}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-[22%] ring-1 ring-white/10 shadow-lg shadow-black/30 group-hover:scale-105 transition-transform duration-300"
                  loading="eager"
                />
                <span className="text-lg md:text-xl font-black text-white tracking-tight">
                  QuranWall
                </span>
              </Link>

              <div className="flex items-center gap-6 ml-auto">
                <div className="hidden lg:flex items-center gap-1">
                  <Link
                    to="/about/karol-billik"
                    className="text-lg font-semibold text-white hover:text-white/70 transition-colors duration-300 px-4 py-3"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/blog"
                    className="text-lg font-semibold text-white hover:text-white/70 transition-colors duration-300 px-4 py-3"
                  >
                    Blog
                  </Link>

                  {/* Features: link to the page, reveal section deep-links on hover/focus.
                      group-hover + group-focus-within keep it usable by mouse and keyboard
                      with no JS; the pt-3 on the panel is a hover bridge to the trigger. */}
                  <div className="relative group">
                    <Link
                      to="/features"
                      className="inline-flex items-center gap-1 text-lg font-semibold text-white hover:text-white/70 transition-colors duration-300 px-4 py-3"
                    >
                      Features
                      <ChevronDown
                        className="w-4 h-4 mt-0.5 transition-transform duration-200 group-hover:rotate-180"
                        aria-hidden="true"
                      />
                    </Link>
                    <div className="absolute left-0 top-full min-w-[15rem] pt-3 opacity-0 invisible translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
                      <div className="rounded-2xl border border-white/10 bg-surface-elevated/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-2">
                        {featureNav.map((f) => (
                          <Link
                            key={f.id}
                            to={`/features#${f.id}`}
                            className="block rounded-xl px-4 py-3 text-base font-medium text-white/75 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {f.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/support"
                    className="text-lg font-semibold text-white hover:text-white/70 transition-colors duration-300 px-4 py-3"
                  >
                    Support
                  </Link>
                </div>

                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:inline-flex items-center justify-center px-7 py-3 bg-white text-surface text-xl font-semibold rounded-full hover:bg-white/90 transition-all duration-300"
                >
                  Download
                </a>

                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-white hover:text-white/70 transition-colors duration-300"
                  aria-label="Toggle menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
      >
        <div
          className="absolute inset-0 bg-black/75"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute left-4 right-4 bg-surface-elevated rounded-2xl shadow-2xl transition-[transform,opacity] duration-200 ease-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
          style={{ top: 'calc(5rem + env(safe-area-inset-top, 0px) + var(--browser-top-inset, 0px))' }}
        >
          <div className="flex flex-col p-3 gap-2">
            <Link to="/about/karol-billik" className={mobileLinkClass} onClick={closeMobileMenu}>
              About Us
            </Link>
            <Link to="/blog" className={mobileLinkClass} onClick={closeMobileMenu}>
              Blog
            </Link>

            {/* Features: collapsible group of section deep-links */}
            <div>
              <button
                onClick={() => setIsMobileFeaturesOpen((v) => !v)}
                className={`w-full flex items-center justify-between ${mobileLinkClass}`}
                aria-expanded={isMobileFeaturesOpen}
              >
                Features
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${isMobileFeaturesOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {isMobileFeaturesOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-white/10 flex flex-col">
                  <Link
                    to="/features"
                    className="px-4 py-3 text-white/55 hover:text-white hover:bg-white/5 rounded-lg transition-all text-lg font-medium"
                    onClick={closeMobileMenu}
                  >
                    All features
                  </Link>
                  {featureNav.map((f) => (
                    <Link
                      key={f.id}
                      to={`/features#${f.id}`}
                      className="px-4 py-3 text-white/55 hover:text-white hover:bg-white/5 rounded-lg transition-all text-lg font-medium"
                      onClick={closeMobileMenu}
                    >
                      {f.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/support" className={mobileLinkClass} onClick={closeMobileMenu}>
              Support
            </Link>

            <div className="pt-2 mt-2 border-t border-surface-border">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-8 py-3.5 bg-white text-surface text-xl font-semibold rounded-full transition-colors"
                onClick={closeMobileMenu}
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
