import { useState, useMemo } from "react"
import { SearchableItem, FilterState } from "@/types/searchtype"
import { filterAndSortData, extractUniqueValues } from "@/lib/searchUtils"

const initialFilters: FilterState = {
  searchQuery: "",
  locationQuery: "",
  specialties: [],
  languages: [],
  type: "hospital",
  priceRange: { min: 0, max: 100000 },
  hospitalType: "all",
  minRating: 0,
  experienceRange: { min: 0, max: 50 },
  sortBy: "relevance"
}

export function useSearchFilters(allData: SearchableItem[] | null) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const filteredData = useMemo(() => {
    return filterAndSortData(allData, filters)
  }, [allData, filters])

  const uniqueSpecialties = useMemo(() => {
    return extractUniqueValues(allData, 'specialties')
  }, [allData])

  const uniqueLanguages = useMemo(() => {
    return extractUniqueValues(allData, 'languages')
  }, [allData])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }))
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, locationQuery: e.target.value }))
  }

  const handleTypeChange = (value: "all" | "doctor" | "hospital" | "treatment") => {
    setFilters(prev => ({ ...prev, type: value }))
  }

  const handleFilterToggle = (filterType: "specialties" | "languages", value: string, checked: boolean) => {
    setFilters(prev => {
      const currentFilters = prev[filterType]
      return {
        ...prev,
        [filterType]: checked ? [...currentFilters, value] : currentFilters.filter(item => item !== value),
      }
    })
  }

  const handlePriceChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min: values[0], max: values[1] },
    }))
  }

  const handleHospitalTypeChange = (value: "all" | "multi-specialty" | "single-specialty") => {
    setFilters(prev => ({
      ...prev,
      hospitalType: value,
    }))
  }

  const handleRatingChange = (value: number) => {
    setFilters(prev => ({
      ...prev,
      minRating: value,
    }))
  }

  const handleSortChange = (value: "relevance" | "rating" | "name" | "experience") => {
    setFilters(prev => ({ ...prev, sortBy: value }))
  }

  const clearAllFilters = () => {
    setFilters(initialFilters)
  }

  return {
    filters,
    filteredData,
    uniqueSpecialties,
    uniqueLanguages,
    handleSearchChange,
    handleLocationChange,
    handleTypeChange,
    handleFilterToggle,
    handlePriceChange,
    handleHospitalTypeChange,
    handleRatingChange,
    handleSortChange,
    clearAllFilters
  }
}