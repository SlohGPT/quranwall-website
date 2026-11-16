import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;

const tree = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);

// dist/404.html is prerendered from the NotFound route but served for any
// unknown URL (e.g. /blog/<typo>), so its markup may not match the route the
// browser resolves. Render fresh instead of hydrating.
if (container.hasChildNodes() && !container.hasAttribute('data-not-found')) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
