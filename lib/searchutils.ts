import { SearchableItem, FilterState } from "@/types/searchtype"

export function filterAndSortData(allData: SearchableItem[] | null, filters: FilterState): SearchableItem[] | null {
  if (!allData) return null

  let filtered = allData.filter(item => {
    if (filters.type !== "all" && item.type !== filters.type) return false

    // Search filter
    const searchLower = filters.searchQuery.toLowerCase()
    const matchesSearch =
      (item.type === "doctor" && (item as any).name?.toLowerCase().includes(searchLower)) ||
      (item.type === "hospital" && (item as any).Name?.toLowerCase().includes(searchLower)) ||
      (item.type === "treatment" && (item as any).name?.toLowerCase().includes(searchLower))

    // Specialty filter
    const matchesSpecialties = filters.specialties.length === 0 ||
      (item.type === "doctor" && filters.specialties.some(spec =>
        (item as any).specialty?.toLowerCase().includes(spec.toLowerCase()))) ||
      (item.type === "hospital" && (item as any).department1Name.some((dept: string) =>
        filters.specialties.includes(dept))) ||
      (item.type === "treatment" && filters.specialties.some(spec =>
        (item as any).department?.toLowerCase().includes(spec.toLowerCase())))

    // Language filter
    const matchesLanguages = filters.languages.length === 0 ||
      (item.type === "doctor" && (item as any).languages?.some((lang: string) =>
        filters.languages.includes(lang)))

    // Price filter
    const matchesPrice = item.type !== "treatment" ||
      ((item as any).priceRangeMin >= filters.priceRange.min &&
        (item as any).priceRangeMax <= filters.priceRange.max)

    // Hospital type filter
    const matchesHospitalType = item.type !== "hospital" ||
      filters.hospitalType === "all" ||
      (filters.hospitalType === "multi-specialty" && (item as any).department1Name?.length > 1) ||
      (filters.hospitalType === "single-specialty" && (item as any).department1Name?.length <= 1)

    // Rating filter
    const matchesRating = item.type !== "hospital" ||
      (item as any).Rating >= filters.minRating

    return matchesSearch && matchesSpecialties && matchesLanguages && matchesPrice &&
      matchesHospitalType && matchesRating
  })

  // Sort data
  switch (filters.sortBy) {
    case "rating":
      filtered.sort((a, b) => {
        const aRating = a.type === "hospital" ? (a as any).Rating : 0
        const bRating = b.type === "hospital" ? (b as any).Rating : 0
        return bRating - aRating
      })
      break
    case "name":
      filtered.sort((a, b) => {
        const aName = a.type === "doctor" ? (a as any).name :
          a.type === "hospital" ? (a as any).Name : (a as any).name
        const bName = b.type === "doctor" ? (b as any).name :
          b.type === "hospital" ? (b as any).Name : (b as any).name
        return aName.localeCompare(bName)
      })
      break
    case "experience":
      filtered.sort((a, b) => {
        const aExp = a.type === "doctor" ? parseInt((a as any).experience || "0") : 0
        const bExp = b.type === "doctor" ? parseInt((b as any).experience || "0") : 0
        return bExp - aExp
      })
      break
    default:
      // Relevance sorting (default)
      break
  }

  return filtered
}

export function extractUniqueValues(allData: SearchableItem[] | null, type: 'specialties' | 'languages'): string[] {
  if (!allData) return []
  
  const uniqueValues = new Set<string>()
  
  allData.forEach(item => {
    if (type === 'specialties') {
      if (item.type === "doctor" && item.specialty) {
        uniqueValues.add(item.specialty)
      } else if (item.type === "hospital" && Array.isArray((item as any).department1Name)) {
        (item as any).department1Name.forEach((dept: string) => uniqueValues.add(dept))
      } else if (item.type === "treatment" && (item as any).department) {
        uniqueValues.add((item as any).department)
      }
    } else if (type === 'languages') {
      if (item.type === "doctor" && item.languages) {
        item.languages.forEach((lang: string) => uniqueValues.add(lang))
      }
    }
  })
  
  return Array.from(uniqueValues).sort()
}