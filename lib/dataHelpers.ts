import type { Hospital, HospitalBranch } from "@/types/hospital"

// Utility functions for data normalization and extraction
export function normalize(value?: string | null): string {
  return (value || "").toLowerCase().trim()
}

export function toTitle(value: any): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (Array.isArray(value)) {
    for (const item of value) {
      const title = toTitle(item)
      if (title) return title
    }
    return ""
  }
  // Handle object with various title properties
  if (typeof value === "object") {
    const titleFields = ["title", "name", "label", "countryName", "stateName", "cityName", "hospitalName"]
    for (const field of titleFields) {
      if (value[field] && typeof value[field] === "string") {
        return value[field]
      }
    }
  }
  return ""
}

export function extractStateFromCity(city: any): string {
  if (!city || typeof city !== "object") return ""

  const stateKeys = ["state", "stateRef", "state_ref", "state_city"]
  for (const key of stateKeys) {
    if (key in city) {
      const stateValue = city[key]
      const title = toTitle(stateValue)
      if (title) return title
    }
  }
  return ""
}

export function extractCountryFromCity(city: any): string {
  if (!city || typeof city !== "object") return ""

  // Check direct country references on city
  const countryKeys = ["country", "countryRef", "country_ref", "country_state", "country_of_state"]
  for (const key of countryKeys) {
    if (key in city) {
      const countryValue = city[key]
      const title = toTitle(countryValue)
      if (title) return title
    }
  }

  // Check nested state's country references
  if (city.state && typeof city.state === "object") {
    for (const key of countryKeys) {
      if (key in city.state) {
        const countryValue = city.state[key]
        const title = toTitle(countryValue)
        if (title) return title
      }
    }
  }

  return ""
}

export function extractLocationFromBranch(cities: any[]): {
  city: string
  state: string
  country: string
} {
  if (!Array.isArray(cities) || cities.length === 0) {
    return { city: "", state: "", country: "" }
  }

  const firstCity = cities[0]
  return {
    city: toTitle(firstCity),
    state: extractStateFromCity(firstCity),
    country: extractCountryFromCity(firstCity),
  }
}

export function matchesFilters(
  hospital: Hospital,
  derivedLocation: { city: string; state: string; country: string },
  filters: {
    search?: string
    city?: string
    state?: string
    country?: string
    specialty?: string
  },
): boolean {
  const name = normalize(hospital.name)
  const city = normalize(hospital.city || derivedLocation.city)
  const state = normalize(hospital.state || derivedLocation.state)
  const country = normalize(hospital.country || derivedLocation.country)

  const search = normalize(filters.search)
  const specialty = normalize(filters.specialty)
  const specialties = (hospital.specialtiesTags || []).map((tag) => normalize(tag))

  // Search filter check
  const searchOk =
    !search ||
    name.includes(search) ||
    city.includes(search) ||
    state.includes(search) ||
    country.includes(search) ||
    specialties.some((s) => s.includes(search))

  // Exact filters check
  const cityOk = !filters.city || city === normalize(filters.city)
  const stateOk = !filters.state || state === normalize(filters.state)
  const countryOk = !filters.country || country === normalize(filters.country)
  const specialtyOk = !filters.specialty || specialties.includes(specialty)

  return searchOk && cityOk && stateOk && countryOk && specialtyOk
}

export function collectFilterOptions(branches: HospitalBranch[]) {
  const countries = new Set<string>()
  const states = new Set<string>()
  const cities = new Set<string>()
  const specialties = new Set<string>()

  for (const branch of branches) {
    // Extract location data from branch cities
    for (const city of branch.city_branches || []) {
      const cityTitle = toTitle(city)
      if (cityTitle) cities.add(cityTitle)

      const stateTitle = extractStateFromCity(city)
      if (stateTitle) states.add(stateTitle)

      const countryTitle = extractCountryFromCity(city)
      if (countryTitle) countries.add(countryTitle)
    }

    // Extract specialties from hospitals
    for (const hospital of branch.hospitalList_branches || []) {
      for (const tag of hospital.specialtiesTags || []) {
        if (tag) specialties.add(tag)
      }
    }
  }

  return {
    countries: Array.from(countries).sort(),
    states: Array.from(states).sort(),
    cities: Array.from(cities).sort(),
    specialties: Array.from(specialties).sort(),
  }
}
