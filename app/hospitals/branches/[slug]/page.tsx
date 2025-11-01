// File: app/hospitals/branches/[slug]/page.tsx

"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Image from "next/image"
import type { HospitalWithBranchPreview } from "@/types/hospital"
import {
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
  ChevronLeft,
  Loader2,
  Stethoscope,
  Scissors,
  ChevronRight,
  Clock,
  ArrowLeft,
  Home,
  Hospital,
  Search,
  X,
  Filter,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

// Helper function to extract the main hospital image URL
const getHospitalImage = (content: any): string | null => {
  if (typeof content === 'string') {
    return getWixImageUrl(content);
  }
  if (!content?.nodes) return null;
  const imageNode = content.nodes.find((node: any) => node.type === 'IMAGE');
  return imageNode?.imageData?.image?.src?.id
    ? `https://static.wixstatic.com/media/${imageNode.imageData.image.src.id}`
    : null;
}

// Helper function to extract branch image URL
const getBranchImage = (content: any): string | null => {
  if (typeof content === 'string') {
    return getWixImageUrl(content);
  }
  if (!content?.nodes) return null;
  const imageNode = content.nodes.find((node: any) => node.type === 'IMAGE');
  return imageNode?.imageData?.image?.src?.id
    ? `https://static.wixstatic.com/media/${imageNode.imageData.image.src.id}`
    : null;
}

// Helper function to extract hospital logo URL
const getHospitalLogo = (content: any): string | null => {
  if (typeof content === 'string') {
    return getWixImageUrl(content);
  }
  if (!content?.nodes) return null;
  const imageNode = content.nodes?.[0];
  if (imageNode?.type === 'IMAGE' && imageNode.imageData?.image?.src?.id) {
    return `https://static.wixstatic.com/media/${imageNode.imageData.image.src.id}`;
  }
  return null;
}

// Helper function to extract doctor image URL
const getDoctorImage = (content: any): string | null => {
  if (typeof content === 'string') {
    return getWixImageUrl(content);
  }
  if (!content?.nodes) return null;
  const imageNode = content.nodes.find((node: any) => node.type === 'IMAGE');
  return imageNode?.imageData?.image?.src?.id
    ? `https://static.wixstatic.com/media/${imageNode.imageData.image.src.id}`
    : null;
}

// Helper function to extract treatment image URL
const getTreatmentImage = (content: any): string | null => {
  if (typeof content === 'string') {
    return getWixImageUrl(content);
  }
  if (!content?.nodes) return null;
  const imageNode = content.nodes.find((node: any) => node.type === 'IMAGE');
  return imageNode?.imageData?.image?.src?.id
    ? `https://static.wixstatic.com/media/${imageNode.imageData.image.src.id}`
    : null;
}

// Helper function to get short plain text description from rich content
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

// Helper function to render rich text content
const renderRichText = (richContent: any): JSX.Element | null => {
  if (typeof richContent === 'string') {
    return <div className="description-1 leading-relaxed prose space-y-3 prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: richContent }} />
  }
  if (!richContent || !richContent.nodes) return null

  const renderNode = (node: any): JSX.Element | null => {
    switch (node.type) {
      case 'PARAGRAPH':
        return (
          <p key={Math.random()} className="text-gray-600 leading-relaxed mb-2">
            {node.nodes?.map((child: any, idx: number) => renderTextNode(child, idx))}
          </p>
        )
      case 'HEADING1':
        return (
          <h3 key={Math.random()} className="text-xl font-semibold text-gray-800 mb-2">
            {node.nodes?.map((child: any, idx: number) => renderTextNode(child, idx))}
          </h3>
        )
      case 'HEADING2':
        return (
          <h4 key={Math.random()} className="text-lg font-semibold text-gray-800 mb-2">
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
            <div key={Math.random()} className="my-4">
              <Image
                src={imgSrc}
                alt="Embedded image"
                width={600}
                height={400}
                className="w-full h-auto rounded-lg"
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
const Breadcrumb = ({ hospitalName, branchName, hospitalSlug }: { hospitalName: string; branchName: string; hospitalSlug: string }) => (
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
        <span className="text-gray-800 font-medium">{branchName}</span>
      </div>
    </div>
  </nav>
)

// Accreditations List Component
const AccreditationsList = ({ accreditations }: { accreditations: any[] }) => {
  if (!accreditations || accreditations.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100">
        <Award className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No accreditations listed</p>
        <p className="text-gray-400 mt-2 text-xs">Accreditations</p>
      </div>
    );
  }

  return (
    <div className="text-center p-6 bg-white md:bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
      <Award className="w-8 h-8 text-gray-600 mx-auto mb-3" />
      <div className="space-y-1 max-h-20 overflow-y-auto">
        {accreditations.slice(0, 4).map((acc: any) => (
          <p key={acc._id} className="text-sm text-gray-700 font-medium line-clamp-1 px-2 py-1 bg-gray-100 rounded mx-auto w-full max-w-[120px]">
            {acc.name}
          </p>
        ))}
        {accreditations.length > 4 && (
          <p className="text-xs text-gray-500 mt-2">+{accreditations.length - 4} more</p>
        )}
      </div>
      <p className="text-gray-500 mt-3 text-xs font-medium">Accreditations</p>
    </div>
  );
}

// Specialties List Component
const SpecialtiesList = ({ specialties }: { specialties: any[] }) => {
  if (!specialties || specialties.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100">
        <Heart className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-xs">No specialties listed</p>
        <p className="text-gray-400 mt-2 text-xs">Specialties</p>
      </div>
    );
  }

  return (
    <div className="text-center p-6 bg-white md:bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
      <Heart className="w-8 h-8 text-gray-600 mx-auto mb-3" />
      <div className="space-y-1 max-h-20 overflow-y-auto">
        {specialties.slice(0, 4).map((spec: any) => (
          <p key={spec._id || Math.random()} className="text-3xl font-semibold text-gray-800">
            {spec.name}
          </p>
        ))}
        {specialties.length > 4 && (
          <p className="text-xs text-gray-500 mt-2">+{specialties.length - 4} more</p>
        )}
      </div>
      <p className="text-gray-500 mt-3 text-sm font-medium">Specialties</p>
    </div>
  );
}

// Similar Branches Carousel Component
const SimilarBranchesCarousel = ({ branches, currentCityDisplay }: { branches: any[], currentCityDisplay: string }) => {
  if (branches.length === 0) return null

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  })

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const itemsPerView = 3
  const visibleSlidesClass = `w-full sm:w-1/2 lg:w-[calc(32.7%-0.666rem)]`

  return (
    <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-4 map-4">
        <h3 className="text-2xl font-semibold text-gray-800  flex items-center gap-3">
          Nearby Branches in {currentCityDisplay} <span className="text-gray-700 text-base font-normal">({branches.length})</span>
        </h3>
        {branches.length > itemsPerView && (
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={scrollNext}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {branches.map((branchItem) => {
            const branchImage = getBranchImage(branchItem.branchImage)
            const hospitalSlug = generateSlug(branchItem.hospitalName)
            return (
              <div key={branchItem._id} className={classNames("flex-shrink-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden", visibleSlidesClass)}>
                <BranchCard branch={branchItem} branchImage={branchImage} hospitalSlug={hospitalSlug} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Branch Card Component
const BranchCard = ({ branch, branchImage, hospitalSlug }: { branch: any, branchImage: string | null, hospitalSlug: string }) => {
  const firstCity = branch.city && branch.city.length > 0 ? branch.city[0].name : 'N/A'

  return (
    <Link href={`/hospitals/branches/${hospitalSlug}-${generateSlug(branch.name)}`} className="block h-full">
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        {branchImage ? (
          <Image
            src={branchImage}
            alt={branch.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Hospital className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-800 text-base line-clamp-1">{branch.name}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span>{firstCity}</span>
        </div>
      </div>
    </Link>
  )
}

// Doctor Card Component
const DoctorCard = ({ doctor }: { doctor: any }) => {
  const doctorImage = getDoctorImage(doctor.profileImage)
  const doctorSlug = doctor.slug || generateSlug(doctor.name)

  return (
    <Link href={`/doctors/${doctorSlug}`} className="group flex flex-col h-full bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
      <div className="relative h-60 overflow-hidden bg-gray-50">
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
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-gray-900 text-lg mb-2 line-clamp-1">{doctor.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{doctor.specialization}</p>
        {doctor.experience && (
          <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {doctor.experience} years of experience
          </p>
        )}
        <p className="text-gray-500 text-xs line-clamp-2 flex-1">{getShortDescription(doctor.about)}</p>
      </div>
    </Link>
  )
}

// Treatment Card Component
const TreatmentCard = ({ item }: { item: any }) => {
  const treatmentImage = getTreatmentImage(item.treatmentImage || item.image)

  return (
    <Link href={`/treatment/${item.slug || generateSlug(item.name)}`} className="group flex flex-col h-full bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
      <div className="relative h-48 overflow-hidden bg-gray-50">
        {treatmentImage ? (
          <Image
            src={treatmentImage}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Scissors className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-1">{item.name}</h3>

        {item.cost && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-blue-600 font-semibold text-sm">Starting from ${item.cost}</p>
          </div>
        )}
      </div>
    </Link>
  )
}

// Embla Carousel Component
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
    containScroll: 'trimSnaps'
  })

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const itemsPerView = 3
  const visibleSlidesClass = `w-full sm:w-1/2 lg:w-[calc(32.7%-0.666rem)]`

  const renderCard = (item: any) => {
    switch (type) {
      case 'doctors':
        return <DoctorCard doctor={item} />
      case 'treatments':
        return <TreatmentCard item={item} />
      default:
        return null
    }
  }

  return (
    <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex justify-between items-center map-4">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-3">

          {title}
        </h3>
        {items.length > itemsPerView && (
          <div className="flex gap-2">
            <button onClick={scrollPrev} className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={scrollNext} className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {items.map((item, index) => (
            <div key={item._id || index} className={classNames("flex-shrink-0", visibleSlidesClass)}>
              {renderCard(item)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Sub-component: Search Dropdown
interface SearchDropdownProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: { id: string; name: string }[]
  selectedOption: string
  onOptionSelect: (id: string) => void
  onClear: () => void
  type: "branch" | "city" | "treatment" | "specialty"
}

const SearchDropdown = ({
  value,
  onChange,
  placeholder,
  options,
  selectedOption,
  onOptionSelect,
  onClear,
  type,
}: SearchDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const filteredOptions = useMemo(() => 
    options.filter(option =>
      option.name.toLowerCase().includes(value.toLowerCase())
    ), [options, value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedOptionName = options.find(opt => opt.id === selectedOption)?.name

  const getIcon = () => {
    switch (type) {
      case "branch":
        return <Building2 className="w-4 h-4 text-gray-500" />
      case "city":
        return <MapPin className="w-4 h-4 text-gray-500" />
      case "treatment":
        return <Stethoscope className="w-4 h-4 text-gray-500" />
      case "specialty":
        return <Heart className="w-4 h-4 text-gray-500" />
      default:
        return <Search className="w-4 h-4 text-gray-500" />
    }
  }

  const getPlaceholder = () => {
    switch (type) {
      case "branch":
        return "e.g., Apollo Delhi Branch..."
      case "city":
        return "e.g., Mumbai, Delhi..."
      case "treatment":
        return "e.g., MRI Scan, Chemotherapy..."
      case "specialty":
        return "e.g., Cardiology, Neurology..."
      default:
        return placeholder
    }
  }

  const getLabel = () => {
    switch (type) {
      case "branch":
        return "Filter by Branch"
      case "city":
        return "Filter by City"
      case "treatment":
        return "Filter by Treatment"
      case "specialty":
        return "Filter by Specialty"
      default:
        return ""
    }
  }

  const getNoResultsText = () => {
    switch (type) {
      case "branch":
        return "branches"
      case "city":
        return "cities"
      case "treatment":
        return "treatments"
      case "specialty":
        return "specialties"
      default:
        return ""
    }
  }

  return (
    <div ref={dropdownRef} className="relative space-y-2">
      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
        {getIcon()}
        <span className="">{getLabel()}</span>
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {getIcon()}
        </div>
        <input
          type="text"
          placeholder={getPlaceholder()}
          value={selectedOptionName || value}
          onChange={(e) => {
            onChange(e.target.value)
            if (selectedOption) onOptionSelect("")
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-12 py-3 border border-gray-200 rounded-lg w-full text-sm bg-white focus:bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all placeholder:text-gray-400 shadow-sm"
        />

        {(value || selectedOption) && (
          <button
            onClick={() => {
              onChange("")
              onOptionSelect("")
              onClear()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Clear filter"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Toggle dropdown"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (value || filteredOptions.length > 0) && (
        <>
          <div
            className="fixed inset-0 z-10 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onOptionSelect(option.id)
                    onChange("")
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 min-h-[44px]"
                >
                  {getIcon()}
                  <div className="font-medium text-gray-900">{option.name}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-sm text-gray-500 text-center">
                No {getNoResultsText()} match your search. Try a different term.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Hospital Search Component - Updated with dropdown filters
const HospitalSearch = ({
  allHospitals
}: {
  allHospitals: any[]
}) => {
  const router = useRouter()

  // Build filter options from allHospitals
  const branchOptions = useMemo(() => {
    const branchMap: Record<string, string> = {}
    allHospitals.forEach((hospital: any) => {
      hospital.branches?.forEach((branch: any) => {
        if (branch?._id && branch?.name) {
          branchMap[branch._id] = branch.name
        }
      })
    })
    return Object.entries(branchMap).map(([id, name]) => ({ id, name }))
  }, [allHospitals])

  const cityOptions = useMemo(() => {
    const cityMap: Record<string, string> = {}
    allHospitals.forEach((hospital: any) => {
      hospital.branches?.forEach((branch: any) => {
        branch.city?.forEach((city: any) => {
          if (city?._id && city?.name) cityMap[city._id] = city.name
        })
      })
    })
    return Object.entries(cityMap).map(([id, name]) => ({ id, name }))
  }, [allHospitals])

  const treatmentOptions = useMemo(() => {
    const treatmentMap: Record<string, string> = {}
    allHospitals.forEach((hospital: any) => {
      hospital.treatments?.forEach((t: any) => {
        if (t?._id && t?.name) treatmentMap[t._id] = t.name
      })
      hospital.branches?.forEach((branch: any) =>
        branch.treatments?.forEach((t: any) => {
          if (t?._id && t?.name) treatmentMap[t._id] = t.name
        })
      )
    })
    return Object.entries(treatmentMap).map(([id, name]) => ({ id, name }))
  }, [allHospitals])

  const specializationOptions = useMemo(() => {
    const specializationSet = new Set<string>()
    allHospitals.forEach((hospital: any) => {
      hospital.branches?.forEach((branch: any) => {
        branch.treatments?.forEach((t: any) => {
          if (t?.category) specializationSet.add(t.category)
        })
        branch.doctors?.forEach((d: any) => {
          if (d.specialization) specializationSet.add(d.specialization)
        })
        branch.specialties?.forEach((s: any) => {
          if (s.name) specializationSet.add(s.name)
        })
      })
      hospital.treatments?.forEach((t: any) => {
        if (t?.category) specializationSet.add(t.category)
      })
      hospital.doctors?.forEach((d: any) => {
        if (d.specialization) specializationSet.add(d.specialization)
      })
    })
    return Array.from(specializationSet).map(name => ({ id: name, name }))
  }, [allHospitals])

  // States for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [branchQuery, setBranchQuery] = useState("")
  const [cityQuery, setCityQuery] = useState("")
  const [treatmentQuery, setTreatmentQuery] = useState("")
  const [specializationQuery, setSpecializationQuery] = useState("")
  const [selectedBranchId, setSelectedBranchId] = useState("")
  const [selectedCityId, setSelectedCityId] = useState("")
  const [selectedTreatmentId, setSelectedTreatmentId] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("")

  const clearFilters = () => {
    setSearchQuery("")
    setBranchQuery("")
    setCityQuery("")
    setTreatmentQuery("")
    setSpecializationQuery("")
    setSelectedBranchId("")
    setSelectedCityId("")
    setSelectedTreatmentId("")
    setSelectedSpecialization("")
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let url = '/hospitals?'
    let params: string[] = []

    if (searchQuery) {
      params.push(`search=${encodeURIComponent(searchQuery)}`)
    }
    if (selectedBranchId || branchQuery) {
      params.push(`branch=${encodeURIComponent(selectedBranchId || branchQuery)}`)
    }
    if (selectedCityId || cityQuery) {
      params.push(`city=${encodeURIComponent(selectedCityId || cityQuery)}`)
    }
    if (selectedTreatmentId || treatmentQuery) {
      params.push(`treatment=${encodeURIComponent(selectedTreatmentId || treatmentQuery)}`)
    }
    if (selectedSpecialization || specializationQuery) {
      params.push(`specialty=${encodeURIComponent(selectedSpecialization || specializationQuery)}`)
    }

    if (params.length > 0) {
      router.push(url + params.join('&'))
    } else {
      router.push('/hospitals')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Building2 className="w-5 h-5" />
        Search Hospitals
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            Hospital or Branch Name
          </label>
          <input
            type="text"
            placeholder="Enter hospital or branch name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <SearchDropdown
          value={cityQuery}
          onChange={setCityQuery}
          placeholder="Search cities..."
          options={cityOptions}
          selectedOption={selectedCityId}
          onOptionSelect={setSelectedCityId}
          onClear={() => {
            setCityQuery("")
            setSelectedCityId("")
          }}
          type="city"
        />
        <SearchDropdown
          value={treatmentQuery}
          onChange={setTreatmentQuery}
          placeholder="Search treatments..."
          options={treatmentOptions}
          selectedOption={selectedTreatmentId}
          onOptionSelect={setSelectedTreatmentId}
          onClear={() => {
            setTreatmentQuery("")
            setSelectedTreatmentId("")
          }}
          type="treatment"
        />
        <SearchDropdown
          value={specializationQuery}
          onChange={setSpecializationQuery}
          placeholder="Search specialties..."
          options={specializationOptions}
          selectedOption={selectedSpecialization}
          onOptionSelect={setSelectedSpecialization}
          onClear={() => {
            setSpecializationQuery("")
            setSelectedSpecialization("")
          }}
          type="specialty"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Search
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Clear Filters
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Redirects to hospital list with filtered results
      </p>
    </div>
  )
}

// Skeleton Components
const HeroSkeleton = () => (
  <section className="relative w-full h-[70vh] bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
    <div className="absolute bottom-0 left-0 w-full z-10 px-6 pb-12">
      <div className="container mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 rounded w-64" />
            <div className="h-4 bg-gray-300 rounded w-96" />
          </div>
        </div>
      </div>
    </div>
  </section>
)

const OverviewSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-48 mb-6" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="text-center p-6">
          <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-3" />
          <div className="h-6 bg-gray-300 rounded mx-auto w-20" />
          <div className="h-4 bg-gray-300 rounded mx-auto w-16 mt-2" />
        </div>
      ))}
    </div>
  </div>
)

const AboutSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-48 mb-4" />
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 rounded" />
      ))}
    </div>
  </div>
)

const CarouselSkeleton = ({ type }: { type: string }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-64 mb-4" />
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-80">
          <div className="h-48 bg-gray-300 rounded-lg mb-4" />
          <div className="space-y-2">
            <div className="h-5 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

const FacilitiesSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-48 mb-4" />
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="w-3 h-3 bg-gray-300 rounded-full" />
          <div className="h-4 bg-gray-300 rounded w-32" />
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

// Main Branch Detail Component
export default function BranchDetail({ params }: { params: Promise<{ slug: string }> }) {
  const [branch, setBranch] = useState<any>(null)
  const [hospital, setHospital] = useState<HospitalWithBranchPreview | null>(null)
  const [allHospitals, setAllHospitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBranchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const resolvedParams = await params
        const branchSlug = resolvedParams.slug

        const res = await fetch('/api/hospitals')
        if (!res.ok) throw new Error("Failed to fetch hospitals")
        const data = await res.json()

        if (data.items && data.items.length > 0) {
          let foundBranch = null
          let foundHospital = null

          for (const hospitalItem of data.items) {
            const hospitalSlug = generateSlug(hospitalItem.name)

            if (hospitalItem.branches && hospitalItem.branches.length > 0) {
              for (const branchItem of hospitalItem.branches) {
                const branchNameSlug = generateSlug(branchItem.name)
                const combinedSlug = `${hospitalSlug}-${branchNameSlug}`

                if (combinedSlug === branchSlug) {
                  foundBranch = branchItem
                  foundHospital = hospitalItem
                  break
                }
              }
            }
            if (foundBranch) break
          }

          if (foundBranch && foundHospital) {
            setBranch(foundBranch)
            setHospital(foundHospital)
            setAllHospitals(data.items)
          } else {
            throw new Error("Branch not found")
          }
        } else {
          throw new Error("No hospitals available")
        }
      } catch (err) {
        console.error('Error fetching branch:', err)
        setError(err instanceof Error ? err.message : "Failed to load branch details")
      } finally {
        setLoading(false)
      }
    }

    fetchBranchData()
  }, [params])

  // Loading State with Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSkeleton />
        <Breadcrumb hospitalName="Hospital Name" branchName="Branch Name" hospitalSlug="" />
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid lap:grid-cols-12 gap-8">
              <main className="lap:col-span-9 space-y-8">
                <OverviewSkeleton />
                <AboutSkeleton />
                <CarouselSkeleton type="doctors" />
                <CarouselSkeleton type="treatments" />
                <FacilitiesSkeleton />
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
  if (error || !branch || !hospital) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative">
        <Breadcrumb hospitalName="Hospital Name" branchName="Branch Name" hospitalSlug="" />
        <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-lg shadow-sm border border-gray-100">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-800">Branch Not Found</h2>
          <p className="text-gray-600 leading-relaxed">{error || "The requested branch could not be found. Please check the URL or try searching again."}</p>
          <Link
            href="/hospitals"
            className="inline-block w-full bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-all font-semibold shadow-sm hover:shadow-md"
          >
            Go to Hospital Search
          </Link>
        </div>
      </div>
    )
  }

  // Derived Data
  const branchImage = getBranchImage(branch.branchImage)
  const hospitalImage = getHospitalImage(hospital.image)
  const heroImage = branchImage || hospitalImage
  const hospitalLogo = getHospitalLogo(hospital.logo)
  const hospitalSlug = hospital.slug || generateSlug(hospital.name)

  // Compute similar branches in nearby cities (same city)
  const currentCities = branch.city ? branch.city.map((c: any) => c.name) : []
  const similarBranches = allHospitals
    .filter((h: any) => h._id !== hospital._id)
    .flatMap((h: any) =>
      h.branches
        .filter((b: any) => b.city && b.city.some((c: any) => currentCities.includes(c.name)))
        .map((b: any) => ({ ...b, hospitalName: h.name }))
    )
    .slice(0, 6)
  const currentCityDisplay = branch.city?.[0]?.name || 'Nearby Cities'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="relative w-full h-[70vh]">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${hospital.name} ${branch.name} facility`}
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
            <div className="flex gap-x-4 items-center">
              <div className="flex justify-start">
                {hospitalLogo && (
                  <div className="relative w-16 h-16 bg-white rounded-full p-2">
                    <Image
                      src={hospitalLogo}
                      alt={`${hospital.name} logo`}
                      fill
                      className="object-contain rounded-full"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight">
                  {branch.name}
                </h1>
                <div className="flex flex-wrap gap-x-2 mt-0">
                  {branch.specialties?.slice(0, 3).map((spec: any) => (
                    <span key={spec._id} className="flex items-center gap-1  text-lg">

                      {spec.name},
                    </span>
                  ))}
                  {branch.accreditation && branch.accreditation.slice(0, 3).map((acc: any) => (
                    <span key={acc._id} className="flex items-center gap-2 text-lg">
                      {acc.name}
                      {acc.image && (
                        <img
                          src={getWixImageUrl(acc.image)}
                          alt={acc.name}
                          className="w-5 h-5 rounded-full object-contain"
                        />
                      )}

                    </span>
                  ))}
                  {branch.specialties?.length > 3 && (
                    <span className="text-lg text-blue-200">+{branch.specialties.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">

              {branch.address && (
                <span className="flex items-center gap-2 text-lg font-medium ">
                  <MapPin className="w-4 h-4" />
                  {branch.address}
                </span>
              )}
              {branch.emergencyContact && (
                <span className="flex items-center gap-2 bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium border border-red-500/30">
                  <Clock className="w-4 h-4" />
                  24/7: {branch.emergencyContact}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      <Breadcrumb hospitalName={hospital.name} branchName={branch.name} hospitalSlug={hospitalSlug} />
      {/* Main Content */}
      <section className="py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-4 md:px-0 px-2">
            <main className="lg:col-span-9 space-y-4">
              {/* Hospital Group Overview */}


              {/* Key Statistics */}
              <section className="md:bg-white md:rounded-lg md:shadow-sm md:p-4 md:border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Branch Overview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {branch.specialties?.length > 0 && (
                    <SpecialtiesList specialties={branch.specialties} />
                  )}
                  {branch.totalBeds && (
                    <StatCard icon={Bed} value={branch.totalBeds} label="Total Beds" />
                  )}
                  {branch.icuBeds && (
                    <StatCard icon={Bed} value={branch.icuBeds} label="ICU Beds" />
                  )}
                  {branch.noOfDoctors && (
                    <StatCard icon={Users} value={branch.noOfDoctors} label="Doctors" />
                  )}
                  {branch.yearEstablished && (
                    <StatCard icon={Calendar} value={branch.yearEstablished} label="Established" />
                  )}
                  {/* {branch.accreditation?.length > 0 && (
                    <AccreditationsList accreditations={branch.accreditation} />
                  )} */}

                </div>
              </section>

              {/* About Branch Section */}
              {branch.description && (
                <section className="md:bg-white md:rounded-lg md:shadow-sm md:p-4 md:border border-gray-100">
                  <h2 className="text-2xl font-semibold  text-gray-800 mt-5 md:mt-0 mb-2 md:mb-2">About {branch.name}</h2>
                  {renderRichText(branch.description)}
                  <div className="pt-2">
                    <a href="/hospitals" className="description  ">
                      Explore More About Our Group Hospitals
                    </a>
                  </div>

                </section>

              )}

              {/* Doctors Section */}
              {branch.doctors && branch.doctors.length > 0 && (
                <section >
                  <EmblaCarousel
                    items={branch.doctors}
                    title="Our Specialist Doctors"
                    Icon={Stethoscope}
                    type="doctors"
                  />
                </section>
              )}

              {/* Treatments Section */}
              {branch.treatments && branch.treatments.length > 0 && (
                <section>
                  <EmblaCarousel
                    items={branch.treatments}
                    title="Available Treatments"
                    Icon={Scissors}
                    type="treatments"
                  />
                </section>
              )}



              {/* Similar Branches Section */}
              <SimilarBranchesCarousel branches={similarBranches} currentCityDisplay={currentCityDisplay} />
            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-3 space-y-8">
              <HospitalSearch allHospitals={allHospitals} />
              <ContactForm />
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ icon: Icon, value, label }: { icon: any; value: string | number; label: string }) => (
  <div className="text-center p-6 bg-white md:bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm ">
    <Icon className="w-8 h-8 text-gray-600 mx-auto mb-3" />
    <p className="text-3xl font-semibold text-gray-800">{value}</p>
    <p className="text-gray-500 mt-2 text-sm">{label}</p>
  </div>
)