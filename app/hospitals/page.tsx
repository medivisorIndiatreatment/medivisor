"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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
  doctors: Array<any>
  treatments: Array<{
    _id: string
    name: string
    description: string | null
    category: string | null
    duration: string | null
    cost: string | null
    treatmentImage?: string | null
  }>
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
  doctors: Array<{
    _id: string
    name: string
    specialization: string | null
    qualification: string | null
    experience: string | null
    designation: string | null
    languagesSpoken: string | null
    about: string | null
    profileImage: any | null
  }>
  treatments: Array<{
    _id: string
    name: string
    description: string | null
    category: string | null
    duration: string | null
    cost: string | null
  }>
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
    {/* Image Skeleton */}
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
      <div className="absolute top-3 right-3 bg-gray-300 rounded w-20 h-6" />
    </div>

    {/* Content Skeleton */}
    <div className="p-4 space-y-4">
      {/* Title */}
      <div className="h-6 bg-gray-200 rounded w-3/4" />

      {/* Location Section Skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 gap-2 pt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded p-3 h-16" />
        ))}
      </div>
    </div>
  </div>
)

// Sub-component: Hospital Card (now showing branch data)
interface HospitalCardProps {
  branch: BranchType
  hospitalName: string
  hospitalLogo: string | null
}

const HospitalCard = ({ branch, hospitalName, hospitalLogo }: HospitalCardProps) => {
  const router = useRouter()

  // Generate slug from branch name and hospital name
  const slug = generateSlug(`${hospitalName} ${branch.name}`)

  // Use branch image first, then hospital image/logo as fallback
  const imageUrl = getWixImageUrl(branch.branchImage?.imageData?.image?.src?.id || branch.branchImage) || null

  // Get cities for this branch
  const cities = branch.city?.map(c => c.name).filter(Boolean) || []
  const primaryCity = cities[0] || ""
  const primaryState = branch.city?.[0]?.state || ""

  // Get accreditations for this branch
  const displayAccreditations = branch.accreditation?.slice(0, 3) || []
  const remainingAccreditations = branch.accreditation?.length - 3 || 0

  // Get hospital logo URL
  const hospitalLogoUrl = hospitalLogo ? getWixImageUrl(hospitalLogo) : null

  // Get primary specialty
  const primarySpecialty = branch.specialties?.[0]?.name || 'N/A'

  return (
    <Link href={`/hospitals/branches/${slug}`} className="block">
      <article className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-60 md:h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Badges Overlay */}
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

        {/* Content Section */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          {/* Hospital and Branch Name */}
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

          {/* Stats Grid */}
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

// Sub-component: Search Dropdown
interface SearchDropdownProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: { id: string; name: string }[]
  selectedOption: string
  onOptionSelect: (id: string) => void
  onClear: () => void
  type: "branch" | "city" | "treatment"
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
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(value.toLowerCase())
  )

  const selectedOptionName = options.find(opt => opt.id === selectedOption)?.name

  const getIcon = () => {
    switch (type) {
      case "branch":
        return <Building2 className="w-4 h-4 text-gray-500" />
      case "city":
        return <MapPin className="w-4 h-4 text-gray-500" />
      case "treatment":
        return <Stethoscope className="w-4 h-4 text-gray-500" />
      default:
        return <Search className="w-4 h-4 text-gray-500" />
    }
  }

  const getPlaceholder = () => {
    switch (type) {
      case "branch":
        return "Search branches..."
      case "city":
        return "Search cities..."
      case "treatment":
        return "Search treatments..."
      default:
        return placeholder
    }
  }

  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-medium text-gray-800 flex items-center gap-2">
        {getIcon()}
        {type === "branch" ? "Branch" : type === "city" ? "City" : "Treatment"}
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
          className="pl-10 pr-12 py-3 border border-gray-200 rounded-lg w-full text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
        />

        {(value || selectedOption) && (
          <button
            onClick={() => {
              onChange("")
              onOptionSelect("")
              onClear()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                No {type === "branch" ? "branches" : type === "city" ? "cities" : "treatments"} found
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
  branchQuery: string
  setBranchQuery: (value: string) => void
  cityQuery: string
  setCityQuery: (value: string) => void
  treatmentQuery: string
  setTreatmentQuery: (value: string) => void
  selectedBranchId: string
  setSelectedBranchId: (value: string) => void
  selectedCityId: string
  setSelectedCityId: (value: string) => void
  selectedTreatmentId: string
  setSelectedTreatmentId: (value: string) => void
  branches: { id: string; name: string }[]
  cities: { id: string; name: string }[]
  treatments: { id: string; name: string }[]
  showFilters: boolean
  setShowFilters: (value: boolean) => void
  clearFilters: () => void
  keyboardHeight?: number
}

const FilterSidebar = ({
  branchQuery,
  setBranchQuery,
  cityQuery,
  setCityQuery,
  treatmentQuery,
  setTreatmentQuery,
  selectedBranchId,
  setSelectedBranchId,
  selectedCityId,
  setSelectedCityId,
  selectedTreatmentId,
  setSelectedTreatmentId,
  branches,
  cities,
  treatments,
  showFilters,
  setShowFilters,
  clearFilters,
  keyboardHeight = 0,
}: FilterSidebarProps) => (
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
    {/* Drag Handle for Mobile */}
    <div className="lg:hidden flex justify-center py-2 border-b border-gray-100 bg-white">
      <div className="w-6 h-1 rounded-full bg-gray-300" />
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 border-b border-gray-100 bg-white sticky top-0 z-10">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-700" />
        Search & Filters
      </h2>
      <button
        onClick={() => setShowFilters(false)}
        className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors p-1"
        aria-label="Close filters"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Filter Content */}
    <div className="p-4 sm:p-5 space-y-4 lg:space-y-6">
      {/* Branch Filter */}
      <SearchDropdown
        value={branchQuery}
        onChange={setBranchQuery}
        placeholder="Search branches..."
        options={branches}
        selectedOption={selectedBranchId}
        onOptionSelect={setSelectedBranchId}
        onClear={() => {
          setBranchQuery("")
          setSelectedBranchId("")
        }}
        type="branch"
      />

      {/* City Filter */}
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

      {/* Treatment Filter */}
      <SearchDropdown
        value={treatmentQuery}
        onChange={setTreatmentQuery}
        placeholder="Search treatments..."
        options={treatments}
        selectedOption={selectedTreatmentId}
        onOptionSelect={setSelectedTreatmentId}
        onClear={() => {
          setTreatmentQuery("")
          setSelectedTreatmentId("")
        }}
        type="treatment"
      />

      {/* Clear Filters Button */}
      <button
        onClick={clearFilters}
        className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-colors text-sm font-medium flex items-center justify-center gap-2 min-h-[44px]"
      >
        <X className="w-4 h-4" />
        Clear All Filters
      </button>
    </div>
  </aside>
)

// Sub-component: Mobile Search Button (Bottom Fixed Bar)
interface MobileSearchButtonProps {
  setShowFilters: (value: boolean) => void
  resultsCount: number
}

const MobileSearchButton = ({ setShowFilters, resultsCount }: MobileSearchButtonProps) => (
  <div className="lg:hidden fixed bottom-0 left-0 px-2 md:px-0 right-0 z-30 bg-white border-t border-gray-300">
    <div className="flex items-center justify-between p-3">
      <p className="description truncate flex-1">
        Showing <span className="font-semibold text-gray-900">{resultsCount}</span> hospitals
      </p>
      <button
        onClick={() => setShowFilters(true)}
        className="ml-4 py-2 px-4 bg-gray-100 border border-gray-100 rounded-lg flex items-center gap-2 description-1 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
      </button>
    </div>
  </div>
)

// Sub-component: Results Header
interface ResultsHeaderProps {
  branches: BranchType[]
  clearFilters: () => void
}

const ResultsHeader = ({ branches, clearFilters }: ResultsHeaderProps) => (
  <>
    {!branches.length ? null : (
      <div className="hidden lg:flex items-center justify-between mb-4">
        <p className="text-lg font-semibold mt-4">
          Found <span className="text-gray-800">{branches.length}</span> hospitals
        </p>
        <button
          onClick={clearFilters}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400"
        >
          <X className="w-4 h-4" />
          Clear all filters
        </button>
      </div>
    )}
  </>
)

// Sub-component: No Results
const NoResults = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 bg-white rounded-lg border border-gray-200 p-4 sm:p-8 relative z-0">
    <Hospital className="w-16 h-16 text-gray-400" />
    <h3 className="text-lg font-semibold text-gray-900">No hospitals found</h3>
    <p className="text-sm text-gray-600 max-w-md">
      Try adjusting your search criteria or filters to find what you're looking for.
    </p>
  </div>
)

// Sub-component: Loading Skeletons
const LoadingSkeletons = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <HospitalCardSkeleton key={index} />
    ))}
  </div>
)

