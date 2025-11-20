"use client"

import React, { useEffect, useState } from 'react'
import { wixClient } from '@/lib/wixClient'
import { media } from '@wix/sdk'
import { ChevronLeft, Facebook, Twitter, Linkedin, Copy, Clock, Calendar, Eye, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { RicosRenderer } from './RichContentViewer'
import { extractTextFromRicos, type RicosContent } from '@/lib/ricos-parser'

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
  settings?: any
}

// Function to get Wix Image URL with better error handling
function getWixImageUrl(wixUrl: string | undefined): string | null {
  if (!wixUrl) return null
  
  try {
    if (wixUrl.startsWith('wix:image://')) {
      const { url } = media.getImageUrl(wixUrl)
      return url
    } else if (wixUrl.startsWith('http')) {
      return wixUrl
    }
    return null
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
    // Added &modestbranding=1&rel=0 for a cleaner look
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
  } else if (content && 'nodes' in content) {
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
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (e) {
    return 'N/A'
  }
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

  // Client-side meta tag updates
  useEffect(() => {
    if (!post) return

    document.title = `${post.title} | Medivisor India`

    return () => {
      document.title = 'Medivisor India'
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

      // **CRITICAL CHECK** - Ensure wixClient and posts module are available and callable
      if (!wixClient || !wixClient.posts || typeof wixClient.posts.getPostBySlug !== 'function') {
          console.error('[v0] Error: wixClient or wixClient.posts.getPostBySlug module not available')
          setError('Blog service not available. Please check API Key configuration and ensure the Wix Blog V4 SDK is correctly integrated.')
          setIsLoading(false)
          return
      }
      
      const postsClient = wixClient.posts // Alias for cleaner code

      try {
        console.log('[v0] Fetching post with slug:', slug)

        let fetchedPost: Post | null = null

        // --- Attempt 1: getPostBySlug with RICH_CONTENT Fieldset ---
        // The error is being thrown here, confirming the API call failed (likely CORS/Permissions)
        try {
          console.log('[v0] Attempting getPostBySlug with RICH_CONTENT fieldset...')
          
          const response = await postsClient.getPostBySlug(slug, {
            fieldsets: ['RICH_CONTENT']
          })
          
          // Use optional chaining for safe access
          if (response?.post) { 
            fetchedPost = response.post as Post
            console.log('[v0] Successfully fetched post with rich content using getPostBySlug')
          } else {
            console.log('[v0] getPostBySlug response was null or missing post. Trying queryPosts.')
          }
        } catch (getBySlugError: any) {
          // This catch block executes when the API call fails
          console.error(`[v0] getPostBySlug failed with error: ${getBySlugError.message || 'Unknown error'}. Trying queryPosts.`)
          // Continue to the next attempt (queryPosts)
        }

        // --- Attempt 2: queryPosts with RICH_CONTENT Fieldset (Fallback) ---
        if (!fetchedPost && typeof postsClient.queryPosts === 'function') {
          try {
            console.log('[v0] Trying queryPosts with RICH_CONTENT fieldset...')
            
            const response = await postsClient.queryPosts()
              .eq('slug', slug)
              // client-side .find() does not accept an options object; fieldsets must be requested server-side or via getPostBySlug
              .find()

            // Use optional chaining for safe access
            if (response?.items && response.items.length > 0) {
              fetchedPost = response.items[0] as Post
              console.log('[v0] Successfully fetched post using queryPosts')
            } else {
              console.log('[v0] queryPosts returned no items.')
            }
          } catch (queryError: any) {
            console.error(`[v0] queryPosts failed with error: ${queryError.message || 'Unknown error'}`)
            // Fallback failed
          }
        }

        if (fetchedPost) {
          setPost(fetchedPost)

          // Fetch related posts
          try {
            let relatedPostsData: Post[] = []
            if (typeof postsClient.queryPosts === 'function') {
              console.log('[v0] Fetching related posts using queryPosts...')
              const postTags = fetchedPost.tags || []
              const postCategories = fetchedPost.categoryIds || []

              let query = postsClient.queryPosts().ne('_id', fetchedPost._id).limit(6)
              
              if (postTags.length > 0) {
                query = query.hasSome('hashtags', postTags) 
              } else if (postCategories.length > 0) {
                query = query.hasSome('categoryIds', postCategories)
              }
              
              const relatedResponse = await query.find()
              // Use optional chaining for safe access
              relatedPostsData = (relatedResponse?.items as Post[]) || [] 
            } else if (typeof postsClient.listPosts === 'function') {
              // Fallback to listPosts if queryPosts is not available (less ideal)
              console.log('[v0] Fetching related posts using listPosts (fallback)...')
              const relatedResponse = await postsClient.listPosts({
                paging: { limit: 10 },
              })
              // Use optional chaining for safe access
              const postsList = (relatedResponse?.posts || []) as Post[] 
              relatedPostsData = postsList
                .filter((p: Post) => p._id !== fetchedPost!._id)
                .slice(0, 6) 
            }
            setRelatedPosts(relatedPostsData)
          } catch (relatedError) {
            console.error('[v0] Failed to fetch related posts:', relatedError)
          }
        } else {
          setError("Post not found. The blog post you're looking for doesn't exist or has been removed.")
        }
      } catch (err: any) {
        console.error('[v0] Failed to fetch post (Outer Catch):', err)
        setError(`Failed to load post. This is likely due to a network, CORS, or API Key error with the Wix SDK. Please check your Wix configuration. Error: ${err.message || 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPostData()
  }, [slug])

  const handleShare = async (platform?: string) => {
    const shareUrl = post?.url || window.location.href
    const shareTitle = post?.title || ''
    const shareText = post?.excerpt || ''

    if (platform) {
      const encodedUrl = encodeURIComponent(shareUrl)
      const encodedTitle = encodeURIComponent(shareTitle)

      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')
          break
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank')
          break
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')
          break
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank') 
          break
        default:
          break
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(post?.url || window.location.href)
      alert('Link copied to clipboard!')
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
                <span className="text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
              <p className="text-[#241d1f] mb-6">{error}</p>
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

  if (!post) {
    return (
      <div className="min-h-screen md:py-10 py-4 bg-gradient-to-br from-gray-50 to-white">
        <main className="container mx-auto px-4 py-12 text-center">
           <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
              <p className="text-[#241d1f] mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
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
  const youtubeEmbedUrl = getYouTubeEmbedUrl(embedVideoUrl)
  const imageUrl = getWixImageUrl(post.media?.wixMedia?.image || post.coverMedia?.image)
  const readTime = calculateReadTime(post.richContent || post.contentText || post.content, post.minutesToRead)

  return (
    <div className="min-h-screen bg-gradient-to-br px-4 md:px-0 py-4 md:py-10 from-gray-50 to-white">
      <main className="container mx-auto">
        <div className="mx-auto">
          <nav className="md:my-3">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-10 px-4 py-2 border-gray-200 text-[#241d1f] hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </nav>
          <div className="md:space-y-12">
            <div className='grid grid-cols-1 md:grid-cols-3 md:gap-4'>
              <div className='col-span-1 md:col-span-2'>
                <article className="md:bg-white md:rounded-xs md:shadow-xs overflow-hidden">
                  <div className="p-0 md:p-4">
                    <header className="mt-5">
                      <h1 className="text-2xl md:text-3xl font-medium text-[#241d1f] mb-6 leading-tight">
                        {post.title}
                      </h1>
                      
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

                      {(imageUrl || youtubeEmbedUrl) && (
                        <div className="mb-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                          {youtubeEmbedUrl ? (
                            <div className="aspect-w-16 aspect-h-9 w-full">
                                <iframe 
                                    src={youtubeEmbedUrl} 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    title={post.title}
                                    className="w-full h-full aspect-[16/9]"
                                ></iframe>
                            </div>
                          ) : imageUrl ? (
                            <img
                              src={imageUrl || "/placeholder.svg"}
                              alt={post.title}
                              className="w-full h-auto object-cover max-h-[60vh]"
                              loading="eager"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : null}
                        </div>
                      )}
                    </header>

                    <div className="prose prose-lg max-w-none">
                      {post.richContent ? (
                        <RicosRenderer content={post.richContent} />
                      ) : post.content ? (
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                      ) : post.contentText ? (
                        <div className="whitespace-pre-wrap text-lg text-[#241d1f] leading-relaxed">{post.contentText}</div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📝</span>
                          </div>
                          <p className="text-[#241d1f] italic text-lg">No content available for this post. Please check the post editor in Wix to ensure content is saved and the API is correctly configured to fetch it.</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#241d1f]">Share this post:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleShare()}
                              className="p-2 text-[#241d1f] hover:text-blue-600 transition-colors"
                              aria-label="Share"
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleShare('facebook')}
                              className="p-2 text-[#241d1f] hover:text-blue-600 transition-colors"
                              aria-label="Share on Facebook"
                            >
                              <Facebook className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleShare('twitter')}
                              className="p-2 text-[#241d1f] hover:text-blue-400 transition-colors"
                              aria-label="Share on Twitter"
                            >
                              <Twitter className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleShare('linkedin')}
                              className="p-2 text-[#241d1f] hover:text-blue-700 transition-colors"
                              aria-label="Share on LinkedIn"
                            >
                              <Linkedin className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleShare('whatsapp')}
                              className="p-2 text-[#241d1f] hover:text-green-600 transition-colors"
                              aria-label="Share on WhatsApp"
                            >
                              <MessageCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleCopyLink}
                              className="p-2 text-[#241d1f] hover:text-gray-800 transition-colors"
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
                              isBookmarked ? 'text-blue-600' : 'text-[#241d1f] hover:text-blue-600'
                            }`}
                            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
                          >
                            <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
                          </button>
                          
                          <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={`p-2 transition-colors ${
                              isLiked ? 'text-red-600' : 'text-[#241d1f] hover:text-red-600'
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
              <div className='col-span-1'>
                {relatedPosts.length > 0 && (
                  <section className="mt-5 md:mt-0 md:bg-white md:rounded-xs md:shadow-xs md:p-4">
                    <h2 className="text-xl md:text-2xl font-medium text-[#241d1f] mb-3 leading-tight border-b pb-2 md:border-none md:pb-0">Related Articles</h2>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => {
                        const relatedImageUrl = getWixImageUrl(
                          relatedPost.media?.wixMedia?.image || relatedPost.coverMedia?.image
                        )
                        return (
                          <a
                            key={relatedPost._id}
                            href={`/blog/${relatedPost.slug}`}
                            className="flex items-start bg-gray-50 md:bg-white rounded-xs border border-gray-100 hover:shadow-sm transition-all duration-300 p-3"
                          >
                            {relatedImageUrl && (
                              <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                  src={relatedImageUrl || "/placeholder.svg"}
                                  alt={relatedPost.title}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                            <h3 className="ml-3 text-base font-medium text-[#241d1f] hover:text-gray-800 transition-colors duration-200 line-clamp-3">
                              {relatedPost.title}
                            </h3>
                          </a>
                        )
                      })}
                    </div>
                  </section>
                )}
                <div className="lg:sticky mt-8 lg:top-28">
                  <div className="bg-[#E22026] rounded-xs shadow-xl text-white p-6 text-center">
                    <h2 className="text-2xl font-semibold mb-4 tracking-tight">
                      Ready to Meet Your Specialist?
                    </h2>
                    <p className="text-base mb-6 leading-relaxed">
                      Schedule a consultation with one of our expert doctors and take the first step toward better health.
                    </p>
                    <button
                      onClick={() => (window.location.href = "/contact")}
                      className="inline-flex items-center px-6 font-medium py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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