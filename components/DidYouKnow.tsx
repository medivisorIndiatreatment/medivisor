"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { FaLightbulb } from "react-icons/fa";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react"

const images = [
  {
    src: "/about1.jpg",
    alt: "Modern Medical Facility in India",
    caption: "World-class JCI-accredited hospitals",
  },
  // {
  //   src: "/international-patients-indian-hospital.png",
  //   alt: "International Patients in India",
  //   caption: "Over 2 million patients annually",
  // },
  // {
  //   src: "/indian-robotic-surgery.png",
  //   alt: "Advanced Robotic Surgery",
  //   caption: "Leading in robotic surgeries",
  // },
  // {
  //   src: "/medivisor-mauritius-office.png",
  //   alt: "Medivisor Mauritius Office",
  //   caption: "Our Mauritius Office",
  // },
]

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <section className="w-full bg-gray-50 py-10">
    <div className="container mx-auto px-4 md:px-0">
      <div className="bg-white rounded-md p-4 md:p-10 md:grid grid-cols-2 items-center gap-4 md:gap-12 overflow-hidden border border-gray-100 animate-pulse">
        {/* Skeleton for Image */}
        <div className="relative col-span-1 bg-gray-200 h-96 md:h-[500px]">
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {[...Array(images.length)].map((_, index) => (
              <div key={index} className="w-2 h-2 rounded-full bg-gray-400" />
            ))}
          </div>
        </div>

        {/* Skeleton for Content */}
        <div className="md:pt-0 pt-6 col-span-1 flex justify-center md:justify-start">
          <div className="max-w-2xl w-full">
            <div className="h-10 w-64 bg-gray-200 rounded mb-6" />
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gray-200" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default function DidYouKnowSection() {
  const [currentImage, setCurrentImage] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(true)

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500) // Adjust time as needed
    return () => clearTimeout(timer)
  }, [])

  // Auto-advance slider
  useEffect(() => {
    if (loading || !isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, loading])

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
    setIsAutoPlaying(false)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
    setIsAutoPlaying(false)
  }

  const goToImage = (index: number) => {
    setCurrentImage(index)
    setIsAutoPlaying(false)
  }

  const listItems = [
    "Over 2 million international patients travel to India every year for affordable, high-quality medical care.",
    "India offers treatment at up to 80% lower costs than the Philippines, Thailand, Malaysia, or Singapore.",
    "India is home to hundreds of world-class, JCI-accredited hospitals and thousands of internationally trained surgeons.",
    "The country leads in robotic surgeries, organ transplants, bone marrow transplants, and advanced cancer therapies—all at affordable prices.",
    "With an Indian eVisa available within 24–72 hours, patients can start treatment immediately, with virtually no waiting time.",
    <span>
      Medivisor has proudly assisted over 2,500 patients from the Pacific
      Islands, Africa, CIS countries, and beyond in accessing seamless,
      world-class medical care in India.
    </span>,
    <span>
      You can reach our India Office at{" "}
      <a
        href="tel:+91 83682 47758"
        className="transition-colors duration-200 hover:text-[#74BF44]"
      >
        +91 83682 47758
      </a>{" "}
      for quick treatment information and travel assistance.
    </span>,
  ]

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <section className="w-full bg-gray-50 py-4 md:py-10">
      <div className="container mx-auto ">
        <div className="md:bg-white rounded-xs p-2 md:p-6 md:grid grid-cols-2 items-center gap-4 md:gap-12 overflow-hidden md:border border-none border-gray-100 transition-all duration-700">
          {/* Left Image Slider (Sticky on Mobile) */}
          <div className="relative col-span-1 group h-[250px] md:h-96 lg:h-[500px] md:static sticky top-0 md:top-auto mb-6 md:mb-0">
            <div className="relative w-full h-full overflow-hidden rounded-xs">
              {/* Main Image */}
              <div className="relative w-full h-full">
                <Image
                  src={images[currentImage].src}
                  alt={images[currentImage].alt}
               
                  width={1200}
                  height={700}
                  priority   // extremely important for LCP
                  quality={70}
                  sizes="100vw"
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                />
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImage
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                      }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="md:pt-6 pt-2 col-span-1 flex justify-center md:justify-start">
            <div className="max-w-2xl md:px-0 ">
              <h3 className="heading-base mb-2 flex -ml-3 items-center gap-x-3">
                <FaLightbulb className="text-red-500" />
                Did You Know?
              </h3>

              <ul className="space-y-3 descrtiption">
                {listItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-x-3 group">
                    <div className="py-0 md:py-0.5">
                      <div className=" description-1 ">
                        {index + 1}.
                      </div>
                    </div>
                    <span className="description">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}