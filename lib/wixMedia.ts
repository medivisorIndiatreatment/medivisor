import { media } from "@wix/sdk"

/**
 * Converts a Wix media URL (e.g., wix:image://v1/...) to a public-facing CDN URL.
 * @param wixUrl The original Wix media URL.
 * @returns The CDN URL or null if the input is invalid or an error occurs.
 */
export function getWixImageUrl(wixUrl: string | undefined): string | null {
  if (!wixUrl || !wixUrl.startsWith("wix:image://")) {
    return null
  }
  try {
    const result = media.getImageUrl(wixUrl)
    return result.url
  } catch (error) {
    // Console error removed, returning null on failure
    return null
  }
}

/**
 * Gets a Wix image URL scaled to fill the specified width and height.
 * @param wixUrl The original Wix media URL.
 * @param width The desired width.
 * @param height The desired height.
 * @returns The scaled CDN URL or a standard CDN URL on failure.
 */
export function getWixScaledToFillImageUrl(wixUrl: string | undefined, width: number, height: number): string | null {
  if (!wixUrl || !wixUrl.startsWith("wix:image://")) {
    return null
  }

  try {
    const url = media.getScaledToFillImageUrl(wixUrl, width, height, {
      quality: 85,
      autoEncode: true,
    })
    return url
  } catch (error) {
    // Console error removed, falling back to original URL
    return getWixImageUrl(wixUrl)
  }
}

/**
 * Gets a Wix image URL scaled to fit within the specified width and height.
 * @param wixUrl The original Wix media URL.
 * @param width The desired width.
 * @param height The desired height.
 * @returns The scaled CDN URL or a standard CDN URL on failure.
 */
export function getWixScaledToFitImageUrl(wixUrl: string | undefined, width: number, height: number): string | null {
  if (!wixUrl || !wixUrl.startsWith("wix:image://")) {
    return null
  }

  try {
    const url = media.getScaledToFitImageUrl(wixUrl, width, height, {
      quality: 90,
      autoEncode: true,
    })
    return url
  } catch (error) {
    // Console error removed, falling back to original URL
    return getWixImageUrl(wixUrl)
  }
}

/**
 * Gets the thumbnail URL for a Wix video URL.
 * @param wixUrl The original Wix video URL (wix:video://...).
 * @returns The thumbnail URL or null on failure.
 */
export function getWixVideoThumbnailUrl(wixUrl: string | undefined): string | null {
  if (!wixUrl || !wixUrl.startsWith("wix:video://")) {
    return null
  }
  try {
    const result = media.getVideoUrl(wixUrl)
    return result.thumbnail // This gives the thumbnail URL
  } catch (error) {
    // Console error removed, returning null on failure
    return null
  }
}

/**
 * Determines the best available cover image URL for a given 'moment' object by checking various fields.
 * All internal logging (console.log) has been removed.
 * @param moment The object containing potential image fields (e.g., coverMedia, mediagallery).
 * @returns The scaled cover image URL or null if no valid image is found.
 */
export function getBestCoverImage(moment: any): string | null {
  // Try cover media first
  if (moment.coverMedia?.image) {
    const coverUrl = getWixScaledToFillImageUrl(moment.coverMedia.image, 2000, 1500)
    if (coverUrl) {
      return coverUrl
    }
  }

  // Try coverPhoto field
  if (moment.coverPhoto) {
    const coverPhotoUrl = getWixScaledToFillImageUrl(moment.coverPhoto, 2000, 1500)
    if (coverPhotoUrl) {
      return coverPhotoUrl
    }
  }

  // Try first image from media gallery
  if (moment.mediagallery && Array.isArray(moment.mediagallery) && moment.mediagallery.length > 0) {
    const firstImage = moment.mediagallery.find((media: any) => media.src && media.src.startsWith("wix:image://"))
    if (firstImage?.src) {
      const galleryUrl = getWixScaledToFillImageUrl(firstImage.src, 2000, 1500)
      if (galleryUrl) {
        return galleryUrl
      }
    }
  }

  // Try any common image field
  const imageFields = [
    "image",
    "photo",
    "picture",
    "thumbnail",
    "mainImage",
    "featuredImage",
    "coverImage",
    "heroImage",
    "primaryImage",
  ]

  for (const field of imageFields) {
    if (moment[field]) {
      let imageUrl = null

      // Handle different field structures
      if (typeof moment[field] === "string" && moment[field].startsWith("wix:image://")) {
        imageUrl = moment[field]
      } else if (moment[field]?.url && moment[field].url.startsWith("wix:image://")) {
        imageUrl = moment[field].url
      } else if (moment[field]?.src && moment[field].src.startsWith("wix:image://")) {
        imageUrl = moment[field].src
      } else if (moment[field]?.imageInfo && moment[field].imageInfo.startsWith("wix:image://")) {
        imageUrl = moment[field].imageInfo
      }

      if (imageUrl) {
        const fieldUrl = getWixScaledToFillImageUrl(imageUrl, 2000, 1500)
        if (fieldUrl) {
          return fieldUrl
        }
      }
    }
  }

  // Try to extract any wix:image:// URLs from the entire object recursively
  const findWixImageInObject = (obj: any, maxDepth = 3): string | null => {
    if (maxDepth <= 0) return null

    if (typeof obj === "string" && obj.startsWith("wix:image://")) {
      return obj
    }

    if (typeof obj === "object" && obj !== null) {
      if (!Array.isArray(obj)) {
        for (const value of Object.values(obj)) {
          const result = findWixImageInObject(value, maxDepth - 1)
          if (result) return result
        }
      } else {
        for (let i = 0; i < Math.min(obj.length, 5); i++) {
          const result = findWixImageInObject(obj[i], maxDepth - 1)
          if (result) return result
        }
      }
    }

    return null
  }

  const foundImage = findWixImageInObject(moment)
  if (foundImage) {
    const foundUrl = getWixScaledToFillImageUrl(foundImage, 2000, 1500)
    if (foundUrl) {
      return foundUrl
    }
  }

  return null
}