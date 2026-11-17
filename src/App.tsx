import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ScrollManager from './components/ScrollManager';

// Home and NotFound stay in the entry chunk; every other route is its own chunk. scripts/prerender.mjs writes a
// modulepreload for the route's chunk into each page's <head>, so hydration does not wait on a second round trip.
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const Support = lazy(() => import('./pages/Support'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const EULA = lazy(() => import('./pages/EULA'));
const AuthorKarol = lazy(() => import('./pages/AuthorKarol'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
// NOTE: Pillar and Compare page components remain in src/pages for when topic
// hubs and competitor-comparison pages are added back. Wire their routes here
// (with the matching entries in scripts/prerender.mjs + generate-sitemap.mjs)
// once the corresponding data exists in pillars.json / comparisons.json.

const pageFallback = <div className="min-h-screen bg-surface" />;

const page = (node: React.ReactNode) => <Suspense fallback={pageFallback}>{node}</Suspense>;

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={page(<FeaturesPage />)} />
        <Route path="/support" element={page(<Support />)} />
        <Route path="/privacy-policy" element={page(<PrivacyPolicy />)} />
        <Route path="/terms-of-use" element={page(<TermsOfUse />)} />
        <Route path="/eula" element={page(<EULA />)} />
        <Route path="/about/karol-billik" element={page(<AuthorKarol />)} />
        <Route path="/blog" element={page(<Blog />)} />
        <Route path="/blog/:slug" element={page(<BlogPost />)} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
