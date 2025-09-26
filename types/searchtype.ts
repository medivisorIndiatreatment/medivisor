import { NextResponse } from "next/server"

const COLLECTION_ID_DOCTOR = "Import2"
const COLLECTION_ID_HOSPITAL = "Hospital"
const COLLECTION_ID_TREATMENT = "TreatmentAngioplastyPci"

// NOTE: Replace these with real Wix REST calls when credentials are available.
// For now, keep structure ready and return [] if envs are missing.
async function fetchCollectionAll(collectionId: string): Promise<any[]> {
  const apiKey = process.env.WIX_API_KEY
  const siteId = process.env.WIX_SITE_ID
  // Debug logs
  console.log("[v0] fetchCollectionAll start:", { collectionId, hasApiKey: !!apiKey, hasSiteId: !!siteId })

  if (!apiKey || !siteId) {
    console.log("[v0] Missing WIX_API_KEY or WIX_SITE_ID. Returning empty array for", collectionId)
    return []
  }

  // Example placeholder pagination loop. Replace with Wix Data REST calls.
  const all: any[] = []
  let page = 0
  const pageSize = 100
  // In real Wix REST: you would call their query endpoint with cursor/skip until done.
  // This is a placeholder loop to illustrate paging structure.
  while (page < 1) {
    // Replace with real fetch
    // const res = await fetch(...)
    // const { items, paging } = await res.json()
    const items: any[] = [] // placeholder
    all.push(...items)
    page += 1
    if (items.length < pageSize) break
  }

  console.log("[v0] fetchCollectionAll done:", { collectionId, count: all.length })
  return all
}

function formatStringToArray(data: string[] | string | null | undefined): string[] {
  if (!data) return []
  if (Array.isArray(data)) return data.map((item) => String(item).trim())
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data.replace(/'/g, '"'))
      if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim())
    } catch {
      return data.split(",").map((item) => item.trim())
    }
  }
  return []
}

function parseSocialLinks(data: string | null | undefined): Record<string, string> {
  if (!data || typeof data !== "string") return {}
  try {
    const parsed = JSON.parse(data.replace(/'/g, '"'))
    if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, string>
  } catch {}
  return {}
}

function parseFaqs(data: string | null | undefined): { question: string; answer: string }[] {
  if (!data || typeof data !== "string") return []
  try {
    return JSON.parse(data)
  } catch {}
  return []
}

export async function GET() {
  try {
    const [doctorsRaw, hospitalsRaw, treatmentsRaw] = await Promise.all([
      fetchCollectionAll(COLLECTION_ID_DOCTOR),
      fetchCollectionAll(COLLECTION_ID_HOSPITAL),
      fetchCollectionAll(COLLECTION_ID_TREATMENT),
    ])

    const doctors = (doctorsRaw || []).map((item: any) => ({
      ...item,
      _id: item._id,
      name: item.name || "Medical Advisor",
      title: item.Title || item.title,
      specialty: item.specialty,
      branches: item.branches,
      totalBeds: item.totalBeds,
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
      type: "doctor" as const,
    }))

    const hospitals = (hospitalsRaw || []).map((item: any) => {
      const socialLinks = parseSocialLinks(item.socialLinks)
      return {
        _id: item._id,
        Name: item.name || "Unknown Hospital",
        Type: item.type || "",
        specialty: item.specialty || "",
        branches: item.branches || "",
        totalBeds: item.totalBeds || "",
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
        type: "hospital" as const,
      }
    })

    const treatments = (treatmentsRaw || []).map((item: any) => ({
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
      image: item.image,
      type: "treatment" as const,
    }))

    const items = [...doctors, ...hospitals, ...treatments]
    return NextResponse.json({ items })
  } catch (error: any) {
    console.log("[v0] GET /api/search error:", error?.message || error)
    return NextResponse.json({ items: [], error: "Failed to fetch" }, { status: 200 })
  }
}
