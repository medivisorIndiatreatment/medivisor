// app/doctors/[slug]/page.tsx
"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import type { HospitalType, ExtendedDoctorType, BranchType, CityType, SpecialtyType, TreatmentType } from "@/types/hospital" // Assume types from hospitals/page.tsx
import {
  Users,
  Clock,
  Award,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  Calendar,
  Bed,
  Heart,
  ChevronLeft,
  Loader2,
  Stethoscope,
  Scissors,
  ChevronRight,
  ArrowLeft,
  Home,
  Hospital,
  Search,
  X,
  Filter,
  Star,
  DollarSign,
  BookOpen,
  Plus,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import classNames from "classnames"
import ContactForm from "@/components/ContactForm"
import { Inter } from "next/font/google"
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react'

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  variable: "--font-inter"
})

// EMBLA CLASSES (from branch page) - KEPT FOR REFERENCE/OTHER CAROUSELS
const EMBLA_CLASSES = {
  container: "embla__container flex touch-pan-y ml-[-1rem]",
  slide: "embla__slide flex-[0_0_auto] min-w-0 pl-4",
  viewport: "overflow-hidden"
}
const EMBLA_SLIDE_SIZES = {
  xs: "w-full",
  sm: "sm:w-1/2",
  lg: "lg:w-1/3",
}

// Utility functions
const getWixImageUrl = (imageStr: string | null | undefined): string | null => {
  if (!imageStr || typeof imageStr !== "string" || !imageStr.startsWith("wix:image://v1/")) return null
  const parts = imageStr.split("/")
  return parts.length >= 4 ? `https://static.wixstatic.com/media/${parts[3]}` : null
}

const generateSlug = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') return ''
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

const getDoctorImage = (imageData: any): string | null => getWixImageUrl(imageData)
const getTreatmentImage = (imageData: any): string | null => getWixImageUrl(imageData)
const getHospitalImage = (imageData: any): string | null => getWixImageUrl(imageData)
const getBranchImage = (imageData: any): string | null => getWixImageUrl(imageData) // New helper for branch image

// Helper: Short plain text from rich content
const getShortDescription = (richContent: any, maxLength: number = 100): string => {
  if (typeof richContent === 'string') {
    const text = richContent.replace(/<[^>]*>/g, '').trim()
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }
  if (!richContent?.nodes) return ''
  let text = ''
  for (const node of richContent.nodes) {
    if (node.type === 'PARAGRAPH' && text.length < maxLength) {
      const paraText = node.nodes?.map((n: any) => n.text || '').join(' ').trim()
      text += (text ? ' ' : '') + paraText
    }
    if (text.length >= maxLength) break
  }
  return text.trim().length > maxLength ? text.trim().substring(0, maxLength) + '...' : text.trim()
}

