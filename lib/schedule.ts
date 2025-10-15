export type LocationId = "png" | "slb" | "vut" | "fji-ltk" | "fji-suv"

export type ScheduleLocation = {
  id: LocationId
  label: string
  country: string
  city: string
  dates: string[] // ISO yyyy-mm-dd
  feeLabel: string
  localContact?: string
}

export const MEETING_FEE = "25 USD / 100 PGK / 200 SBD / 2500 Vatu / 50 FJD"

export const schedule: ScheduleLocation[] = [
  {
    id: "png",
    label: "PNG (Port Moresby)",
    country: "Papua New Guinea",
    city: "Port Moresby",
    dates: ["2025-11-18", "2025-11-19"],
    feeLabel: MEETING_FEE,
    localContact: "Shirley Waira: 74376546",
  },
  {
    id: "slb",
    label: "Solomon Islands (Honiara)",
    country: "Solomon Islands",
    city: "Honiara",
    dates: ["2025-11-20", "2025-11-21"],
    feeLabel: MEETING_FEE,
    localContact: "Freda Sofu: 7618955",
  },
  {
    id: "vut",
    label: "Vanuatu (Port Vila)",
    country: "Vanuatu",
    city: "Port Vila",
    dates: ["2025-11-23", "2025-11-24"],
    feeLabel: MEETING_FEE,
    localContact: "Mary Semeno: 7627430 / 5213197",
  },
  {
    id: "fji-ltk",
    label: "Fiji (Lautoka)",
    country: "Fiji",
    city: "Lautoka",
    dates: ["2025-11-25"],
    feeLabel: MEETING_FEE,
    localContact: "Ashlin Chandra (Lautoka): 9470527",
  },
  {
    id: "fji-suv",
    label: "Fiji (Suva)",
    country: "Fiji",
    city: "Suva",
    dates: ["2025-11-26"],
    feeLabel: MEETING_FEE,
    localContact: "Reshmi Kumar (Suva): 9470588",
  },
]

// 30–45 minute appointment slots; adjust as needed.
// Use 24h to avoid locale confusion; UI will display friendly format.
export const TIME_SLOTS_24H = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] as const

export function formatDateFriendly(iso: string) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function formatTimeFriendly(t24: string) {
  const [h, m] = t24.split(":").map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}
