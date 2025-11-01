// File: app/hospitals/page.tsx

"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Banner from "@/components/BannerService"
import {
  Search,
  Filter,
  Loader2,
  Hospital,
  Building2,
  Award,
  MapPin,
  Heart,
  Stethoscope,
  Cross,
  ChevronRight,
  ChevronLeft,
  Home,
  X,
  ChevronDown,
  Clock,
  DollarSign,
} from "lucide-react"

const getWixImageUrl = (imageStr: string): string | null => {
  if (!imageStr || typeof imageStr !== 'string') return null;
  if (!imageStr.startsWith('wix:image://v1/')) return null;

  const parts = imageStr.split('/');
  if (parts.length < 4) return null;

  const id = parts[3];
  return `https://static.wixstatic.com/media/${id}`;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

interface AccreditationType {
  _id: string;
  name: string;
  description: string | null;
  image: string | null;
  issuingBody: string | null;
  year: string | null;
}

interface DoctorType {
  _id: string
  name: string
  specialization: string | null
  qualification: string | null
  experience: string | null
  designation: string | null
  languagesSpoken: string | null
  about: string | null
  profileImage: any | null
}

interface ExtendedDoctorType extends DoctorType {
  hospitalName: string
  branchName?: string
  branchId?: string
  relevanceScore: number
}

interface TreatmentType {
  _id: string
  name: string
  description: string | null
  category: string | null
  duration: string | null
  cost: string | null
  treatmentImage?: string | null
}

interface ExtendedTreatmentType extends TreatmentType {
  hospitalName: string
  branchName?: string
  branchId?: string
  relevanceScore: number
}

interface BranchType {
  _id: string
  name: string
  address: string | null
  city: Array<{
    _id: string
    name: string
    state: string | null
    country: string | null
  }>
  contactNumber: string | null
  email: string | null
  totalBeds: number | null
  icuBeds: string | null
  yearEstablished: number | null
  emergencyContact: string | null
  branchImage: any | null
  description: string | null
  doctors: Array<DoctorType>
  treatments: Array<TreatmentType>
  specialties: Array<{
    _id: string
    name: string
    image: string | null
    description: string | null
    issuingBody: string | null
    year: string | null
    category: string | null
  }>
  accreditation: AccreditationType[]
  noOfDoctors: string | null
  relevanceScore?: number
}

interface HospitalType {
  _id: string
  name: string
  slug: string | null
  image: string | null
  logo: string | null
  yearEstablished: string | null
  accreditation: AccreditationType[] | null
  beds: string | null
  emergencyServices: boolean | null
  description: string | null
  website: string | null
  email: string | null
  contactNumber: string | null
  branches: BranchType[]
  doctors: Array<DoctorType>
  treatments: Array<TreatmentType>
  relevanceScore?: number
}

// Sub-component: Breadcrumb Navigation
const BreadcrumbNav = () => (
  <nav aria-label="Breadcrumb" className="container border-t border-gray-300 bg-white mx-auto px-4 sm:px-6 lg:px-8 ">
    <ol className="flex items-center px-2 md:px-0 space-x-1 py-3 text-sm text-gray-500">
      <li>
        <Link href="/" className="flex items-center hover:text-gray-700 transition-colors">
          <Home className="w-4 h-4 mr-1" />
          Home
        </Link>
      </li>
      <li>
        <span className="mx-1">/</span>
      </li>
      <li className="text-gray-900 font-medium">Hospitals</li>
    </ol>
  </nav>
)

// Sub-component: Hospital Card Skeleton
const HospitalCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
      <div className="absolute top-3 right-3 bg-gray-300 rounded w-20 h-6" />
    </div>
    <div className="p-4 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded p-3 h-16" />
        ))}
      </div>
    </div>
  </div>
)

// Sub-component: Doctor Card Skeleton
const DoctorCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative" />
    <div className="p-4 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  </div>
)

// Sub-component: Treatment Card Skeleton
const TreatmentCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative" />
    <div className="p-4 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  </div>
)

// Sub-component: View Toggle
interface ViewToggleProps {
  view: 'hospitals' | 'doctors' | 'treatments'
  setView: (view: 'hospitals' | 'doctors' | 'treatments') => void
}

const ViewToggle = ({ view, setView }: ViewToggleProps) => (
  <div className="flex bg-white rounded-xs shadow-xs border-gray-200 border p-1 mb-6 mx-auto lg:mx-0 max-w-md">
    <button
      onClick={() => setView('hospitals')}
      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        view === 'hospitals'
          ? 'bg-gray-200 text-gray-800 shadow-xs'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      Hospitals
    </button>
    <button
      onClick={() => setView('doctors')}
      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        view === 'doctors'
          ? 'bg-gray-200 text-gray-800 shadow-xs'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      Doctors
    </button>
    <button
      onClick={() => setView('treatments')}
      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        view === 'treatments'
          ? 'bg-gray-200 text-gray-800 shadow-xs'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      Treatments
    </button>
  </div>
)

// Sub-component: Hospital Card
interface HospitalCardProps {
  branch: BranchType
  hospitalName: string
  hospitalLogo: string | null
}