// Main Component
export default function HospitalDirectory() {
  const [hospitals, setHospitals] = useState<HospitalType[]>([])
  const [branches, setBranches] = useState<BranchType[]>([])
  const [branchOptions, setBranchOptions] = useState<{ id: string; name: string }[]>([])
  const [cityOptions, setCityOptions] = useState<{ id: string; name: string }[]>([])
  const [treatmentOptions, setTreatmentOptions] = useState<{ id: string; name: string }[]>([])
  const [branchQuery, setBranchQuery] = useState("")
  const [cityQuery, setCityQuery] = useState("")
  const [treatmentQuery, setTreatmentQuery] = useState("")
  const [selectedBranchId, setSelectedBranchId] = useState("")
  const [selectedCityId, setSelectedCityId] = useState("")
  const [selectedTreatmentId, setSelectedTreatmentId] = useState("")
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const showFiltersRef = useRef(showFilters)
  useEffect(() => {
    showFiltersRef.current = showFilters
  }, [showFilters])

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

      // Auto-show filters if keyboard opens significantly and filters are not shown
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

  // Memoized filter parameters
  const filterParams = useMemo(() => {
    const params = new URLSearchParams()

    if (selectedBranchId) {
      params.append("branchId", selectedBranchId)
    } else if (branchQuery) {
      params.append("branch", branchQuery)
    }
    if (selectedCityId) {
      params.append("cityId", selectedCityId)
    } else if (cityQuery) {
      params.append("city", cityQuery)
    }
    if (selectedTreatmentId) {
      params.append("treatmentId", selectedTreatmentId)
    } else if (treatmentQuery) {
      params.append("treatment", treatmentQuery)
    }

    // Add cache buster for fresh data
    params.append("_t", Date.now().toString())

    return params
  }, [branchQuery, selectedBranchId, cityQuery, selectedCityId, treatmentQuery, selectedTreatmentId])

  // Fetch hospitals with debounced callback
  const fetchHospitals = useCallback(async () => {
    setLoading(true)
    try {
      console.log("[HospitalDirectory] Fetching hospitals with params:", filterParams.toString())

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const res = await fetch(`/api/hospitals?${filterParams.toString()}`, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      clearTimeout(timeoutId)

      if (!res.ok) throw new Error(`Failed to fetch hospitals: ${res.status}`)
      const data = await res.json()

      console.log("[HospitalDirectory] Fetched hospitals count:", data.items?.length || 0)
      setHospitals(data.items || [])

      // Extract all branches from hospitals
      const allBranches: BranchType[] = []
      data.items?.forEach((hospital: HospitalType) => {
        hospital.branches?.forEach((branch: BranchType) => {
          allBranches.push(branch)
        })
      })
      setBranches(allBranches)

    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("[HospitalDirectory] Error fetching hospitals:", err)
        setHospitals([])
        setBranches([])
      }
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [filterParams])

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const res = await fetch("/api/hospitals?pageSize=200&_t=" + Date.now(), {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) throw new Error("Failed to fetch filter options")
      const data = await res.json()

      const branchMap: Record<string, string> = {}
      const cityMap: Record<string, string> = {}
      const treatmentMap: Record<string, string> = {}

      data.items?.forEach((hospital: HospitalType) => {
        hospital.branches?.forEach((branch: BranchType) => {
          if (branch?._id && branch?.name) {
            branchMap[branch._id] = branch.name
          }
          branch.city?.forEach((city: any) => {
            if (city?._id && city?.name) cityMap[city._id] = city.name
          })
          branch.treatments?.forEach((t: any) => {
            if (t?._id && t?.name) treatmentMap[t._id] = t.name
          })
        })
      })

      setBranchOptions(Object.entries(branchMap).map(([id, name]) => ({ id, name })))
      setCityOptions(Object.entries(cityMap).map(([id, name]) => ({ id, name })))
      setTreatmentOptions(Object.entries(treatmentMap).map(([id, name]) => ({ id, name })))
    } catch (e) {
      console.error("[HospitalDirectory] Error fetching filter options:", (e as Error).message)
    }
  }, [])

  // Debounced fetch on filter changes
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetchHospitals()
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [fetchHospitals])

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions()
  }, [fetchFilterOptions])

  const clearFilters = () => {
    setBranchQuery("")
    setCityQuery("")
    setTreatmentQuery("")
    setSelectedBranchId("")
    setSelectedCityId("")
    setSelectedTreatmentId("")
  }

  const renderContent = () => {
    if (initialLoad || loading) return <LoadingSkeletons />
    if (branches.length === 0) return <NoResults />
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {branches.map((branch) => {
          // Find the parent hospital for this branch
          const parentHospital = hospitals.find(hospital =>
            hospital.branches?.some(b => b._id === branch._id)
          )
          return (
            <HospitalCard
              key={branch._id}
              branch={branch}
              hospitalName={parentHospital?.name || "Hospital"}
              hospitalLogo={parentHospital?.logo || null}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Banner */}
      <Banner
        topSpanText="Find the Right Hospital"
        title="Search, Compare, and Discover Trusted Hospitals Across India"
        description="Explore Medivisor India's verified hospital directory — search by city, specialty, or accreditation to find the best medical care for your needs. View hospital profiles, facilities, and branch networks with accurate, up-to-date details to make confident healthcare choices."
        buttonText="Start Your Hospital Search"
        buttonLink="/hospital-network/#hospital-search"
        bannerBgImage="bg-hospital-search.png"
        mainImageSrc="/about-main.png"
        mainImageAlt="Medivisor India Hospital Search – Discover Top Hospitals Across India"
      />

      {/* Breadcrumb Navigation */}
      <BreadcrumbNav />

      {/* Main Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="flex md:px-0 px-2 flex-col lg:flex-row gap-6 py-10">
          {/* Mobile Search Overlay */}
          {showFilters && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Sidebar Filters */}
          <FilterSidebar
            branchQuery={branchQuery}
            setBranchQuery={setBranchQuery}
            cityQuery={cityQuery}
            setCityQuery={setCityQuery}
            treatmentQuery={treatmentQuery}
            setTreatmentQuery={setTreatmentQuery}
            selectedBranchId={selectedBranchId}
            setSelectedBranchId={setSelectedBranchId}
            selectedCityId={selectedCityId}
            setSelectedCityId={setSelectedCityId}
            selectedTreatmentId={selectedTreatmentId}
            setSelectedTreatmentId={setSelectedTreatmentId}
            branches={branchOptions}
            cities={cityOptions}
            treatments={treatmentOptions}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            clearFilters={clearFilters}
            keyboardHeight={keyboardHeight}
          />

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-0">
            <ResultsHeader branches={branches} clearFilters={clearFilters} />
            {renderContent()}
          </main>
        </div>
      </section>

      {/* Mobile Search Button */}
      <MobileSearchButton setShowFilters={setShowFilters} resultsCount={branches.length} />
    </div>
  )
}