// schedule.ts
export type LocationId = "png" | "slb" | "vut" | "fji"

export type ScheduleLocation = {
  id: LocationId
  label: string
  country: string
  city: string
  dates: string[] // ISO yyyy-mm-dd
  times: string[] // Time ranges like ["9 AM to 6 PM"]
  venues: string[] // Venue names
  feeLabel: string
  localContact?: string
  availableSlots?: TimeSlot[][] // 2D array: dates[index] -> slots for that date
}

export type TimeSlot = {
  time: string // Format: "HH:MM"
  displayTime: string // Format: "9:00 AM to 10:00 AM"
  isAvailable: boolean
}

export const schedule: ScheduleLocation[] = [
  {
    id: "png",
    label: "Papua New Guinea ",
    country: "Papua New Guinea",
    city: "Port Moresby",
    dates: ["2025-11-18", "2025-11-19"],
    times: ["2 PM to 6 PM", "9 AM to 6 PM"],
    venues: ["Hotel Crown", "Hotel Crown"],
    feeLabel: "100 PGK / 25 USD",
    localContact: "Shirley Waira: 74376546",
    availableSlots: [
      [
        { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: false },
        { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: false },
        { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: false },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true }
      ],
      [
        { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
        { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: true },
        { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: false },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true }
      ]
    ]
  },
  {
    id: "slb",
    label: "Solomon Islands ",
    country: "Solomon Islands",
    city: "Honiara",
    dates: ["2025-11-20", "2025-11-21"],
    times: ["2 PM to 6 PM", "9 AM to 6 PM"],
    venues: ["Hotel Grace", "Hotel Grace"],
    feeLabel: "200 SBD / 25 USD",
    localContact: "Freda Sofu: 7618955",
    availableSlots: [
      [
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true }
      ],
      [
        { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
        { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: false },
        { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true }
      ]
    ]
  },
  {
    id: "vut",
    label: "Vanuatu ",
    country: "Vanuatu",
    city: "Port Vila",
    dates: ["2025-11-23", "2025-11-24"],
    times: ["9 AM to 6 PM", "9 AM to 1 PM"],
    venues: ["Hotel Golden Port", "Hotel Golden Port"],
    feeLabel: "2500 Vatu / 25 USD",
    localContact: "Mary Semeno: 7627430 / 5213197",
    availableSlots: [
      [
        { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
        { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: true },
        { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: false },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true }
      ],
      [
        { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
        { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: true },
        { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true }
      ]
    ]
  },
  {
    id: "fji",
    label: "Fiji ",
    country: "Fiji",
    city: "Suva & Lautoka",
    dates: ["2025-11-25", "2025-11-26"],
    times: ["9 AM to 6 PM", "9 AM to 6 PM"],
    venues: ["Suva Office", "Lautoka Office"],
    feeLabel: "50 FJD / 25 USD",
    localContact: "Suva: Reshmi Kumar (9470588), Lautoka: Ashlin Chandra (9470527)",
    availableSlots: [
      [
        { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
        { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: true },
        { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: false }
      ],
      [
        { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
        { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: false },
        { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true }
      ]
    ]
  },
]

// Default time slots structure
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
  { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: true },
  { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
  { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
  { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
  { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true }
]

export function formatDateFriendly(iso: string) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTimeFriendly(t24: string) {
  const [h, m] = t24.split(":").map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

// Helper to format date with time and venue
export function formatScheduleDetails(location: ScheduleLocation): string[] {
  return location.dates.map((date, index) => {
    const formattedDate = formatDateFriendly(date)
    const time = location.times[index] || ""
    const venue = location.venues[index] || ""

    if (time && venue) {
      return `${formattedDate}, ${time}, ${venue}`
    } else if (time) {
      return `${formattedDate}, ${time}`
    } else if (venue) {
      return `${formattedDate}, ${venue}`
    }
    return formattedDate
  })
}

// Helper function to map location IDs to flag emojis
export function getFlagEmoji(locationId: LocationId): string {
  const flags: Record<LocationId, string> = {
    png: "🇵🇬",
    slb: "🇸🇧",
    vut: "🇻🇺",
    fji: "🇫🇯",
  }
  return flags[locationId] || "🏳️"
}

// Helper to get location by ID
export function getLocationById(id: LocationId): ScheduleLocation | undefined {
  return schedule.find((loc) => loc.id === id)
}

// Helper to get all location IDs for form
export function getAllLocationIds(): LocationId[] {
  return schedule.map((loc) => loc.id)
}

// Helper to get available time slots for a specific date index
export function getTimeSlotsForDate(location: ScheduleLocation, dateIndex: number): TimeSlot[] {
  if (location.availableSlots && location.availableSlots[dateIndex]) {
    return location.availableSlots[dateIndex].filter(slot => slot.isAvailable)
  }
  
  // Fallback to default time slots if none specified
  return DEFAULT_TIME_SLOTS.filter(slot => slot.isAvailable)
}

// Helper to check if a specific time slot is available
export function isTimeSlotAvailable(location: ScheduleLocation, dateIndex: number, time: string): boolean {
  const slots = getTimeSlotsForDate(location, dateIndex)
  return slots.some(slot => slot.time === time && slot.isAvailable)
}