"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Stethoscope, DollarSign, Star, MapPin } from "lucide-react"
import type { ExtendedTreatmentType } from '@/types/search'
import { getWixImageUrl, generateSlug, formatLocation } from '@/types/search'

type TreatmentCardProps = {
  treatment: ExtendedTreatmentType
}

const ScrollableTitle = ({ text, className, isHovered }: { text: string; className?: string; isHovered: boolean }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [animationDuration, setAnimationDuration] = useState('0s');

  React.useEffect(() => {
    const checkOverflow = () => {
      const rAF = window.requestAnimationFrame(() => {
        if (containerRef.current && textRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const textWidth = textRef.current.scrollWidth;

          if (textWidth > containerWidth) {
            setIsOverflowing(true);
            const duration = textWidth / 50;
            setAnimationDuration(`${Math.max(duration, 5)}s`);
          } else {
            setIsOverflowing(false);
            setAnimationDuration('0s');
          }
        }
      });
      return () => window.cancelAnimationFrame(rAF);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile: show 2 lines (no hover effects)
  if (isMobile) {
    return (
      <div className={`${className} line-clamp-2`}>
        {text}
      </div>
    );
  }

  // On desktop: use original marquee logic
  const isMarqueeActive = isOverflowing && isHovered;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
    >
      <div
        className={`whitespace-nowrap inline-block ${!isMarqueeActive ? 'truncate w-full' : ''}`}
        style={{
          animation: isMarqueeActive ? `marquee ${animationDuration} linear infinite` : 'none',
          transform: 'translateX(0)',
        }}
      >
        <span ref={textRef} className="inline-block pr-8">
          {text}
        </span>

        {isMarqueeActive && (
          <span className="inline-block pr-8">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

const TreatmentCard = ({ treatment }: TreatmentCardProps) => {
  const [isHovered, setIsHovered] = useState(false); // ADDED hover state
  const slug = generateSlug(treatment.name)
  const imageUrl = getWixImageUrl(treatment.treatmentImage)

  // ⭐ UPDATED: Location logic to include state name and display count
  const primaryLocation = useMemo(() => {
    const availLocs = treatment.filteredBranchesAvailableAt || treatment.branchesAvailableAt

    if (!availLocs || availLocs.length === 0) {
      return { name: "Location Varies", cost: treatment.cost }
    }

    const firstLoc = availLocs[0]
    const cityData = firstLoc.cities?.[0]

    // Format: "City, State, Country" (e.g., "Gurugram, Delhi NCR, India")
    const locationString = formatLocation(cityData)

    return {
      name: locationString,
      cost: firstLoc.cost || treatment.cost,
    }
  }, [treatment])

  return (
    <Link href={`/treatment/${slug}`} className="block">
      <article
        className="group bg-white rounded-xs md:mb-0 mb-5 shadow-sm md:shadow-xs transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col hover:shadow-sm border border-gray-100"
        onMouseEnter={() => setIsHovered(true)} // ADDED handler
        onMouseLeave={() => setIsHovered(false)} // ADDED handler
      >
        <div className="relative h-72 md:h-48 overflow-hidden bg-gray-50">
          {treatment.popular && (
            <span className="absolute top-3 right-3 z-10 inline-flex items-center text-sm bg-gray-50 text-gray-600 font-medium px-3 py-2 rounded-xs shadow-sm border border-gray-100">
              <Star className="w-3 h-3 mr-1 fill-gray-300 text-gray-400" />Popular
            </span>
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={treatment.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.currentTarget.style.display = "none" }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Stethoscope className="w-12 h-12 text-gray-200" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
        </div>

        <div className="p-3 flex-1 flex flex-col md:space-y-1">
          <header className="space-y-2 flex-1 min-h-0">
            <h2 className="md:text-base text-2xl py-2 md:py-0 font-medium leading-[20px] text-gray-900 transition-colors">
              <ScrollableTitle text={treatment.name} isHovered={isHovered} /> {/* PASSED prop */}
            </h2>

            {treatment.category && (
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="inline-block bg-gray-50 line-clamp-1 text-gray-600 text-base md:text-sm px-3 py-2 rounded-xs font-medium border border-gray-100">
                  {treatment.category}
                </span>
              </div>
            )}
          </header>

          {/* <footer className="border-t border-gray-200 pt-2 flex flex-col gap-2">
            <p className="text-base md:text-sm text-gray-700 font-normal flex items-center gap-1">
              <DollarSign className="w-4 h-4 flex-shrink-0 text-gray-700" />
              Starting from <span className="font-medium text-gray-900">{primaryLocation.cost || 'Inquire'}</span>
            </p>
          </footer> */}
        </div>
      </article>
    </Link>
  )
}

export default TreatmentCard