// File: app/treatments/[slug]/page.tsx

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
  Users
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
const Breadcrumb = ({ hospitalName, branchName, treatmentName, hospitalSlug }: { hospitalName: string; branchName: string; treatmentName: string; hospitalSlug: string }) => (
  <nav className="bg-white border-b border-gray-200 py-4">
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
        <span className="text-gray-800 font-medium">{treatmentName}</span>
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
    <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
          <Hospital className="w-6 h-6 text-gray-600" />
          Similar Hospitals <span className="text-gray-500 font-normal">({similarHospitals.length})</span>
        </h3>
        {similarHospitals.length > itemsPerView && (
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={scrollNext}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
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
              <div key={hospital._id} className={classNames("flex-shrink-0 bg-white rounded-xl p-0 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1", visibleSlidesClass)}>
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
    <div className="relative w-full h-48 mb-0 rounded-t-xl overflow-hidden bg-gray-100">
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

// Doctor Card Component
const DoctorCard = ({ item }: { item: any }) => {
  const doctorImage = getDoctorImage(item.profileImage)
  const doctorSlug = item.slug || generateSlug(item.name)

  return (
    <Link
      href={`/doctors/${doctorSlug}`}
      className="group h-full flex flex-col hover:no-underline"
    >
      <div className="relative flex-1 min-h-48 rounded-t-xl overflow-hidden bg-gray-100">
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
          <h5 className="font-semibold text-gray-800 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
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
  <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
    <div className="space-y-4">
      <div className="h-20 w-full bg-gray-300 rounded-xl animate-pulse" />
      <div className="h-12 w-3/4 bg-gray-300 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse" />
    </div>
  </section>
)

const CarouselSkeleton = ({ type }: { type: 'doctors' | 'hospitals' }) => {
  const itemsPerView = 3
  const visibleSlidesClass = `min-w-0 w-80`

  return (
    <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse ml-2" />
        </div>
        <div className="flex gap-2">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 animate-pulse" />
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-6">
          {Array.from({ length: Math.max(itemsPerView + 1, 6) }).map((_, i) => (
            <div key={i} className={classNames("flex-shrink-0 bg-white rounded-xl p-0 border border-gray-200 shadow-sm animate-pulse", visibleSlidesClass)}>
              <div className="relative w-full h-48 mb-0 rounded-t-xl overflow-hidden bg-gray-100" />
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
    <div className="bg-white sticky top-24 rounded-2xl shadow-sm p-6 border border-gray-200">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-300 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  </aside>
)

// Embla Carousel Component for Doctors
const EmblaCarouselDoctors = ({
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
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
          <Icon className="w-6 h-6 text-gray-600" />
          {title} <span className="text-gray-500 font-normal">({items.length})</span>
        </h3>
        {items.length > itemsPerView && (
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={scrollNext}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
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
            <div key={item._id || index} className={classNames("flex-shrink-0 bg-white rounded-xl p-0 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1", visibleSlidesClass)}>
              <DoctorCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Treatment Detail Component
export default function TreatmentDetail({ params }: { params: Promise<{ slug: string }> }) {
  const [treatment, setTreatment] = useState<any>(null)
  const [branch, setBranch] = useState<any>(null)
  const [hospital, setHospital] = useState<HospitalWithBranchPreview | null>(null)
  const [allHospitals, setAllHospitals] = useState<any[]>([])
  const [relatedDoctors, setRelatedDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTreatmentData = async () => {
      setLoading(true)
      setError(null)
      try {
        const resolvedParams = await params
        const treatmentSlug = resolvedParams.slug

        console.log('Fetching treatment with slug:', treatmentSlug)

        const res = await fetch('/api/hospitals')
        if (!res.ok) throw new Error("Failed to fetch hospitals")
        const data = await res.json()

        if (data.items && data.items.length > 0) {
          let foundTreatment = null
          let foundBranch = null
          let foundHospital = null
          let doctors: any[] = []

          // Search through all hospitals -> branches -> treatments
          for (const hospitalItem of data.items) {
            const hospitalSlug = generateSlug(hospitalItem.name)
            if (hospitalItem.branches && hospitalItem.branches.length > 0) {
              for (const branchItem of hospitalItem.branches) {
                const branchNameSlug = generateSlug(branchItem.name)
                if (branchItem.treatments && branchItem.treatments.length > 0) {
                  for (const treatmentItem of branchItem.treatments) {
                    const treatmentNameSlug = generateSlug(treatmentItem.name)
                    // For simplicity, match on treatment slug only; in production, use combined slug like `${hospitalSlug}-${branchNameSlug}-${treatmentNameSlug}`
                    if (treatmentNameSlug === treatmentSlug) {
                      foundTreatment = treatmentItem
                      foundBranch = branchItem
                      foundHospital = hospitalItem
                      doctors = branchItem.doctors || []
                      break
                    }
                  }
                }
                if (foundTreatment) break
              }
            }
            if (foundTreatment) break
          }

          if (foundTreatment && foundHospital && foundBranch) {
            console.log('Found treatment:', foundTreatment.name)
            console.log('In branch:', foundBranch.name)
            console.log('In hospital:', foundHospital.name)
            setTreatment(foundTreatment)
            setBranch(foundBranch)
            setHospital(foundHospital)
            setRelatedDoctors(doctors)
            setAllHospitals(data.items)
          } else {
            throw new Error("Treatment not found")
          }
        } else {
          throw new Error("No hospitals available")
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
      <div className="min-h-screen bg-gray-50">
        <HeroSkeleton />
        <Breadcrumb hospitalName="Hospital Name" branchName="Branch Name" treatmentName="Treatment Name" hospitalSlug="" />
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-12 gap-8">
              <main className="lg:col-span-9 space-y-8">
                <OverviewSkeleton />
                <CarouselSkeleton type="doctors" />
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
  if (error || !treatment || !hospital || !branch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative">
        <Breadcrumb hospitalName="Hospital Name" branchName="Branch Name" treatmentName="Treatment Name" hospitalSlug="" />
        <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
          <Scissors className="w-16 h-16 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-800">Treatment Not Found</h2>
          <p className="text-gray-600 leading-relaxed">{error || "The requested treatment could not be found. Please check the URL or try searching again."}</p>
          <Link
            href="/hospitals"
            className="inline-block w-full bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-all font-semibold shadow-sm hover:shadow-md"
          >
            Go to Hospital Search
          </Link>
        </div>
      </div>
    )
  }

  // Derived Data
  const treatmentImage = getTreatmentImage(treatment.treatmentImage)
  const hospitalImage = getHospitalImage(hospital.image)
  const heroImage = treatmentImage || hospitalImage
  const hospitalSlug = hospital.slug || generateSlug(hospital.name)
  const branchSlug = generateSlug(branch.name)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="relative w-full h-[70vh]">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${treatment.name} treatment`}
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
              {treatment.name}
            </h1>
            <p className="text-lg max-w-2xl leading-relaxed text-gray-200">
              {treatment.category || 'Specialized Treatment'} - Available at {hospital.name} {branch.name}
            </p>
            {treatment.cost && (
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30">
                  <Award className="w-4 h-4" />
                  Starting from ${treatment.cost}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
      <Breadcrumb hospitalName={hospital.name} branchName={branch.name} treatmentName={treatment.name} hospitalSlug={hospitalSlug} />
      {/* Main Content */}
      <section className="py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8">
            <main className="lg:col-span-9 space-y-8">
              {/* Treatment Overview */}
              <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Treatment Details</h2>
                <div className="">
                  {treatment.description && (
                    <div className="prose prose-lg space-y-3 max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: treatment.description }} className="space-y-3" />
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    {treatment.category && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-gray-800">Category</p>
                          <p className="text-gray-600">{treatment.category}</p>
                        </div>
                      </div>
                    )}
                    {treatment.duration && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">Duration</p>
                          <p className="text-gray-600">{treatment.duration}</p>
                        </div>
                      </div>
                    )}
                    {treatment.cost && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Award className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">Estimated Cost</p>
                          <p className="text-blue-600 font-semibold">${treatment.cost}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Related Doctors Section */}
              {relatedDoctors && relatedDoctors.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                  <EmblaCarouselDoctors
                    items={relatedDoctors}
                    title="Specialist Doctors for this Treatment"
                    Icon={Stethoscope}
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