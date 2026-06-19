import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import EULA from './pages/EULA';
import AuthorKarol from './pages/AuthorKarol';
import NotFound from './pages/NotFound';
import ScrollManager from './components/ScrollManager';

const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
// NOTE: Pillar and Compare page components remain in src/pages for when topic
// hubs and competitor-comparison pages are added back. Wire their routes here
// (with the matching entries in scripts/prerender.mjs + generate-sitemap.mjs)
// once the corresponding data exists in pillars.json / comparisons.json.

const blogFallback = <div className="min-h-screen bg-surface" />;

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/eula" element={<EULA />} />
        <Route path="/about/karol-billik" element={<AuthorKarol />} />
        <Route
          path="/blog"
          element={
            <Suspense fallback={blogFallback}>
              <Blog />
            </Suspense>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <Suspense fallback={blogFallback}>
              <BlogPost />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
