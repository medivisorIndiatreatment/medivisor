// File: app/treatments/[slug]/page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import type { HospitalWithBranchPreview } from "@/types/hospital"
import {
  Calendar,
  Award,
  Stethoscope,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Home,
  Hospital,
  MapPin,
  Bed,
  Phone,
  Mail,
  User,
  Clock,
  DollarSign,
  Building2
} from "lucide-react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import classNames from "classnames"
import ContactForm from "@/components/ContactForm"

// Helper function to get Wix image URL from direct string
const getWixImageUrl = (imageStr: string): string | null => {
  if (!imageStr || typeof imageStr !== 'string') return null;
  if (!imageStr.startsWith('wix:image://v1/')) return null;

  const parts = imageStr.split('/');
  if (parts.length < 4) return null;

  const id = parts[3];
  return `https://static.wixstatic.com/media/${id}`;
}

// Helper functions
const getHospitalImage = (content: any): string | null => {
  if (typeof content === 'string') {
    return getWixImageUrl(content);
  }
  if (!content || !content.nodes) return null
  const imageNode = content.nodes.find((node: any) => node.type === 'IMAGE')
  if (imageNode?.imageData?.image?.src?.id) {
    const id = imageNode.imageData.image.src.id
    return `https://static.wixstatic.com/media/${id}`
  }
  return null
}

const getTreatmentImage = (content: any): string | null => {
  if (typeof content === 'string') {
    return getWixImageUrl(content);
  }
  if (!content || !content.nodes) return null
  const imageNode = content.nodes.find((node: any) => node.type === 'IMAGE')
  if (imageNode?.imageData?.image?.src?.id) {
    const id = imageNode.imageData.image.src.id
    return `https://static.wixstatic.com/media/${id}`
  }
  return null
}

const getBranchImage = (content: any): string | null => {
  if (typeof content === 'string') {
    return getWixImageUrl(content);
  }
  if (!content || !content.nodes) return null
  const imageNode = content.nodes.find((node: any) => node.type === 'IMAGE')
  if (imageNode?.imageData?.image?.src?.id) {
    const id = imageNode.imageData.image.src.id
    return `https://static.wixstatic.com/media/${id}`
  }
  return null
}

const getDoctorImage = (content: any): string | null => {
  if (typeof content === 'string') {
    return getWixImageUrl(content);
  }
  if (!content || !content.nodes) return null
  const imageNode = content.nodes.find((node: any) => node.type === 'IMAGE')
  if (imageNode?.imageData?.image?.src?.id) {
    const id = imageNode.imageData.image.src.id
    return `https://static.wixstatic.com/media/${id}`
  }
  return null
}

