import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import StickyInstallBar from '../components/StickyInstallBar';
import BlogPostContent from '../components/BlogPostContent';
import NotFound from './NotFound';
import { getPost, getListing, getRelated } from '../lib/posts';
import { CLUSTER_LABEL, clusterHref } from '../lib/clusters';
import { breadcrumbSchema as buildBreadcrumbs } from '../lib/breadcrumbs';
import { GENERIC_CARD, HERO_SIZES, HERO_WIDTHS, coverSize, coverSrcSet } from '../lib/covers';

export default function BlogPost() {
  const { slug = '' } = useParams<{ slug: string }>();
  const post = getPost(slug);
  const listing = getListing(slug);

  if (!post || !listing) return <NotFound />;

  const related = getRelated(slug);
  const url = `https://quranwall.com/blog/${slug}`;
  // A post whose own image is the generic site card shares that image with every other page, so its listing cover
  // (a dedicated 1600 x 1067 card) is the og:image / twitter:image / Article image instead. The post JSON is untouched.
  const imagePath = post.meta.image === GENERIC_CARD ? listing.thumbnail : post.meta.image;
  const imageUrl = imagePath.startsWith('http') ? imagePath : `https://quranwall.com${imagePath}`;
  // Real pixel size from the generated size map; an unknown image gets no width/height rather than a guess.
  const imageSize = coverSize(imagePath);
  // The hero is the page's LCP image: preload it from the prerendered <head> (AVIF, same srcset and sizes as the <picture>).
  const hasHero = post.meta.image !== GENERIC_CARD;
  const heroSets = hasHero ? coverSrcSet(post.meta.image, HERO_WIDTHS) : null;
  const heroPreload = heroSets
    ? ({
        rel: 'preload',
        as: 'image',
        type: 'image/avif',
        imagesrcset: heroSets.avif,
        imagesizes: HERO_SIZES,
        fetchpriority: 'high',
      } as Record<string, string>)
    : null;
  const dateModified = post.meta.dateModified || post.meta.datePublished;
  // Google appends the site name itself when the document title is long;
  // keep the post title as-is to avoid SERP truncation when titles run past ~55 chars.
  const docTitle =
    post.meta.title.length > 55 ? post.meta.title : `${post.meta.title} | QuranWall`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.meta.title,
    description: post.meta.description,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      ...(imageSize ? { width: imageSize.width, height: imageSize.height } : {}),
    },
    datePublished: post.meta.datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: 'Karol Billik',
      url: 'https://quranwall.com/about/karol-billik',
      jobTitle: 'Founder',
      worksFor: { '@type': 'Organization', name: 'QuranWall' },
    },
    publisher: {
      '@type': 'Organization',
      name: 'QuranWall',
      logo: {
        '@type': 'ImageObject',
        url: 'https://quranwall.com/icon-app-512.png',
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: post.meta.keywords.join(', '),
  };

  // Same four levels as the visible trail. The topic item points at its anchor on /blog (no pillar pages exist yet).
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: CLUSTER_LABEL[post.meta.cluster], path: clusterHref(post.meta.cluster) },
    { name: post.meta.title, path: `/blog/${slug}` },
  ]);

  return (
    <div className="min-h-screen bg-surface pb-[calc(88px+env(safe-area-inset-bottom,0px))] md:pb-0">
      <Helmet>
        <title>{docTitle}</title>
        <meta name="description" content={post.meta.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={post.meta.title} />
        <meta property="og:description" content={post.meta.description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={imageUrl} />
        {imageSize && <meta property="og:image:width" content={String(imageSize.width)} />}
        {imageSize && <meta property="og:image:height" content={String(imageSize.height)} />}
        <meta name="twitter:title" content={post.meta.title} />
        <meta name="twitter:description" content={post.meta.description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta property="article:published_time" content={post.meta.datePublished} />
        <meta property="article:modified_time" content={dateModified} />
        <meta property="article:author" content="Karol Billik" />
        {post.meta.keywords.map((k) => (
          <meta key={k} property="article:tag" content={k} />
        ))}
        {heroPreload && <link {...heroPreload} />}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <Navigation />
      <BlogPostContent post={post} slug={slug} related={related} />
      <Footer />
      <StickyInstallBar kind="blog" />
    </div>
  );
}