const HospitalCard = ({ branch, hospitalName, hospitalLogo }: HospitalCardProps) => {
  const slug = generateSlug(`${hospitalName} ${branch.name}`)

  const imageUrl = getWixImageUrl(branch.branchImage?.imageData?.image?.src?.id || branch.branchImage) || null

  const cities = branch.city?.map(c => c.name).filter(Boolean) || []
  const primaryCity = cities[0] || ""
  const primaryState = branch.city?.[0]?.state || ""

  const displayAccreditations = branch.accreditation?.slice(0, 3) || []
  const remainingAccreditations = branch.accreditation?.length - 3 || 0

  const hospitalLogoUrl = hospitalLogo ? getWixImageUrl(hospitalLogo) : null

  const primarySpecialty = branch.specialties?.[0]?.name || 'N/A'

  return (
    <Link href={`/hospitals/branches/${slug}`} className="block">
      <article className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer h-full flex flex-col">
        <div className="relative h-60 md:h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="absolute top-2 left-2 right-3 z-10 flex justify-end flex-wrap gap-2">
            {displayAccreditations.map((acc) => (
              <span key={acc._id} className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-700 px-1 py-1 rounded-full shadow-xs">
                {acc.image ? (
                  <img
                    src={getWixImageUrl(acc.image)}
                    alt={acc.name}
                    className="w-7 h-7 rounded-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                ) : (
                  <Award className="w-3 h-3" />
                )}
              </span>
            ))}
            {remainingAccreditations > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md shadow-sm">
                +{remainingAccreditations} more
              </span>
            )}
          </div>

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={branch.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Hospital className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>

        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <header className="mb-3">
            <h2 className="text-lg sm:text-lg font-medium line-clamp-2 group-hover:text-gray-900 transition-colors">
              {branch.name}
            </h2>
            <div className="flex relative items-center gap-x-2">
              {primaryCity && (
                <div className="pt-1 flex-1">
                  <div className="flex items-center flex gap-x-1 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 mr-1 " />
                    <span className="truncate">{primaryCity}</span>, <p className="text-sm text-gray-600"> { " "}{primarySpecialty}</p>
                  </div> 
                </div>
              )}
              {hospitalLogoUrl && (
                <img
                  src={hospitalLogoUrl}
                  alt={`${hospitalName} logo`}
                  className="w-20 h-auto rounded absolute -bottom-2 -right-0 object-contain flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
            </div>
          </header>

          <footer className="border-t border-gray-100 pt-2 sm:pt-3 mt-auto">
            <div className="grid grid-cols-3 gap-2 sm:gap-2">
              {branch.noOfDoctors && (
                <div className="text-center rounded bg-gray-50 p-2 sm:p-2 border border-gray-100">
                  <p className="text-lg md:text-sm font-semibold text-gray-900">{branch.noOfDoctors}</p>
                  <p className="text-lg md:text-xs text-gray-900 uppercase font-medium">Doctors</p>
                </div>
              )}
              {branch.totalBeds && (
                <div className="text-center rounded bg-gray-50 p-2 sm:p-3 border border-gray-100">
                  <p className="text-lg md:text-sm font-semibold text-gray-900">{branch.totalBeds}+</p>
                  <p className="text-lg md:text-xs text-gray-900 uppercase font-medium"> Beds</p>
                </div>
              )}
              {branch.yearEstablished && (
                <div className="text-center rounded bg-gray-50 p-2 sm:p-3 border border-gray-100">
                  <p className="text-lg md:text-sm font-semibold text-gray-900">{branch.yearEstablished}</p>
                  <p className="text-lg md:text-xs text-gray-900 uppercase font-medium">Est</p>
                </div>
              )}
            </div>
          </footer>
        </div>
      </article>
    </Link>
  )
}

// Sub-component: Doctor Card (Minimal Details)
interface DoctorCardProps {
  doctor: ExtendedDoctorType
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const slug = generateSlug(doctor.name)
  const imageUrl = getWixImageUrl(doctor.profileImage) || null

  return (
    <Link href={`/doctors/${slug}`} className="block">
      <article className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer h-full flex flex-col">
        <div className="relative h-60 md:h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={doctor.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Stethoscope className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <header className="mb-3">
            <h2 className="text-lg font-medium line-clamp-2 group-hover:text-gray-900 transition-colors">
              {doctor.name}
            </h2>
            <p className="text-sm font-semibold text-gray-600 mb-1">{doctor.specialization || 'General Practitioner'}</p>
            <p className="text-sm text-gray-700 mb-2">
              {doctor.hospitalName}{doctor.branchName ? `, ${doctor.branchName}` : ''}
            </p>
            {doctor.experience && (
              <p className="text-xs text-gray-500 mb-3">{doctor.experience} years experience</p>
            )}
          </header>
          {/* Minimal details only - no qualification, languages, designation */}
        </div>
      </article>
    </Link>
  )
}

// Sub-component: Treatment Card (Minimal Details)
interface TreatmentCardProps {
  treatment: ExtendedTreatmentType
}

const TreatmentCard = ({ treatment }: TreatmentCardProps) => {
  const slug = generateSlug(treatment.name)
  const imageUrl = getWixImageUrl(treatment.treatmentImage) || null

  return (
    <Link href={`/treatments/${slug}`} className="block">
      <article className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer h-full flex flex-col">
        <div className="relative h-60 md:h-48 overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={treatment.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Stethoscope className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <header className="mb-3">
            <h2 className="text-lg font-medium line-clamp-2 group-hover:text-gray-900 transition-colors">
              {treatment.name}
            </h2>
            {treatment.category && (
              <p className="text-sm font-semibold text-green-600 mb-1">{treatment.category}</p>
            )}
            <p className="text-sm text-gray-700 mb-2">
            {treatment.branchName ? ` ${treatment.branchName}` : ''}
            </p>
          </header>
          <div className="space-y-2 text-sm text-gray-600 mt-auto">
            {treatment.cost && (
              <p className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span>{treatment.cost}</span>
              </p>
            )}
           
          </div>
        </div>
      </article>
    </Link>
  )
}

// Sub-component: Quick Search Dropdown
interface QuickSearchDropdownProps {
  value: string
  onChange: (value: string) => void
  options: { id: string; name: string }[]
  onClear: () => void
  view: 'hospitals' | 'doctors' | 'treatments'
}

const QuickSearchDropdown = ({ value, onChange, options, onClear, view }: QuickSearchDropdownProps) => {
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

  const getLabelText = () => {
    switch (view) {
      case 'hospitals':
        return "Quick Search"
      case 'doctors':
        return "Find Doctors"
      case 'treatments':
        return "Explore Treatments"
      default:
        return "Search"
    }
  }

  const getPlaceholderText = () => {
    switch (view) {
      case 'hospitals':
        return "e.g., Apollo Hospital, Mumbai, Cardiology..."
      case 'doctors':
        return "e.g., Dr. Smith, Cardiologist, Apollo..."
      case 'treatments':
        return "e.g., Knee Replacement, Oncology, AIIMS..."
      default:
        return "Search..."
    }
  }

  const getIcon = () => <Search className="w-4 h-4 text-gray-500" />

  const getNoResultsText = () => "results"

  return (
    <div ref={dropdownRef} className="relative space-y-2">
      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 ">
        {getIcon()}
        {getLabelText()}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {getIcon()}
        </div>
        <input
          type="text"
          placeholder={getPlaceholderText()}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-12 py-3 border border-gray-200 rounded-lg w-full text-sm bg-white focus:bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all placeholder:text-gray-400 shadow-sm"
        />
        {value && (
          <button
            onClick={() => {
              onChange("")
              onClear()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Clear search"
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
                    onChange(option.name)
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
      <p className="text-xs text-gray-500">{getLabelText()}</p>
    </div>
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

// Sub-component: Filter Sidebar
interface FilterSidebarProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  branchQuery: string
  setBranchQuery: (value: string) => void
  cityQuery: string
  setCityQuery: (value: string) => void
  treatmentQuery: string
  setTreatmentQuery: (value: string) => void
  specializationQuery: string
  setSpecializationQuery: (value: string) => void
  selectedBranchId: string
  setSelectedBranchId: (value: string) => void
  selectedCityId: string
  setSelectedCityId: (value: string) => void
  selectedTreatmentId: string
  setSelectedTreatmentId: (value: string) => void
  selectedSpecialization: string
  setSelectedSpecialization: (value: string) => void
  branches: { id: string; name: string }[]
  cities: { id: string; name: string }[]
  treatments: { id: string; name: string }[]
  specializations: { id: string; name: string }[]
  quickSearchOptions: { id: string; name: string }[]
  view: 'hospitals' | 'doctors' | 'treatments'
  showFilters: boolean
  setShowFilters: (value: boolean) => void
  clearFilters: () => void
  keyboardHeight?: number
}

const FilterSidebar = ({
  searchQuery,
  setSearchQuery,
  branchQuery,
  setBranchQuery,
  cityQuery,
  setCityQuery,
  treatmentQuery,
  setTreatmentQuery,
  specializationQuery,
  setSpecializationQuery,
  selectedBranchId,
  setSelectedBranchId,
  selectedCityId,
  setSelectedCityId,
  selectedTreatmentId,
  setSelectedTreatmentId,
  selectedSpecialization,
  setSelectedSpecialization,
  branches,
  cities,
  treatments,
  specializations,
  quickSearchOptions,
  view,
  showFilters,
  setShowFilters,
  clearFilters,
  keyboardHeight = 0,
}: FilterSidebarProps) => {
  const renderFilters = () => {
    switch (view) {
      case 'hospitals':
        return (
          <>
            <SearchDropdown
              value={cityQuery}
              onChange={setCityQuery}
              placeholder="Search cities..."
              options={cities}
              selectedOption={selectedCityId}
              onOptionSelect={setSelectedCityId}
              onClear={() => {
                setCityQuery("")
                setSelectedCityId("")
              }}
              type="city"
            />
          </>
        )
      case 'doctors':
        return (
          <>
            <SearchDropdown
              value={cityQuery}
              onChange={setCityQuery}
              placeholder="Search cities..."
              options={cities}
              selectedOption={selectedCityId}
              onOptionSelect={setSelectedCityId}
              onClear={() => {
                setCityQuery("")
                setSelectedCityId("")
              }}
              type="city"
            />
            <SearchDropdown
              value={specializationQuery}
              onChange={setSpecializationQuery}
              placeholder="Search specialties..."
              options={specializations}
              selectedOption={selectedSpecialization}
              onOptionSelect={setSelectedSpecialization}
              onClear={() => {
                setSpecializationQuery("")
                setSelectedSpecialization("")
              }}
              type="specialty"
            />
          </>
        )
      case 'treatments':
        return (
          <>
            <SearchDropdown
              value={cityQuery}
              onChange={setCityQuery}
              placeholder="Search cities..."
              options={cities}
              selectedOption={selectedCityId}
              onOptionSelect={setSelectedCityId}
              onClear={() => {
                setCityQuery("")
                setSelectedCityId("")
              }}
              type="city"
            />
            <SearchDropdown
              value={specializationQuery}
              onChange={setSpecializationQuery}
              placeholder="Search specialties..."
              options={specializations}
              selectedOption={selectedSpecialization}
              onOptionSelect={setSelectedSpecialization}
              onClear={() => {
                setSpecializationQuery("")
                setSelectedSpecialization("")
              }}
              type="specialty"
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <aside
      className={`
        w-full lg:w-80
        bg-white border border-gray-50 rounded-t-lg lg:rounded-lg lg:rounded-r-lg shadow-xl lg:shadow-none
        overflow-hidden lg:overflow-y-auto
        max-h-[80vh] lg:max-h-[calc(100vh-2rem)]
        transform transition-transform duration-300 ease-in-out lg:sticky lg:top-10
        ${showFilters
          ? 'translate-y-0 lg:translate-x-0'
          : 'translate-y-full md:translate-y-0 lg:translate-x-0'
        }
        lg:static fixed lg:z-auto z-50 bottom-0 left-0 right-0 lg:right-auto lg:inset-y-auto
        ${!showFilters ? 'hidden lg:block' : 'block'}
      `}
      style={showFilters ? { bottom: `${keyboardHeight}px` } : undefined}
    >
      <div className="lg:hidden flex justify-center py-2 border-b border-gray-100 bg-white">
        <div className="w-6 h-1 rounded-full bg-gray-300" />
      </div>

      <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-700" />
          Filters
        </h2>
        <button
          onClick={() => setShowFilters(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors p-1"
          aria-label="Close filters"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        <QuickSearchDropdown
          value={searchQuery}
          onChange={setSearchQuery}
          options={quickSearchOptions}
          onClear={() => setSearchQuery("")}
          view={view}
        />
        {renderFilters()}
        <button
          onClick={clearFilters}
          className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium flex items-center justify-center gap-2 min-h-[44px]"
        >
          <X className="w-4 h-4" />
          Clear Filters
        </button>
      </div>
    </aside>
  )
}

// Sub-component: Mobile Search Button
interface MobileSearchButtonProps {
  setShowFilters: (value: boolean) => void
  resultsCount: number
  view: 'hospitals' | 'doctors' | 'treatments'
}

const MobileSearchButton = ({ setShowFilters, resultsCount, view }: MobileSearchButtonProps) => (
  <div className="lg:hidden fixed bottom-0 left-0 px-2 md:px-0 right-0 z-30 bg-white border-t border-gray-300">
    <div className="flex items-center justify-between p-3">
      <p className="text-sm text-gray-600 truncate flex-1">
        {resultsCount} {view} results
      </p>
      <button
        onClick={() => setShowFilters(true)}
        className="ml-4 py-2 px-4 bg-gray-200 border-gray-800 rounded-lg flex items-center gap-2 text-white text-sm font-medium transition-colors hover:bg-gray-600"
      >
        <Filter className="w-4 h-4" />
        <span>Filter</span>
      </button>
    </div>
  </div>
)

// Sub-component: Results Header
interface ResultsHeaderProps {
  count: number
  view: 'hospitals' | 'doctors' | 'treatments'
  clearFilters: () => void
}

const ResultsHeader = ({ count, view, clearFilters }: ResultsHeaderProps) => (
  <>
    {count > 0 && (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <p className="text-lg font-semibold text-gray-900">
          {count} {view} found
        </p>
        <button
          onClick={clearFilters}
          className="text-gray-600 hover:text-gray-700 text-sm font-medium transition-colors flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 bg-gray-50"
        >
          <X className="w-4 h-4" />
          Clear filters
        </button>
      </div>
    )}
  </>
)

// Sub-component: No Results
interface NoResultsProps {
  view: 'hospitals' | 'doctors' | 'treatments'
}

const NoResults = ({ view }: NoResultsProps) => (
  <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 bg-white rounded-lg border border-gray-200 p-4 sm:p-8 relative z-0">
    {view === 'hospitals' ? (
      <Hospital className="w-16 h-16 text-gray-400" />
    ) : (
      <Stethoscope className="w-16 h-16 text-gray-400" />
    )}
    <h3 className="text-lg font-semibold text-gray-900">No {view} match your search</h3>
    <p className="text-sm text-gray-600 max-w-md">
      Try broadening your search or using different filters. We're here to help you find the right care.
    </p>
  </div>
)

// Main Component
export default function HospitalDirectory() {
  const searchParams = useSearchParams()
  const [hospitals, setHospitals] = useState<HospitalType[]>([])
  const [branchOptions, setBranchOptions] = useState<{ id: string; name: string }[]>([])
  const [cityOptions, setCityOptions] = useState<{ id: string; name: string }[]>([])
  const [treatmentOptions, setTreatmentOptions] = useState<{ id: string; name: string }[]>([])
  const [specializationOptions, setSpecializationOptions] = useState<{ id: string; name: string }[]>([])
  const [quickSearchOptions, setQuickSearchOptions] = useState<{ id: string; name: string }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [branchQuery, setBranchQuery] = useState("")
  const [cityQuery, setCityQuery] = useState("")
  const [treatmentQuery, setTreatmentQuery] = useState("")
  const [specializationQuery, setSpecializationQuery] = useState("")
  const [selectedBranchId, setSelectedBranchId] = useState("")
  const [selectedCityId, setSelectedCityId] = useState("")
  const [selectedTreatmentId, setSelectedTreatmentId] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("")
  const [view, setView] = useState<'hospitals' | 'doctors' | 'treatments'>('hospitals')
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const showFiltersRef = useRef(showFilters)
  useEffect(() => {
    showFiltersRef.current = showFilters
  }, [showFilters])

  // Initialize from URL params on mount
  useEffect(() => {
    const initialSearch = searchParams.get('search') || ''
    const initialCity = searchParams.get('city') || ''
    const initialTreatment = searchParams.get('treatment') || ''
    const initialBranch = searchParams.get('branch') || ''
    if (initialSearch) {
      setSearchQuery(initialSearch)
    }
    if (initialCity) {
      setCityQuery(initialCity)
    }
    if (initialTreatment) {
      setTreatmentQuery(initialTreatment)
    }
    if (initialBranch) {
      setBranchQuery(initialBranch)
    }
  }, [searchParams])

  // Keyboard detection for mobile
  useEffect(() => {
    if (!('visualViewport' in window)) return

    const vw = window.visualViewport
    let currentIsMobile = window.innerWidth < 1024

    const updateKeyboardHeight = () => {
      currentIsMobile = window.innerWidth < 1024
      if (!currentIsMobile) {
        setKeyboardHeight(0)
        return
      }

      const newHeight = Math.max(0, window.innerHeight - vw!.height)
      setKeyboardHeight(newHeight)

      if (newHeight > 150 && !showFiltersRef.current) {
        setShowFilters(true)
      }
    }

    vw!.addEventListener('resize', updateKeyboardHeight)
    window.addEventListener('orientationchange', updateKeyboardHeight)
    window.addEventListener('resize', updateKeyboardHeight)

    updateKeyboardHeight()

    return () => {
      vw!.removeEventListener('resize', updateKeyboardHeight)
      window.removeEventListener('orientationchange', updateKeyboardHeight)
      window.removeEventListener('resize', updateKeyboardHeight)
    }
  }, [])

  // Quick search options
  const quickSearchOptionsMemo = useMemo(() => {
    const opts: { id: string; name: string }[] = []
    const idMap = new Map<string, boolean>()

    switch (view) {
      case 'hospitals':
        hospitals.forEach((h) => {
          if (!idMap.has(h._id)) {
            idMap.set(h._id, true)
            opts.push({ id: h._id, name: h.name })
          }
          h.branches?.forEach((b) => {
            if (!idMap.has(b._id)) {
              idMap.set(b._id, true)
              opts.push({ id: b._id, name: b.name })
            }
          })
        })
        break
      case 'doctors':
        hospitals.forEach((h) => {
          h.doctors?.forEach((d) => {
            if (!idMap.has(d._id)) {
              idMap.set(d._id, true)
              opts.push({ id: d._id, name: d.name })
            }
          })
          h.branches?.forEach((b) =>
            b.doctors?.forEach((d) => {
              if (!idMap.has(d._id)) {
                idMap.set(d._id, true)
                opts.push({ id: d._id, name: d.name })
              }
            })
          )
        })
        break
      case 'treatments':
        hospitals.forEach((h) => {
          h.treatments?.forEach((t) => {
            if (!idMap.has(t._id)) {
              idMap.set(t._id, true)
              opts.push({ id: t._id, name: t.name })
            }
          })
          h.branches?.forEach((b) =>
            b.treatments?.forEach((t) => {
              if (!idMap.has(t._id)) {
                idMap.set(t._id, true)
                opts.push({ id: t._id, name: t.name })
              }
            })
          )
        })
        break
    }
    return opts
  }, [hospitals, view])

  useEffect(() => {
    setQuickSearchOptions(quickSearchOptionsMemo)
  }, [quickSearchOptionsMemo])

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      console.log("[HospitalDirectory] Fetching all hospitals for client-side filtering")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const res = await fetch(`/api/hospitals?pageSize=200&_t=${Date.now()}`, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      clearTimeout(timeoutId)

      if (!res.ok) throw new Error(`Failed to fetch hospitals: ${res.status}`)
      const data = await res.json()

      console.log("[HospitalDirectory] Fetched all hospitals count:", data.items?.length || 0)
      const allHospitals = data.items || []
      setHospitals(allHospitals)

      // Build filter options (improved deduplication)
      const branchMap: Record<string, string> = {}
      const cityMap: Record<string, string> = {}
      const treatmentMap: Record<string, string> = {}
      const specializationSet = new Set<string>()

      allHospitals.forEach((hospital: HospitalType) => {
        hospital.branches?.forEach((branch: BranchType) => {
          if (branch?._id && branch?.name) {
            branchMap[branch._id] = branch.name
          }
          branch.city?.forEach((city: any) => {
            if (city?._id && city?.name) cityMap[city._id] = city.name
          })
          branch.treatments?.forEach((t: any) => {
            if (t?._id && t?.name) treatmentMap[t._id] = t.name
            if (t?.category) specializationSet.add(t.category)
          })
          branch.doctors?.forEach((d: DoctorType) => {
            if (d.specialization) specializationSet.add(d.specialization)
          })
          branch.specialties?.forEach((s: any) => {
            if (s.name) specializationSet.add(s.name)
          })
        })
        hospital.treatments?.forEach((t: any) => {
          if (t?._id && t?.name) treatmentMap[t._id] = t.name
          if (t?.category) specializationSet.add(t.category)
        })
        hospital.doctors?.forEach((d: DoctorType) => {
          if (d.specialization) specializationSet.add(d.specialization)
        })
      })

      setBranchOptions(Object.entries(branchMap).map(([id, name]) => ({ id, name })))
      setCityOptions(Object.entries(cityMap).map(([id, name]) => ({ id, name })))
      setTreatmentOptions(Object.entries(treatmentMap).map(([id, name]) => ({ id, name })))
      setSpecializationOptions(Array.from(specializationSet).map(name => ({ id: name, name })))

    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("[HospitalDirectory] Error fetching hospitals:", err)
        setHospitals([])
      }
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [])

  // Relevance scoring function
  const calculateRelevanceScore = useCallback((item: any, lowerSearch: string, itemType: 'hospital' | 'doctor' | 'treatment' | 'branch'): number => {
    let score = 0

    const match = (text: string | null, weight: number) => {
      if (!text) return
      const lowerText = text.toLowerCase()
      if (lowerText === lowerSearch) score += weight * 3 // Exact match
      else if (lowerText.startsWith(lowerSearch)) score += weight * 2 // Prefix match
      else if (lowerText.includes(lowerSearch)) score += weight // Partial match
    }

    switch (itemType) {
      case 'hospital':
        match(item.name, 10)
        item.branches?.forEach((b: BranchType) => {
          match(b.name, 5)
          b.city?.forEach((c: any) => match(c.name, 5))
          b.specialties?.forEach((s: any) => match(s.name, 3))
          b.treatments?.forEach((t: TreatmentType) => match(t.name, 4))
        })
        break
      case 'branch':
        match(item.name, 10)
        match(item.hospitalName, 8) // Assuming hospitalName attached
        item.city?.forEach((c: any) => match(c.name, 5))
        item.specialties?.forEach((s: any) => match(s.name, 5))
        item.treatments?.forEach((t: TreatmentType) => match(t.name, 6))
        break
      case 'doctor':
        match(item.name, 10)
        match(item.specialization, 8)
        match(item.hospitalName, 6)
        break
      case 'treatment':
        match(item.name, 10)
        match(item.category, 8)
        match(item.hospitalName, 6)
        break
    }

    return score
  }, [])

  // Filtered branches from hospitals with strict filters
  const filteredBranches = useMemo(() => {
    const lowerSearch = searchQuery.toLowerCase()
    const branchesData: BranchType[] = []
    hospitals.forEach((hospital) => {
      hospital.branches?.forEach((branch) => {
        // Check city
        let matchesCity = true
        if (selectedCityId) {
          matchesCity = branch.city.some((c: any) => c._id === selectedCityId)
        } else if (cityQuery) {
          const lowerCity = cityQuery.toLowerCase()
          matchesCity = branch.city.some((c: any) => c.name.toLowerCase().includes(lowerCity))
        }
        if (!matchesCity) return

        // Check specialty
        let matchesSpecialty = true
        if (selectedSpecialization) {
          matchesSpecialty = branch.specialties.some((s: any) => s.name === selectedSpecialization) ||
            branch.doctors.some((d: DoctorType) => d.specialization === selectedSpecialization)
        } else if (specializationQuery) {
          const lowerSpec = specializationQuery.toLowerCase()
          matchesSpecialty = branch.specialties.some((s: any) => s.name.toLowerCase().includes(lowerSpec)) ||
            branch.doctors.some((d: DoctorType) => d.specialization?.toLowerCase().includes(lowerSpec))
        }
        if (!matchesSpecialty) return

        // Check search
        let matchesSearch = true
        if (searchQuery) {
          const score = calculateRelevanceScore({ ...branch, hospitalName: hospital.name }, lowerSearch, 'branch')
          matchesSearch = score > 0
        }
        if (!matchesSearch) return

        const branchWithScore = {
          ...branch,
          relevanceScore: searchQuery ? calculateRelevanceScore({ ...branch, hospitalName: hospital.name }, lowerSearch, 'branch') : 0
        }
        branchesData.push(branchWithScore)
      })
    })

    // Sort: by relevance if searching, else by name
    if (searchQuery) {
      branchesData.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    } else {
      branchesData.sort((a, b) => a.name.localeCompare(b.name))
    }

    return branchesData
  }, [hospitals, searchQuery, selectedCityId, cityQuery, selectedSpecialization, specializationQuery, calculateRelevanceScore])

  // Filtered doctors from hospitals with strict filters
  const filteredDoctors = useMemo(() => {
    const lowerSearch = searchQuery.toLowerCase()
    const doctorMap = new Map<string, ExtendedDoctorType>()
    hospitals.forEach((hospital) => {
      // For hospital-level doctors: only if hospital has matching city branch
      let hospitalMatchesCity = true
      if (selectedCityId || cityQuery) {
        hospitalMatchesCity = hospital.branches.some((b: BranchType) => {
          if (selectedCityId) {
            return b.city.some((c: any) => c._id === selectedCityId)
          } else if (cityQuery) {
            const lowerCity = cityQuery.toLowerCase()
            return b.city.some((c: any) => c.name.toLowerCase().includes(lowerCity))
          }
          return false
        })
      }
      if (hospitalMatchesCity) {
        hospital.doctors?.forEach((d: DoctorType) => {
          // Check specialty
          let matchesSpecialty = true
          if (selectedSpecialization) {
            matchesSpecialty = d.specialization === selectedSpecialization
          } else if (specializationQuery) {
            const lowerSpec = specializationQuery.toLowerCase()
            matchesSpecialty = d.specialization?.toLowerCase().includes(lowerSpec) || false
          }
          if (!matchesSpecialty) return

          // Check search
          let matchesSearch = true
          if (searchQuery) {
            const score = calculateRelevanceScore({ ...d, hospitalName: hospital.name }, lowerSearch, 'doctor')
            matchesSearch = score > 0
          }
          if (!matchesSearch) return

          const doctorWithScore = {
            ...d,
            hospitalName: hospital.name,
            branchName: undefined,
            branchId: undefined,
            relevanceScore: searchQuery ? calculateRelevanceScore({ ...d, hospitalName: hospital.name }, lowerSearch, 'doctor') : 0
          }
          doctorMap.set(d._id, doctorWithScore)
        })
      }

      // For branch-level doctors
      hospital.branches?.forEach((branch: BranchType) => {
        let matchesCity = true
        if (selectedCityId) {
          matchesCity = branch.city.some((c: any) => c._id === selectedCityId)
        } else if (cityQuery) {
          const lowerCity = cityQuery.toLowerCase()
          matchesCity = branch.city.some((c: any) => c.name.toLowerCase().includes(lowerCity))
        }
        if (!matchesCity) return

        branch.doctors?.forEach((d: DoctorType) => {
          // Check specialty
          let matchesSpecialty = true
          if (selectedSpecialization) {
            matchesSpecialty = d.specialization === selectedSpecialization
          } else if (specializationQuery) {
            const lowerSpec = specializationQuery.toLowerCase()
            matchesSpecialty = d.specialization?.toLowerCase().includes(lowerSpec) || false
          }
          if (!matchesSpecialty) return

          // Check search
          let matchesSearch = true
          if (searchQuery) {
            const score = calculateRelevanceScore({ ...d, hospitalName: hospital.name, branchName: branch.name }, lowerSearch, 'doctor')
            matchesSearch = score > 0
          }
          if (!matchesSearch) return

          const doctorWithScore = {
            ...d,
            hospitalName: hospital.name,
            branchName: branch.name,
            branchId: branch._id,
            relevanceScore: searchQuery ? calculateRelevanceScore({ ...d, hospitalName: hospital.name, branchName: branch.name }, lowerSearch, 'doctor') : 0
          }
          // Prefer branch-specific if not already set with branch
          const existing = doctorMap.get(d._id)
          if (!existing?.branchId) {
            doctorMap.set(d._id, doctorWithScore)
          }
        })
      })
    })
    let doctors = Array.from(doctorMap.values())

    // Sort: by relevance if searching, else by name
    if (searchQuery) {
      doctors.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    } else {
      doctors.sort((a, b) => a.name.localeCompare(b.name))
    }

    return doctors
  }, [hospitals, searchQuery, selectedCityId, cityQuery, selectedSpecialization, specializationQuery, calculateRelevanceScore])

  // Filtered treatments from hospitals with strict filters
  const filteredTreatments = useMemo(() => {
    const lowerSearch = searchQuery.toLowerCase()
    const treatmentMap = new Map<string, ExtendedTreatmentType>()
    hospitals.forEach((hospital) => {
      // For hospital-level treatments: only if hospital has matching city branch
      let hospitalMatchesCity = true
      if (selectedCityId || cityQuery) {
        hospitalMatchesCity = hospital.branches.some((b: BranchType) => {
          if (selectedCityId) {
            return b.city.some((c: any) => c._id === selectedCityId)
          } else if (cityQuery) {
            const lowerCity = cityQuery.toLowerCase()
            return b.city.some((c: any) => c.name.toLowerCase().includes(lowerCity))
          }
          return false
        })
      }
      if (hospitalMatchesCity) {
        hospital.treatments?.forEach((t: TreatmentType) => {
          // Check specialty (using category)
          let matchesSpecialty = true
          if (selectedSpecialization) {
            matchesSpecialty = t.category === selectedSpecialization
          } else if (specializationQuery) {
            const lowerSpec = specializationQuery.toLowerCase()
            matchesSpecialty = t.category?.toLowerCase().includes(lowerSpec) || false
          }
          if (!matchesSpecialty) return

          // Check search
          let matchesSearch = true
          if (searchQuery) {
            const score = calculateRelevanceScore({ ...t, hospitalName: hospital.name }, lowerSearch, 'treatment')
            matchesSearch = score > 0
          }
          if (!matchesSearch) return

          const treatmentWithScore = {
            ...t,
            hospitalName: hospital.name,
            branchName: undefined,
            branchId: undefined,
            relevanceScore: searchQuery ? calculateRelevanceScore({ ...t, hospitalName: hospital.name }, lowerSearch, 'treatment') : 0
          }
          treatmentMap.set(t._id, treatmentWithScore)
        })
      }

      // For branch-level treatments
      hospital.branches?.forEach((branch: BranchType) => {
        let matchesCity = true
        if (selectedCityId) {
          matchesCity = branch.city.some((c: any) => c._id === selectedCityId)
        } else if (cityQuery) {
          const lowerCity = cityQuery.toLowerCase()
          matchesCity = branch.city.some((c: any) => c.name.toLowerCase().includes(lowerCity))
        }
        if (!matchesCity) return

        branch.treatments?.forEach((t: TreatmentType) => {
          // Check specialty (using category)
          let matchesSpecialty = true
          if (selectedSpecialization) {
            matchesSpecialty = t.category === selectedSpecialization
          } else if (specializationQuery) {
            const lowerSpec = specializationQuery.toLowerCase()
            matchesSpecialty = t.category?.toLowerCase().includes(lowerSpec) || false
          }
          if (!matchesSpecialty) return

          // Check search
          let matchesSearch = true
          if (searchQuery) {
            const score = calculateRelevanceScore({ ...t, hospitalName: hospital.name, branchName: branch.name }, lowerSearch, 'treatment')
            matchesSearch = score > 0
          }
          if (!matchesSearch) return

          const treatmentWithScore = {
            ...t,
            hospitalName: hospital.name,
            branchName: branch.name,
            branchId: branch._id,
            relevanceScore: searchQuery ? calculateRelevanceScore({ ...t, hospitalName: hospital.name, branchName: branch.name }, lowerSearch, 'treatment') : 0
          }
          // Prefer branch-specific if not already set with branch
          const existing = treatmentMap.get(t._id)
          if (!existing?.branchId) {
            treatmentMap.set(t._id, treatmentWithScore)
          }
        })
      })
    })
    let treatments = Array.from(treatmentMap.values())

    // Sort: by relevance if searching, else by name
    if (searchQuery) {
      treatments.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    } else {
      treatments.sort((a, b) => a.name.localeCompare(b.name))
    }

    return treatments
  }, [hospitals, searchQuery, selectedCityId, cityQuery, selectedSpecialization, specializationQuery, calculateRelevanceScore])

  // Fetch data on mount
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

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

  const currentCount = (() => {
    switch (view) {
      case 'hospitals':
        return filteredBranches.length
      case 'doctors':
        return filteredDoctors.length
      case 'treatments':
        return filteredTreatments.length
      default:
        return 0
    }
  })()

  const currentViewItems = (() => {
    switch (view) {
      case 'hospitals':
        return filteredBranches
      case 'doctors':
        return filteredDoctors
      case 'treatments':
        return filteredTreatments
      default:
        return []
    }
  })()

  const isHospitalsView = view === 'hospitals'
  const isDoctorsView = view === 'doctors'
  const isTreatmentsView = view === 'treatments'

  const renderContent = () => {
    if (initialLoad || loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            isHospitalsView ? (
              <HospitalCardSkeleton key={index} />
            ) : isTreatmentsView ? (
              <TreatmentCardSkeleton key={index} />
            ) : (
              <DoctorCardSkeleton key={index} />
            )
          ))}
        </div>
      )
    }
    if (currentCount === 0) {
      return <NoResults view={view} />
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentViewItems.map((item, index) => (
          <div key={item._id} className={`animate-in slide-in-from-bottom-2 duration-500 delay-${index * 50}ms`}>
            {isHospitalsView ? (
              <HospitalCard
                branch={item as BranchType}
                hospitalName={hospitals.find(h => h.branches?.some(b => b._id === item._id))?.name || "Hospital"}
                hospitalLogo={hospitals.find(h => h.branches?.some(b => b._id === item._id))?.logo || null}
              />
            ) : isDoctorsView ? (
              <DoctorCard doctor={item as ExtendedDoctorType} />
            ) : (
              <TreatmentCard treatment={item as ExtendedTreatmentType} />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Banner
        topSpanText="Find the Right Hospital"
        title="Search, Compare, and Discover Trusted Hospitals Across India"
        description="Explore Medivisor India's verified hospital directory — search by city, specialty, or accreditation to find the best medical care for your needs. View hospital profiles, facilities, and branch networks with accurate, up-to-date details to make confident healthcare choices."
        buttonText="Start Your Hospital Search"
        buttonLink="/hospitals"
        bannerBgImage="bg-hospital-search.png"
        mainImageSrc="/about-main.png"
        mainImageAlt="Medivisor India Hospital Search – Discover Top Hospitals Across India"
      />

      <BreadcrumbNav />

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="flex md:px-0 px-2 flex-col lg:flex-row gap-6 py-10">
          {showFilters && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFilters(false)}
            />
          )}

          <FilterSidebar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            branchQuery={branchQuery}
            setBranchQuery={setBranchQuery}
            cityQuery={cityQuery}
            setCityQuery={setCityQuery}
            treatmentQuery={treatmentQuery}
            setTreatmentQuery={setTreatmentQuery}
            specializationQuery={specializationQuery}
            setSpecializationQuery={setSpecializationQuery}
            selectedBranchId={selectedBranchId}
            setSelectedBranchId={setSelectedBranchId}
            selectedCityId={selectedCityId}
            setSelectedCityId={setSelectedCityId}
            selectedTreatmentId={selectedTreatmentId}
            setSelectedTreatmentId={setSelectedTreatmentId}
            selectedSpecialization={selectedSpecialization}
            setSelectedSpecialization={setSelectedSpecialization}
            branches={branchOptions}
            cities={cityOptions}
            treatments={treatmentOptions}
            specializations={specializationOptions}
            quickSearchOptions={quickSearchOptions}
            view={view}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            clearFilters={clearFilters}
            keyboardHeight={keyboardHeight}
          />

          <main className="flex-1 min-w-0 pb-20 lg:pb-0">
            <ViewToggle view={view} setView={setView} />
            <ResultsHeader count={currentCount} view={view} clearFilters={clearFilters} />
            {renderContent()}
          </main>
        </div>
      </section>

      <MobileSearchButton setShowFilters={setShowFilters} resultsCount={currentCount} view={view} />
    </div>
  )
}