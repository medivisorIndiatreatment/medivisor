"use client"

import { useEffect, useState } from "react"
import { wixClient } from "@/lib/wixClient"
import { media } from "@wix/sdk"
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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RicosRenderer } from "@/components/RichContentViewer"
import { extractTextFromRicos, type RicosContent } from "@/lib/ricos-parser"

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
    if (!wixUrl || !wixUrl.startsWith("wix:image://")) {
        return null
    }
    try {
        const { url } = media.getImageUrl(wixUrl)
        return url
    } catch (error) {
        console.error("Error getting Wix image URL:", error)
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

    if (!content) return "Less than 1 min read"

    let text = ""
    if (typeof content === "string") {
        text = content.replace(/<[^>]*>/g, "")
    } else if (content.nodes) {
        text = extractTextFromRicos(content.nodes)
    }

    const wordsPerMinute = 200
    const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return minutes === 0 ? "Less than 1 min read" : `${minutes} min read`
}

// Function to format date
function formatDate(dateString: string | undefined): string {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

interface BlogPostClientPageProps {
    slug: string
}

export default function BlogPostClientPage({ slug }: BlogPostClientPageProps) {
    const [post, setPost] = useState<Post | null>(null)
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [isLiked, setIsLiked] = useState(false)

    useEffect(() => {
        const fetchPostData = async () => {
            if (!slug) {
                setError("No slug provided")
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                console.log("Fetching post with slug:", slug)

                if (!wixClient.posts) {
                    console.error("Error: wixClient.posts module not available")
                    setError("Blog service not available. Please check configuration.")
                    return
                }

                let fetchedPost: Post | null = null

                // Try multiple methods to fetch the post
                try {
                    if (typeof wixClient.posts.getPostBySlug === "function") {
                        console.log("Trying getPostBySlug...")
                        const response = await wixClient.posts.getPostBySlug(slug, {
                            fieldsets: ["CONTENT_TEXT", "URL", "RICH_CONTENT"], // Include rich content
                        })

                        if (response.post) {
                            fetchedPost = response.post as Post
                            console.log("Successfully fetched post using getPostBySlug")
                            console.log("Rich content:", fetchedPost.richContent)
                        }
                    }
                } catch (getBySlugError) {
                    console.log("getPostBySlug failed, trying queryPosts:", getBySlugError)
                }

                if (!fetchedPost) {
                    try {
                        if (typeof wixClient.posts.queryPosts === "function") {
                            console.log("Trying queryPosts...")
                            const response = await wixClient.posts.queryPosts().eq("slug", slug).find()

                            if (response.items && response.items.length > 0) {
                                fetchedPost = response.items[0] as Post
                                console.log("Successfully fetched post using queryPosts")
                            }
                        }
                    } catch (queryError) {
                        console.error("queryPosts also failed:", queryError)
                    }
                }

                if (!fetchedPost) {
                    try {
                        if (typeof wixClient.posts.listPosts === "function") {
                            console.log("Trying listPosts as fallback...")
                            const response = await wixClient.posts.listPosts({
                                paging: { limit: 100 },
                            })

                            const foundPost = response.posts?.find((p: any) => p.slug === slug)
                            if (foundPost) {
                                fetchedPost = foundPost as Post
                                console.log("Successfully found post using listPosts")
                            }
                        }
                    } catch (listError) {
                        console.error("listPosts also failed:", listError)
                    }
                }

                if (fetchedPost) {
                    setPost(fetchedPost)

                    // Fetch related posts
                    try {
                        let relatedPostsData: Post[] = []

                        if (typeof wixClient.posts.listPosts === "function") {
                            const relatedResponse = await wixClient.posts.listPosts({
                                paging: { limit: 4 },
                            })
                            relatedPostsData = (relatedResponse.posts || [])
                                .filter((p: any) => p._id !== fetchedPost._id)
                                .slice(0, 3) as Post[]
                        } else if (typeof wixClient.posts.queryPosts === "function") {
                            const relatedResponse = await wixClient.posts.queryPosts().ne("_id", fetchedPost._id).limit(3).find()
                            relatedPostsData = relatedResponse.items as Post[]
                        }

                        setRelatedPosts(relatedPostsData)
                    } catch (relatedError) {
                        console.error("Failed to fetch related posts:", relatedError)
                    }
                } else {
                    setError("Post not found. The blog post you're looking for doesn't exist or has been removed.")
                }
            } catch (err: any) {
                console.error("Failed to fetch post:", err)
                setError(`Failed to load post: ${err.message || "Unknown error"}`)
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
                console.log("Error sharing:", error)
            }
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            // You could add a toast notification here
        } catch (error) {
            console.error("Failed to copy link:", error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <main className="container mx-auto px-4 py-12">
                    <div className="w-full mx-auto">
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <main className="container mx-auto px-4 py-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">😞</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <p className="text-sm text-gray-500 mb-6">Slug: {slug}</p>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                <Link href="/blog" className="inline-flex items-center">
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Back to Blog
                                </Link>
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <main className="container mx-auto px-4 py-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🔍</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
                            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
                            <p className="text-sm text-gray-500 mb-6">Slug: {slug}</p>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                <Link href="/blog" className="inline-flex items-center">
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Back to Blog
                                </Link>
                            </Button>
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
        <div className="min-h-screen bg-gray-100">
            <main className="py-8 md:py-8">
                <div className="container mx-auto px-4 md:px-0 ">
                    {/* Breadcrumb */}
                    <nav className="mb-6">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back to Blog
                        </Link>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <article className="bg-white rounded-xs col-span-2 shadow-xs border border-gray-100 overflow-hidden">
                            <div className="p-8 md:p-8">
                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl  font-bold text-left mb-8 text-gray-900">
                                    {post.title}
                                </h1>
                                <div className="prose prose-lg max-w-none">
                                    {post.richContent ? (
                                        <RicosRenderer content={post.richContent} />
                                    ) : post.content ? (
                                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                    ) : post.contentText ? (
                                        <div className="whitespace-pre-wrap text-lg text-gray-700 leading-relaxed">{post.contentText}</div>
                                    ) : (
                                        <div className="text-center py-4y">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="text-2xl">📝</span>
                                            </div>
                                            <p className="text-gray-600 italic text-lg">No content available for this post.</p>
                                        </div>
                                    )}
                                </div>

                               
                            </div>
                        </article>

                        {/* Sidebar */}
                        <div className="relative">
                            <aside className="space-y-8 top-0 sticky ">
                                {/* Related Posts */}
                                {relatedPosts.length > 0 && (
                                    <Card className="bg-white border-gray-100 shadow-sm">
                                        <CardContent className="p-3">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">Related Articles</h3>
                                            <div className="space-y-6">
                                                {relatedPosts.map((relatedPost) => {
                                                    const relatedImageUrl = getWixImageUrl(
                                                        relatedPost.media?.wixMedia?.image || relatedPost.coverMedia?.image,
                                                    )
                                                    return (
                                                        <Link
                                                            key={relatedPost._id}
                                                            href={`/blog/${relatedPost.slug}`}
                                                            className="group border-gray-200 border flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                                                        >
                                                            {relatedImageUrl && (
                                                                <div className="flex-shrink-0">
                                                                    <Image
                                                                        src={relatedImageUrl || "/placeholder.svg"}
                                                                        alt={relatedPost.title}
                                                                        width={80}
                                                                        height={80}
                                                                        className="rounded-lg object-cover group-hover:scale-105 transition-transform duration-200"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-sm line-clamp-2 mb-0 group-hover:text-blue-600 transition-colors duration-200">
                                                                    {relatedPost.title}
                                                                </h4>
                                                                <div className="flex items-center justify-between">

                                                                    <p className="text-xs text-gray-600">
                                                                        {calculateReadTime(
                                                                            relatedPost.richContent || relatedPost.contentText,
                                                                            relatedPost.minutesToRead,
                                                                        )}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mb-1">{formatDate(relatedPost.firstPublishedDate)}</p>
                                                                </div>

                                                            </div>
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}



                                <Card className="bg-gradient-to-r from-red-600 to-red-700 border-none shadow-none text-white">
                                    <CardContent className="p-8 text-center">
                                        <h2 className="text-3xl font-bold mb-4">Ready to Meet Your Specialist?</h2>
                                        <p className="text-lg mb-6">
                                            Schedule a consultation with any of our expert doctors and take the first<br />
                                            step towards better health.
                                        </p>
                                       
                                    </CardContent>
                                </Card>

                            </aside>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
