import React from "react"
import { type RicosNode, type RicosContent, getWixMediaUrl } from "@/lib/ricos-parser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ExternalLink, Play } from 'lucide-react'
import Image from "next/image"
import { getYouTubeEmbedUrl } from "@/lib/utils"
import type { JSX } from "react/jsx-runtime"
import { FaCheckCircle } from 'react-icons/fa';

interface RicosRendererProps {
  content: RicosContent | string
  className?: string
}

export function RicosRenderer({ content, className = "" }: RicosRendererProps) {
  // Handle legacy HTML content
  if (typeof content === "string") {
    return <div className={`prose  text-smpmd:rose-base max-w-none ${className}`} dangerouslySetInnerHTML={{ __html: content }} />
  }

  const renderTextWithDecorations = (textData: any): React.ReactNode => {
    if (!textData) return null

    let element: React.ReactNode = textData.text

    // Apply decorations in reverse order to nest them properly
    if (textData.decorations) {
      for (let i = textData.decorations.length - 1; i >= 0; i--) {
        const decoration = textData.decorations[i]

        switch (decoration.type) {
          case "BOLD":
            element = <span className="font-semibold text-gray-700">{element}</span>
            break
          case "ITALIC":
            element = <em className="italic">{element}</em>
            break
          case "UNDERLINE":
            element = <u className="underline decoration-2 underline-offset-2">{element}</u>
            break
          case "LINK":
            const url = decoration.linkData?.link?.url
            const target = decoration.linkData?.link?.target === "BLANK" ? "_blank" : "_self"
            const rel = decoration.linkData?.link?.rel?.noreferrer ? "noopener noreferrer" : undefined

            element = (
              <a
                href={url?.startsWith("http") ? url : `https://${url}`}
                target={target}
                rel={rel}
                className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200 hover:bg-blue-50 px-1 py-0.5 rounded"
              >
                {element}
                {target === "_blank" && <ExternalLink className="inline w-3 h-3 ml-1" />}
              </a>
            )
            break
          case "COLOR":
            const foreground = decoration.colorData?.foreground
            const background = decoration.colorData?.background

            element = (
              <span
                style={{
                  color: foreground,
                  backgroundColor: background,
                }}
                className={`${background ? "px-0 py-1 rounded-md" : ""}`}
              >
                {element}
              </span>
            )
            break
          case "FONT_SIZE":
            const fontSize = decoration.fontSizeData?.value
            if (fontSize) {
              element = <span style={{ fontSize: `${fontSize}px` }}>{element}</span>
            }
            break
        }
      }
    }

    return element
  }

  const getTextAlignment = (alignment?: string): string => {
    switch (alignment) {
      case "LEFT":
        return "text-left"
      case "CENTER":
        return "text-center"
      case "RIGHT":
        return "text-right"
      case "JUSTIFY":
        return "text-justify"
      default:
        return "text-left"
    }
  }

  const getAlignment = (alignment?: string): string => {
    switch (alignment) {
      case "LEFT":
        return "flex justify-start"
      case "CENTER":
        return "flex justify-center"
      case "RIGHT":
        return "flex justify-end"
      default:
        return "flex justify-center"
    }
  }

  const renderNode = (node: RicosNode, index: number): React.ReactNode => {
    switch (node.type) {
      case "PARAGRAPH":
        if (!node.nodes || node.nodes.length === 0) {
          return <div key={index} className="h-0" />
        }

        return (
          <p
            key={index}
            className={ text-sm`md:text-base text-gray-700 leading-relaxed mb-3 ${getTextAlignment(node.paragraphData?.textStyle?.textAlignment)}`}
          >
            {node.nodes?.map((childNode, childIndex) => renderNode(childNode, childIndex))}
          </p>
        )

      case "HEADING":
        const level = node.headingData?.level || 1
        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
        const headingClasses = {
          1: "text-5xl font-bold mb-8 mt-12 text-gray-900 leading-tight tracking-tight",
          2: "text-4xl font-bold mb-3 mt-10 text-gray-900 leading-tight tracking-tight",
          3: "text-3xl font-bold mb-5 mt-8 text-gray-900 leading-tight",
          4: "text-2xl font-bold mb-4 mt-6 text-gray-900 leading-tight",
          5: "text-xl font-bold mb-3 mt-5 text-gray-900 leading-tight",
          6:  text-sm"md:text-base font-bold mb-2 mt-4 text-gray-900 leading-tight",
        }

        return (
          <HeadingTag
            key={index}
            className={`${headingClasses[level as keyof typeof headingClasses]} ${getTextAlignment(node.headingData?.textStyle?.textAlignment)}`}
          >
            {node.nodes?.map((childNode, childIndex) => renderNode(childNode, childIndex))}
          </HeadingTag>
        )

      case "TEXT":
        return <React.Fragment key={index}>{renderTextWithDecorations(node.textData)}</React.Fragment>

      case "IMAGE":
        const imageId = node.imageData?.image?.src?.id
        const altText = node.imageData?.altText || ""
        const caption = node.imageData?.caption
        const width = node.imageData?.image?.width || 800
        const height = node.imageData?.image?.height || 600
        const alignment = node.imageData?.containerData?.alignment || "CENTER"

        if (!imageId) return null

        return (
          <figure key={index} className={`my-8 ${getAlignment(alignment)}`}>
            <div className="relative overflow-hidden rounded-xs shadow-xs hover:shadow-sm transition-shadow duration-300">
              <Image
                src={getWixMediaUrl(imageId, width, height) || "/placeholder.svg"}
                alt={altText}
                width={width}
                height={height}
                className="w-full h-auto object-cover  transition-transform duration-500"
                priority={index < 2}
                unoptimized
              />
            </div>
            {caption && (
              <figcaption className="text-sm text-gray-600 mt-3 text-center italic bg-gray-50 px-4 py-2 ro text-smumd:nded-base">
                {caption}
              </figcaption>
            )}
          </figure>
        )

      case "VIDEO":
        const videoUrl = node.videoData?.video?.src?.url
        const thumbnailId = node.videoData?.thumbnail?.src?.id
        const videoWidth = node.videoData?.containerData?.width?.size || 800
        const videoHeight = node.videoData?.containerData?.height?.size || 450

        if (!videoUrl) return null

        const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl)

        return (
          <div key={index} className="my-8">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden s text-smhmd:adow-base">
              {youtubeEmbedUrl ? (
                <iframe
                  className="w-full h-full"
                  src={youtubeEmbedUrl}
                  title={node.id || "Embedded YouTube video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={videoUrl}
                  poster={
                    thumbnailId ? getWixMediaUrl(thumbnailId, Number(videoWidth), Number(videoHeight)) : undefined
                  }
                  controls
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        )

      case "BULLETED_LIST":
        return (
          <ul key={index} className="list-none mb-4 space-y-1 text-sm md:text-base text-gray-700">
            {node.nodes?.map((childNode, childIndex) => (
              <li key={childIndex} className="flex items-start gap-x-3">
                <FaCheckCircle className="text-white fill-[#74BF44] mt-1 ml-2 flex-shrink-0" />
                <div className="flex-1">
                  {childNode.nodes?.map((textNode, textIndex) => renderNode(textNode, textIndex))}
                </div>
              </li>
            ))}
          </ul>
        )

      case "ORDERED_LIST":
        return (
          <ol key={index} className="list-decimal  mb-8 space-y-2 text-sm md:text-base text-gray-700 ml-2">
            {node.nodes?.map((childNode, childIndex) => (
              <li key={childIndex} className="leading-relaxed pl-2">
                {childNode.nodes?.map((textNode, textIndex) => renderNode(textNode, textIndex))}
              </li>
            ))}
          </ol>
        )

      case "LIST_ITEM":
        return (
          <React.Fragment key={index}>
            {node.nodes?.map((childNode, childIndex) => renderNode(childNode, childIndex))}
          </React.Fragment>
        )

      case "BLOCKQUOTE":
        return (
          <blockquote
            key={index}
            className="relative border-l-4 border-blue-500 pl-8 py-6 my-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-r-xl"
          >
            <div className="absolute -left-2 -top-2 text-4xl text-blue-400 font-serif">"</div>
            <div className="italic text-sm md:text-base text-gray-800 leading-relaxed">
              {node.nodes?.map((childNode, childIndex) => renderNode(childNode, childIndex))}
            </div>
          </blockquote>
        )

      case "CODE_BLOCK":
        const language = node.codeBlockData?.textStyle?.language || "text"
        const codeText = node.nodes?.map((n) => n.textData?.text).join("") || ""

        return (
          <div key={index} className="my-8">
            <div className="relative bg-gray-900 rounded-xl overflow-hidden s text-smhmd:adow-base">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-sm text-gray-300 font-medium">{language}</span>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <pre className="p-6 overflow-x-auto">
                <code className={`language-${language} text-gray-100 text-sm`}>{codeText}</code>
              </pre>
            </div>
          </div>
        )

      case "DIVIDER":
        return (
          <div key={index} className="my-12 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <div className="px-4">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        )

      case "BUTTON":
        const buttonText = node.buttonData?.text || "Button"
        const buttonUrl = node.buttonData?.link?.url
        const buttonTarget = node.buttonData?.link?.target || "_self"
        const buttonStyle = node.buttonData?.design

        return (
          <div key={index} className="my-8 flex justify-center">
            <Button
              asChild
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium ro text-smumd:nded-base s text-smhmd:adow-base hover:shadow-xl transition-all duration-200"
              style={{
                backgroundColor: buttonStyle?.backgroundColor || "#3B82F6",
                borderColor: buttonStyle?.borderColor,
                color: buttonStyle?.textColor || "white",
              }}
            >
              <a
                href={buttonUrl}
                target={buttonTarget}
                rel={buttonTarget === "_blank" ? "noopener noreferrer" : undefined}
              >
                {buttonText}
                {buttonTarget === "_blank" && <ExternalLink className="w-4 h-4" />}
              </a>
            </Button>
          </div>
        )

      case "EMBED":
        const embedSrc = node.embedData?.src
        const embedType = node.embedData?.type

        if (!embedSrc) return null

        const embedYoutubeUrl = getYouTubeEmbedUrl(embedSrc)

        return (
          <div key={index} className="my-8">
            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden s text-smhmd:adow-base">
              <iframe
                src={embedYoutubeUrl || embedSrc}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title={`Embedded ${embedType || "content"}`}
              />
            </div>
          </div>
        )

      case "GALLERY":
        const galleryItems = node.galleryData?.items || []

        // Group items into pairs for the two-column layout
        const groupedItems = []
        for (let i = 0; i < galleryItems.length; i += 2) {
          groupedItems.push(galleryItems.slice(i, i + 2))
        }

        return (
          <div key={index} className="my-8 space-y-8">
            {groupedItems.map((group, groupIndex) => (
              <div key={groupIndex} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {group.map((item, itemIndex) => {
                  const itemImageId = item.image?.src?.id
                  if (!itemImageId) return null

                  return (
                    <Card key={itemIndex} className="overflow-hidden hover:s text-smhmd:adow-base transition-shadow duration-300 h-full flex flex-col">
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={getWixMediaUrl(itemImageId, 600, 338) || "/placeholder.svg"}
                          alt={item.title || `Gallery image ${itemIndex + 1}`}
                          fill
                          className="object-cover hover:scale-110 transition-transform duration-500"
                          unoptimized
                        />
                      </div>
                      <CardHeader>
                        {item.title && <CardTitle>{item.title}</CardTitle>}
                        {item.description && <CardDescription>{item.description}</CardDescription>}
                      </CardHeader>
                      <CardContent className="flex-grow">
                        {item.description && (
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        )}
                        {/* You can add more content here based on your Ricos data structure */}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ))}
          </div>
        )

      case "AUDIO":
        const audioUrl = node.audioData?.audio?.src?.url
        const audioName = node.audioData?.name
        const authorName = node.audioData?.authorName

        if (!audioUrl) return null

        return (
          <Card key={index} className="my-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                {audioName && <h4 className="font-semibold text-gray-900">{audioName}</h4>}
                {authorName && <p className="text-sm text-gray-600">{authorName}</p>}
              </div>
            </div>
            <audio controls className="w-full">
              <source src={audioUrl} />
              Your browser does not support the audio element.
            </audio>
          </Card>
        )

      case "FILE":
        const fileUrl = node.fileData?.src?.url
        const fileName = node.fileData?.name
        const fileType = node.fileData?.type
        const fileSize = node.fileData?.size

        if (!fileUrl) return null

        return (
          <Card key={index} className="my-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{fileName || "Download File"}</h4>
                <div className="text-sm text-gray-600">
                  {fileType && <span className="mr-2">{fileType.toUpperCase()}</span>}
                  {fileSize && <span>({formatFileSize(fileSize)})</span>}
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="bg-white hover:bg-blue-50 border-blue-200">
                <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </Card>
        )

      default:
        if (node.nodes) {
          return <div key={index}>{node.nodes.map((childNode, childIndex) => renderNode(childNode, childIndex))}</div>
        }
        return null
    }
  }

  return (
    <div className={`prose  text-smpmd:rose-base max-w-none ${className}`}>
      {content.nodes?.map((node, index) => renderNode(node, index))}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}