"use client"

import React, { useEffect, useState } from 'react'
import { wixClient } from '../lib/wixClient'
import { media } from '@wix/sdk'
import {
  ChevronLeft,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Clock,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from 'lucide-react'
import { RicosRenderer } from './RichContentViewer'
import { extractTextFromRicos, type RicosContent } from '../lib/ricos-parser'

interface Post {
  _id: string
  title: string
  slug: string
  firstPublishedDate?: string
  lastPublishedDate?: string
  url?: string
  media?: {
    wixMedia?: {
      image?: string
      video?: string
    }
    embedMedia?: {
      thumbnail?: {
        url: string
        width?: number
        height?: number
      }
      video?: {
        url: string
        width?: number
        height?: number
      }
    }
    displayed?: boolean
    custom?: boolean
  }
  coverMedia?: {
    image?: string
  }
  excerpt?: string
  content?: string
  contentText?: string
  richContent?: RicosContent
  tags?: string[]
  hashtags?: string[]
  categoryIds?: string[]
  featured?: boolean
  commentingEnabled?: boolean
  minutesToRead?: number
  language?: string
  viewCount?: number
  likeCount?: number
  commentCount?: number
}

// Function to get Wix Image URL
function getWixImageUrl(wixUrl: string | undefined): string | null {
  if (!wixUrl || !wixUrl.startsWith('wix:image://')) {
    return null
  }
  try {
    const { url } = media.getImageUrl(wixUrl)
    return url
  } catch (error) {
    console.error('Error getting Wix image URL:', error)
    return null
  }
}

// Function to get YouTube embed URL
function getYouTubeEmbedUrl(youtubeUrl: string | undefined): string | null {
  if (!youtubeUrl) return null

  const regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?$/
  const match = youtubeUrl.match(regExp)

  if (match && match[1] && match[1].length === 11) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&modestbranding=1&rel=0`
  }
  return null
}

// Function to calculate read time
function calculateReadTime(content: string | RicosContent | undefined, minutesToRead?: number): string {
  if (minutesToRead && minutesToRead > 0) {
    return `${minutesToRead} min read`
  }

  if (!content) return 'Less than 1 min read'

  let text = ''
  if (typeof content === 'string') {
    text = content.replace(/<[^>]*>/g, '')
  } else if (content.nodes) {
    text = extractTextFromRicos(content.nodes)
  }

  const wordsPerMinute = 200
  const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return minutes === 0 ? 'Less than 1 min read' : `${minutes} min read`
}

// Function to format date
function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Function to generate meta description from content
function generateMetaDescription(content: string | RicosContent | undefined, excerpt?: string): string {
  if (excerpt && excerpt.trim().length > 0) {
    return excerpt.trim()
  }

  let text = ''
  if (typeof content === 'string') {
    text = content.replace(/<[^>]*>/g, '').trim()
  } else if (content?.nodes) {
    text = extractTextFromRicos(content.nodes).trim()
  }

  // Limit to 160 characters for SEO
  if (text.length > 160) {
    return text.substring(0, 157) + '...'
  }

  return text || 'Read this informative blog post to learn more.'
}

interface BlogPostProps {
  slug: string
}

export default function BlogPost({ slug }: BlogPostProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // Update SEO meta tags
  useEffect(() => {
    if (!post) return

    // Update document title
    document.title = `${post.title} | Your Blog Name`

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    const description = generateMetaDescription(post.richContent || post.contentText || post.content, post.excerpt)
    
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    } else {
      const newMetaDescription = document.createElement('meta')
      newMetaDescription.name = 'description'
      newMetaDescription.content = description
      document.head.appendChild(newMetaDescription)
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', post.title)
    } else {
      const newOgTitle = document.createElement('meta')
      newOgTitle.setAttribute('property', 'og:title')
      newOgTitle.content = post.title
      document.head.appendChild(newOgTitle)
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', description)
    } else {
      const newOgDescription = document.createElement('meta')
      newOgDescription.setAttribute('property', 'og:description')
      newOgDescription.content = description
      document.head.appendChild(newOgDescription)
    }

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.href)
    } else {
      const newOgUrl = document.createElement('meta')
      newOgUrl.setAttribute('property', 'og:url')
      newOgUrl.content = window.location.href
      document.head.appendChild(newOgUrl)
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', post.title)
    } else {
      const newTwitterTitle = document.createElement('meta')
      newTwitterTitle.name = 'twitter:title'
      newTwitterTitle.content = post.title
      document.head.appendChild(newTwitterTitle)
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description)
    } else {
      const newTwitterDescription = document.createElement('meta')
      newTwitterDescription.name = 'twitter:description'
      newTwitterDescription.content = description
      document.head.appendChild(newTwitterDescription)
    }

    // Set canonical URL
    let canonicalUrl = document.querySelector('link[rel="canonical"]')
    if (!canonicalUrl) {
      canonicalUrl = document.createElement('link')
      canonicalUrl.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalUrl)
    }
    canonicalUrl.setAttribute('href', window.location.href)

    // Cleanup function to reset meta tags when component unmounts
    return () => {
      document.title = 'Your Blog Name' // Reset to default title
    }
  }, [post])

  // Update Open Graph and Twitter images when image URL is available
  useEffect(() => {
    if (!post) return

    const imageUrl = getWixImageUrl(post.media?.wixMedia?.image || post.coverMedia?.image)
    if (!imageUrl) return

    // Update Open Graph image
    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) {
      ogImage.setAttribute('content', imageUrl)
    } else {
      const newOgImage = document.createElement('meta')
      newOgImage.setAttribute('property', 'og:image')
      newOgImage.content = imageUrl
      document.head.appendChild(newOgImage)
    }

    // Update Twitter image
    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (twitterImage) {
      twitterImage.setAttribute('content', imageUrl)
    } else {
      const newTwitterImage = document.createElement('meta')
      newTwitterImage.name = 'twitter:image'
      newTwitterImage.content = imageUrl
      document.head.appendChild(newTwitterImage)
    }

    // Set image dimensions if available
    const ogImageWidth = document.querySelector('meta[property="og:image:width"]')
    const ogImageHeight = document.querySelector('meta[property="og:image:height"]')
    
    if (!ogImageWidth) {
      const newOgImageWidth = document.createElement('meta')
      newOgImageWidth.setAttribute('property', 'og:image:width')
      newOgImageWidth.content = '1200'
      document.head.appendChild(newOgImageWidth)
    }
    
    if (!ogImageHeight) {
      const newOgImageHeight = document.createElement('meta')
      newOgImageHeight.setAttribute('property', 'og:image:height')
      newOgImageHeight.content = '630'
      document.head.appendChild(newOgImageHeight)
    }
  }, [post])

  useEffect(() => {
    const fetchPostData = async () => {
      if (!slug) {
        setError('No slug provided')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('Fetching post with slug:', slug)

        if (!wixClient.posts) {
          console.error('Error: wixClient.posts module not available')
          setError('Blog service not available. Please check configuration.')
          return
        }

        let fetchedPost: Post | null = null

        // Try multiple methods to fetch the post
        try {
          if (typeof wixClient.posts.getPostBySlug === 'function') {
            console.log('Trying getPostBySlug...')
            const response = await wixClient.posts.getPostBySlug(slug, {
              fieldsets: ['CONTENT_TEXT', 'URL', 'RICH_CONTENT'],
            })

            if (response.post) {
              fetchedPost = response.post as Post
              console.log('Successfully fetched post using getPostBySlug')
              console.log('Rich content:', fetchedPost.richContent)
            }
          }
        } catch (getBySlugError) {
          console.log('getPostBySlug failed, trying queryPosts:', getBySlugError)
        }

        if (!fetchedPost) {
          try {
            if (typeof wixClient.posts.queryPosts === 'function') {
              console.log('Trying queryPosts...')
              const response = await wixClient.posts.queryPosts().eq('slug', slug).find()

              if (response.items && response.items.length > 0) {
                fetchedPost = response.items[0] as Post
                console.log('Successfully fetched post using queryPosts')
              }
            }
          } catch (queryError) {
            console.error('queryPosts also failed:', queryError)
          }
        }

        if (!fetchedPost) {
          try {
            if (typeof wixClient.posts.listPosts === 'function') {
              console.log('Trying listPosts as fallback...')
              const response = await wixClient.posts.listPosts({
                paging: { limit: 100 },
              })

              const foundPost = response.posts?.find((p: any) => p.slug === slug)
              if (foundPost) {
                fetchedPost = foundPost as Post
                console.log('Successfully found post using listPosts')
              }
            }
          } catch (listError) {
            console.error('listPosts also failed:', listError)
          }
        }

        if (fetchedPost) {
          setPost(fetchedPost)

          // Fetch related posts
          try {
            let relatedPostsData: Post[] = []
            let relatedResponse
            if (typeof wixClient.posts.queryPosts === 'function') {
              console.log('Trying to fetch related posts using queryPosts...')
              const postTags = fetchedPost.tags || []
              const postCategories = fetchedPost.categoryIds || []

              let query = wixClient.posts.queryPosts().ne('_id', fetchedPost._id).limit(6)
              
              if (postTags.length > 0) {
                query = query.hasSome('hashtags', postTags);
                console.log('Querying related posts by hashtags:', postTags)
              } else if (postCategories.length > 0) {
                query = query.hasSome('categoryIds', postCategories);
                console.log('Querying related posts by categories:', postCategories)
              } else {
                console.log('No tags or categories found, fetching recent posts instead.')
              }

              relatedResponse = await query.find()
              relatedPostsData = relatedResponse.items as Post[]
            } else if (typeof wixClient.posts.listPosts === 'function') {
              console.log('Falling back to listPosts for related content...')
              // Fallback to listPosts and filter
              relatedResponse = await wixClient.posts.listPosts({
                paging: { limit: 10 },
              })
              const postsList = relatedResponse.posts || []
              relatedPostsData = postsList
                .filter((p: any) => p._id !== fetchedPost._id)
                .slice(0, 6) as Post[]
            }
            console.log('Fetched related posts:', relatedPostsData.length)
            setRelatedPosts(relatedPostsData)
          } catch (relatedError) {
            console.error('Failed to fetch related posts:', relatedError)
          }
        } else {
          setError("Post not found. The blog post you're looking for doesn't exist or has been removed.")
        }
      } catch (err: any) {
        console.error('Failed to fetch post:', err)
        setError(`Failed to load post: ${err.message || 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPostData()
  }, [slug])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br md:py-10 py-4 from-gray-50 to-white">
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="aspect-[16/9] bg-gray-200"></div>
                <div className="p-8 md:p-12">
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br md:py-10 py-4 from-gray-50 to-white">
        <main className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl"></span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <p className="text-sm text-gray-500 mb-6">Slug: {slug}</p>
              <button
                onClick={() =>  window.history.back()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                 Back
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen md:py-10 py-4 bg-gradient-to-br from-gray-50 to-white">
        <main className="container mx-auto px-4 py-12 text-center">
           <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">剥</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
              <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
              <p className="text-sm text-gray-500 mb-6">Slug: {slug}</p>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                 Back
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const embedVideoUrl = post.media?.embedMedia?.video?.url
  const embedThumbnailUrl = post.media?.embedMedia?.thumbnail?.url
  const youtubeEmbedUrl = getYouTubeEmbedUrl(embedVideoUrl)
  const imageUrl = getWixImageUrl(post.media?.wixMedia?.image || post.coverMedia?.image)
  const readTime = calculateReadTime(post.richContent || post.contentText || post.content, post.minutesToRead)

  return (
    <div className="min-h-screen bg-gradient-to-br px-4 md:px-0 py-4 md:py-10 from-gray-50 to-white">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": generateMetaDescription(post.richContent || post.contentText || post.content, post.excerpt),
            "image": imageUrl ? [imageUrl] : [],
            "datePublished": post.firstPublishedDate,
            "dateModified": post.lastPublishedDate || post.firstPublishedDate,
            "author": {
              "@type": "Organization",
              "name": "Your Organization Name"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Your Organization Name",
              "logo": {
                "@type": "ImageObject",
                "url": "https://yourwebsite.com/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": window.location.href
            }
          })
        }}
      />
      
      <main className="container mx-auto">
        <div className="mx-auto">
          {/* Breadcrumb */}
          <nav className="md:my-3">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-10 px-4 py-2 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </nav>
          <div className="md:space-y-12">
            <div className='grid grid-cols-1 md:grid-cols-3 md:gap-4'>
              <div className='col-span-2'>
                <article className="md:bg-white md:rounded-xs md:shadow-xs overflow-hidden">
                  <div className="p-0 md:p-4">
                    {/* Article Header */}
                    <header className="mt-5">
                      <h1 className="text-2xl md:text-3xl font-medium text-gray-700 mb-6 leading-tight">
                        {post.title}
                      </h1>
                      
                      {/* Post Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <time dateTime={post.firstPublishedDate}>
                            {formatDate(post.firstPublishedDate)}
                          </time>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{readTime}</span>
                        </div>
                        {post.viewCount !== undefined && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.viewCount} views</span>
                          </div>
                        )}
                      </div>

                      {/* Featured Image */}
                      {imageUrl && (
                        <div className="mb-8 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={post.title}
                            className="w-full h-auto object-cover"
                            loading="eager"
                          />
                        </div>
                      )}
                    </header>

                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none">
                      {post.richContent ? (
                        <RicosRenderer content={post.richContent} />
                      ) : post.content ? (
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                      ) : post.contentText ? (
                        <div className="whitespace-pre-wrap text-lg text-gray-700 leading-relaxed">{post.contentText}</div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">統</span>
                          </div>
                          <p className="text-gray-600 italic text-lg">No content available for this post.</p>
                        </div>
                      )}
                    </div>

                    {/* Social Sharing */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Share this post:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={handleShare}
                              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                              aria-label="Share"
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleCopyLink}
                              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                              aria-label="Copy link"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setIsBookmarked(!isBookmarked)}
                            className={`p-2 transition-colors ${
                              isBookmarked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                            }`}
                            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
                          >
                            <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
                          </button>
                          
                          <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={`p-2 transition-colors ${
                              isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                            }`}
                            aria-label={isLiked ? "Unlike" : "Like"}
                          >
                            <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
              <div className='col-span-1 bg-white md:p-4'>
                {/* Related Posts */}
                 {relatedPosts.length > 0 && (
                  <section className="mt-5">
                    <h2 className="text-xl md:text-3xl font-medium text-gray-700 mb-3 leading-tight">Related Articles</h2>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => {
                        const relatedImageUrl = getWixImageUrl(
                          relatedPost.media?.wixMedia?.image || relatedPost.coverMedia?.image
                        );
                        return (
                          <a
                            key={relatedPost._id}
                            href={`/blog/${relatedPost.slug}`}
                            className="flex items-center bg-gray-50 rounded-xs border border-gray-100 shadow-xs hover:shadow-xs transition-all duration-300 p-3"
                          >
                            {relatedImageUrl && (
                              <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                  src={relatedImageUrl}
                                  alt={relatedPost.title}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                              </div>
                            )}
                            <h3 className="ml-3 text-base font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 line-clamp-2">
                              {relatedPost.title}
                            </h3>
                          </a>
                        );
                      })}
                    </div>
                  </section>
                )}
                <div className="lg:sticky mt-4 md:mt-0 md:py-0 md:py-10 lg:top-28 lg:min-h-[calc(100vh-7rem)]">
                  <div className="bg-[#E22026] rounded-xs shadow-xs text-white p-4 text-center">
                    <h2 className="text-2xl md:text-xl font-semibold mb-4 tracking-tight">
                      Ready to Meet Your Specialist?
                    </h2>
                    <p className="text-base md:text-lg mb-6 leading-relaxed">
                      Schedule a consultation with one of our expert doctors and take the first step toward better health.
                    </p>
                    <button
                      onClick={() => (window.location.href = "/contact")}
                      className="inline-flex items-center px-6 font-medium py-2 bg-white text-red-600 rounded-xs hover:bg-red-50 hover:text-gray-700 transition-all duration-200 shadow-xs hover:shadow-md"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}