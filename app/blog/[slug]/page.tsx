import BlogPost from "@/components/BlogPostClientPage"
import { Metadata } from "next"
import { wixClient } from "@/lib/wixClient"
import { media } from '@wix/sdk'

interface Params {
  params: { slug: string }
}

// Function to get properly formatted Wix Image URL
function getWixImageUrl(wixUrl: string | undefined): string | null {
  if (!wixUrl) return null
  
  try {
    // Handle both wix:image:// and direct URLs
    if (wixUrl.startsWith('wix:image://')) {
      const { url } = media.getImageUrl(wixUrl)
      return formatImageUrlForSocial(url)
    } else if (wixUrl.startsWith('http')) {
      return formatImageUrlForSocial(wixUrl)
    }
    return null
  } catch (error) {
    console.error('Error getting Wix image URL:', error)
    return null
  }
}

// Function to format image URL for social media platforms
function formatImageUrlForSocial(imageUrl: string): string | null {
  if (!imageUrl) return null
  
  try {
    // Ensure URL is valid
    const url = new URL(imageUrl)
    
    // For Wix static URLs, we need to ensure they're properly formatted
    if (url.hostname === 'static.wixstatic.com') {
      // Reconstruct the URL with proper parameters for social media
      const pathParts = url.pathname.split('/')
      const mediaPart = pathParts[pathParts.length - 1]
      
      // Create a clean, optimized URL for social media
      // Use Wix's image transformation with proper format
      const optimizedUrl = `https://static.wixstatic.com/media/${mediaPart}/v1/fill/w_1200,h_630,al_c,q_85,usm_0.66_1.00_0.01/${mediaPart}`
      
      return optimizedUrl
    }
    
    // For other URLs, return as is
    return imageUrl
  } catch (error) {
    console.error('Error formatting image URL:', error)
    return null
  }
}

// Function to get optimized image URL for social sharing
function getOptimizedShareImage(wixUrl: string | undefined): string {
  if (!wixUrl) {
    // Fallback to a reliable default image
    return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=630&q=80"
  }
  
  // Try to get the properly formatted image URL
  const imageUrl = getWixImageUrl(wixUrl)
  
  if (imageUrl) {
    return imageUrl
  }
  
  // Final fallback to a reliable medical/health related image
  return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=630&q=80"
}

// Function to extract text from content for meta description
function extractTextForMeta(content: any): string {
  if (!content) return ''
  
  if (typeof content === 'string') {
    return content.replace(/<[^>]*>/g, '').trim()
  }
  
  return 'Informative medical blog post from Medivisor India.'
}

// Function to generate meta description from content
function generateMetaDescription(content: any, excerpt?: string): string {
  if (excerpt && excerpt.trim().length > 0) {
    return excerpt.trim()
  }

  const text = extractTextForMeta(content)

  if (text.length > 160) {
    return text.substring(0, 157) + '...'
  }

  return text || 'Read this informative blog post about medical treatment, patient journeys, and healthcare tips in India.'
}

// Helper function to fetch blog by slug from Wix
async function fetchBlogBySlug(slug: string) {
  try {
    if (!wixClient.posts) return null

    let blog = null
    
    // Try getPostBySlug first
    if (typeof wixClient.posts.getPostBySlug === "function") {
      const response = await wixClient.posts.getPostBySlug(slug, {
        fieldsets: [
          "CONTENT_TEXT",
          "URL",
          "RICH_CONTENT",
         "SEO"
        ],
      })
      if (response.post) blog = response.post
    }

    // Fallback to queryPosts if getPostBySlug fails
    if (!blog && typeof wixClient.posts.queryPosts === "function") {
      const response = await wixClient.posts.queryPosts()
        .eq('slug', slug)
        .find()
      
      if (response.items && response.items.length > 0) {
        blog = response.items[0]
      }
    }

    return blog
  } catch (err) {
    console.error("Error fetching blog:", err)
    return null
  }
}

// Dynamic Metadata for Blog Post
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const blog = await fetchBlogBySlug(params.slug)

  if (!blog) {
    return {
      title: "Blog Post Not Found | Medivisor India",
      description: "The requested blog post doesn't exist.",
      robots: "noindex, nofollow",
    }
  }

  const title = blog.title || "Medivisor India Blog"
  const description = generateMetaDescription(blog.richContent || blog.contentText || blog.content, blog.excerpt)
  
  // Get the optimized share image - this now uses reliable fallbacks
  const shareImageUrl = getOptimizedShareImage(blog.coverMedia?.image || blog.media?.wixMedia?.image)
  
  const url = `https://medivisorindiatreatment.com/blog/${params.slug}`

  // Article specific meta tags
  const articleMeta: any = {}
  if (blog.firstPublishedDate) {
    articleMeta.publishedTime = blog.firstPublishedDate
  }
  if (blog.lastPublishedDate) {
    articleMeta.modifiedTime = blog.lastPublishedDate
  }
  if (blog.tags && blog.tags.length > 0) {
    articleMeta.tags = blog.tags
  }

  return {
    title: `${title} | Medivisor India`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Medivisor India Treatment",
      images: [
        {
          url: shareImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "article",
      ...articleMeta,
      authors: ["Medivisor India"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImageUrl],
      site: "@medivisorindia",
      creator: "@medivisorindia",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    keywords: blog.tags?.join(', ') || "medical treatment, healthcare, India, patient journey",
    authors: [{ name: "Medivisor India" }],
    publisher: "Medivisor India",
    category: "healthcare",
    ...articleMeta,
  }
}

// Generate Static Params for SSG
export async function generateStaticParams() {
  try {
    if (!wixClient.posts) return []

    let posts: any[] = []
    
    if (typeof wixClient.posts.queryPosts === "function") {
      const response = await wixClient.posts.queryPosts()
        .limit(50)
        .find()
      posts = response.items || []
    } else if (typeof wixClient.posts.listPosts === "function") {
      const response = await wixClient.posts.listPosts({
        paging: { limit: 50 },
      })
      posts = response.posts || []
    }

    return posts.map((post: any) => ({
      slug: post.slug,
    }))
  } catch (err) {
    console.error("Error generating static params:", err)
    return []
  }
}

// Blog Post Page Component
export default function BlogPostPage({ params }: Params) {
  return <BlogPost slug={params.slug} />
}