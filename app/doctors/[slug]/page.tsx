// File: app/doctors/[slug]/page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import type { HospitalWithBranchPreview } from "@/types/hospital"
import {
  Building2,
  Calendar,
  Bed,
  Award,
  Stethoscope,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Home,
  Hospital,
  Users,
  Phone,
  Mail,
  Clock
} from "lucide-react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import classNames from "classnames"
import ContactForm from "@/components/ContactForm"

// Helper function to extract the main hospital image URL from rich content
const getHospitalImage = (richContent: any): string | null => {
  if (typeof richContent === 'string') return richContent
  if (!richContent || !richContent.nodes) return null
  const imageNode = richContent.nodes.find((node: any) => node.type === 'IMAGE')
  if (imageNode?.imageData?.image?.src?.id) {
    const id = imageNode.imageData.image.src.id
    return `https://static.wixstatic.com/media/${id}`
  }
  return null
}

// Helper function to extract doctor image URL from rich content
const getDoctorImage = (richContent: any): string | null => {
  if (typeof richContent === 'string') return richContent
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
  if (typeof richContent === 'string') return richContent
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

// Breadcrumb Component
const Breadcrumb = ({ hospitalName, branchName, doctorName, hospitalSlug }: { hospitalName: string; branchName: string; doctorName: string; hospitalSlug: string }) => (
  <nav className="bg-white border-b border-gray-100 py-4">
    <div className="container mx-auto px-4">
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Link href="/" className="flex items-center gap-1 hover:text-gray-800 transition-colors">
          <Home className="w-4 h-4" />
          Home
        </Link>
        <span>/</span>
        <Link href="/hospitals" className="hover:text-gray-800 transition-colors">
          Hospitals
        </Link>
        <span>/</span>
        <Link
          href={`/hospitals/${hospitalSlug}`}
          className="hover:text-gray-800 transition-colors"
        >
          {hospitalName}
        </Link>
        <span>/</span>
        <Link
          href={`/hospitals/${hospitalSlug}/branches/${generateSlug(branchName)}`}
          className="hover:text-gray-800 transition-colors"
        >
          {branchName}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{doctorName}</span>
      </div>
    </div>
  </nav>
)

// Similar Hospitals Carousel Component
const SimilarHospitalsCarousel = ({ hospitals, currentHospitalId }: { hospitals: any[], currentHospitalId: string }) => {
  const similarHospitals = hospitals
    .filter(h => h._id !== currentHospitalId)
    .slice(0, 6)

  if (similarHospitals.length === 0) return null

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  })

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const itemsPerView = 3
  const visibleSlidesClass = `min-w-0 w-80`

  return (
    <section className="bg-white rounded-xs shadow-xs p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
          <Hospital className="w-6 h-6 text-gray-600" />
          Similar Hospitals <span className="text-gray-500 font-normal">({similarHospitals.length})</span>
        </h3>
        {similarHospitals.length > itemsPerView && (
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
          {similarHospitals.map((hospital) => {
            const hospitalImage = getHospitalImage(hospital.image)
            const hospitalSlug = hospital.slug || generateSlug(hospital.name)
            return (
              <div key={hospital._id} className={classNames("flex-shrink-0 bg-white rounded-xs p-0 border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1", visibleSlidesClass)}>
                <HospitalCard hospital={hospital} hospitalImage={hospitalImage} hospitalSlug={hospitalSlug} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Hospital Card Component
const HospitalCard = ({ hospital, hospitalImage, hospitalSlug }: { hospital: any, hospitalImage: string | null, hospitalSlug: string }) => (
  <Link href={`/hospitals/${hospitalSlug}`} className="block group">
    <div className="relative w-full h-48 mb-0 rounded-t-xs overflow-hidden bg-gray-100">
      {hospitalImage ? (
        <Image
          src={hospitalImage}
          alt={hospital.name}
          fill
          className="object-cover w-full group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Hospital className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    <div className="flex-1 min-w-0 p-6">
      <h5 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-1">{hospital.name}</h5>
      <p className="text-gray-600 font-medium mb-2 line-clamp-1">{hospital.accreditation || 'Leading Healthcare Provider'}</p>
      <p className="text-gray-500 text-sm mb-2 line-clamp-1">{hospital.beds || 'N/A'} Beds</p>
      {hospital.description && <p className="text-gray-500 text-sm line-clamp-1">{hospital.description}</p>}
    </div>
  </Link>
)

// Skeleton Components
const HeroSkeleton = () => (
  <section className="relative w-full h-[70vh]">
    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
    <div className="absolute bottom-0 left-0 w-full z-10 px-6 pb-12 text-white">
      <div className="container mx-auto space-y-4">
        <div className="space-y-2">
          <div className="h-10 w-3/4 bg-white/20 rounded animate-pulse" />
          <div className="h-6 w-1/2 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </section>
)

const OverviewSkeleton = () => (
  <section className="bg-white rounded-xs shadow-xs p-4 border border-gray-100">
    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
    <div className="space-y-4">
      <div className="h-20 w-full bg-gray-300 rounded-xs animate-pulse" />
      <div className="h-12 w-3/4 bg-gray-300 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse" />
    </div>
  </section>
)

const CarouselSkeleton = ({ type }: { type: 'treatments' | 'hospitals' }) => {
  const itemsPerView = 3
  const visibleSlidesClass = `min-w-0 w-80`

  return (
    <section className="bg-white rounded-xs shadow-xs p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse ml-2" />
        </div>
        <div className="flex gap-2">
          <div className="bg-white rounded-xs p-3 shadow-xs border border-gray-100 animate-pulse" />
          <div className="bg-white rounded-xs p-3 shadow-xs border border-gray-100 animate-pulse" />
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-6">
          {Array.from({ length: Math.max(itemsPerView + 1, 6) }).map((_, i) => (
            <div key={i} className={classNames("flex-shrink-0 bg-white rounded-xs p-0 border border-gray-100 shadow-xs animate-pulse", visibleSlidesClass)}>
              <div className="relative w-full h-48 mb-0 rounded-t-xs overflow-hidden bg-gray-100" />
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-300 rounded" />
                <div className="h-5 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const SidebarSkeleton = () => (
  <aside className="lg:col-span-3 space-y-8">
    <div className="bg-white sticky top-24 rounded-xs shadow-xs p-6 border border-gray-100">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-300 rounded-xs animate-pulse" />
        ))}
      </div>
    </div>
  </aside>
)

// Embla Carousel Component for Treatments
const EmblaCarouselTreatments = ({
  items,
  title,
  Icon
}: {
  items: any[],
  title: string,
  Icon: any
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  })

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const itemsPerView = 3
  const visibleSlidesClass = `min-w-0 w-80`

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
          <Icon className="w-6 h-6 text-gray-600" />
          {title} <span className="text-gray-500 font-normal">({items.length})</span>
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
              <TreatmentCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
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
          <h5 className="font-semibold text-gray-800 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">{item.name}</h5>
          <p className="text-gray-600 font-medium line-clamp-1">{item.category || 'Specialized Treatment'}</p>
          <p className="text-gray-500 text-sm line-clamp-2">{item.description || "Comprehensive medical treatment for optimal recovery."}</p>
        </div>
        {item.cost && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-blue-600 font-semibold text-sm">Starting from ${item.cost}</p>
          </div>
        )}
      </div>
    </Link>
  )
}

// Main Doctor Detail Component
export default function DoctorDetail({ params }: { params: Promise<{ slug: string }> }) {
  const [doctor, setDoctor] = useState<any>(null)
  const [branch, setBranch] = useState<any>(null)
  const [hospital, setHospital] = useState<HospitalWithBranchPreview | null>(null)
  const [allHospitals, setAllHospitals] = useState<any[]>([])
  const [relatedTreatments, setRelatedTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctorData = async () => {
      setLoading(true)
      setError(null)
      try {
        const resolvedParams = await params
        const doctorSlug = resolvedParams.slug

        console.log('Fetching doctor with slug:', doctorSlug)

        const res = await fetch('/api/hospitals')
        if (!res.ok) throw new Error("Failed to fetch hospitals")
        const data = await res.json()

        if (data.items && data.items.length > 0) {
          let foundDoctor = null
          let foundBranch = null
          let foundHospital = null
          let treatments: any[] = []

          // Search through all hospitals -> branches -> doctors
          for (const hospitalItem of data.items) {
            const hospitalSlug = generateSlug(hospitalItem.name)
            if (hospitalItem.branches && hospitalItem.branches.length > 0) {
              for (const branchItem of hospitalItem.branches) {
                const branchNameSlug = generateSlug(branchItem.name)
                if (branchItem.doctors && branchItem.doctors.length > 0) {
                  for (const doctorItem of branchItem.doctors) {
                    const doctorNameSlug = generateSlug(doctorItem.name)
                    // For simplicity, match on doctor slug only; in production, use combined slug like `${hospitalSlug}-${branchNameSlug}-${doctorNameSlug}`
                    if (doctorNameSlug === doctorSlug) {
                      foundDoctor = doctorItem
                      foundBranch = branchItem
                      foundHospital = hospitalItem
                      treatments = branchItem.treatments || []
                      break
                    }
                  }
                }
                if (foundDoctor) break
              }
            }
            if (foundDoctor) break
          }

          if (foundDoctor && foundHospital && foundBranch) {
            console.log('Found doctor:', foundDoctor.name)
            console.log('In branch:', foundBranch.name)
            console.log('In hospital:', foundHospital.name)
            setDoctor(foundDoctor)
            setBranch(foundBranch)
            setHospital(foundHospital)
            setRelatedTreatments(treatments)
            setAllHospitals(data.items)
          } else {
            throw new Error("Doctor not found")
          }
        } else {
          throw new Error("No hospitals available")
        }
      } catch (err) {
        console.error('Error fetching doctor:', err)
        setError(err instanceof Error ? err.message : "Failed to load doctor details")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorData()
  }, [params])

  // Loading State with Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSkeleton />
        <Breadcrumb hospitalName="Hospital Name" branchName="Branch Name" doctorName="Doctor Name" hospitalSlug="" />
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-12 gap-4">
              <main className="lg:col-span-9 space-y-8">
                <OverviewSkeleton />
                <CarouselSkeleton type="treatments" />
                <CarouselSkeleton type="hospitals" />
              </main>
              <SidebarSkeleton />
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Error State
  if (error || !doctor || !hospital || !branch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative">
        <Breadcrumb hospitalName="Hospital Name" branchName="Branch Name" doctorName="Doctor Name" hospitalSlug="" />
        <div className="text-center space-y-6 max-w-md p-4 bg-white rounded-xs shadow-xs border border-gray-100">
          <Stethoscope className="w-16 h-16 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-800">Doctor Not Found</h2>
          <p className="text-gray-600 leading-relaxed">{error || "The requested doctor could not be found. Please check the URL or try searching again."}</p>
          <Link
            href="/hospitals"
            className="inline-block w-full bg-gray-800 text-white px-6 py-3 rounded-xs hover:bg-gray-900 transition-all font-semibold shadow-xs hover:shadow-md"
          >
            Go to Hospital Search
          </Link>
        </div>
      </div>
    )
  }

  // Derived Data
  const doctorImage = getDoctorImage(doctor.profileImage)
  const hospitalImage = getHospitalImage(hospital.image)
  const heroImage = doctorImage || hospitalImage
  const hospitalSlug = hospital.slug || generateSlug(hospital.name)
  const branchSlug = generateSlug(branch.name)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="relative w-full h-[70vh]">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${doctor.name} profile`}
            fill
            priority
            className="object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full z-10 px-6 pb-12 text-white">
          <div className="container mx-auto space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
               {doctor.name}
            </h1>
            <p className="text-lg max-w-2xl leading-relaxed text-gray-200">
              {doctor.specialization} - {doctor.qualification} at {hospital.name} {branch.name}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {doctor.designation && (
                <span className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-xs text-sm font-medium border border-blue-500/30">
                  <Users className="w-4 h-4" />
                  {doctor.designation}
                </span>
              )}
              {branch.emergencyContact && (
                <span className="flex items-center gap-2 bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-xs text-sm font-medium border border-red-500/30">
                  <Clock className="w-4 h-4" />
                  24/7 Emergency: {branch.emergencyContact}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      <Breadcrumb hospitalName={hospital.name} branchName={branch.name} doctorName={doctor.name} hospitalSlug={hospitalSlug} />
      {/* Main Content */}
      <section className="py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-4">
            <main className="lg:col-span-9 space-y-4">
              {/* Doctor Overview */}
              <section className="bg-white rounded-xs shadow-xs p-4 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Doctor Profile</h2>
                <div className="space-y-3">
                  {doctor.description && (
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed">{doctor.description}</p>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {doctor.specialization && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xs border border-gray-100">
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-gray-800">Specialization</p>
                          <p className="text-gray-600">{doctor.specialization}</p>
                        </div>
                      </div>
                    )}
                    {doctor.qualification && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xs border border-gray-100">
                        <Award className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">Qualification</p>
                          <p className="text-gray-600">{doctor.qualification}</p>
                        </div>
                      </div>
                    )}
                    {doctor.designation && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xs border border-gray-100">
                        <Users className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">Designation</p>
                          <p className="text-gray-600">{doctor.designation}</p>
                        </div>
                      </div>
                    )}
                    {doctor.experience && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xs border border-gray-100">
                        <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">Experience</p>
                          <p className="text-gray-600">{doctor.experience} years</p>
                        </div>
                      </div>
                    )}
                    {doctor.contactNumber && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xs border border-blue-200">
                        <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">Contact</p>
                          <p className="text-blue-600 font-semibold">{doctor.contactNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Related Treatments Section */}
              {relatedTreatments && relatedTreatments.length > 0 && (
                <section className="bg-white rounded-xs shadow-xs p-4 border border-gray-100">
                  <EmblaCarouselTreatments
                    items={relatedTreatments}
                    title="Treatments Offered"
                    Icon={Scissors}
                  />
                </section>
              )}

              {/* Similar Hospitals Section */}
              <SimilarHospitalsCarousel hospitals={allHospitals} currentHospitalId={hospital._id} />
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