const getShortDescription = (richContent: any, maxLength: number = 100): string => {
  if (typeof richContent === 'string') {
    const text = richContent.replace(/<[^>]*>/g, '').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  if (!richContent || !richContent.nodes) return '';
  let text = '';
  for (const node of richContent.nodes) {
    if (node.type === 'PARAGRAPH' && text.length < maxLength) {
      const paraText = node.nodes?.map((n: any) => n.text || '').join(' ').trim();
      text += (text ? ' ' : '') + paraText;
    }
    if (text.length >= maxLength) break;
  }
  return text.trim().length > maxLength ? text.trim().substring(0, maxLength) + '...' : text.trim();
}

const renderRichText = (richContent: any): JSX.Element | null => {
  if (typeof richContent === 'string') {
    return <div className="text-gray-700 leading-relaxed prose prose-neutral space-y-3 prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: richContent }} />
  }
  if (!richContent || !richContent.nodes) return null

  const renderNode = (node: any): JSX.Element | null => {
    switch (node.type) {
      case 'PARAGRAPH':
        return (
          <p key={Math.random()} className="text-gray-700 leading-relaxed mb-3">
            {node.nodes?.map((child: any, idx: number) => renderTextNode(child, idx))}
          </p>
        )
      case 'HEADING1':
        return (
          <h3 key={Math.random()} className="text-2xl font-bold text-gray-900 mb-3">
            {node.nodes?.map((child: any, idx: number) => renderTextNode(child, idx))}
          </h3>
        )
      case 'HEADING2':
        return (
          <h4 key={Math.random()} className="text-xl font-semibold text-gray-900 mb-3">
            {node.nodes?.map((child: any, idx: number) => renderTextNode(child, idx))}
          </h4>
        )
      case 'IMAGE':
        let imgSrc = null;
        if (typeof node.imageData?.image?.src === 'string') {
          imgSrc = getWixImageUrl(node.imageData.image.src);
        } else if (node.imageData?.image?.src?.id) {
          imgSrc = `https://static.wixstatic.com/media/${node.imageData.image.src.id}`;
        }
        if (imgSrc) {
          return (
            <div key={Math.random()} className="my-6">
              <Image
                src={imgSrc}
                alt="Embedded image"
                width={600}
                height={400}
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
          )
        }
        return null
      default:
        return null
    }
  }

  const renderTextNode = (textNode: any, idx: number): JSX.Element | null => {
    if (textNode.type !== 'TEXT') return null
    const text = textNode.text || ''
    const isBold = textNode.textStyle?.bold || false
    const isItalic = textNode.textStyle?.italic || false
    const isUnderline = textNode.textStyle?.underline || false

    let content = text
    if (isBold) content = <strong key={idx}>{text}</strong>
    else if (isItalic) content = <em key={idx}>{text}</em>
    else if (isUnderline) content = <u key={idx}>{text}</u>
    else content = <span key={idx}>{text}</span>

    return content
  }

  return (
    <div className="space-y-4">
      {richContent.nodes.map((node: any, idx: number) => renderNode(node))}
    </div>
  )
}

const generateSlug = (name: string): string => {
  return name
    ?.toLowerCase()
    ?.trim()
    ?.replace(/[^\w\s-]/g, '')
    ?.replace(/\s+/g, '-')
    ?.replace(/-+/g, '-') || ''
}

// Breadcrumb Component
const Breadcrumb = ({ treatmentName }: { treatmentName: string }) => (
  <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-4 sticky top-0 z-20">
    <div className="container mx-auto px-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="flex items-center gap-2 hover:text-gray-900 transition-colors duration-200">
          <Home className="w-4 h-4" />
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <Link href="/treatments" className="hover:text-gray-900 transition-colors duration-200">
          Treatments
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{treatmentName}</span>
      </div>
    </div>
  </nav>
)

// Branches Offering Treatment Carousel Component
const BranchesOfferingTreatmentCarousel = ({ 
  branches, 
  treatmentName 
}: { 
  branches: any[], 
  treatmentName: string 
}) => {
  if (branches.length === 0) return null

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: false
  })

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const itemsPerView = 3
  const visibleSlidesClass = `min-w-0 w-full md:w-[calc(33.333%-0.666rem)] flex-shrink-0`

  const canScrollPrev = emblaApi ? emblaApi.canScrollPrev() : false
  const canScrollNext = emblaApi ? emblaApi.canScrollNext() : false

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        
          Nearby Branches in Delhi NCR Offering {treatmentName}
          <span className="text-gray-500 font-normal">({branches.length})</span>
        </h3>
        {(branches.length > itemsPerView) && (
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={classNames(
                "bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
                !canScrollPrev && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={classNames(
                "bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
                !canScrollNext && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
      <div className="max-w-[63rem] mx-auto">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {branches.map((branch) => {
              const branchImage = getBranchImage(branch.branchImage)
              const hospitalSlug = generateSlug(branch.hospitalName)
              const branchSlug = generateSlug(branch.name)
              const firstCity = branch.city && branch.city.length > 0 ? branch.city[0].name : 'N/A'
              
              return (
                <div key={branch._id} className={classNames("bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ", visibleSlidesClass)}>
                  <Link href={`/hospitals/${hospitalSlug}`} className="block group">
                    <div className="relative w-full h-48 rounded-t-lg overflow-hidden bg-gray-50">
                      {branchImage ? (
                        <Image
                          src={branchImage}
                          alt={branch.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Hospital className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-gray-900 text-base line-clamp-1">{branch.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{getShortDescription(branch.description, 80)}</p>
                      {branch.yearEstablished && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Est. {branch.yearEstablished}</span>
                        </div>
                      )}
                      {branch.totalBeds && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Bed className="w-4 h-4" />
                          <span>{branch.totalBeds} Beds</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Location</p>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{firstCity}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// Specialist Doctors Carousel Component
const SpecialistDoctorsCarousel = ({ 
  doctors, 
  title 
}: { 
  doctors: any[], 
  title: string 
}) => {
  if (doctors.length === 0) return null

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: false
  })

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const itemsPerView = 3
  const visibleSlidesClass = `min-w-0 w-full md:w-[calc(33.333%-0.666rem)] flex-shrink-0`

  const canScrollPrev = emblaApi ? emblaApi.canScrollPrev() : false
  const canScrollNext = emblaApi ? emblaApi.canScrollNext() : false

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
       
          {title}
          <span className="text-gray-500 font-normal">({doctors.length})</span>
        </h3>
        {(doctors.length > itemsPerView) && (
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={classNames(
                "bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
                !canScrollPrev && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={classNames(
                "bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
                !canScrollNext && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
      <div className="max-w-[63rem] mx-auto">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {doctors.map((doctor) => {
              const doctorImage = getDoctorImage(doctor.profileImage)
              const doctorSlug = doctor.slug || generateSlug(doctor.name)
              
              return (
                <div key={doctor._id} className={classNames("bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ", visibleSlidesClass)}>
                  <Link href={`/doctors/${doctorSlug}`} className="block group">
                    <div className="relative w-full h-48 rounded-t-lg overflow-hidden bg-gray-50">
                      {doctorImage ? (
                        <Image
                          src={doctorImage}
                          alt={doctor.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Stethoscope className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-gray-900 text-base line-clamp-1">{doctor.name}</h3>
                      <p className="text-gray-600 text-sm">{doctor.specialization}</p>
                      {doctor.experience && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{doctor.experience} years experience</span>
                        </div>
                      )}
                      
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// Helper function to get unique doctors with aggregated hospital branches
const getUniqueDoctorsWithHospitalBranches = (doctors: any[]) => {
  const uniqueDoctorsMap = new Map()

  doctors.forEach(doctor => {
    if (!uniqueDoctorsMap.has(doctor._id)) {
      uniqueDoctorsMap.set(doctor._id, {
        ...doctor,
        hospitalBranches: []
      })
    }

    const uniqueDoctor = uniqueDoctorsMap.get(doctor._id)
    if (doctor.hospitalBranches && !uniqueDoctor.hospitalBranches.some((b: any) => b.name === doctor.branchName)) {
      uniqueDoctor.hospitalBranches.push({
        name: doctor.branchName,
        slug: doctor.branchSlug
      })
    }
  })

  return Array.from(uniqueDoctorsMap.values())
}

// Skeleton Components
const HeroSkeleton = () => (
  <section className="relative w-full h-[70vh] bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
    <div className="absolute bottom-0 left-0 w-full z-10 px-6 pb-12">
      <div className="container mx-auto space-y-4">
        <div className="space-y-2">
          <div className="h-8 md:h-10 bg-gray-700/50 rounded w-64 md:w-96" />
          <div className="h-5 bg-gray-700/30 rounded w-80" />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="h-8 bg-gray-700/30 rounded-full w-32 px-4 py-2" />
          <div className="h-8 bg-gray-700/30 rounded-full w-40 px-4 py-2" />
        </div>
      </div>
    </div>
  </section>
)

const OverviewSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-48 mb-6" />
    <div className="space-y-4">
      <div className="h-4 bg-gray-300 rounded" />
      <div className="h-4 bg-gray-300 rounded w-3/4" />
      <div className="h-4 bg-gray-300 rounded w-5/6" />
      <div className="h-4 bg-gray-300 rounded" />
    </div>
    <div className="grid md:grid-cols-3 gap-6 mt-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="w-3 h-3 bg-gray-300 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-300 rounded w-16" />
            <div className="h-4 bg-gray-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

const SidebarSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded" />
              <div className="h-3 bg-gray-300 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse h-96" />
  </div>
)

// Main Component
export default function TreatmentDetail({ params }: { params: Promise<{ slug: string }> }) {
  const [treatment, setTreatment] = useState<any>(null)
  const [specialistDoctors, setSpecialistDoctors] = useState<any[]>([])
  const [allBranches, setAllBranches] = useState<any[]>([])
  const [treatmentCategory, setTreatmentCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTreatmentData = async () => {
      setLoading(true)
      setError(null)

      try {
        const resolvedParams = await params
        const treatmentSlug = resolvedParams.slug

        const res = await fetch('/api/hospitals')
        if (!res.ok) throw new Error("Failed to fetch hospitals")

        const data = await res.json()

        let foundTreatment = null
        let allDoctorsOffering: any[] = []
        let branchesOfferingTreatment: any[] = []

        if (data.items && data.items.length > 0) {
          for (const hospitalItem of data.items) {
            if (hospitalItem.treatments && Array.isArray(hospitalItem.treatments)) {
              for (const treatmentItem of hospitalItem.treatments) {
                if (generateSlug(treatmentItem.name) === treatmentSlug) {
                  // Found the treatment
                  if (!foundTreatment) {
                    foundTreatment = treatmentItem
                  }
                  branchesOfferingTreatment.push({
                    ...hospitalItem,
                    hospitalName: hospitalItem.name,
                    hospitalSlug: hospitalItem.slug || generateSlug(hospitalItem.name)
                  })
                }
              }
            }

            // Check branches for treatments
            if (hospitalItem.branches && Array.isArray(hospitalItem.branches)) {
              for (const branchItem of hospitalItem.branches) {
                if (branchItem.treatments && Array.isArray(branchItem.treatments)) {
                  for (const treatmentItem of branchItem.treatments) {
                    if (generateSlug(treatmentItem.name) === treatmentSlug) {
                      // Found the treatment
                      if (!foundTreatment) {
                        foundTreatment = treatmentItem
                      }
                      branchesOfferingTreatment.push({
                        ...branchItem,
                        hospitalName: hospitalItem.name,
                        hospitalSlug: hospitalItem.slug || generateSlug(hospitalItem.name)
                      })
                    }
                  }
                }
              }
            }

            // Find doctors offering this exact treatment
            if (hospitalItem.branches && Array.isArray(hospitalItem.branches)) {
              for (const branchItem of hospitalItem.branches) {
                if (branchItem.doctors && Array.isArray(branchItem.doctors)) {
                  for (const doctor of branchItem.doctors) {
                    const hasExactTreatment = doctor.treatments?.some((t: any) => 
                      generateSlug(t.name || '') === treatmentSlug
                    )
                    
                    if (hasExactTreatment) {
                      allDoctorsOffering.push({
                        ...doctor,
                        hospitalName: hospitalItem.name,
                        branchName: branchItem.name || '',
                        hospitalSlug: hospitalItem.slug || generateSlug(hospitalItem.name),
                        branchSlug: generateSlug(branchItem.name || '')
                      })
                    }
                  }
                }
              }
            }
          }
        }

        // Remove duplicate doctors and aggregate their hospital branches
        const uniqueDoctors = getUniqueDoctorsWithHospitalBranches(allDoctorsOffering)
        
        // Limit branches to 6
        const limitedBranches = branchesOfferingTreatment.slice(0, 6)
        
        if (foundTreatment || uniqueDoctors.length > 0 || limitedBranches.length > 0) {
          if (!foundTreatment) {
            const words = treatmentSlug.split('-')
            const treatmentName = words.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            foundTreatment = {
              name: treatmentName,
              description: `Specialized ${treatmentName.toLowerCase()} treatment provided by expert doctors across our network of hospitals in Delhi NCR. Our team of ${uniqueDoctors.length} specialist doctors ensures you receive the highest quality care using the latest medical advancements.`,
              category: treatmentName
            }
          }

          console.log('Found treatment:', foundTreatment.name)
          console.log('Unique doctors offering treatment:', uniqueDoctors.length)
          console.log('Branches offering treatment in Delhi NCR:', limitedBranches.length)
          
          setTreatment(foundTreatment)
          setSpecialistDoctors(uniqueDoctors)
          setAllBranches(limitedBranches)
          setTreatmentCategory(foundTreatment.name)
        } else {
          throw new Error("Treatment not found")
        }
      } catch (err) {
        console.error('Error fetching treatment:', err)
        setError(err instanceof Error ? err.message : "Failed to load treatment details")
      } finally {
        setLoading(false)
      }
    }

    fetchTreatmentData()
  }, [params])

  // Loading State with Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <HeroSkeleton />
        <Breadcrumb treatmentName="Treatment Name" />
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-8">
              <main className="lg:col-span-9 space-y-8">
                <OverviewSkeleton />
                <SidebarSkeleton />
              </main>
              <SidebarSkeleton />
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Error State
  if (error || !treatment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-6 relative">
        <Breadcrumb treatmentName="Treatment Name" />
        <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-lg shadow-sm border border-gray-100">
          <Scissors className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Treatment Not Found</h2>
          <p className="text-gray-600 leading-relaxed">{error || "The requested treatment could not be found. Please check the URL or try searching again."}</p>
          <Link
            href="/treatments"
            className="inline-block w-full bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-all font-semibold shadow-sm hover:shadow-md"
          >
            Browse All Treatments
          </Link>
        </div>
      </div>
    )
  }

  // Derived Data
  const treatmentImage = treatment?.treatmentImage ? getTreatmentImage(treatment.treatmentImage) : null
  const heroImage = treatmentImage

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Header */}
      <section className="relative w-full h-[50vh] md:h-[70vh]">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${treatment.name} treatment`}
            fill
            priority
            className="object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full z-10 px-6 pb-12 text-white">
          <div className="container mx-auto space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {treatment.name}
            </h1>
            <p className="text-lg max-w-2xl leading-relaxed text-gray-200">
              {treatment.category || 'Specialized Treatment'} 
              {specialistDoctors.length > 0 && ` - ${specialistDoctors.length} Specialist Doctors Available`}
            </p>
            {treatment.cost && (
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold border border-white/20">
                  <Award className="w-4 h-4" />
                  Starting from ${treatment.cost}
                </span>
                {treatment.duration && (
                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold border border-white/20">
                    <Calendar className="w-4 h-4" />
                    {treatment.duration}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Breadcrumb treatmentName={treatment.name} />

      {/* Main Content */}
      <section className="md:py-12 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8">
            <main className="lg:col-span-9 space-y-8">
              {/* Treatment Overview */}
              <section className="md:bg-white md:rounded-lg md:shadow-sm md:p-8 p-2 md:border border-gray-100 mb-2 md:mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 md:mt-0 mt-6 md:mb-6">About This Treatment</h2>
                <div className="">
                  {treatment.description && (
                    <div className="prose prose-neutral prose-lg space-y-3 max-w-none">
                      {renderRichText(treatment.description)}
                    </div>
                  )}
                  <div className="grid md:grid-cols-3 gap-6 mt-8">
                    {treatment.category && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-3 h-3 bg-gray-100 rounded-full flex-shrink-0"></div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs uppercase tracking-wide">Category</p>
                          <p className="text-gray-700 text-sm">{treatment.category}</p>
                        </div>
                      </div>
                    )}
                    {treatment.duration && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900 text-xs uppercase tracking-wide">Duration</p>
                          <p className="text-gray-700 text-sm">{treatment.duration}</p>
                        </div>
                      </div>
                    )}
                    {treatment.cost && (
                      <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <Award className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900 text-xs uppercase tracking-wide">Estimated Cost</p>
                          <p className="text-gray-600 font-bold text-sm">${treatment.cost}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Specialist Doctors Section */}
              {specialistDoctors.length > 0 && (
                <SpecialistDoctorsCarousel
                  doctors={specialistDoctors}
                  title={`Doctors Offering ${treatment.name}`}
                />
              )}

              {/* Branches Offering Treatment Section */}
              {allBranches.length > 0 && (
                <BranchesOfferingTreatmentCarousel 
                  branches={allBranches} 
                  treatmentName={treatment.name}
                />
              )}
            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-3 space-y-8">
              <ContactForm />
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}