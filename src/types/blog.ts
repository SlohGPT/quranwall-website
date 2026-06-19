// Topic clusters for the blog/pillar system. No posts ship at launch; these are
// the intended QuranWall taxonomy for when content is added.
export type BlogCluster =
  | 'daily-quran-lock-screen'
  | 'dua-and-dhikr-iphone'
  | 'muslim-productivity-iphone'
  | 'quran-study-tools-ios'
  | 'muslim-app-comparisons';

export interface ImageAttribution {
  photographer: string;
  photographerUrl: string;
  unsplashUrl: string;
}

export interface BlogPostMeta {
  title: string;
  description: string;
  date: string;
  datePublished: string;
  dateModified?: string;
  readTime: string;
  image: string;
  imageAttribution?: ImageAttribution;
  keywords: string[];
  cluster: BlogCluster;
}

export type BlogSection =
  | { type: 'callout'; icon?: string; title?: string; content: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'tip'; content: string }
  | { type: 'stat'; number: string; label: string; description?: string }
  | { type: 'steps'; items: string[] }
  | { type: 'list'; items: string[] }
  | { type: 'highlight'; content: string }
  | { type: 'important'; content: string }
  | { type: 'verse'; reference: string; text: string }
  | { type: 'cta'; title: string; description: string; buttonText: string; buttonUrl: string };

export interface BlogPost {
  meta: BlogPostMeta;
  sections: BlogSection[];
}

export interface BlogPostListing {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  date: string;
  datePublished: string;
  cluster: BlogCluster;
  keywords: string[];
  readTime: string;
  isPublished: boolean;
}

export interface PillarConfig {
  slug: string;
  title: string;
  description: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  datePublished: string;
  dateModified: string;
  sections: BlogSection[];
  featured: string[];
}
