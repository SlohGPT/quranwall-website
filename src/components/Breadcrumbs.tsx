import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
  /** Shorten a long last crumb to one line on phones (the full text stays in the DOM). */
  truncate?: boolean;
}

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[14px] text-white/65">
      <ol className="flex flex-nowrap items-center gap-1">
        {crumbs.map((crumb, i) => (
          <li key={i} className={`flex items-center gap-1 ${crumb.truncate ? 'min-w-0' : 'shrink-0 md:shrink'}`}>
            {crumb.to ? (
              <Link to={crumb.to} className="hover:text-white transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className={`text-white/80 ${crumb.truncate ? 'block max-w-[12rem] truncate md:max-w-[22rem]' : ''}`} aria-current="page">
                {crumb.label}
              </span>
            )}
            {i < crumbs.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-white/65" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
