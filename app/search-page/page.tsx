"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { AlertTriangle, Loader2, Search, HeartPulse, MapPin, Filter } from 'lucide-react' 
import { wixClient } from "@/lib/wixClient"
import CtaSection from "@/components/CtaSection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { OptimizedImage } from "@/components/optimized-image"
import Banner from "@/components/BannerService"
import { getBestCoverImage } from "@/lib/wixMedia"

// --- Configuration ---
const COLLECTION_ID = "HospitalList"
// New assumed CMS Collection IDs for separate City, State, Country lists
const CITY_COLLECTION_ID = "CityMaster" 
const STATE_COLLECTION_ID = "StateMaster" 
const COUNTRY_COLLECTION_ID = "CountryMaster"
const ITEMS_PER_PAGE = 22

// Branch reference type
interface Branch {
  _id: string
  name: string
  address: string
  city: string
  state: string
  country: string
  pinCode: string | null
}

interface HospitalMaster {
  _id: string
  name: string
  branch: Branch[]
  logo: string
  description: string
  specialtiesTags: string
}

// Helper function to fetch location data from a specific collection
const fetchLocations = async (collectionId: string): Promise<string[]> => {
  try {
    const response = await wixClient.items
      .query(collectionId)
      .limit(1000) 
      .find({ consistentRead: true })

    if (!response || !response.items) return []

    // UPDATED: Check for 'title' first, as seen in the API response structure, 
    // then fall back to 'name'/'Name'.
    const names = response.items
      .map((item: any) => item.title || item.name || item.Name || "") 
      .filter(name => name)
      .sort()

    return Array.from(new Set(names)) 
  } catch (err) {
    console.error(`Error fetching collection ${collectionId}:`, err)
    return []
  }
}

// New function to fetch all location filters
const fetchLocationFilters = async () => {
  const [cities, states, countries] = await Promise.all([
    fetchLocations(CITY_COLLECTION_ID),
    fetchLocations(STATE_COLLECTION_ID),
    fetchLocations(COUNTRY_COLLECTION_ID),
  ])

  return { cities, states, countries }
}

