import { type NextRequest, NextResponse } from "next/server"
import { wixServerClient } from "@/lib/wixServer"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    console.log("[v0] Fetching post with slug:", slug)

    let post: any = null

    // First try getPostBySlug
    try {
      if (typeof wixServerClient.posts.getPostBySlug === "function") {
        const response = await wixServerClient.posts.getPostBySlug(slug)
        post = response.post
        console.log("[v0] Post found using getPostBySlug")
      }
    } catch (error) {
      console.log("[v0] getPostBySlug failed, trying queryPosts...")
      try {
        if (typeof wixServerClient.posts.queryPosts === "function") {
          const response = await wixServerClient.posts.queryPosts().eq("slug", slug).find()
          post = response.items?.[0]
          console.log("[v0] Post found using queryPosts")
        }
      } catch (fallbackError) {
        console.error("[v0] Both methods failed:", fallbackError)
        return withCors(
          NextResponse.json({ error: "Post not found" }, { status: 404 })
        )
      }
    }

    if (!post) {
      return withCors(
        NextResponse.json({ error: "Post not found" }, { status: 404 })
      )
    }

    const processedPost = {
      ...post,
      excerpt: post.excerpt || "No description available.",
      content: post.content || "",
      publishedDate: post.publishedDate || post.firstPublishedDate,
      author: post.author || { name: "Anonymous" },
      tags: post.tags || [],
      categories: post.categories || [],
    }

    console.log("[v0] Post processed successfully:", processedPost.title)

    return withCors(NextResponse.json({ post: processedPost }))
  } catch (error) {
    console.error("[v0] Failed to fetch post:", error)
    return withCors(
      NextResponse.json(
        {
          error: "Failed to fetch blog post",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      )
    )
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }))
}

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}
