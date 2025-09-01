import { NextResponse, type NextRequest } from "next/server";
import { wixServerClient } from "@/lib/wixServer";

// Define a list of allowed origins.
const ALLOWED_ORIGINS = [
  "https://medivisor-ujuu.vercel.app",
  "https://www.medivisor-ujuu.vercel.app",
  "https://www.medivisor-ujuu.vercel.ap", 

  "https://medivisorindiatreatment.com/"
];

/**
 * Creates CORS headers dynamically based on the requesting origin.
 * @param origin The origin header from the incoming request.
 * @returns A headers object suitable for NextResponse.
 */
const getCorsHeaders = (origin: string | null) => {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
};


/**
 * Handles the GET request for a specific blog post by its slug.
 * @param req The incoming Next.js request object.
 * @param context The context object containing dynamic route parameters.
 * @returns A Next.js response with the requested post data or an error.
 */
export async function GET(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  const { slug } = context.params;
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400, headers });
  }

  try {
    let post = null;

    if (typeof wixServerClient.posts.getPostBySlug === "function") {
      const response = await wixServerClient.posts.getPostBySlug(slug, {
        fieldsets: ["CONTENT_TEXT", "URL", "RICH_CONTENT"],
      });
      post = response.post;
    }

    if (!post && typeof wixServerClient.posts.queryPosts === "function") {
      const response = await wixServerClient.posts.queryPosts().eq("slug", slug).find();
      if (response.items.length > 0) post = response.items[0];
    }

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404, headers });
    }

    return NextResponse.json(post, { status: 200, headers });
  } catch (error: any) {
    console.error(`[api/wix-posts/${slug}] Error fetching post:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch post" },
      { status: 500, headers }
    );
  }
}

/**
 * Handles the OPTIONS preflight request for CORS.
 * @returns A successful Next.js response with CORS headers.
 */
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);
  
  return new NextResponse(null, {
    status: 200,
    headers,
  });
}