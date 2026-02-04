"use client"

import { useState } from "react"
import Link from "next/link"
import { Scissors } from "lucide-react"
import MarqueeHeading from "./MarqueeHeading"
import { generateSlug, getTreatmentImage } from "../utils"

const TreatmentCard = ({ item }: { item: any }) => {
  const [isHovered, setIsHovered] = useState(false)
  const treatmentImage = getTreatmentImage(item.treatmentImage || item.image)
  const itemName = item.name || item.title || 'N/A Treatment'
  const itemSlug = generateSlug(itemName)
  const specialistName = item.specialistName
  const cost = item.startingCost || item.cost

  return (
    <Link
      href={`/treatment/${itemSlug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col h-full bg-white border md:border-gray-100 border-gray-200 rounded-xs shadow-lg md:shadow-sm hover:shadow-md overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-gray-400/50"
    >
      <div className="relative h-72 md:h-48 overflow-hidden bg-gray-50 rounded-t-lg">
        {treatmentImage ? (
          <img src={treatmentImage} alt={`${itemName} treatment`} className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} onError={(e) => { e.currentTarget.style.display = "none" }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100"><Scissors className="w-12 h-12 text-gray-300" /></div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col font-light">
        <div className="overflow-hidden">
          <MarqueeHeading isHovered={isHovered}>
            <h3 className="text-2xl md:text-lg font-medium text-gray-900 leading-tight">
              {itemName}
            </h3>
          </MarqueeHeading>
        </div>
        
        {/* Specialist Name */}
        {specialistName && (
          <p className="text-sm text-gray-500 mt-1 truncate">
            {specialistName}
          </p>
        )}
        
        {/* Cost */}
        {cost && (
          <p className="text-sm font-medium text-[#74BF44] mt-1">
            From {cost}
          </p>
        )}
      </div>
    </Link>
  )
}

export default TreatmentCard