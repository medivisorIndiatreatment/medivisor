// File: app/hospitals/[slug]/page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import type { HospitalWithBranchPreview } from "@/types/hospital"
import {
  Hospital,
  Building2,
  Calendar,
  Bed,
  Award,
  Phone,
  Mail,
  Globe,
  MapPin,
  Users,
  Heart,
  Star,
  ChevronLeft,
  Loader2,
  Stethoscope,
  Scissors,
  ChevronRight,
  Clock,
  ArrowRight,
  ExternalLink,
  Home,
} from "lucide-react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import classNames from "classnames"
import ContactForm from "@/components/ContactForm"

// Helper function to extract the main hospital image URL from rich content
const getHospitalImage = (richContent: any): string | null => {
  if (!richContent || !richContent.nodes) return null
  const imageNode = richContent.nodes.find((node: any) => node.type === 'IMAGE')
  if (imageNode?.imageData?.image?.src?.id) {
    const id = imageNode.imageData.image.src.id
    return `https://static.wixstatic.com/media/${id}`
  }
  return null
}

// Helper function to extract hospital logo URL from rich content
const getHospitalLogo = (richContent: any): string | null => {
  if (!richContent || !richContent.nodes) return null
  const imageNode = richContent.nodes?.[0]
  if (imageNode?.type === 'IMAGE' && imageNode.imageData?.image?.src?.id) {
    const id = imageNode.imageData.image.src.id
    return `https://static.wixstatic.com/media/${id}`
  }
  return null
}

// Helper function to extract doctor image URL from rich content
const getDoctorImage = (richContent: any): string | null => {
  if (!richContent || !richContent.nodes) return null
  const imageNode = richContent.nodes.find((node: any) => node.type === 'IMAGE')
  if (imageNode?.imageData?.image?.src?.id) {
    const id = imageNode.imageData.image.src.id
    return `https://static.wixstatic.com/media/${id}`
  }
  return null
}

// Helper function to extract branch image URL from rich content
const getBranchImage = (richContent: any): string | null => {
  if (!richContent || !richContent.nodes) return null
  const imageNode = richContent.nodes.find((node: any) => node.type === 'IMAGE')
  if (imageNode?.imageData?.image?.src?.id) {
    const id = imageNode.imageData.image.src.id
    return `https://static.wixstatic.com/media/${id}`
  }
  return null
}

// Helper function to extract treatment image URL from rich content
const getTreatmentImage = (richContent: any): string | null => {
  if (!richContent || !richContent.nodes) return null
  const imageNode = richContent.nodes.find((node: any) => node.type === 'IMAGE')
  if (imageNode?.imageData?.image?.src?.id) {
    const id = imageNode.imageData.image.src.id
    return `https://static.wixstatic.com/media/${id}`
  }
  return null
}

// Helper function to generate a URL-friendly slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Helper function to generate branch slug
const generateBranchSlug = (hospitalSlug: string, branchName: string): string => {
  const branchSlug = generateSlug(branchName)
  return `${hospitalSlug}-${branchSlug}`
}

// Helper function to remove banners (images) from HTML description
const removeBannersFromDescription = (html: string): string => {
  // Remove all <img> tags to eliminate banners
  return html.replace(/<img[^>]*>/g, '').replace(/<br\s*\/?>/gi, '\n');
}

// Sub-component: Breadcrumb Navigation
const BreadcrumbNav = ({ hospitalName }: { hospitalName: string }) => (
  <nav aria-label="Breadcrumb" className="container bg-white mx-auto px-4 sm:px-6 lg:px-8 ">
    <ol className="flex items-center space-x-1 text-sm py-3 text-gray-500">
      <li>
        <Link href="/" className="flex items-center hover:text-gray-700 transition-colors">
          <Home className="w-4 h-4 mr-1" />
          Home
        </Link>
      </li>
      <li>
        <span className="mx-1">/</span>
      </li>
      <li>
        <Link href="/hospitals" className="flex items-center hover:text-gray-700 transition-colors">
          Hospitals
        </Link>
      </li>
      <li>
        <span className="mx-1">/</span>
      </li>
      <li className="text-[#241d1f] font-medium">{hospitalName}</li>
    </ol>
  </nav>
)

