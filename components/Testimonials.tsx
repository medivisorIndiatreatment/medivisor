"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronRight } from "lucide-react"

export default function Testimonials() {
  const [showMoreButton, setShowMoreButton] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState<{[key: string]: boolean}>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [currentVideo, setCurrentVideo] = useState({
    id: "tRFHfLX-v2Q",
    title: "Akanisi Navuku from Fiji - Cancer Treatment",
  })

  const testimonials = [
    {
      id: "tRFHfLX-v2Q",
      name: "Akanisi Navuku",
      treatment: "Cancer Treatment",
      title: "Akanisi Navuku from Fiji - Cancer Treatment",
    },
    {
      id: "KZDq1ICki0k",
      name: "Cathy Koe",
      treatment: "Mitral Valve Replacement",
      title: "Cathy Koe from Solomon Islands",
    },
    {
      id: "5NVBGLyg5Cs",
      name: "Sterry Toukes",
      treatment: "Heart Treatment",
      title: "Sterry Toukes from PNG - Heart Treatment",
    },
    {
      id: "5BsftwEpNLo",
      name: "Leon Warsal",
      treatment: "Aortic Valve Replacement",
      title: "Leon Warsal from Vanuatu - Aortic Valve Replacement",
    },
    {
      id: "c2HbMordW7s",
      name: "Jean Gabriel",
      treatment: "Hodgkin's Lymphoma",
      title: "Jean Gabriel from Vanuatu - Hodgkin's Lymphoma",
    },
    {
      id: "SQ1RQELGqUM",
      name: "Freda Sofu",
      treatment: "Kidney Stone Removal",
      title: "Freda Sofu from Solomon Islands - Kidney Stone Removal",
    },
  ]

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const container = scrollContainerRef.current
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5
          setShowMoreButton(isAtBottom)
        }
      }, 100)
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
      handleScroll()

      return () => {
        container.removeEventListener("scroll", handleScroll)
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const changeVideo = (videoId: string, title: string) => {
    setCurrentVideo({ id: videoId, title })
  }

  const handleImageLoad = (testimonialId: string) => {
    setImageLoaded(prev => ({ ...prev, [testimonialId]: true }))
  }

  // Skeleton loader component
  const VideoSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-8 w-3/4 mb-4 rounded"></div>
      <div className="aspect-video bg-gray-200 rounded-lg"></div>
    </div>
  )

  const TestimonialSkeleton = () => (
    <div className="animate-pulse flex items-center p-1 rounded-md border border-gray-200">
      <div className="w-24 h-16 bg-gray-200 rounded-md"></div>
      <div className="ml-4 flex-1">
        <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
        <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
      </div>
    </div>
  )

  return (
    <section className="px-2 md:px-0 md:py-10 py-4 bg-white" id="Stories" itemScope itemType="https://schema.org/VideoGallery">
      <div className="container text-center px-4 md:px-0 mx-auto">
        <div className="md:text-center text-left mb-3 md:mb-6 mt-8 md:mt-0 max-w-3xl mx-auto">
          <h2 className="heading-base mb-2" itemProp="name">Patient Testimonials</h2>
          <p className="description" itemProp="description">
            Discover the voices of 2,500+ international patients who found comfort, care, and a hassle-free treatment journey in India — all made possible with Medivisor by their side.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2 border-t md:border-gray-100 border-gray-200 md:shadow">
            {isLoading ? (
              <VideoSkeleton />
            ) : (
              <>
                <h4 className="title-heading py-5" itemProp="name">{currentVideo.title}</h4>
                <div className="aspect-video overflow-hidden border-gray-100" itemProp="video" itemScope itemType="https://schema.org/VideoObject">
                  <meta itemProp="name" content={currentVideo.title} />
                  <meta itemProp="thumbnailUrl" content={`https://img.youtube.com/vi/${currentVideo.id}/maxresdefault.jpg`} />
                  <meta itemProp="embedUrl" content={`https://www.youtube.com/embed/${currentVideo.id}`} />
                  
                  {/* Lazy loaded YouTube iframe with click-to-play optimization */}
                  <div className="relative w-full h-full bg-gray-100">
                    <iframe
                      loading="lazy"
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=1&rel=0&modestbranding=1&showinfo=0&playsinline=1`}
                      title={`Patient Testimonial: ${currentVideo.title}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      itemProp="embedUrl"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Testimonials List */}
          <div>
            <div className="md:bg-white pb-1 md:border md:border-gray-100">
              <h3 className="title-heading py-5">Inspiring Stories</h3>
              <div 
                ref={scrollContainerRef} 
                className="space-y-4 text-left overflow-y-auto max-h-[444px] md:px-4 py-2"
                role="list"
              >
                {isLoading ? (
                  // Show skeletons during loading
                  Array(6).fill(0).map((_, index) => (
                    <TestimonialSkeleton key={index} />
                  ))
                ) : (
                  // Actual testimonials
                  testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className="cursor-pointer flex items-center p-1 rounded-md border border-gray-200 hover:bg-[#E22026]/10 transition group"
                      onClick={() => changeVideo(testimonial.id, testimonial.title)}
                      role="listitem"
                      itemScope
                      itemType="https://schema.org/VideoObject"
                    >
                      {/* Optimized image with skeleton */}
                      <div className="relative w-24 h-16">
                        {!imageLoaded[testimonial.id] && (
                          <div className="absolute inset-0 bg-gray-200 rounded-md animate-pulse"></div>
                        )}
                        <Image
                          src={`https://img.youtube.com/vi/${testimonial.id}/hqdefault.jpg`}
                          alt={`Video thumbnail: ${testimonial.name} - ${testimonial.treatment}`}
                          width={96}
                          height={64}
                          className={`w-24 h-16 object-cover rounded-md border transition-opacity duration-300 ${
                            imageLoaded[testimonial.id] ? 'opacity-100' : 'opacity-0'
                          }`}
                          loading={index < 3 ? "eager" : "lazy"}
                          onLoad={() => handleImageLoad(testimonial.id)}
                          itemProp="thumbnailUrl"
                        />
                      </div>
                      
                      <div className="ml-4">
                        <p 
                          className="font-semibold text-[#241d1f] group-hover:text-black"
                          itemProp="name"
                        >
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-500" itemProp="description">
                          {testimonial.treatment}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* More Videos Button */}
              <div className="md:px-4 py-3 pt-5 md:border-t border-gray-100">
                <button className="w-full px-4 py-2 bg-gray-100 text-[#241d1f] border border-gray-200 rounded-md text-base font-medium hover:bg-gray-200 transition-colors">
                  <a 
                    href="/patient-testimonials" 
                    className="flex items-center justify-center gap-2"
                    aria-label="View more patient testimonial videos"
                  >
                    More Videos
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGallery",
            "name": "Patient Testimonials - Medivisor India Treatment",
            "description": "Watch inspiring stories from international patients who received medical treatment in India with Medivisor's assistance.",
            "video": testimonials.map(testimonial => ({
              "@type": "VideoObject",
              "name": testimonial.title,
              "description": `Patient testimonial from ${testimonial.name} about ${testimonial.treatment}`,
              "thumbnailUrl": `https://img.youtube.com/vi/${testimonial.id}/maxresdefault.jpg`,
              "embedUrl": `https://www.youtube.com/embed/${testimonial.id}`,
              "uploadDate": "2024-01-01",
              "duration": "PT2M",
            }))
          })
        }}
      />
    </section>
  )
}