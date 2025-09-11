import BlogPost from '@/components/BlogPostClientPage';
import { Metadata } from 'next';
import { wixClient } from '@/lib/wixClient';

interface Params {
  params: { slug: string };
}

// Helper function to fetch blog by slug from Wix
async function fetchBlogBySlug(slug: string) {
  try {
    if (!wixClient.posts) return null;

    let blog = null;
    if (typeof wixClient.posts.getPostBySlug === 'function') {
      const response = await wixClient.posts.getPostBySlug(slug, {
        fieldsets: ['CONTENT_TEXT', 'URL', 'RICH_CONTENT', 'TAGS', 'CATEGORY_IDS', 'SEO', 'EXCERPT', 'TITLE', 'COVER_MEDIA', 'FIRST_PUBLISHED_DATE'],
      });
      if (response.post) blog = response.post;
    }

    return blog;
  } catch (err) {
    console.error('Error fetching blog:', err);
    return null;
  }
}

// Dynamic Metadata
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const blog = await fetchBlogBySlug(params.slug);

  if (!blog) {
    return {
      title: 'Blog Post Not Found | Medivisor India',
      description: "The requested blog post doesn't exist.",
    };
  }

  const title = blog.title || 'Medivisor India Blog';
  const description = blog.excerpt || 'Read informative blog posts about medical treatment, patient journeys, and healthcare tips in India.';
  const image = blog.coverMedia?.image || '/default-blog-og.jpg';
  const url = `https://www.medivisorindia.com/blog/${blog.slug}`;
  const keywords = (blog.tags || []).join(', ') || 'medical treatment, healthcare, patient stories, Medivisor India';

  return {
    title: `${title} | Medivisor India`,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Medivisor India Treatment',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image,
      site: '@MedivisorIndia',
    },
    authors: [{ name: 'Medivisor India' }],
    robots: 'index, follow',
    metadataBase: new URL('https://www.medivisorindia.com'),
  };
}

// Page Component
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPost slug={params.slug} />;
}
