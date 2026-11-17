import { CLUSTER_LABEL, CLUSTER_ORDER, clusterHref } from '../lib/clusters';

/** Header "Guides" menu: the five blog topics, then the app comparison hub again under its reader-facing name. */
export const guideNav: { label: string; to: string }[] = [
  ...CLUSTER_ORDER.map((c) => ({ label: CLUSTER_LABEL[c], to: clusterHref(c) })),
  { label: 'Best apps compared', to: clusterHref('muslim-app-comparisons') },
];
