// lib/wixClient.ts
import { createClient as wixCreateClient, OAuthStrategy } from "@wix/sdk"
import { posts, categories } from "@wix/blog"
import { proGallery } from "@wix/pro-gallery"
import { items } from "@wix/data"
import { submissions } from "@wix/forms"

export const wixClient = wixCreateClient({
  auth: OAuthStrategy({
    clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!, // ⚠️ must be set in .env
  }),
  modules: {
    posts,
    categories,
    proGallery,
    items,
    submissions,
  },
})

export function createClient() {
  return wixCreateClient({
    auth: OAuthStrategy({
      clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
    }),
    modules: {
      posts,
      categories,
      proGallery,
      items,
      submissions,
    },
  })
}
