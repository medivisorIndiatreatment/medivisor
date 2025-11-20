"use client"

import React from "react"
import { media } from "@wix/sdk"
import type { JSX } from "react/jsx-runtime" // Import JSX to resolve undeclared variable error

interface RicosContent {
  nodes: any[]
  metadata?: any
}

interface RicosRendererProps {
  content: RicosContent | any[]
}

export function RicosRenderer({ content }: RicosRendererProps) {
  if (!content || (!content.nodes && !Array.isArray(content))) {
    return null
  }

  const nodes = content.nodes || (Array.isArray(content) ? content : [])

  if (nodes.length === 0) {
    return null
  }

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null

    // Handle paragraph nodes
    if (node.type === "PARAGRAPH" || node.paragraphData) {
      return (
        <p key={index} className="mb-6 text-base md:text-lg text-[#241d1f] leading-relaxed">
          {node.nodes && renderNodes(node.nodes)}
          {node.textData && node.textData.text}
        </p>
      )
    }

    // Handle heading nodes
    if (node.type === "HEADING" || node.headingData) {
      const level = node.headingData?.level || 2
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
      const className =
        level === 1
          ? "text-2xl md:text-3xl font-bold mb-6 mt-8 text-[#241d1f]"
          : level === 2
            ? "text-xl md:text-2xl font-semibold mb-4 mt-6 text-[#241d1f]"
            : "text-lg md:text-xl font-medium mb-3 mt-4 text-[#241d1f]"

      return (
        <HeadingTag key={index} className={className}>
          {node.nodes && renderNodes(node.nodes)}
          {node.textData && node.textData.text}
        </HeadingTag>
      )
    }

    // Handle text nodes
    if (node.type === "TEXT" || node.textData) {
      const text = node.textData?.text || ""
      let className = "text-base md:text-lg text-[#241d1f]"

      // Handle text decorations
      if (node.textData?.decorations) {
        const decorations = node.textData.decorations
        if (decorations.includes("BOLD")) className += " font-bold"
        if (decorations.includes("ITALIC")) className += " italic"
        if (decorations.includes("UNDERLINE")) className += " underline"
      }

      return (
        <span key={index} className={className}>
          {text}
        </span>
      )
    }

    // Handle list nodes
    if (node.type === "BULLETED_LIST" || node.bulletedListData) {
      return (
        <ul key={index} className="list-disc list-inside mb-6 space-y-2 ml-4">
          {node.nodes && renderNodes(node.nodes)}
        </ul>
      )
    }

    if (node.type === "ORDERED_LIST" || node.orderedListData) {
      return (
        <ol key={index} className="list-decimal list-inside mb-6 space-y-2 ml-4">
          {node.nodes && renderNodes(node.nodes)}
        </ol>
      )
    }

    if (node.type === "LIST_ITEM" || node.listItemData) {
      return (
        <li key={index} className="text-base md:text-lg text-[#241d1f] leading-relaxed">
          {node.nodes && renderNodes(node.nodes)}
        </li>
      )
    }

    if (node.type === "IMAGE" || node.imageData) {
      const imageSourceData = node.imageData?.image?.src || node.imageData?.containerData?.image?.src
      let imageSrc = ""

      if (imageSourceData && typeof imageSourceData === "object") {
        if (imageSourceData.id) {
          imageSrc = imageSourceData.id
        } else if (imageSourceData.url) {
          imageSrc = imageSourceData.url
        }
      } else if (typeof imageSourceData === "string") {
        imageSrc = imageSourceData
      }

      const alt = node.imageData?.altText || "Blog Image"
      const width = node.imageData?.image?.width || node.imageData?.containerData?.width
      const height = node.imageData?.image?.height || node.imageData?.containerData?.height

      let finalImageUrl = ""

      if (imageSrc) {
        // Wix image IDs are typically in format: 9a90e8_4a7b68f4413e4667b8b55b25c5002f50~mv2.jpg
        // Convert to: https://static.wixstatic.com/media/9a90e8_4a7b68f4413e4667b8b55b25c5002f50~mv2.jpg
        if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
          finalImageUrl = imageSrc
        } else if (imageSrc.startsWith("wix:image://")) {
          // Handle wix:image:// protocol using Wix SDK
          try {
            const { url } = media.getImageUrl(imageSrc)
            finalImageUrl = url
          } catch (error) {
            // Fallback parsing method
            const match = imageSrc.match(/wix:image:\/\/v1\/([^/]+)\//)
            if (match && match[1]) {
              finalImageUrl = `https://static.wixstatic.com/media/${match[1]}`
            }
          }
        } else {
          const safeImageSrc = String(imageSrc)
          if (!safeImageSrc.includes("/")) {
            finalImageUrl = `https://static.wixstatic.com/media/${safeImageSrc}`
          } else {
            finalImageUrl = safeImageSrc
          }
        }
      }

      if (finalImageUrl) {
        return (
          <div key={index} className="my-8">
            <img
              src={finalImageUrl || "/placeholder.svg"}
              alt={alt}
              className="w-full h-auto rounded-lg shadow-sm"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/blog-abstract-design.png"
              }}
            />
            {alt && alt !== "Blog Image" && <p className="text-sm text-gray-500 text-center mt-2 italic">{alt}</p>}
          </div>
        )
      }
    }

    // Handle video nodes
    if (node.type === "VIDEO" || node.videoData) {
      const src = node.videoData?.video?.src || node.videoData?.src
      const poster = node.videoData?.thumbnail?.url

      if (src) {
        return (
          <div key={index} className="my-8">
            <video controls poster={poster} className="w-full h-auto rounded-lg shadow-sm" src={src}>
              Your browser does not support the video tag.
            </video>
          </div>
        )
      }
    }

    // Handle divider
    if (node.type === "DIVIDER" || node.dividerData) {
      return <hr key={index} className="my-8 border-gray-200" />
    }

    // Handle blockquote
    if (node.type === "BLOCKQUOTE" || node.blockquoteData) {
      return (
        <blockquote
          key={index}
          className="border-l-4 border-blue-500 pl-6 my-6 italic text-[#241d1f] bg-gray-50 py-4 rounded-r-lg"
        >
          {node.nodes && renderNodes(node.nodes)}
        </blockquote>
      )
    }

    // Handle code block
    if (node.type === "CODE_BLOCK" || node.codeBlockData) {
      return (
        <pre key={index} className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto my-6">
          <code className="text-sm font-mono">{node.textData?.text || (node.nodes && renderNodes(node.nodes))}</code>
        </pre>
      )
    }

    if (node.type === "LINK" || node.linkData) {
      const href = node.linkData?.link?.url || "#"
      const target = node.linkData?.link?.target || "_self"

      return (
        <a
          key={index}
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {node.nodes && renderNodes(node.nodes)}
        </a>
      )
    }

    // Recursive rendering for nested nodes
    if (node.nodes && Array.isArray(node.nodes)) {
      return <React.Fragment key={index}>{renderNodes(node.nodes)}</React.Fragment>
    }

    return null
  }

  const renderNodes = (nodes: any[]): React.ReactNode[] => {
    if (!Array.isArray(nodes)) return []
    return nodes.map((node, index) => renderNode(node, index))
  }

  return <div className="rich-content-viewer">{renderNodes(nodes)}</div>
}
