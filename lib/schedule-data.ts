export type CountryKey = "PNG" | "Solomon" | "Vanuatu" | "Fiji"

export type CountrySchedule = {
  key: CountryKey
  countryName: string
  cityLabel: string
  dates: string[] // ISO 'YYYY-MM-DD'
  flagQuery: string // used with /placeholder.svg
}

// Nov 18–26, 2025
export const SCHEDULE: CountrySchedule[] = [
  {
    key: "PNG",
    countryName: "Papua New Guinea",
    cityLabel: "Port Moresby",
    dates: ["2025-11-18", "2025-11-19"],
    flagQuery: "Flag of Papua New Guinea",
  },
  {
    key: "Solomon",
    countryName: "Solomon Islands",
    cityLabel: "Honiara",
    dates: ["2025-11-20", "2025-11-21"],
    flagQuery: "Flag of Solomon Islands",
  },
  {
    key: "Vanuatu",
    countryName: "Vanuatu",
    cityLabel: "Port Vila",
    dates: ["2025-11-23", "2025-11-24"],
    flagQuery: "Flag of Vanuatu",
  },
  {
    key: "Fiji",
    countryName: "Fiji",
    cityLabel: "Lautoka & Suva",
    dates: ["2025-11-25", "2025-11-26"],
    flagQuery: "Flag of Fiji",
  },
]

// 30-min slots: 09:00–12:00 and 14:00–17:00
export function generateSlots(): string[] {
  const mk = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  const seg = (startH: number, endH: number) => {
    const out: string[] = []
    for (let h = startH; h < endH; h++) {
      out.push(mk(h, 0), mk(h, 30))
    }
    return out
  }
  return [...seg(9, 12), ...seg(14, 17)]
}

export function getCountryByKey(key: CountryKey) {
  return SCHEDULE.find((c) => c.key === key)
}

export function getAllCountries() {
  return SCHEDULE
}

export function getDatesForCountry(key: CountryKey) {
  return getCountryByKey(key)?.dates ?? []
}

export function getSlotsForDate(_key: CountryKey, _isoDate: string) {
  // In this basic version, all dates share the same template of slots.
  return generateSlots()
}