export default function HospitalMasterPage() {
  const [allHospitals, setAllHospitals] = useState<HospitalMaster[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<HospitalMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  // ADDED: General search query state
  const [searchQuery, setSearchQuery] = useState("") 

  const [filters, setFilters] = useState({
    city: "",
    state: "",
    country: "",
    specialties: new Set<string>(),
  })
  const [availableFilters, setAvailableFilters] = useState<{
    cities: string[]
    states: string[]
    countries: string[]
    specialties: string[]
  }>({ cities: [], states: [], countries: [], specialties: [] })

  const observer = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const fetchHospitals = async (skip = 0, limit = ITEMS_PER_PAGE) => {
    try {
      const response = await wixClient.items
        .query(COLLECTION_ID)
        .include("branches") // Fulfills the requirement to include branches data
        .skip(skip)
        .limit(limit)
        .descending("name")
        .find({ consistentRead: true })

      if (!response || !response.items) return { items: [], hasMore: false, totalCount: 0, specialties: [] }

      const specialties = new Set<string>()

      const hospitalData: HospitalMaster[] = response.items.map((item: any) => {
        const branches = (item.branches || []).map((branch: any) => ({
          _id: branch._id,
          name: branch.branchName || branch.name || "Unnamed Branch",
          address: branch.address || "",
          city: branch.city || "", // Assumed string field to match CityMaster 'title'
          state: branch.state || "",
          country: branch.country || "",
          pinCode: branch.pinCode || null,
        }))

        const itemSpecialties = item.specialtiesTags ? item.specialtiesTags.split(',').map((s: string) => s.trim()) : []
        itemSpecialties.forEach((tag: string) => {
          if (tag) specialties.add(tag)
        })

        return {
          _id: item._id,
          name: item.name || item.Name || "Untitled Hospital",
          branches,
          logo: getBestCoverImage(item) || item.logoImageUrl || "/placeholder-hospital-logo.svg",
          description: item.description || item.Description || "No description available.",
          specialtiesTags: item.specialtiesTags || item["Specialties (Tags)"] || "N/A",
        }
      })

      const totalCount = response.totalCount || 0
      const hasMore = skip + limit < totalCount
      return {
        items: hospitalData,
        hasMore,
        totalCount,
        specialties: Array.from(specialties).sort(),
      }
    } catch (err: any) {
      console.error("Error fetching HospitalMaster collection:", err.message)
      if (err.code === 'WDE0027') {
        setError("Permissions Error: Check your Wix collection read settings.")
      } else {
        setError("Failed to load hospitals. Try again later.")
      }
      return { items: [], hasMore: false, totalCount: 0, specialties: [] }
    }
  }

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)

    const [hospitalResult, locationFilters] = await Promise.all([
      fetchHospitals(0, ITEMS_PER_PAGE),
      fetchLocationFilters(),
    ])

    setAllHospitals(hospitalResult.items)
    setFilteredHospitals(hospitalResult.items)
    setHasMore(hospitalResult.hasMore)
    setTotalCount(hospitalResult.totalCount)

    setAvailableFilters({
      ...locationFilters,
      specialties: hospitalResult.specialties,
    })
    
    setLoading(false)
  }

  // UPDATED: Filter logic uses strict equality for city/state/country selected from a dropdown 
  // and includes a general search query with a robust, consolidated search logic.
  const applyFilters = useCallback(() => {
    let filtered = allHospitals

    const hasFilters = filters.city || filters.state || filters.country || filters.specialties.size > 0 || searchQuery.length > 0;
    
    if (hasFilters) {
      filtered = allHospitals.filter(hospital => {
        let matchesLocation = true
        let matchesSpecialties = true
        let matchesSearchQuery = true 

        const lowerSearchQuery = searchQuery.toLowerCase().trim();
        const lowerCityFilter = filters.city.toLowerCase().trim();
        const lowerStateFilter = filters.state.toLowerCase().trim();
        const lowerCountryFilter = filters.country.toLowerCase().trim();
        
        // --- 1. Explicit Location Filters (City/State/Country Selects - uses exact match) ---
        if (filters.city || filters.state || filters.country) {
          matchesLocation = hospital.branches.some(branch => {
            const branchCity = branch.city ? branch.city.toLowerCase().trim() : "";
            const branchState = branch.state ? branch.state.toLowerCase().trim() : "";
            const branchCountry = branch.country ? branch.country.toLowerCase().trim() : "";

            return (
              (!filters.city || branchCity === lowerCityFilter) && // Exact match for select
              (!filters.state || branchState === lowerStateFilter) && // Exact match for select
              (!filters.country || branchCountry === lowerCountryFilter) // Exact match for select
            )
          })
        }

        // --- 2. General Search Query (NEW: Consolidated Search Logic) ---
        if (lowerSearchQuery) {
          
          // Consolidated Search Text: Hospital Name + Specialties + ALL Branch fields (Name, City, State, Country)
          let searchableText = hospital.name;
          searchableText += " " + hospital.specialtiesTags;

          const branchText = hospital.branches.map(branch => {
            // Concatenate all branch fields that should be searchable
            return [branch.name, branch.city, branch.state, branch.country]
              .filter(Boolean) // Filter out null/empty strings
              .join(' ');
          }).join(' ');
          
          searchableText += " " + branchText;
          searchableText = searchableText.toLowerCase().trim();

          // Check if the entire searchable text includes the query
          matchesSearchQuery = searchableText.includes(lowerSearchQuery);
        }
        
        // --- 3. Specialties Filter (Checkboxes) ---
        if (filters.specialties.size > 0) {
          const hospitalSpecialties = hospital.specialtiesTags.split(',').map(s => s.trim().toLowerCase())
          matchesSpecialties = Array.from(filters.specialties).every(specialty =>
            hospitalSpecialties.includes(specialty.toLowerCase())
          )
        }
        
        // A hospital must satisfy ALL active filter conditions:
        return matchesLocation && matchesSpecialties && matchesSearchQuery
      })
    }

    setFilteredHospitals(filtered)
  }, [filters, allHospitals, searchQuery]) 

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const result = await fetchHospitals(allHospitals.length, ITEMS_PER_PAGE)
    setAllHospitals(prev => [...prev, ...result.items])
    setHasMore(result.hasMore)
    
    // Only update specialties, as location filters are now loaded fully in loadInitialData
    setAvailableFilters(prev => ({
      ...prev,
      specialties: Array.from(new Set([...prev.specialties, ...result.specialties])).sort(),
    }))
    
    setLoadingMore(false)
  }, [loadingMore, hasMore, allHospitals.length])

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loadingMore) return

    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    })
    observer.current.observe(loadMoreRef.current)

    return () => {
      if (observer.current) observer.current.disconnect()
    }
  }, [hasMore, loadMore, loadingMore])

  useEffect(() => {
    loadInitialData()
  }, [])

  // Triggers filter application when 'searchQuery', 'allHospitals', or 'filters' changes
  useEffect(() => {
    applyFilters()
  }, [filters, allHospitals, searchQuery, applyFilters]) 

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFilters(prev => {
      const newSpecialties = new Set(prev.specialties)
      if (checked) {
        newSpecialties.add(specialty)
      } else {
        newSpecialties.delete(specialty)
      }
      return { ...prev, specialties: newSpecialties }
    })
  }

  // Skeleton loading card (unchanged)
  const SkeletonCard = () => (
    <Card className="w-full h-full animate-pulse flex flex-col">
      <div className="h-48 md:h-56 bg-gray-200 rounded-t-lg" />
      <div className="p-4 space-y-3 flex-grow">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="space-y-2 mt-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
      </div>
      <div className="p-4 pt-2">
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </Card>
  )

  // Hospital card (unchanged)
  const HospitalCard = ({ hospital }: { hospital: HospitalMaster }) => {
    const formattedSpecialties = hospital.specialtiesTags
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 3)
      .join(', ')

    const branchCount = hospital.branches?.length || 0

    return (
      <Card className="group relative border-gray-100 flex flex-col overflow-hidden rounded-md border bg-white shadow-none ring-1 ring-gray-100 transition-all duration-300 hover:shadow-sm hover:ring-primary/50">
        <div className="relative h-48 w-full overflow-hidden flex items-center justify-center">
          <OptimizedImage
            src={hospital.logo || "/placeholder-hospital-logo.svg"}
            alt={hospital.name || "Hospital Logo"}
            width={400}
            height={400}
            className="object-contain p-4 transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col px-5 py-2 md:py-4 border-t border-gray-100 flex-grow">
          <h2 className="title-text line-clamp-2">{hospital.name}</h2>

          {/* Branches */}
          {branchCount > 0 ? (
            <>
              <div className="flex items-center text-sm text-gray-500 line-clamp-1 border-b border-gray-100 mb-1 pb-1">
                <MapPin className="inline h-4 w-4 mr-1 text-blue-500" /> 
                <span className="font-medium">{branchCount > 1 ? `${branchCount} Locations` : "1 Location"}</span>
              </div>
              <ul className="text-xs text-gray-500 mt-1 space-y-1">
                {hospital.branches.slice(0, 2).map((b: Branch) => (
                  <li key={b._id}>
                    <MapPin className="inline h-3 w-3 mr-1 text-blue-400" />
                    {b.name} {b.address ? `- ${b.address}` : b.city ? `- ${b.city}` : ""}
                  </li>
                ))}
                {branchCount > 2 && (
                  <li className="italic text-gray-400">+ {branchCount - 2} more</li>
                )}
              </ul>
            </>
          ) : (
            <div className="flex items-center text-sm text-gray-400 line-clamp-1 border-b border-gray-100 mb-1 pb-1">
              <MapPin className="inline h-4 w-4 mr-1 text-gray-300" /> 
              <span>Location information unavailable</span>
            </div>
          )}

          {/* Specialties */}
          {hospital.specialtiesTags && (
            <div className="flex items-center text-sm text-gray-600 line-clamp-1 mb-1 pb-1 mt-1">
              <HeartPulse className="inline h-4 w-4 mr-1 text-red-500" /> {formattedSpecialties}
            </div>
          )}

          {hospital.description && (
            <p className="description text-gray-700 line-clamp-3 mt-2">{hospital.description}</p>
          )}
        </div>
        <div className="px-5 pb-4 pt-2">
          <Link href={`/hospitals/${hospital._id}`}>
            <Button variant="outline" size="sm" className="w-full">View Details</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <main className="min-h-screen">
      <Banner
        topSpanText="Top Healthcare Providers"
        title="Leading Hospitals and Facilities"
        description="Explore our curated network of world-class hospitals, known for their advanced technology, expert teams, and comprehensive care."
        buttonText="View Hospitals"
        buttonLink="#hospital-gallery"
        mainImageSrc="/placeholder-hospital.png"
        mainImageAlt="Leading Hospitals"
      />

      <section className="bg-gray-50 px-2 md:px-0 py-10" id="hospital-gallery">
        <div className="container mx-auto px-4 py-4 md:py-10 flex flex-col md:flex-row gap-6">
          
          {/* Filter Sidebar */}
          <div className="md:w-1/4">
            <Card className="p-4 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* City Filter - CONVERTED TO SELECT */}
                <div>
                  <Label htmlFor="city-filter" className="text-sm font-medium">City</Label>
                  <select
                    id="city-filter"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Tailwind classes for 'Input' look
                  >
                    <option value="">All Cities</option>
                    {availableFilters.cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {availableFilters.cities.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No cities available (Check '{CITY_COLLECTION_ID}' collection).</p>
                  )}
                </div>

                {/* State Filter - CONVERTED TO SELECT */}
                <div>
                  <Label htmlFor="state-filter" className="text-sm font-medium">State</Label>
                  <select
                    id="state-filter"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">All States</option>
                    {availableFilters.states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {availableFilters.states.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No states available (Check '{STATE_COLLECTION_ID}' collection).</p>
                  )}
                </div>

                {/* Country Filter - CONVERTED TO SELECT */}
                <div>
                  <Label htmlFor="country-filter" className="text-sm font-medium">Country</Label>
                  <select
                    id="country-filter"
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">All Countries</option>
                    {availableFilters.countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {availableFilters.countries.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No countries available (Check '{COUNTRY_COLLECTION_ID}' collection).</p>
                  )}
                </div>

                {/* Specialties Filter (unchanged) */}
                <div>
                  <Label className="text-sm font-medium">Specialties</Label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {availableFilters.specialties.map(specialty => (
                      <div key={specialty} className="flex items-center">
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={filters.specialties.has(specialty)}
                          onCheckedChange={(checked) => handleSpecialtyChange(specialty, checked as boolean)}
                        />
                        <Label htmlFor={`specialty-${specialty}`} className="ml-2 text-sm">{specialty}</Label>
                      </div>
                    ))}
                    {availableFilters.specialties.length === 0 && (
                      <p className="text-sm text-gray-500">No specialties found.</p>
                    )}
                  </div>
                </div>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFilters({ city: "", state: "", country: "", specialties: new Set() });
                    setSearchQuery(""); // Clear search as well
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            
            {/* General Search Bar (NEW) */}
            <div className="relative mb-6">
              <Input
                type="text"
                placeholder="Search Hospital Name, Specialty, or Location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-lg border-2 border-primary/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            </div>

            {error && (
              <Card className="mb-8 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Connection Issue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700 mb-4">{error}</p>
                  <Button onClick={loadInitialData} variant="outline" className="border-red-300 text-red-700 bg-transparent">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}
              </div>
            )}

            {!loading && (
              <>
                {filteredHospitals.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Hospitals Found</h3>
                      <p className="text-gray-500 mb-4">No hospitals match your search or filters.</p>
                      <Button 
                        onClick={() => {
                          setSearchQuery(""); 
                          setFilters({ city: "", state: "", country: "", specialties: new Set() }); 
                        }} 
                        variant="outline"
                      >
                        Clear Search & Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                      {filteredHospitals.map(hospital => <HospitalCard key={hospital._id} hospital={hospital} />)}
                    </div>

                    {hasMore && (
                      <div ref={loadMoreRef} className="text-center pt-8">
                        <Button
                          onClick={loadMore}
                          disabled={loadingMore}
                          className="bg-gradient-to-r from-blue-500 to-teal-600 text-white px-8 py-3 hover:from-blue-600 hover:to-teal-700 transition-all duration-300"
                        >
                          {loadingMore ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading More...</> : <>Load More Hospitals</>}
                        </Button>
                      </div>
                    )}

                    {!hasMore && filteredHospitals.length > ITEMS_PER_PAGE && (
                      <div className="text-center pt-8">
                        <p className="text-gray-500 text-sm">🎉 You've seen all matching hospitals!</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
      <CtaSection />
    </main>
  )
}