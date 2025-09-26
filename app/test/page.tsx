"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { wixServerClient } from "@/lib/wixServer"
import { getBestCoverImage } from "@/lib/wixMedia"
import { OptimizedImage } from "@/components/optimized-image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import type { MedicalAdvisor } from "@/types/medicalAdvisor"
import { Clock, HeartPulse, ShieldCheck, Stethoscope, DollarSign, Search, MapPin } from "lucide-react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Define the collection IDs
const COLLECTION_ID_DOCTOR = "Import2"
const COLLECTION_ID_HOSPITAL = "Hospital"
const COLLECTION_ID_TREATMENT = "TreatmentAngioplastyPci"

// Define the interfaces for each data type
interface Hospital {
  _id: string
  Name: string
  Type: string
  Tagline: string
  Description: string
  Logo: string
  slug: string
  department1Name: string[]
  Facilities: string[]
  Services: string[]
  "Insurance Partners": string[]
  Rating: number
  "Review Count": number
  "Established Year": number
  Website: string
  "Contact Email": string
  "Facebook Link": string
  "Instagram Link": string
  "LinkedIn Link": string
  type: "hospital"
}

// Updated Treatment interface to match the new API response structure
interface Treatment {
  _id: string
  name: string
  description: string
  slug: string
  department: string
  tags: string[]
  priceRangeMin: number
  priceRangeMax: number
  relatedDoctors: string[]
  durationMinutes: number
  faqs: { question: string; answer: string }[]
  image: string | null // Added image field for treatment
  type: "treatment"
}

// Create a union type for all searchable items
type SearchableItem = (MedicalAdvisor & { type: "doctor" }) | Hospital | Treatment

// Define the state interface for filters
interface FilterState {
  searchQuery: string
  locationQuery: string
  specialties: string[]
  languages: string[]
  type: "all" | "doctor" | "hospital" | "treatment"
}

// Helper function to format strings to arrays
function formatStringToArray(data: string[] | string | null | undefined): string[] {
  if (!data) return []
  if (Array.isArray(data)) {
    return data.map((item) => String(item).trim())
  }
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data.replace(/'/g, '"'))
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim())
      }
    } catch (e) {
      return data.split(",").map((item) => item.trim())
    }
  }
  return []
}