// Sub-component: Hospital Detail Skeleton
const HospitalDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Hero Skeleton */}
    <section className="relative w-full h-[70vh] bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full z-10 px-6 pb-12">
        <div className="container mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-gray-300 rounded-full w-16 h-16" />
                <div className="space-y-2">
                  <div className="h-8 bg-gray-300 rounded w-64" />
                  <div className="h-6 bg-gray-300 rounded w-96" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Breadcrumb Skeleton */}
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="flex items-center space-x-2 py-4 text-sm">
        <div className="h-4 bg-gray-300 rounded w-12" />
        <div className="h-4 bg-gray-300 rounded w-8 mx-2" />
        <div className="h-4 bg-gray-300 rounded w-20" />
      </div>
    </div>

    {/* Main Content Skeleton */}
    <section className="py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-4 pb-12">
          <main className="lg:col-span-9 space-y-4">
            {/* Overview Skeleton */}
            <div className="bg-white rounded-xs shadow-xs border border-gray-100 p-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-xs mx-auto" />
                    <div className="h-6 bg-gray-200 rounded-xs mx-auto w-20" />
                    <div className="h-4 bg-gray-200 rounded-xs mx-auto w-16" />
                  </div>
                ))}
              </div>
            </div>

            {/* About Skeleton */}
            <div className="bg-white rounded-xs shadow-xs border border-gray-100 p-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded" />
                <div className="h-6 bg-gray-200 rounded" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </div>
            </div>

            {/* Branches Skeleton */}
            <div className="bg-white rounded-xs shadow-xs border border-gray-100 p-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-3 bg-white rounded-xs shadow-xs border border-gray-100">
                    <div className="h-48 bg-gray-200 rounded-t-xs" />
                    <div className="h-6 bg-gray-200 rounded-xs w-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded-xs w-3/4" />
                      <div className="h-4 bg-gray-200 rounded-xs w-1/2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 bg-gray-200 rounded-xs" />
                      <div className="h-12 bg-gray-200 rounded-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctors Carousel Skeleton */}
            <div className="bg-white rounded-xs shadow-xs border border-gray-100 p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6" />
              <div className="overflow-hidden">
                <div className="flex gap-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-72 bg-white rounded-xs shadow-xs border border-gray-100 space-y-3">
                      <div className="h-48 bg-gray-200 rounded-t-xs" />
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded-xs w-full" />
                        <div className="h-5 bg-gray-200 rounded-xs w-3/4" />
                        <div className="h-4 bg-gray-200 rounded-xs w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Treatments Carousel Skeleton */}
            <div className="bg-white rounded-xs shadow-xs border border-gray-100 p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6" />
              <div className="overflow-hidden">
                <div className="flex gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-72 bg-white rounded-xs shadow-xs border border-gray-100 space-y-3">
                      <div className="h-48 bg-gray-200 rounded-t-xs" />
                      <div className="space-y-2 px-6">
                        <div className="h-6 bg-gray-200 rounded-xs w-full" />
                        <div className="h-4 bg-gray-200 rounded-xs w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar Skeleton */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="bg-white sticky top-16 rounded-xs shadow-xs p-6 border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-xs" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
)

// Stat Card Component
const StatCard = ({ icon: Icon, value, label }: { icon: any; value: string | number; label: string }) => (
  <div className="text-center p-6 bg-gray-50 rounded-xs border border-gray-100 shadow-xs hover:shadow-sm group">
    <div className="w-12 h-12 bg-white rounded-xs flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-100 transition-colors">
      <Icon className="w-6 h-6 text-[#241d1f] group-hover:text-gray-700" />
    </div>
    <p className="text-2xl font-bold text-[#241d1f]">{value}</p>
    <p className="text-[#241d1f] mt-2 text-sm font-medium uppercase">{label}</p>
  </div>
)

