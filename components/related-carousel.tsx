"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Star, MapPin, Hospital, Stethoscope, Pill, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RelatedItem {
  id: string
  name: string
  type: "hospital" | "doctor" | "treatment" | "branch"
  rating?: number
  reviewCount?: number
  location?: string
  department?: string
  specialties?: string[]
  price?: number
  image?: string
  description?: string
  phone?: string
  operatingHours?: string
}

interface RelatedCarouselProps {
  title: string
  items: RelatedItem[]
  type: "hospital" | "doctor" | "treatment" | "branch"
}

export function RelatedCarousel({ title, items, type }: RelatedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 3
  const maxIndex = Math.max(0, items.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-gray-900 text-gray-900" : "text-gray-300"}`}
      />
    ))
  }

  const getIcon = () => {
    switch (type) {
      case "hospital":
        return <Hospital className="w-5 h-5 text-gray-900" />
      case "doctor":
        return <Stethoscope className="w-5 h-5 text-gray-900" />
      case "treatment":
        return <Pill className="w-5 h-5 text-gray-900" />
      case "branch":
        return <Building className="w-5 h-5 text-gray-900" />
    }
  }

  const getHref = (item: RelatedItem) => {
    if (item.type === "branch") {
      // For branches, we need to construct the hospital/branch path
      // This assumes the branch item has the hospital slug in its description or we need to find it
      return "#" // Placeholder - would need hospital context for proper routing
    }
    return `/${item.type}/${createSlug(item.name)}`
  }

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          {getIcon()}
          {title}
        </h3>
        {items.length > itemsPerView && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="h-8 w-8 p-0 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="h-8 w-8 p-0 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView + 0.5)}%)`,
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0" style={{ width: `calc(33.333% - 10.667px)` }}>
              <Card className="h-full bg-white border border-gray-200 rounded-xs hover:shadow-xs transition-shadow duration-200">
                <CardHeader className="pb-3 border-b border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900 text-balance line-clamp-2">{item.name}</CardTitle>
                      {item.department && <p className="text-sm text-gray-500">{item.department}</p>}
                    </div>
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        {renderStars(item.rating)}
                        <span className="text-xs font-medium text-gray-700">{item.rating}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {item.description && <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>}

                  {item.specialties && (
                    <div className="flex flex-wrap gap-1">
                      {item.specialties.slice(0, 2).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs bg-gray-100 text-gray-800 border-transparent">
                          {specialty}
                        </Badge>
                      ))}
                      {item.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                          +{item.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {item.type === "branch" && (
                    <div className="space-y-1">
                      {item.phone && <div className="text-xs text-gray-600">📞 {item.phone}</div>}
                      {item.operatingHours && (
                        <div className="text-xs text-gray-600">🕒 {item.operatingHours}</div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {item.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.price && (
                        <div className="text-sm font-semibold text-gray-900">{formatPrice(item.price)}</div>
                      )}
                    </div>
                    <Link href={getHref(item)}>
                      <Button size="sm" className="text-xs bg-gray-900 text-white hover:bg-gray-800 rounded-full">
                        {item.type === "doctor" ? "Book" : item.type === "branch" ? "Visit" : "View"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}