// Helper function to parse social links
function parseSocialLinks(data: string | null | undefined): Record<string, string> {
  if (!data || typeof data !== "string") return {}
  try {
    const parsed = JSON.parse(data.replace(/'/g, '"'))
    if (typeof parsed === "object" && parsed !== null) {
      return parsed
    }
  } catch (e) {
    console.error("Failed to parse social links string:", e)
  }
  return {}
}

// Helper function to parse FAQs from a string
function parseFaqs(data: string | null | undefined): { question: string; answer: string }[] {
  if (!data || typeof data !== "string") return []
  try {
    return JSON.parse(data)
  } catch (e) {
    console.error("Failed to parse FAQs string:", e)
  }
  return []
}

// Asynchronous function to fetch and combine data from all collections
async function getCombinedData(): Promise<SearchableItem[]> {
  try {
    const [doctorsResponse, hospitalResponse, treatmentResponse] = await Promise.all([
      wixServerClient.items.query(COLLECTION_ID_DOCTOR).limit(1000).find({ consistentRead: true }),
      wixServerClient.items.query(COLLECTION_ID_HOSPITAL).limit(1000).find({ consistentRead: true }),
      wixServerClient.items.query(COLLECTION_ID_TREATMENT).limit(1000).find({ consistentRead: true }),
    ])

    const doctors: SearchableItem[] =
      doctorsResponse.items?.map((item: any) => ({
        ...item,
        _id: item._id,
        name: item.name || "Medical Advisor",
        title: item.Title || item.title,
        specialty: item.specialty,
        slug: item.slug || "",
        image: item.image,
        experience: item.experience,
        languages: formatStringToArray(item.languages),
        hospital: item.hospital,
        contactPhone: item.contactPhone,
        whatsapp: item.whatsapp,
        about: item.about,
        workExperience: item.workExperience,
        education: item.education,
        memberships: item.memberships,
        awards: item.awards,
        specialtyInterests1yy: formatStringToArray(item.specialtyInterests1yy),
        slug: item.slug,
        type: "doctor",
      })) || []

    const hospitals: SearchableItem[] =
      hospitalResponse.items?.map((item: any) => {
        const socialLinks = parseSocialLinks(item.socialLinks)
        return {
          _id: item._id,
          Name: item.name || "Unknown Hospital",
          Type: item.type || "",
          Tagline: item.tagline || "",
          slug: item.slug || "",
          Description: item.description || "",
          Logo: item.logo,
          department1Name: formatStringToArray(item.department1Name),
          Facilities: formatStringToArray(item.facilities),
          Services: formatStringToArray(item.services),
          "Insurance Partners": formatStringToArray(item.insurancePartners),
          Rating: item.rating ? Number.parseFloat(item.rating) : 0,
          "Review Count": item.reviewCount ? Number.parseInt(item.reviewCount) : 0,
          "Established Year": item.establishedYear ? Number.parseInt(item.establishedYear) : 0,
          Website: item.website || "#",
          "Contact Email": item.contactEmail || "",
          "Facebook Link": socialLinks.facebook || "",
          "Instagram Link": socialLinks.instagram || "",
          "LinkedIn Link": socialLinks.linkedin || "",
          type: "hospital",
        }
      }) || []

    // Fetch and map treatment data
    const treatments: SearchableItem[] =
      treatmentResponse.items?.map((item: any) => ({
        ...item,
        _id: item._id,
        name: item.name || "Treatment",
        description: item.description || "",
        slug: item.slug || "",
        department: item.department || "",
        tags: formatStringToArray(item.tags),
        priceRangeMin: item.priceRangeMin || 0,
        priceRangeMax: item.priceRangeMax || 0,
        relatedDoctors: formatStringToArray(item.relatedDoctors),
        durationMinutes: item.durationMinutes || 0,
        faqs: parseFaqs(item.faqs),
        image: item.image, // Map the image field
        type: "treatment",
      })) || []

    return [...doctors, ...hospitals, ...treatments]
  } catch (error) {
    console.error("Error fetching combined data:", error)
    return []
  }
}

export default function Searchpage() {
  const [allData, setAllData] = useState<SearchableItem[] | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    locationQuery: "",
    specialties: [],
    languages: [],
    type: "all",
  })

  useEffect(() => {
    async function fetchData() {
      const combinedItems = await getCombinedData()
      setAllData(combinedItems)
    }
    fetchData()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
  }
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, locationQuery: e.target.value }))
  }

  const handleTypeChange = (value: "all" | "doctor" | "hospital" | "treatment") => {
    setFilters((prev) => ({ ...prev, type: value }))
  }

  const handleFilterToggle = (filterType: "specialties" | "languages", value: string, checked: boolean) => {
    setFilters((prev) => {
      const currentFilters = prev[filterType]
      return {
        ...prev,
        [filterType]: checked ? [...currentFilters, value] : currentFilters.filter((item) => item !== value),
      }
    })
  }

  const filteredData = useMemo(() => {
    if (!allData) return null

    return allData.filter((item) => {
      const matchesType =
        filters.type === "all" ||
        (filters.type === "doctor" && item.type === "doctor") ||
        (filters.type === "hospital" && item.type === "hospital") ||
        (filters.type === "treatment" && item.type === "treatment")

      let nameToCheck = ""
      if (item.type === "doctor") {
        nameToCheck = (item as MedicalAdvisor).name
      } else if (item.type === "hospital") {
        nameToCheck = (item as Hospital).Name
      } else if (item.type === "treatment") {
        nameToCheck = (item as Treatment).name
      }

      const matchesSearch = nameToCheck?.toLowerCase().includes(filters.searchQuery.toLowerCase())

      const matchesSpecialties =
        filters.specialties.length === 0 ||
        (item.type === "doctor" &&
          filters.specialties.some((spec) =>
            (item as MedicalAdvisor).specialty?.toLowerCase().includes(spec.toLowerCase()),
          )) ||
        (item.type === "hospital" &&
          (item as Hospital).department1Name.some((dept) => filters.specialties.includes(dept))) ||
        (item.type === "treatment" &&
          filters.specialties.some((spec) =>
            (item as Treatment).department?.toLowerCase().includes(spec.toLowerCase()),
          ))

      const matchesLanguages =
        filters.languages.length === 0 ||
        (item.type === "doctor" && (item as MedicalAdvisor).languages?.some((lang) => filters.languages.includes(lang)))

      return matchesType && matchesSearch && matchesSpecialties && matchesLanguages
    })
  }, [allData, filters])

  const uniqueSpecialties = useMemo(() => {
    if (!allData) return []
    const allSpecialties = new Set<string>()
    allData.forEach((item) => {
      if (item.type === "doctor" && item.specialty) {
        allSpecialties.add(item.specialty)
      } else if (item.type === "hospital" && Array.isArray(item.department1Name)) {
        item.department1Name.forEach((dept) => allSpecialties.add(dept))
      } else if (item.type === "treatment" && item.department) {
        allSpecialties.add(item.department)
      }
    })
    return Array.from(allSpecialties).sort()
  }, [allData])

  const uniqueLanguages = useMemo(() => {
    if (!allData) return []
    const allLanguages = new Set<string>()
    allData.forEach((item) => {
      if (item.type === "doctor" && item.languages) {
        item.languages.forEach((lang) => allLanguages.add(lang))
      }
    })
    return Array.from(allLanguages).sort()
  }, [allData])

  if (!allData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p>Loading data...</p>
      </div>
    )
  }

  const renderItem = (item: SearchableItem) => {
    if (item.type === "doctor") {
      const doctor = item as MedicalAdvisor
      const imageSrc = doctor.image ? getBestCoverImage(doctor.image, { width: 150 }) : null

      return (
        <Card
          key={doctor._id}
          className="bg-gray-50 border border-gray-200 rounded-xs shadow-xs hover:shadow-sm transition-all duration-200"
        >
          {/* Doctor Image */}
          <div className="flex justify-start items-center  ">
            {imageSrc && (
              <OptimizedImage
                src={imageSrc}
                alt={doctor.name}
                width={120}
                height={120}
                className="w-28 h-28 m-3 rounded-xs mt-4 object-cover border-4 border-white shadow-xs"
              />
            )}
            <div>
              <div>
                <CardTitle className="title-heading">
                  {doctor.name}
                </CardTitle>
                <p className="description">
                  {doctor.specialty}
                </p>
              </div>

              <div className="flex my-1 items-center justify-start gap-2 description-1">

                <span className="">{doctor.experience}</span>

              </div>
            </div>
          </div>

          {/* Content */}
          <CardContent className="px- pb-w pt-2 text-left space-y-0">

            <div>
              <span className="description">
                {doctor.title}
              </span>

            </div>

            {/* Button */}
            <Link href={`/medical-advisors/${doctor.slug}`} passHref>
              <Button
                className="w-full mt-4 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 hover:text-gray-900 transition"
                variant="outline"
              >
                View Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

      )
    } else if (item.type === "hospital") {
      const hospital = item as Hospital
      const imageSrc = hospital.Logo ? getBestCoverImage(hospital.Logo, { width: 150 }) : null

      return (
        <Card
          key={hospital._id}
          className="bg-gray-50 border border-gray-200 rounded-xs shadow-xs hover:shadow-sm transition-all duration-200"
        >
          {/* Hospital Image & Header */}
          <div className="flex justify-start items-center">
            {imageSrc ? (
              <OptimizedImage
                src={imageSrc}
                alt={hospital.Name}
                width={120}
                height={120}
                className="w-28 h-28 m-3 rounded-xs mt-4 object-cover border-4 border-white shadow-xs"
              />
            ) : (
              <div className="w-28 h-28 m-3 mt-4 flex items-center justify-center bg-gray-100 rounded-xs border-4 border-white shadow-xs">
                <HeartPulse size={40} className="text-gray-500" />
              </div>
            )}
            <div className="flex flex-col">
              {/* Hospital Name */}
              <CardTitle className="title-heading">
                {hospital.Name}
              </CardTitle>

              {/* Tagline */}
              {hospital.Tagline && (
                <p className="description mt-1 line-clamp-1">
                  {hospital.Tagline}
                </p>
              )}

              {/* Type + Established Year Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {hospital.Type && (
                  <span className="inline-flex items-center px-3 py-1 description-1 bg-gray-100 text-gray-700 rounded-full">
                    {hospital.Type}
                  </span>
                )}

                {hospital["Established Year"] && (
                  <span className="inline-flex items-center px-3 py-1 description-1 bg-white border border-gray-200 text-gray-800 rounded-full shadow-sm">
                    Est. {hospital["Established Year"]}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Content */}
          <CardContent className="px-4 pb-4 pt-2 text-left space-y-2">
            <div className="description">
              <span className="font-semibold">Se: </span>
              {hospital.department1Name?.join(", ") || "N/A"}
            </div>
            {/* <div className="description">
              <span className="font-semibold">Insurance Partners: </span>
              {hospital["Insurance Partners"]?.join(", ") || "N/A"}
            </div> */}


            {/* Button */}
            {hospital.slug && (
              <Link href={`/hospitals/${hospital.slug}`} passHref>
                <Button
                  className="w-full mt-4 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 hover:text-gray-900 transition"
                  variant="outline"
                >
                  View Details
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

      )
    } else {
      const treatment = item as Treatment
      const imageSrc = treatment.image ? getBestCoverImage(treatment.image, { width: 150 }) : null

      return (
        <Card
          key={treatment._id}
          className="bg-gray-50 border border-gray-200 rounded-xs shadow-xs hover:shadow-sm transition-all duration-200"
        >
          {/* Treatment Image + Header */}
          <div className="flex items-center">
            {imageSrc ? (
              <OptimizedImage
                src={imageSrc}
                alt={treatment.name}
                width={120}
                height={120}
                className="w-28 h-28 m-3 mt-4 rounded-xs object-cover border-4 border-white shadow-xs"
              />
            ) : (
              <div className="w-28 h-28 m-3 mt-4 flex items-center justify-center bg-gray-100 rounded-xs border-4 border-white shadow-xs">
                <Stethoscope size={40} className="text-gray-500" />
              </div>
            )}

            {/* Name + Department */}
            <div className="flex flex-col  mt-4">
              <CardTitle className="title-heading">{treatment.name}</CardTitle>
              {treatment.department && (
                <p className="description my-1">{treatment.department}</p>
              )}
              {(treatment.priceRangeMin || treatment.priceRangeMax) && (
                <p className="flex items-center gap-x-3 description">
                <div className="flex items-center">
                    <DollarSign size={16} className="text-gray-500" />
                  <span className="font-semibold">Price:</span>
                </div>
                  <span>
                    ${treatment.priceRangeMin} - ${treatment.priceRangeMax}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Content */}
          <CardContent className="px-4 pb-4 pt-2 text-left space-y-3">
            {/* Description */}
            {treatment.description && (
              <p className="description line-clamp-3">{treatment.description}</p>
            )}

            {/* Price */}


            {/* Tags */}
            {/* {treatment.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {treatment.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )} */}

            {/* Button */}
            {treatment.slug && (
              <Link href={`/treatment/${treatment.slug}`} passHref>
                <Button
                  className="w-full mt-4 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 hover:text-gray-900 transition"
                  variant="outline"
                >
                  View Details
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

      )
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner with Search Inputs */}
      <div
        className="relative h-96 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/medical-banner.jpg')" }}
      >
        <div className="absolute inset-0 bg-blue-900 bg-opacity-70 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">
            Find Your Medical Advisor
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mb-8">
            Search for doctors, hospitals, or treatments near you to get the best care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Doctor, hospital, or treatment..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 h-12 bg-white text-gray-800 border-none focus:ring-2 focus:ring-blue-500 shadow-md"
              />
            </div>
            <div className="relative w-full">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Enter location"
                value={filters.locationQuery}
                onChange={handleLocationChange}
                className="w-full pl-10 h-12 bg-white text-gray-800 border-none focus:ring-2 focus:ring-blue-500 shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto my-10 px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Card className="p-4 lg:sticky lg:top-8 bg-white shadow-sm border border-gray-200">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Filters</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                {/* Type filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Resource Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value: "all" | "doctor" | "hospital" | "treatment") =>
                      handleTypeChange(value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1 border border-gray-300">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="doctor">Doctors</SelectItem>
                        <SelectItem value="hospital">Hospitals</SelectItem>
                        <SelectItem value="treatment">Treatments</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Specialties */}
                {uniqueSpecialties.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Specialty / Department</Label>
                    <ScrollArea className="h-40 border rounded-md p-2 mt-1 bg-gray-50 border-gray-200">
                      {uniqueSpecialties.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`specialty-${specialty}`}
                            checked={filters.specialties.includes(specialty)}
                            onCheckedChange={(checked: boolean) =>
                              handleFilterToggle("specialties", specialty, checked)
                            }
                            className="border-gray-300"
                          />
                          <Label htmlFor={`specialty-${specialty}`} className="cursor-pointer text-sm text-gray-700">
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                {/* Languages */}
                {uniqueLanguages.length > 0 && filters.type !== "hospital" && filters.type !== "treatment" && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Languages</Label>
                    <ScrollArea className="h-40 border rounded-md p-2 mt-1 bg-gray-50 border-gray-200">
                      {uniqueLanguages.map((language) => (
                        <div key={language} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`language-${language}`}
                            checked={filters.languages.includes(language)}
                            onCheckedChange={(checked: boolean) => handleFilterToggle("languages", language, checked)}
                            className="border-gray-300"
                          />
                          <Label htmlFor={`language-${language}`} className="cursor-pointer text-sm text-gray-700">
                            {language}
                          </Label>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {filteredData && filteredData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">{filteredData.map(renderItem)}</div>
            ) : (
              <div className="text-center text-gray-500 mt-12">
                <p className="text-lg">No results found.</p>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}