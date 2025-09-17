"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, MapPin, Star, Clock, Phone, Calendar, Filter, Hospital, Stethoscope, Pill, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { db } from "@/lib/facilities-data"

type SearchType = "all" | "hospitals" | "doctors" | "treatments"

interface SearchFilters {
    location: string
    department: string
    minRating: number
    priceRange: [number, number]
    facilities: string[]
}

export function HealthcareSearch() {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchType, setSearchType] = useState<SearchType>("all")
    const [filters, setFilters] = useState<SearchFilters>({
        location: "Any location",
        department: "Any department",
        minRating: 0,
        priceRange: [0, 300000],
        facilities: [],
    })

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const locations = Array.from(new Set(db.branches.map((branch) => branch.city)))
        const departments = Array.from(new Set(db.hospitals.flatMap((hospital) => hospital.departments)))
        const facilities = Array.from(new Set(db.hospitals.flatMap((hospital) => hospital.facilities)))

        return { locations, departments, facilities }
    }, [])

    // Search and filter logic
    const searchResults = useMemo(() => {
        const results: any[] = []

        // Search hospitals
        if (searchType === "all" || searchType === "hospitals") {
            const hospitalResults = db.hospitals
                .filter((hospital) => {
                    const matchesQuery =
                        !searchQuery ||
                        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        hospital.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        hospital.departments.some((dept) => dept.toLowerCase().includes(searchQuery.toLowerCase()))

                    const matchesRating = hospital.rating >= filters.minRating
                    const matchesDepartment =
                        filters.department === "Any department" || hospital.departments.includes(filters.department)

                    // Check location through branches
                    const matchesLocation =
                        filters.location === "Any location" ||
                        db.branches.some((branch) => branch.hospitalId === hospital.id && branch.city === filters.location)

                    const matchesFacilities =
                        filters.facilities.length === 0 ||
                        filters.facilities.every((facility) => hospital.facilities.includes(facility))

                    return matchesQuery && matchesRating && matchesDepartment && matchesLocation && matchesFacilities
                })
                .map((hospital) => ({ ...hospital, type: "hospital" }))

            results.push(...hospitalResults)
        }

        // Search doctors
        if (searchType === "all" || searchType === "doctors") {
            const doctorResults = db.doctors
                .filter((doctor) => {
                    const matchesQuery =
                        !searchQuery ||
                        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doctor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doctor.specialties.some((spec) => spec.toLowerCase().includes(searchQuery.toLowerCase()))

                    const matchesRating = doctor.rating >= filters.minRating

                    // Check location through affiliations
                    const matchesLocation =
                        filters.location === "Any location" ||
                        doctor.affiliations.some((branchId) => {
                            const branch = db.branches.find((b) => b.id === branchId)
                            return branch?.city === filters.location
                        })

                    return matchesQuery && matchesRating && matchesLocation
                })
                .map((doctor) => ({ ...doctor, type: "doctor" }))

            results.push(...doctorResults)
        }

        // Search treatments
        if (searchType === "all" || searchType === "treatments") {
            const treatmentResults = db.treatments
                .filter((treatment) => {
                    const matchesQuery =
                        !searchQuery ||
                        treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        treatment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        treatment.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

                    const matchesDepartment =
                        filters.department === "Any department" || treatment.department === filters.department
                    const matchesPrice =
                        treatment.starting_price >= filters.priceRange[0] && treatment.starting_price <= filters.priceRange[1]

                    // Check location through available branches
                    const matchesLocation =
                        filters.location === "Any location" ||
                        treatment.branches_available.some((branchId) => {
                            const branch = db.branches.find((b) => b.id === branchId)
                            return branch?.city === filters.location
                        })

                    return matchesQuery && matchesDepartment && matchesPrice && matchesLocation
                })
                .map((treatment) => ({ ...treatment, type: "treatment" }))

            results.push(...treatmentResults)
        }

        return results
    }, [searchQuery, searchType, filters])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price)
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-gray-900 text-gray-900" : "text-gray-300"}`}
            />
        ))
    }

    const createSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
    }

    const renderResultCard = (result: any) => {
        const getBranchInfo = (branchIds: string[]) => {
            if (!branchIds?.length) return null
            const branch = db.branches.find((b) => branchIds.includes(b.id))
            return branch
        }

        switch (result.type) {
            case "hospital":
                const hospitalBranch = getBranchInfo(result.branches)
                return (
                    <Card key={result.id} className="bg-white border-gray-200 hover:shadow-xs transition-shadow duration-200 rounded-xs overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <Hospital className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-gray-900">{result.name}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">{result.tagline}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {renderStars(result.rating)}
                                    <span className="ml-1 text-sm font-medium text-gray-700">{result.rating}</span>
                                    <span className="text-xs text-gray-400">({result.reviewCount})</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed">{result.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {result.departments.slice(0, 3).map((dept: string) => (
                                    <Badge key={dept} variant="secondary" className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full border-transparent">
                                        {dept}
                                    </Badge>
                                ))}
                                {result.departments.length > 3 && (
                                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300 px-3 py-1 rounded-full">
                                        +{result.departments.length - 3} more
                                    </Badge>
                                )}
                            </div>
                            {hospitalBranch && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>
                                        {hospitalBranch.city}, {hospitalBranch.state}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>24x7 Emergency</span>
                                    </div>
                                    {hospitalBranch && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span>{hospitalBranch.phone}</span>
                                        </div>
                                    )}
                                </div>
                                <Link href={`/hospital/${createSlug(result.name)}`}>
                                    <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-700 transition-colors rounded-full px-6 py-2 text-sm">
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )

            case "doctor":
                const doctorBranch = getBranchInfo(result.affiliations)
                return (
                    <Card key={result.id} className="bg-white border-gray-200 hover:shadow-xs transition-shadow duration-200 rounded-xs overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <Stethoscope className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-gray-900">{result.name}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">{result.title}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {renderStars(result.rating)}
                                    <span className="ml-1 text-sm font-medium text-gray-700">{result.rating}</span>
                                    <span className="text-xs text-gray-400">({result.reviewCount})</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed">{result.about}</p>
                            <div className="flex flex-wrap gap-2">
                                {result.specialties.map((specialty: string) => (
                                    <Badge key={specialty} variant="secondary" className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full border-transparent">
                                        {specialty}
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{result.experienceYears} years experience</span>
                                {doctorBranch && (
                                    <>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span>{doctorBranch.city}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="text-sm">
                                    <span className="text-gray-500">Languages: </span>
                                    <span className="font-medium text-gray-800">{result.languages.join(", ")}</span>
                                </div>
                                <Link href={`/doctor/${createSlug(result.name)}`}>
                                    <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-700 transition-colors rounded-full px-6 py-2 text-sm">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Book Appointment
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )

            case "treatment":
                const treatmentBranch = getBranchInfo(result.branches_available)
                return (
                    <Card key={result.id} className="bg-white border-gray-200 hover:shadow-xs transition-shadow duration-200 rounded-xs overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <Pill className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-gray-900">{result.name}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">{result.department}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-semibold text-gray-900">{formatPrice(result.starting_price)}</div>
                                    <div className="text-xs text-gray-500">Starting from</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed">{result.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {result.tags.map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-xs text-gray-500 border-gray-300 px-3 py-1 rounded-full">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{result.duration_minutes} minutes</span>
                                </div>
                                {treatmentBranch && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{treatmentBranch.city}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="text-sm">
                                    <span className="text-gray-500">Price range: </span>
                                    <span className="font-medium text-gray-800">
                                        {formatPrice(result.price_range.min)} - {formatPrice(result.price_range.max)}
                                    </span>
                                </div>
                                <Link href={`/treatment/${createSlug(result.name)}`}>
                                    <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-700 transition-colors rounded-full px-6 py-2 text-sm">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )

            default:
                return null
        }
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-12 bg-white">
            {/* Header */}
            <div className="text-center my-10">
                <h1 className="heading-lg  mb-0">Find the Best Healthcare Services</h1>
                <p className="description md:w-1/2 mx-auto">
                    Search for hospitals, doctors, and treatments near you. Get the care you deserve with trusted healthcare
                    providers.
                </p>
            </div>

            {/* Search Bar */}
            <div className="bg-gray-50 p-4 rounded-xs mb-6 shadow-xs border border-gray-100">
                <div className="flex flex-col lg:flex-row items-center gap-4">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Search for hospitals, doctors, or treatments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-14 text-base bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-400 rounded-full shadow-inner"
                        />
                    </div>
                    <Select value={searchType} onValueChange={(value: SearchType) => setSearchType(value)}>
                        <SelectTrigger className="w-full lg:w-48 h-14 bg-white border-gray-200 rounded-full shadow-inner text-gray-700">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 rounded-xl shadow-lg">
                            <SelectItem value="all">All Results</SelectItem>
                            <SelectItem value="hospitals">Hospitals</SelectItem>
                            <SelectItem value="doctors">Doctors</SelectItem>
                            <SelectItem value="treatments">Treatments</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">

                <div className="w-full lg:w-72 flex-shrink-0">
                    <Card className="sticky top-4 bg-white border-gray-200 shadow-xs rounded-xs">
                        <CardHeader className="pb-3 border-b border-gray-200 px-4">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                <Filter className="w-4 h-4 text-gray-700" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4">
                            {/* Location Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Location</label>
                                <Select
                                    value={filters.location}
                                    onValueChange={(value) => setFilters((prev) => ({ ...prev, location: value }))}
                                >
                                    <SelectTrigger className="border-gray-200 mt-1 rounded-lg h-10 text-gray-700">
                                        <SelectValue placeholder="Any location" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200 rounded-xs mt-1 shadow-lg">
                                        <SelectItem value="Any location">Any location</SelectItem>
                                        {filterOptions.locations.map((location) => (
                                            <SelectItem key={location} value={location}>
                                                {location}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Department Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Department</label>
                                <Select
                                    value={filters.department}
                                    onValueChange={(value) => setFilters((prev) => ({ ...prev, department: value }))}
                                >
                                    <SelectTrigger className="border-gray-200 rounded-xs mt-1 h-10 text-gray-700">
                                        <SelectValue placeholder="Any department" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200 rounded-xs mt-1 shadow-lg">
                                        <SelectItem value="Any department">Any department</SelectItem>
                                        {filterOptions.departments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Rating Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Min. Rating: <span className="font-bold text-gray-900">{filters.minRating}</span>
                                </label>
                                <Slider
                                    value={[filters.minRating]}
                                    onValueChange={([value]) => setFilters((prev) => ({ ...prev, minRating: value }))}
                                    max={5}
                                    min={0}
                                    step={0.5}
                                    className="bg-gray-200 mt-2 h-1"

                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0</span>
                                    <span>5</span>
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Price Range:{" "}
                                    <span className="font-bold text-gray-900">
                                        {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
                                    </span>
                                </label>
                                <Slider
                                    value={filters.priceRange}
                                    onValueChange={(value) => setFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))}
                                    max={300000}
                                    min={0}
                                    step={10000}
                                    className="bg-gray-200 mt-2 h-1"

                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{formatPrice(0)}</span>
                                    <span>{formatPrice(300000)}</span>
                                </div>
                            </div>

                            {/* Facilities Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Facilities</label>
                                <div className="space-y-3 max-h-48 overflow-y-auto mt-2 pr-2">
                                    {filterOptions.facilities.map((facility) => (
                                        <div key={facility} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={facility}
                                                checked={filters.facilities.includes(facility)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            facilities: [...prev.facilities, facility],
                                                        }));
                                                    } else {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            facilities: prev.facilities.filter((f) => f !== facility),
                                                        }));
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                                            />
                                            <label htmlFor={facility} className="text-sm text-gray-700 cursor-pointer font-normal">
                                                {facility}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setFilters({
                                        location: "Any location",
                                        department: "Any department",
                                        minRating: 0,
                                        priceRange: [0, 300000],
                                        facilities: [],
                                    })
                                }
                                className="w-full text-gray-700 border-gray-200 hover:bg-gray-100 transition-colors rounded-full h-10 text-xs"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Clear All Filters
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Results Header */}
                    <div className="my-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <h2 className="title-heading">Search Results ({searchResults.length})</h2>
                        <Tabs value={searchType} onValueChange={(value: SearchType) => setSearchType(value)} className="w-full md:w-auto">
                            <TabsList className="bg-gray-100 rounded-full p-1">
                                <TabsTrigger value="all" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold">All</TabsTrigger>
                                <TabsTrigger value="hospitals" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold">Hospitals</TabsTrigger>
                                <TabsTrigger value="doctors" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold">Doctors</TabsTrigger>
                                <TabsTrigger value="treatments" className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold">Treatments</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Results Grid */}
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                        {searchResults.length > 0 ? (
                            searchResults.map(renderResultCard)
                        ) : (
                            <Card className="p-10 text-center col-span-full bg-white border-gray-200 rounded-xs shadow-xs">
                                <div className="text-gray-500">
                                    <Search className="w-16 h-16 mx-auto mb-6 opacity-30" />
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                                    <p className="text-gray-600">Try adjusting your search terms or filters to find what you're looking for.</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}