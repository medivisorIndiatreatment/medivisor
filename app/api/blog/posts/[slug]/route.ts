import type { NextApiRequest, NextApiResponse } from 'next'
import { wixClient } from '@/lib/wixClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug' })
  }

  try {
    let post = null

    // Try getPostBySlug
    if (typeof wixClient.posts.getPostBySlug === 'function') {
      const response = await wixClient.posts.getPostBySlug(slug, {
        fieldsets: ['CONTENT_TEXT', 'URL', 'RICH_CONTENT'],
      })
      post = response.post
    }

    // Fallback query
    if (!post && typeof wixClient.posts.queryPosts === 'function') {
      const response = await wixClient.posts.queryPosts().eq('slug', slug).find()
      if (response.items.length > 0) post = response.items[0]
    }

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    res.status(200).json(post)
  } catch (error: any) {
    console.error('Error fetching post:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch post' })
  }
}