// Helper: Render rich text
const renderRichText = (richContent: any): JSX.Element | null => {
  if (typeof richContent === 'string') {
    return <div className={`text-base text-gray-700 leading-relaxed space-y-3 prose prose-sm max-w-none font-light ${inter.variable}`} dangerouslySetInnerHTML={{ __html: richContent }} />
  }
  if (!richContent?.nodes) return null

  const renderNode = (node: any): JSX.Element | null => {
    switch (node.type) {
      case 'PARAGRAPH':
        return (
          <p key={Math.random()} className={`text-base text-gray-700 leading-relaxed mb-2 font-light ${inter.variable}`}>
            {node.nodes?.map((child: any, idx: number) => renderTextNode(child, idx))}
          </p>
        )
      case 'HEADING1':
        return (
          <h3 key={Math.random()} className={`text-xl md:text-2xl font-medium text-gray-900 mb-2 leading-tight ${inter.variable}`}>
            {node.nodes?.map((child: any, idx: number) => renderTextNode(child, idx))}
          </h3>
        )
      case 'HEADING2':
        return (
          <h4 key={Math.random()} className={`text-xl md:text-xl font-medium text-gray-900 mb-2 leading-tight ${inter.variable}`}>
            {node.nodes?.map((child: any, idx: number) => renderTextNode(child, idx))}
          </h4>
        )
      case 'IMAGE':
        const imgSrc = getWixImageUrl(node.imageData?.image?.src)
        if (imgSrc) {
          return (
            <div key={Math.random()} className="my-4">
              <img 
                src={imgSrc} 
                alt="Embedded image" 
                className="w-full h-auto rounded-xs max-w-full" 
                onError={(e) => { e.currentTarget.style.display = "none" }} 
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
    if (isBold) content = <strong key={idx} className="font-medium">{text}</strong>
    else if (isItalic) content = <em key={idx}>{text}</em>
    else if (isUnderline) content = <u key={idx}>{text}</u>
    else content = <span key={idx} className={`font-light ${inter.variable}`}>{text}</span>
    return content
  }

  return (
    <div className={`space-y-4 ${inter.variable} font-light`}>
      {richContent.nodes.map((node: any, idx: number) => renderNode(node))}
    </div>
  )
}

// Helper to deduplicate and merge treatments
const mergeTreatments = (existing: TreatmentType[] | undefined, current: TreatmentType[] | undefined): TreatmentType[] => {
  const allTreatments = [...(existing || []), ...(current || [])]
  const treatmentMap = new Map<string, TreatmentType>()
  allTreatments.forEach(t => {
    if (t._id) {
      treatmentMap.set(t._id, t)
    }
  })
  return Array.from(treatmentMap.values())
}

// Data Fetching Logic (Updated)
const getAllExtendedDoctors = (hospitals: HospitalType[]): ExtendedDoctorType[] => {
  const extendedMap = new Map<string, ExtendedDoctorType>()

  hospitals.forEach((h) => {
    const processDoctor = (item: any, branch?: BranchType) => {
      // Use doctorName as fallback for _id if it's missing (though _id is preferred)
      const baseId = item._id || item.doctorName

      if (!baseId || !item.doctorName) return // Skip if no identifiable info

      const doctorDepartments: any[] = []
      item.specialization?.forEach((spec: any) => {
        spec.department?.forEach((dept: any) => {
          doctorDepartments.push(dept)
        })
      })
      const uniqueDepartments = Array.from(new Map(doctorDepartments.map(dept => [dept._id, dept])).values())

      const location = {
        hospitalName: h.hospitalName,
        hospitalId: h._id,
        branchName: branch?.branchName,
        branchId: branch?._id,
        cities: branch?.city || [],
      }
      
      const treatmentsFromThisLocation = mergeTreatments(
        branch?.treatments,
        h.treatments
      )

      if (extendedMap.has(baseId)) {
        const existingDoctor = extendedMap.get(baseId)!
        
        // 1. Merge locations
        const isLocationDuplicate = existingDoctor.locations.some(
          loc => loc.hospitalId === h._id && (loc.branchId === branch?._id || (!loc.branchId && !branch?._id))
        )
        if (!isLocationDuplicate) {
          existingDoctor.locations.push(location)
        }
        
        // 2. Merge departments (KEPT for data structure, though not used in the UI now)
        const allDepts = [...existingDoctor.departments, ...uniqueDepartments]
        // @ts-ignore
        existingDoctor.departments = Array.from(new Map(allDepts.map(dept => [dept._id, dept])).values())
        
        // 3. Merge related treatments (Deduplicated)
        existingDoctor.relatedTreatments = mergeTreatments(existingDoctor.relatedTreatments, treatmentsFromThisLocation)
        
      } else {
        extendedMap.set(baseId, {
          ...item,
          baseId,
          locations: [location],
          // @ts-ignore
          departments: uniqueDepartments,
          relatedTreatments: treatmentsFromThisLocation,
        } as ExtendedDoctorType)
      }
    }

    h.doctors.forEach((d: any) => processDoctor(d))
    h.branches.forEach((b: any) => {
      b.doctors.forEach((d: any) => processDoctor(d, b))
    })
  })

  return Array.from(extendedMap.values())
}

// Breadcrumb (adapted for doctor)
const Breadcrumb = ({ doctorName }: { doctorName: string }) => (
  <nav className={`bg-white border-b border-gray-100 py-6 ${inter.variable} font-light`}>
    <div className="container mx-auto px-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="flex items-center gap-1 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50 rounded-xs">
          <Home className="w-4 h-4" />
          Home
        </Link>
        <span>/</span>
        <Link href="/doctors" className="hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50 rounded-xs">
          Doctors
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{doctorName}</span>
      </div>
    </div>
  </nav>
)

// StatCard (from hospital page) - KEPT FOR STRUCTURE
const StatCard = ({ icon: Icon, value, label, showPlus = false }: { icon: any; value: any; label: string; showPlus?: boolean }) => (
  <div className={`text-center p-4 bg-gray-50/50 rounded-xs border border-gray-100 transition-shadow ${inter.variable} font-light`}>
    <Icon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
    <p className="text-2xl md:text-3xl font-medium text-gray-900 leading-tight">{value}{showPlus ? '+' : ''}</p>
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
  </div>
)

// DoctorCard (from branch page)
const DoctorCard = ({ doctor }: { doctor: any }) => {
  const doctorImage = getDoctorImage(doctor.profileImage)
  const specializationDisplay = useMemo(() => {
    if (!doctor.specialization) return "General Practitioner"
    if (Array.isArray(doctor.specialization)) {
      const names = doctor.specialization
        .map((spec: any) => typeof spec === 'object' ? spec?.name : spec)
        .filter(Boolean)
      return names.join(', ') || "General Practitioner"
    }
    return doctor.specialization as string
  }, [doctor.specialization])
  const doctorSlug = generateSlug(doctor.doctorName)
  return (
    <Link href={`/doctors/${doctorSlug}`} className="group flex flex-col h-full bg-white border border-gray-100 rounded-xs shadow-sm hover:shadow-md overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-gray-400/50">
      <div className="relative h-60 overflow-hidden bg-gray-50 rounded-t-lg">
        {doctorImage ? (
          <img 
            src={doctorImage} 
            alt={`${doctor.doctorName}, ${specializationDisplay}`} 
            className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full" 
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} 
            onError={(e) => { e.currentTarget.style.display = "none" }} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Stethoscope className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>
      <div className={`p-6 flex-1 flex flex-col ${inter.variable} font-light`}>
        <h3 className="text-xl md:text-xl font-medium text-gray-900 leading-tight mb-1 line-clamp-1">{doctor.doctorName}</h3>
        <div className="flex gap-1">
          <p className="text-gray-800 text-base flex items-center ">{specializationDisplay},</p>
          {doctor.experienceYears && (
            <p className="text-gray-800 text-base flex items-center ">
              {doctor.experienceYears} years of exp
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

// TreatmentCard (from branch page)
const TreatmentCard = ({ item }: { item: any }) => {
  const treatmentImage = getTreatmentImage(item.treatmentImage || item.image)
  const itemSlug = generateSlug(item.name)
  return (
    <Link href={`/treatment/${itemSlug}`} className="group flex flex-col h-full bg-white border border-gray-100 rounded-xs shadow-sm hover:shadow-md overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-gray-400/50">
      <div className="relative h-48 overflow-hidden bg-gray-50 rounded-t-lg">
        {treatmentImage ? (
          <img 
            src={treatmentImage} 
            alt={`${item.name} treatment`} 
            className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full" 
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} 
            onError={(e) => { e.currentTarget.style.display = "none" }} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Scissors className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>
      <div className={`p-6 flex-1 flex flex-col ${inter.variable} font-light`}>
        <h3 className="text-xl md:text-xl font-medium text-gray-900 leading-tight line-clamp-1">{item.name}</h3>
      </div>
    </Link>
  )
}

// BranchCard (NEW component for displaying branches)
const BranchCard = ({ branch }: { branch: any }) => {
  const branchImage = getBranchImage(branch.branchImage)
  const branchSlug = generateSlug(branch.branchName)
  const hospitalSlug = generateSlug(branch.hospitalName)
  
  // Extract specialties from the branch's doctors
  const specialties = useMemo(() => {
    const specSet = new Set<string>()
    branch.doctors?.forEach((d: any) => {
      d.specialization?.forEach((s: any) => {
        const specName = typeof s === 'object' ? s?.name : s
        if (specName) specSet.add(specName)
      })
    })
    return Array.from(specSet)
  }, [branch.doctors])

  const firstCityName = branch.city?.[0]?.cityName || 'N/A'

  return (
    <Link href={`/hospitals/${hospitalSlug}/branch/${branchSlug}`} className="group block h-full focus:outline-none focus:ring-2 focus:ring-gray-400/50 border border-gray-100 rounded-xs shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full h-48 overflow-hidden bg-gray-50 rounded-t-lg">
        {branchImage ? (
          <img 
            src={branchImage} 
            alt={`${branch.branchName} facility`} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} 
            onError={(e) => { e.currentTarget.style.display = "none" }} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>
      <div className={`p-6 space-y-2 border-t border-gray-100 ${inter.variable} font-light`}>
        <p className="text-sm text-gray-500 line-clamp-1">{branch.hospitalName}</p>
        <h3 className="text-xl md:text-xl font-medium text-gray-900 leading-tight line-clamp-1">{branch.branchName}</h3>
        <div className="flex items-center gap-1 text-base text-gray-800">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{firstCityName}</span>
        </div>
        {specialties.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Heart className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{specialties.slice(0, 2).join(', ')} {specialties.length > 2 && `+${specialties.length - 2} more`}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

// HospitalCard (from original code)
const HospitalCard = ({ hospital, hospitalImage }: { hospital: any; hospitalImage: string | null }) => {
  // Try to find a city to display. If the hospital has no branches, this will be 'N/A'
  const firstCity = hospital.branches?.[0]?.city?.[0]?.cityName || 'N/A'
  const hospitalSlug = generateSlug(hospital.hospitalName)
  return (
    <Link href={`/hospitals/${hospitalSlug}`} className="block h-full focus:outline-none focus:ring-2 focus:ring-gray-400/50 border border-gray-100 rounded-xs shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full h-48 overflow-hidden bg-gray-50 rounded-t-lg">
        {hospitalImage ? (
          <img 
            src={hospitalImage} 
            alt={`${hospital.hospitalName} facility`} 
            className="object-cover w-full h-full" 
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} 
            onError={(e) => { e.currentTarget.style.display = "none" }} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Hospital className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>
      <div className={`p-6 space-y-2 border-t border-gray-100 ${inter.variable} font-light`}>
        <h3 className="text-xl md:text-xl font-medium text-gray-900 leading-tight line-clamp-1">{hospital.hospitalName}</h3>
        <div className="flex items-center gap-1 text-base text-gray-800">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{firstCity}</span>
        </div>
      </div>
    </Link>
  )
}

// SearchDropdown (from branch page)
const SearchDropdown = ({ 
  value, 
  onChange, 
  placeholder, 
  options, 
  selectedOption, 
  onOptionSelect, 
  onClear, 
  type 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string; 
  options: { id: string; name: string }[]; 
  selectedOption: string | null; 
  onOptionSelect: (id: string) => void; 
  onClear: () => void; 
  type: string; 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  // SearchDropdown now uses the raw `value` for the input field to allow searching
  const [searchValue, setSearchValue] = useState(value)
  const [filteredOptions, setFilteredOptions] = useState(options)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Sync external state (selectedOption) with internal search value for display
    if (selectedOption) {
      const selectedName = options.find(opt => opt.id === selectedOption)?.name || ''
      setSearchValue(selectedName)
      setFilteredOptions(options) // Reset filtered options when selection changes
    } else {
      setSearchValue(value)
    }
  }, [selectedOption, options, value])


  useEffect(() => {
    if (searchValue) {
      const filtered = options.filter(opt => 
        opt.name.toLowerCase().includes(searchValue.toLowerCase())
      )
      setFilteredOptions(filtered)
    } else {
      setFilteredOptions(options)
    }
  }, [searchValue, options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    onChange(e.target.value) // Update external search value
    setIsOpen(true)
  }

  const handleOptionClick = (id: string, name: string) => {
    onOptionSelect(id)
    setSearchValue(name) // Set input field to the selected name
    onChange(id) // Optional: If we want the search value to reflect the ID or name after selection. Sticking to ID for simplicity of external state.
    setIsOpen(false)
  }

  const handleClear = () => {
    onClear()
    setSearchValue("")
    onChange("")
    setIsOpen(false)
  }

  const iconMap = {
    city: MapPin,
    branch: Building2,
    treatment: Scissors,
    doctor: Stethoscope,
    hospital: Hospital
  }

  const IconComponent = iconMap[type as keyof typeof iconMap] || Search

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchValue} 
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xs focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-transparent bg-white shadow-sm"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xs shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id, option.name)} // Pass name to set input value
              className="w-full text-left p-3 hover:bg-gray-50/50 border-b border-gray-100 last:border-b-0 text-sm text-gray-700"
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Simplified FindYourHospital (no tabs, from hospital adaptation)
const FindYourHospital = ({
  cities,
  branches, // This is now an array of { id: branchName, name: 'BranchName (HospitalName) - CityName' }
  treatments,
  selectedCity,
  setSelectedCity,
  selectedBranch,
  setSelectedBranch,
  selectedTreatment,
  setSelectedTreatment,
  onApplyFilters
}: {
  cities: string[]
  branches: { id: string; name: string }[]
  treatments: string[]
  selectedCity: string
  setSelectedCity: (city: string) => void
  selectedBranch: string
  setSelectedBranch: (branch: string) => void
  selectedTreatment: string
  setSelectedTreatment: (treatment: string) => void
  onApplyFilters: () => void
}) => {
  const cityOptions = useMemo(() => cities.map(city => ({ id: city, name: city })), [cities])
  const treatmentOptions = useMemo(() => treatments.map(treatment => ({ id: treatment, name: treatment })), [treatments])

  // Branch options are now already in the desired format
  const branchOptions = branches

  const handleCitySelect = useCallback((id: string) => {
    setSelectedCity(id)
  }, [setSelectedCity])

  const handleBranchSelect = useCallback((id: string) => {
    setSelectedBranch(id) // id is the branchName string
  }, [setSelectedBranch])

  const handleTreatmentSelect = useCallback((id: string) => setSelectedTreatment(id), [setSelectedTreatment])

  const clearFilters = () => {
    setSelectedCity('')
    setSelectedBranch('')
    setSelectedTreatment('')
  }

  // Find current branch name for display in the input field
  const currentBranchName = useMemo(() => {
    if (!selectedBranch) return ''
    return branchOptions.find(opt => opt.id === selectedBranch)?.name || ''
  }, [selectedBranch, branchOptions])
  
  // Find current treatment name for display in the input field
  const currentTreatmentName = useMemo(() => {
    if (!selectedTreatment) return ''
    return treatmentOptions.find(opt => opt.id === selectedTreatment)?.name || ''
  }, [selectedTreatment, treatmentOptions])

  // We use the full name as the 'value' for the search box, but the ID for filtering (selectedOption)
  return (
    <div className={`bg-white p-6 rounded-xs shadow-sm border border-gray-100 ${inter.variable} font-light`}>
      <h3 className="text-xl md:text-2xl font-medium text-gray-900 tracking-tight mb-6">Filter by Location/Treatment</h3>
      <form onSubmit={(e) => { e.preventDefault(); onApplyFilters(); }} className="space-y-4">
        <SearchDropdown
          value={selectedCity}
          onChange={setSelectedCity}
          placeholder="Filter by city..."
          options={cityOptions}
          selectedOption={selectedCity}
          onOptionSelect={handleCitySelect}
          onClear={() => { setSelectedCity(''); }}
          type="city"
        />
        <SearchDropdown
          value={currentBranchName} // Use the full name for the search value
          onChange={setSelectedBranch} // Update the raw search term (which will be cleared on select)
          placeholder="Filter by branch..."
          options={branchOptions}
          selectedOption={selectedBranch} // The simple branchName ID
          onOptionSelect={handleBranchSelect} // Handles selecting the ID
          onClear={() => { setSelectedBranch(''); }}
          type="branch"
        />
        <SearchDropdown
          value={currentTreatmentName}
          onChange={setSelectedTreatment}
          placeholder="Filter by treatment..."
          options={treatmentOptions}
          selectedOption={selectedTreatment}
          onOptionSelect={handleTreatmentSelect}
          onClear={() => { setSelectedTreatment(''); }}
          type="treatment"
        />
        <button type="submit" className="w-full bg-gray-700 text-white py-3 rounded-xs hover:bg-gray-800 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/50">
          Apply Filters
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="w-full text-gray-600 hover:text-gray-800 py-3 rounded-xs transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-400/50"
        >
          Clear All
        </button>
      </form>
    </div>
  )
}

// PrimarySpecialtyAndTreatments (NEW component, assumed from truncation)
const PrimarySpecialtyAndTreatments = ({ specializationDisplay, relatedTreatments, selectedTreatment }: { specializationDisplay: any[], relatedTreatments: TreatmentType[], selectedTreatment: string }) => {
  const filteredTreatments = useMemo(() => {
    if (!selectedTreatment) return relatedTreatments
    // Treat selectedTreatment as the ID (name) from the dropdown
    return relatedTreatments.filter(t => t.name === selectedTreatment)
  }, [relatedTreatments, selectedTreatment])

  const [showAll, setShowAll] = useState(false)
  const initialCount = 6
  const treatmentsToShow = showAll ? filteredTreatments : filteredTreatments.slice(0, initialCount)

  if (filteredTreatments.length === 0 && selectedTreatment) {
    return null // Hide if filtered to zero
  }

  return (
    <section className={`bg-white rounded-xs shadow-sm border border-gray-100 ${inter.variable} font-light`}>
      <div className="px-8 pt-8">
        <h2 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight mb-6 flex items-center gap-3">
          <Stethoscope className="w-7 h-7" />
          Primary Specialty & Related Treatments
        </h2>
        {specializationDisplay.length > 0 && (
          <div className="mb-8 p-4 bg-gray-50 rounded-xs">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {specializationDisplay.map((spec: any) => (
                <span key={spec._id} className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-200">
                  {spec.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {filteredTreatments.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {treatmentsToShow.map((treatment: TreatmentType) => (
                <TreatmentCard key={treatment._id} item={treatment} />
              ))}
            </div>
            {filteredTreatments.length > initialCount && (
              <div className="p-8 pt-0 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center gap-2 bg-gray-50/50 text-gray-700 px-6 py-3 rounded-xs hover:bg-gray-100 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/50"
                >
                  {showAll ? (
                    <>
                      <ChevronLeft className="w-5 h-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      Show All {filteredTreatments.length} Treatments
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

// SimilarDoctorsList (assumed from truncation)
const SimilarDoctorsList = ({ similarDoctors, selectedCity, selectedBranch }: { similarDoctors: ExtendedDoctorType[], selectedCity: string, selectedBranch: string }) => {
  const [showAll, setShowAll] = useState(false)
  const initialDisplayCount = 3

  const doctorsToDisplay = showAll ? similarDoctors : similarDoctors.slice(0, initialDisplayCount)
  const hasMoreFiltered = similarDoctors.length > initialDisplayCount

  return (
    <section className={`bg-white rounded-xs shadow-sm border border-gray-100 ${inter.variable} font-light`}>
      <div className="px-8 pt-8">
        <h2 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight mb-6 flex items-center gap-3">
          <Users className="w-7 h-7" />
          Similar Doctors ({similarDoctors.length})
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 pb-8">
        {doctorsToDisplay.map((doctor) => <DoctorCard key={doctor._id || doctor.baseId} doctor={doctor} />)}
      </div>
      {hasMoreFiltered && (
        <div className="p-8 pt-0 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 bg-gray-50/50 text-gray-700 px-6 py-3 rounded-xs hover:bg-gray-100 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/50"
          >
            {showAll ? (
              <>
                <ChevronLeft className="w-5 h-5" />
                Show Less
              </>
            ) : (
              <>
                Show All {similarDoctors.length} Doctors
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  )
}

// AffiliatedBranchesList (UPDATED with Embla Carousel, Arrows, and Branches Search)
const AffiliatedBranchesList = ({ allBranches, selectedCity, selectedBranch, selectedTreatment }: { allBranches: any[], selectedCity: string, selectedBranch: string, selectedTreatment: string }) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  
  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' })
  
  // Branch options for dropdown: All branches with hospital and city in name (used for internal search)
  const branchOptions = useMemo(() => {
    return allBranches
      .filter(b => b?.branchName && b.hospitalName && b.city?.[0]?.cityName)
      .map((branch) => ({
        id: branch._id || branch.branchName, // ID is useful for internal logic/tracking
        name: `${branch.branchName} (${branch.hospitalName}) - ${branch.city[0].cityName}`
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allBranches])

  // Filter branches for cards
  const filteredBranches = useMemo(() => {
    let branches = allBranches

    // 1. Apply Search Term (on branch name, hospital, or city) for cards
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      branches = branches.filter(b => 
        b.branchName?.toLowerCase().includes(lowerTerm) ||
        b.hospitalName?.toLowerCase().includes(lowerTerm) ||
        b.city?.some((c: any) => c.cityName?.toLowerCase().includes(lowerTerm))
      )
    }

    // 2. Apply Sidebar Filters
    return branches.filter(branch => {
      // Filter by City
      const matchesCity = !selectedCity || branch.city?.some((c: any) => c.cityName === selectedCity)
      
      // Filter by Branch Name (Full match, as selectedBranch comes from the filter dropdown)
      const matchesBranch = !selectedBranch || branch.branchName === selectedBranch
      
      // Filter by Treatment (Checking if branch or its hospital offer the selected treatment)
      const matchesTreatment = !selectedTreatment || 
        branch.treatments?.some((t: any) => t.name === selectedTreatment) 
      
      return matchesCity && matchesBranch && matchesTreatment
    })
  }, [allBranches, selectedCity, selectedBranch, selectedTreatment, searchTerm])

  const handleBranchSelect = useCallback((id: string) => {
    // ID here is the simple branchName
    const branch = allBranches.find(b => b.branchName === id)
    if (branch) {
      const hospitalSlug = generateSlug(branch.hospitalName)
      const branchSlug = generateSlug(branch.branchName)
      router.push(`/hospitals/${hospitalSlug}/branch/${branchSlug}`)
    }
    setSearchTerm("") // Clear search after navigation
  }, [allBranches, router])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  if (!filteredBranches?.length) {
    return (
      <div className={`bg-white p-8 rounded-xs shadow-sm border border-gray-100 text-center ${inter.variable} font-light`}>
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No affiliated branches matching the filters.</p>
      </div>
    )
  }

  // NOTE: This internal search dropdown uses `searchTerm` as the value/ID for search,
  // but it is for *navigation*, not filtering the cards below. The card filtering uses the sidebar state.
  return (
    <section className={`bg-white rounded-xs shadow-sm border border-gray-100 ${inter.variable} font-light`}>
      <div className="px-8 pt-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7" />
            Affiliated Branches ({filteredBranches.length})
          </h2>
          <div className="relative w-full md:w-80">
            <SearchDropdown
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search branches..."
              options={branchOptions}
              selectedOption={null} // Don't use selectedOption here as we want the full search capability
              onOptionSelect={handleBranchSelect}
              onClear={() => setSearchTerm("")}
              type="branch"
            />
          </div>
        </div>
      </div>
      {/* Embla Carousel with Arrows */}
      <div className="relative px-8 pb-8">
        <div className="embla" ref={emblaRef}>
          <div className={EMBLA_CLASSES.viewport}>
            <div className={EMBLA_CLASSES.container}>
              {filteredBranches.map((branch: any, index: number) => (
                <div key={branch._id || index} className={`${EMBLA_CLASSES.slide} ${EMBLA_SLIDE_SIZES.lg}`}>
                  <BranchCard branch={branch} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Navigation Arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all z-10"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all z-10"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </section>
  )
}

// Skeletons (adapted)
const HeroSkeleton = () => (
  <section className="relative w-full h-[70vh] bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 z-10 pb-12">
      <div className="container mx-auto px-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 bg-gray-300 rounded-full" />
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
  <div className={`bg-white p-6 rounded-xs border border-gray-100 shadow-sm animate-pulse ${inter.variable} font-light`}>
    <div className="h-8 bg-gray-300 rounded w-48 mb-4" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xs" />)}
    </div>
  </div>
)

const AboutSkeleton = () => (
  <div className={`bg-white p-8 rounded-xs border border-gray-100 shadow-sm animate-pulse ${inter.variable} font-light`}>
    <div className="h-8 bg-gray-300 rounded w-32 mb-4" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
  </div>
)

const CarouselSkeleton = ({ type }: { type: string }) => (
  <div className={`bg-white p-8 rounded-xs shadow-sm border border-gray-100 animate-pulse ${inter.variable} font-light`}>
    <div className="h-8 bg-gray-300 rounded w-48 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-60 bg-gray-200 rounded-xs" />)}
    </div>
  </div>
)

const SidebarSkeleton = () => (
  <div className={`space-y-6 ${inter.variable} w-full font-light`}>
    <div className="bg-white p-6 rounded-xs border border-gray-100 shadow-sm animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
    <div className="bg-white p-6 rounded-xs border border-gray-100 shadow-sm animate-pulse h-96" />
  </div>
)

// Main Component
export default function DoctorDetail({ params }: { params: Promise<{ slug: string }> }) {
  const [doctor, setDoctor] = useState<ExtendedDoctorType | null>(null)
  const [allHospitals, setAllHospitals] = useState<HospitalType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aboutExpanded, setAboutExpanded] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedTreatment, setSelectedTreatment] = useState('')

  const router = useRouter()
  const handleApplyFilters = useCallback(() => {
    // Filters applied via state, memos will update
  }, [])

  useEffect(() => {
    const fetchDoctorData = async () => {
      setLoading(true)
      setError(null)
      try {
        const resolvedParams = await params
        const doctorSlug = resolvedParams.slug
        const res = await fetch('/api/hospitals')
        if (!res.ok) throw new Error("Failed to fetch hospitals")
        const data = await res.json()
        
        if (data.items?.length > 0) {
          const extendedDoctors = getAllExtendedDoctors(data.items)
          const foundDoctor = extendedDoctors.find((d: ExtendedDoctorType) => generateSlug(d.doctorName) === doctorSlug)
          setAllHospitals(data.items)
          setDoctor(foundDoctor || null)
          if (!foundDoctor) {
            setError("Doctor not found. The URL might be incorrect or the doctor does not exist.")
          }
        } else {
          setError("No hospital data available.")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred while fetching doctor details")
      } finally {
        setLoading(false)
      }
    }
    fetchDoctorData()
  }, [params])

  const specializationDisplay = useMemo(() => {
    if (!doctor || !doctor.specialization) return []
    if (Array.isArray(doctor.specialization)) {
      // @ts-ignore
      return doctor.specialization.map((spec: any) => typeof spec === 'object' ? spec : { _id: spec, name: spec }).filter((s: any) => s.name)
    }
    // @ts-ignore
    return [{ _id: doctor.specialization, name: doctor.specialization }]
  }, [doctor?.specialization])

  // Similar doctors: doctors with overlapping specializations, filtered by city/branch
  const similarDoctors = useMemo(() => {
    if (!allHospitals.length || !doctor) return []
    const allExtended = getAllExtendedDoctors(allHospitals)
    const doctorSpecialtyNames = specializationDisplay.map(s => s.name)

    let candidates = allExtended.filter(d => 
      d.baseId !== doctor.baseId && // Use baseId for comparison
      // @ts-ignore
      d.specialization?.some((s: any) => doctorSpecialtyNames.includes(s.name || s.title || s))
    )

    // Apply filters
    candidates = candidates.filter(d => {
      const matchesCity = !selectedCity || d.locations.some((loc: any) => loc.cities.some((c: any) => c.cityName === selectedCity))
      const matchesBranch = !selectedBranch || d.locations.some((loc: any) => loc.branchName === selectedBranch)
      return matchesCity && matchesBranch
    })

    return candidates
  }, [allHospitals, doctor, specializationDisplay, selectedCity, selectedBranch])

  // **********************************************
  // UPDATED: doctorBranches to include ALL branches
  // **********************************************
  const doctorBranches = useMemo(() => {
    const branchMap = new Map<string, BranchType & { hospitalName: string, hospitalId: string }>()

    allHospitals.forEach(h => {
      h.branches.forEach((b) => {
        const uniqueKey = b._id ? `${h._id}-${b._id}` : `${h.hospitalName}-${b.branchName}`
        if (!branchMap.has(uniqueKey) && b.branchName) {
          branchMap.set(uniqueKey, {
            ...b,
            hospitalName: h.hospitalName,
            hospitalId: h._id,
            treatments: mergeTreatments(b.treatments, h.treatments), 
          })
        }
      })
    })

    return Array.from(branchMap.values()).sort((a, b) => a.branchName.localeCompare(b.branchName))
  }, [allHospitals])

  // Dropdown data for filter
  const uniqueCities = useMemo(() => {
    const cSet = new Set<string>()
    allHospitals.forEach((h) => {
      h.branches.forEach((b) => {
        if (b.city && Array.isArray(b.city)) {
          b.city.forEach((c: CityType) => {
            if (c.cityName) cSet.add(c.cityName)
          })
        }
      })
    })
    return Array.from(cSet).sort()
  }, [allHospitals])

  // **********************************************************************************************
  // UPDATED: uniqueBranches to return { id: branchName, name: 'BranchName (HospitalName) - CityName' }
  // **********************************************************************************************
  const uniqueBranches = useMemo(() => {
    const bMap = new Map<string, { id: string, name: string }>()
    allHospitals.forEach((h) => {
      h.branches.forEach((b) => {
        if (b.branchName) {
          const firstCityName = b.city?.[0]?.cityName || 'No City'
          const simpleBranchName = b.branchName
          // Use simple branch name as the ID for filtering, but combined name for display
          bMap.set(simpleBranchName, {
            id: simpleBranchName, 
            name: `${b.branchName} (${h.hospitalName}) - ${firstCityName}`
          })
        }
      })
    })
    // Sort by combined name for display order
    return Array.from(bMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allHospitals])

  const uniqueTreatments = useMemo(() => {
    const tSet = new Set<string>()
    allHospitals.forEach((h) => {
      if (h.treatments) {
        h.treatments.forEach((t: TreatmentType) => {
          if (t.name) tSet.add(t.name)
        })
      }
      h.branches.forEach((b) => {
        if (b.treatments) {
          b.treatments.forEach((t: TreatmentType) => {
            if (t.name) tSet.add(t.name)
          })
        }
      })
    })
    return Array.from(tSet).sort()
  }, [allHospitals])

  if (loading) {
    // ... loading skeleton ...
    return (
      <div className={`min-h-screen bg-gray-50 ${inter.variable} font-light`}>
        <HeroSkeleton />
        <Breadcrumb doctorName="Doctor Name" />
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-8">
              <main className="lg:col-span-9 space-y-8">
                {/* <OverviewSkeleton /> Removed */}
                <AboutSkeleton />
                <CarouselSkeleton type="treatments" />
                <CarouselSkeleton type="branches" />
                <CarouselSkeleton type="doctors" />
              </main>
              <div className="lg:col-span-3">
                <SidebarSkeleton />
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error || !doctor) {
    // ... error message ...
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative ${inter.variable} font-light`}>
        <Breadcrumb doctorName="Doctor Name" />
        <div className="text-center space-y-6 max-w-md p-10 bg-white rounded-xs shadow-sm border border-gray-100">
          <Users className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 leading-tight">Doctor Not Found</h2>
          <p className="text-base text-gray-700 leading-relaxed font-light">{error || "The requested doctor could not be found. Please check the URL or try searching again."}</p>
          <Link href="/doctors" className="inline-block w-full bg-gray-700 text-white px-6 py-3 rounded-xs hover:bg-gray-800 transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/50">
            Go to Doctors Search
          </Link>
        </div>
      </div>
    )
  }

  const doctorImage = getDoctorImage(doctor.profileImage)
  const shortAbout = getShortDescription(doctor.aboutDoctor, 200)

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.variable} font-light`}>
      <section className="relative w-full h-[70vh] bg-gray-50">
        {doctorImage && (
          <img
            src={doctorImage}
            alt={`${doctor.doctorName}`}
            className="object-cover w-full h-full"
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
            onError={(e) => { e.currentTarget.style.display = "none" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-12 text-white">
          <div className="container mx-auto px-6 space-y-6">
            <div className="flex gap-x-4 items-center">
              <div className="relative w-16 h-16 bg-white rounded-full p-2 shadow-lg flex-shrink-0">
                {doctorImage ? (
                  <img 
                    src={doctorImage} 
                    alt={`${doctor.doctorName} profile`} 
                    className="object-contain rounded-full w-full h-full" 
                    onError={(e) => { e.currentTarget.style.display = "none" }} 
                  />
                ) : (
                  <Stethoscope className="w-8 h-8 text-gray-400 absolute inset-0 m-auto" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-medium text-white mb-1 leading-tight">{doctor.doctorName}</h1>
                <div className="flex flex-wrap gap-x-2 mt-0 text-lg text-white/80">
                  {specializationDisplay.slice(0, 3).map((spec: any) => <span key={spec._id}>{spec.name} Speciality</span>)}
                  {specializationDisplay.length > 3 && <span className="text-white/60">+{specializationDisplay.length - 3} more</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {doctor.qualification && (
                <span className="flex items-center gap-2 text-sm text-white/90">
                  <Award className="w-4 h-4" />
                  {doctor.qualification}
                </span>
              )}
              {doctor.experienceYears && (
                <span className="flex items-center gap-2 text-sm text-red-300">
                  <Clock className="w-4 h-4" />
                  {doctor.experienceYears} years of exp
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <Breadcrumb doctorName={doctor.doctorName} />

      <section className="py-16 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8">
            <main className="lg:col-span-9 space-y-8">
              {/* Quick Overview (Removed as per user request) */}
              {/* About Doctor Section */}
              {doctor.aboutDoctor && (
                <section className={`bg-white p-8 rounded-xs shadow-sm border border-gray-100 ${inter.variable} font-light`}>
                  <h2 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                    <BookOpen className="w-7 h-7" />
                    About {doctor.doctorName}
                  </h2>
                  <div className="space-y-4">
                    {!aboutExpanded ? (
                      <p className="text-base text-gray-700 leading-relaxed font-light">{shortAbout}</p>
                    ) : (
                      typeof doctor.aboutDoctor === 'string' ? (
                        <div className="text-base text-gray-700 leading-relaxed font-light">{doctor.aboutDoctor}</div>
                      ) : (
                        renderRichText(doctor.aboutDoctor)
                      )
                    )}
                    <button
                      onClick={() => setAboutExpanded(!aboutExpanded)}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      {aboutExpanded ? 'Read Less' : 'Read More'} <ChevronRight className={`w-4 h-4 ${aboutExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </section>
              )}

              {/* Primary Specialty & Related Treatments */}
              <PrimarySpecialtyAndTreatments 
                specializationDisplay={specializationDisplay} 
                relatedTreatments={doctor.relatedTreatments || []} 
                selectedTreatment={selectedTreatment} 
              />

              {/* Affiliated Branches: Card/Grid Display with filters */}
              {doctorBranches.length > 0 && <AffiliatedBranchesList allBranches={doctorBranches} selectedCity={selectedCity} selectedBranch={selectedBranch} selectedTreatment={selectedTreatment} />}

              {/* Similar Doctors: Card/Grid Display with filters */}
              {similarDoctors.length > 0 && <SimilarDoctorsList similarDoctors={similarDoctors} selectedCity={selectedCity} selectedBranch={selectedBranch} />}
            </main>

            <aside className="lg:col-span-3 space-y-8">
              <FindYourHospital 
                cities={uniqueCities} 
                branches={uniqueBranches} 
                treatments={uniqueTreatments}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                selectedBranch={selectedBranch}
                setSelectedBranch={setSelectedBranch}
                selectedTreatment={selectedTreatment}
                setSelectedTreatment={setSelectedTreatment}
                onApplyFilters={handleApplyFilters}
              />
              <ContactForm />
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}