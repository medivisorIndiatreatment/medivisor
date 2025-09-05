"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  UserRoundIcon as UserRoundMedical,
  Hospital,
  Globe,
  Heart,
  Smile,
  Stethoscope,
  MapPin,
  ThumbsUp,
  CheckCircle,
} from "lucide-react" // Import Lucide icons


export default function WhyChooseUsSection() {
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null)
  const [lastHoveredIndex, setLastHoveredIndex] = useState<number | null>(null)

  const stats = [
    {
      icon: <UserRoundMedical className="text-black w-10 h-10" />, // Modern icon, solid black
      value: "2,000+",
      label: "Patients Cared For",
      description: "Global patient success stories with expert-led care.",
      hoverIcon: <Smile className="text-black w-10 h-10" />, // Modern icon, solid black
      content: {
        title: "Expert Medical Professionals",
        paragraph:
          "Our internationally trained doctors deliver compassionate, patient-first care throughout every step of the treatment journey.",
        bullets: [
          "Globally certified medical experts",
          "Multilingual 24/7 patient assistance",
          "Tailored treatment plans",
        ],
        image: "/download.png",
      },
    },
    {
      icon: <Hospital className="text-black w-10 h-10" />, // Modern icon, solid black
      value: "100+",
      label: "Accredited Hospitals",
      description: "Partnered with world-class medical institutions.",
      hoverIcon: <Stethoscope className="text-black w-10 h-10" />, // Modern icon, solid black
      content: {
        title: "Global Hospital Network",
        paragraph:
          "Gain access to JCI & NABH accredited hospitals across India, equipped with the latest technology and global medical standards.",
        bullets: [
          "JCI & NABH certified facilities",
          "Advanced diagnostic & surgical units",
          "Dedicated case coordination team",
        ],
        image: "/Max-Super-Specialist-Hospital-Saket-New-Delhi.jpg",
      },
    },
    {
      icon: <Globe className="text-black w-10 h-10" />, // Modern icon, solid black
      value: "15+",
      label: "Countries Served",
      description: "Supporting cross-border care and travel.",
      hoverIcon: <MapPin className="text-black w-10 h-10" />, // Modern icon, solid black
      content: {
        title: "Cross-Border Patient Assistance",
        paragraph:
          "We serve patients from over 30 countries by simplifying travel, consultation, and follow-up for a stress-free medical journey.",
        bullets: [
          "Visa & travel documentation support",
          "Remote consultations available",
          "Comprehensive international assistance",
        ],
        image: "/high-angle-view-arrow-sign.jpg",
      },
    },
    {
      icon: <Heart className="text-black w-10 h-10" />, // Modern icon, solid black
      value: "95%",
      label: "Satisfaction Rate",
      description: "Top-rated experiences by real patients.",
      hoverIcon: <ThumbsUp className="text-black w-10 h-10" />, // Modern icon, solid black
      content: {
        title: "Real Results. Real Trust.",
        paragraph:
          "With thousands of successful outcomes and transparent care practices, Medivisor is trusted by patients around the world.",
        bullets: ["High patient satisfaction", "Transparent billing practices", "Ongoing post-treatment support"],
        image: "/100-p.jpg",
      },
    },
  ]

  const defaultContent = {
    title: "Trusted Worldwide by Patients",
    paragraph:
      "Medivisor India Treatment connects you with India’s leading hospitals and doctors, offering affordable, safe, and personalized healthcare. From visa assistance to post-treatment care — your medical journey is in expert hands.",
    bullets: [
      "End-to-end medical concierge support",
      "No hidden charges or long waits",
      "24/7 guidance & second opinions",
      "Complete care before, during, and after treatment",
    ],
    image: "/100-p.jpg",
  }

  const contentToDisplay =
    activeCardIndex !== null
      ? stats[activeCardIndex].content
      : lastHoveredIndex !== null
        ? stats[lastHoveredIndex].content
        : defaultContent

  return (
    <section className="relative py-10 bg-gray-100 px-2 md:px-0 overflow-hidden">
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-white opacity-60"></div>

      <div className="container mx-auto relative z-10">
        {/* Section Heading */}
        {/* <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl mb-10 font-bold text-center md:mb-2 text-gray-900">
            Why Choose Medivisor?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover why patients across the globe trust us for international medical care.
          </p>
        </motion.div> */}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 ">
          {stats.map((stat, index) => {
            const isCurrentlyHovered = activeCardIndex === index

            return (
              <motion.div
                key={index}
                onMouseEnter={() => {
                  setActiveCardIndex(index)
                  setLastHoveredIndex(index)
                }}
                onMouseLeave={() => setActiveCardIndex(null)}
                className={`
                  bg-white rounded-xs p-6 text-center border border-gray-100 transition-all duration-300 ease-in-out cursor-pointer
                  min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden
                  ${isCurrentlyHovered ? "border-2 border-gray-100 shadow-xs" : "border border-gray-100"}
                `}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {/* Background glow/overlay on hover */}
                {isCurrentlyHovered && (
                  <motion.div
                    className="absolute inset-0 bg-gray-100 opacity-50 rounded-xs" // Changed hover background to gray for modern look
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <div className="mb-4 z-10 transition-transform duration-300">
                  {isCurrentlyHovered ? stat.hoverIcon : stat.icon}
                </div>
                <h3 className="text-3xl font-semibold text-gray-900 leading-tight z-10">{stat.value}</h3>
                <p className="text-2xl md:text-xl text-gray-700 mt-1 font-medium z-10">{stat.label}</p>
                <p className="md:px-10 px-4 text-[19px] md:text-lg text-gray-700 mt-2 z-10">{stat.description}</p>
              </motion.div>
            )
          })}
        </div>


      </div>
    </section>
  )
}