// Doctor Card Component
const DoctorCard = ({ item }: { item: any }) => {
  const doctorImage = getDoctorImage(item.profileImage)
  const doctorSlug = item.slug || generateSlug(item.name)

  return (
    <Link
      href={`/doctors/${doctorSlug}`}
      className="group h-full flex flex-col hover:no-underline"
    >
      <div className="relative flex-1 min-h-48 rounded-t-xs overflow-hidden bg-gray-100">
        {doctorImage ? (
          <Image
            src={doctorImage}
            alt={item.name}
            fill
            className="object-cover w-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Stethoscope className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-800 text-lg line-clamp-1 group-hover:text-gray-600 transition-colors duration-200">
            {item.name}
          </h5>
          <p className="text-gray-600 font-medium line-clamp-1">
            {item.specialization}
          </p>
          <p className="text-gray-500 text-sm line-clamp-1">
            {item.qualification}
          </p>
          {item.designation && (
            <p className="text-gray-500 text-sm line-clamp-1">
              {item.designation}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

// Treatment Card Component
const TreatmentCard = ({ item }: { item: any }) => {
  const treatmentImage = getTreatmentImage(item.treatmentImage)
  const treatmentSlug = item.slug || generateSlug(item.name)

  return (
    <Link
      href={`/treatment/${treatmentSlug}`}
      className="group h-full flex flex-col hover:no-underline"
    >
      <div className="relative flex-1 min-h-48 rounded-t-xs overflow-hidden bg-gray-100">
        {treatmentImage ? (
          <Image
            src={treatmentImage}
            alt={item.name}
            fill
            className="object-cover w-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Scissors className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-800 text-lg line-clamp-1 group-hover:text-gray-600 transition-colors duration-200">
            {item.name}
          </h5>
          <p className="text-gray-600 font-medium line-clamp-1">
            {item.category || 'Specialized Treatment'}
          </p>
          <p className="text-gray-500 text-sm line-clamp-2">
            {item.description || "Comprehensive medical treatment for optimal recovery."}
          </p>
        </div>
        {item.cost && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 font-semibold text-sm">Starting from ${item.cost}</p>
          </div>
        )}
      </div>
    </Link>
  )
}

// Branch Card Component
const BranchCard = ({ branch, hospitalSlug }: { branch: any; hospitalSlug: string }) => {
  const branchImage = getBranchImage(branch.branchImage)
  const branchSlug = generateBranchSlug(hospitalSlug, branch.name)

  return (
    <Link href={`/hospitals/branches/${branchSlug}`} className="group block">
      <div className="relative w-full h-48 rounded-t-xs overflow-hidden bg-gray-100 mb-4">
        {branchImage ? (
          <Image
            src={branchImage}
            alt={`${branch.name} facility`}
            fill
            className="object-cover w-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6 bg-white rounded-b-xs shadow-xs border border-gray-100">
        <h5 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-1">{branch.name}</h5>
        {branch.address && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{branch.address}</p>}
        <div className="flex flex-wrap gap-2 mb-4">
          {branch.totalBeds && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-xs text-xs text-gray-600">
              <Bed className="w-3 h-3" />
              {branch.totalBeds} Beds
            </span>
          )}
          {branch.operatingRooms && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-xs text-xs text-gray-600">
              <Scissors className="w-3 h-3" />
              {branch.operatingRooms} ORs
            </span>
          )}
        </div>
        {branch.emergencyContact && (
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Phone className="w-4 h-4" />
            {branch.emergencyContact}
          </div>
        )}
      </div>
    </Link>
  )
}

// Embla Carousel Component for Doctors and Treatments
const EmblaCarousel = ({
  items,
  title,
  Icon,
  type
}: {
  items: any[],
  title: string,
  Icon: any,
  type: 'doctors' | 'treatments'
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    breakpoints: {
      '(min-width: 768px)': {
        slidesToScroll: 1,
      },
      '(min-width: 1024px)': {
        slidesToScroll: 1,
      },
    },
  })

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const itemsPerView = 3
  const visibleSlidesClass = 'w-1/3'

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="title-text flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#241d1f]" />
          {title} <span className="description-2 font-normal">({items.length})</span>
        </h3>
        {items.length > itemsPerView && (
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              className="bg-white rounded-xs p-3 shadow-xs border border-gray-100 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={scrollNext}
              className="bg-white rounded-xs p-3 shadow-xs border border-gray-100 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {items.map((item, index) => (
            <div key={item._id || index} className={classNames("flex-shrink-0 bg-white rounded-xs p-0 border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1", visibleSlidesClass)}>
              {type === 'doctors' ? (
                <DoctorCard item={item} />
              ) : (
                <TreatmentCard item={item} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sub-component: Quick Actions Sidebar
const QuickActionsSidebar = () => (
  <>
  <ContactForm/>
  </>
)

// Main Hospital Detail Component
export default function HospitalDetail({ params }: { params: { slug: string } }) {
  const [hospital, setHospital] = useState<HospitalWithBranchPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllBranches, setShowAllBranches] = useState(false)

  useEffect(() => {
    const fetchHospital = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/hospitals')
        if (!res.ok) throw new Error("Failed to fetch hospitals")
        const data = await res.json()
        if (data.items && data.items.length > 0) {
          const matchedHospital = data.items.find((h: HospitalWithBranchPreview) =>
            generateSlug(h.name) === params.slug
          )
          if (matchedHospital) {
            setHospital(matchedHospital)
          } else {
            throw new Error("Hospital not found")
          }
        } else {
          throw new Error("No hospitals available")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hospital details")
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchHospital()
    }
  }, [params.slug])

  // Loading State
  if (loading) {
    return <HospitalDetailSkeleton />
  }

  // Error State
  if (error || !hospital) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative">
        <div className="absolute top-6 left-6">
          <Link href="/hospitals" className="flex items-center gap-2 text-gray-600 hover:text-[#241d1f] transition-colors bg-white px-4 py-2 rounded-xs shadow-xs border border-gray-200 hover:shadow-sm">
            <ChevronLeft className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
        <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-xs shadow-xs border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-xs flex items-center justify-center mx-auto">
            <Hospital className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="title-text text-2xl font-bold">Hospital Not Found</h2>
          <p className="description-2 text-gray-600 leading-relaxed">{error || "The requested hospital could not be found. Please check the URL or try searching again."}</p>
          <Link
            href="/hospitals"
            className="inline-block w-full bg-[#241d1f] text-white px-6 py-3 rounded-xs hover:bg-gray-800 transition-all font-semibold shadow-xs hover:shadow-sm"
          >
            Go to Hospital Search
          </Link>
        </div>
      </div>
    )
  }

  // Derived Data
  const hospitalImage = getHospitalImage(hospital.image)
  const hospitalLogo = getHospitalLogo(hospital.logo)
  const phone = hospital.contactNumber || hospital.phone
  const processedDescription = hospital.description ? removeBannersFromDescription(hospital.description) : null

  // Aggregate unique doctors and treatments across branches
  const allDoctors = hospital.branches?.flatMap(branch =>
    (branch.doctors || []).map(doctor => ({ ...doctor, branch: branch.name }))
  ) || []

  const allTreatments = hospital.branches?.flatMap(branch =>
    (branch.treatments || []).map(treatment => ({ ...treatment, branch: branch.name }))
  ) || []

  const uniqueDoctors = allDoctors.filter((doctor, index, self) =>
    index === self.findIndex(d => d._id === doctor._id)
  )

  const uniqueTreatments = allTreatments.filter((treatment, index, self) =>
    index === self.findIndex(t => t._id === treatment._id)
  )

  const visibleBranches = showAllBranches ? hospital.branches : hospital.branches?.slice(0, 3) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Header */}
      <section className="relative w-full h-[70vh]">
        {hospitalImage ? (
          <Image
            src={hospitalImage}
            alt={`${hospital.name} facility`}
            fill
            priority
            className="object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute top-6 left-6 z-10">
          <Link href="/hospitals" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xs border border-white/20">
            <ChevronLeft className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-10 px-6 pb-12 text-white">
          <div className="container mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    {hospital.accreditation && (
                      <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xs text-xs font-semibold border border-white/30">
                        <Award className="w-3 h-3" />
                        {hospital.accreditation}
                      </span>
                    )}
                    {hospital.emergencyServices && (
                      <span className="flex items-center gap-2 bg-red-500/30 backdrop-blur-sm px-3 py-1 rounded-xs text-xs font-semibold border border-red-500/40">
                        <Clock className="w-3 h-3" />
                        24/7 Emergency
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-x-3">
                  {hospitalLogo && (
                    <div className="relative w-16 h-16 bg-white rounded-full p-2">
                      <Image
                        src={hospitalLogo}
                        alt={`${hospital.name} logo`}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {hospital.name}
                  </h1>
                </div>
              
              </div>
              {hospital.city && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xs border border-white/20">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">{hospital.city}, {hospital.state || "N/A"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      {hospital && <BreadcrumbNav hospitalName={hospital.name} />}

      {/* Main Content */}
      <section className="py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-4 pb-12">
            <main className="lg:col-span-9 space-y-4">
              {/* Key Statistics */}
              <section className="bg-white rounded-xs shadow-xs p-4 border border-gray-100">
                <h2 className="title-text text-2xl mb-2 font-bold">Hospital Overview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {hospital.branches?.length > 0 && (
                    <StatCard icon={Building2} value={hospital.branches.length} label="Branches" />
                  )}
                  {(hospital.beds || hospital.noOfBeds) && (
                    <StatCard icon={Bed} value={hospital.beds || hospital.noOfBeds} label="Beds" />
                  )}
                  {hospital.yearEstablished && (
                    <StatCard icon={Calendar} value={hospital.yearEstablished} label="Established" />
                  )}
                  {hospital.accreditation && (
                    <StatCard icon={Award} value={hospital.accreditation.split(' ')[0]} label="Accreditation" />
                  )}
                </div>
              </section>

              {/* About Section */}
              {processedDescription && (
                <section className="bg-white rounded-xs shadow-xs p-4 border border-gray-100">
                  <h2 className="title-text text-2xl mb-2 font-bold">About {hospital.name}</h2>
                  <div 
                    className="description space-y-3"
                    dangerouslySetInnerHTML={{ __html: processedDescription }}
                  />
                </section>
              )}

              {/* Branches Section */}
              {hospital.branches?.length > 0 && (
                <section className="bg-white rounded-xs shadow-xs p-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="title-text flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-[#241d1f]" />
                      Our Branches <span className="description-2">({hospital.branches.length})</span>
                    </h2>
                  </div>
                  {showAllBranches ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hospital.branches.map((branch) => (
                        <BranchCard key={branch._id} branch={branch} hospitalSlug={params.slug} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {visibleBranches.map((branch) => (
                        <BranchCard key={branch._id} branch={branch} hospitalSlug={params.slug} />
                      ))}
                      {hospital.branches.length > 3 && (
                        <div className="col-span-full text-center pt-0">
                          <button
                            onClick={() => setShowAllBranches(true)}
                            className="bg-gray-100 text-white px-8 py-3 rounded-xs hover:bg-gray-100 transition-all font-medium shadow-xs hover:shadow-sm flex items-center gap-2 mx-auto description-2 text-gray-700"
                          >
                            Show All {hospital.branches.length - 3} More Branches <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Doctors Section */}
              {uniqueDoctors.length > 0 && (
                <section className="bg-white rounded-xs shadow-xs p-4 border border-gray-100">
                  <EmblaCarousel
                    items={uniqueDoctors}
                    title="Our Specialist Doctors"
                    Icon={Stethoscope}
                    type="doctors"
                  />
                </section>
              )}

              {/* Treatments Section */}
              {uniqueTreatments.length > 0 && (
                <section className="bg-white rounded-xs shadow-xs p-4 border border-gray-100">
                  <EmblaCarousel
                    items={uniqueTreatments}
                    title="Available Treatments"
                    Icon={Scissors}
                    type="treatments"
                  />
                </section>
              )}

            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-3 space-y-8">
              <QuickActionsSidebar />
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}