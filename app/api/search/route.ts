import type { NextRequest } from "next/server"
import { wixServerClient } from "@/lib/wixServer"

type Mode = "hospitalmaster" | "doctor" | "treatment"

function parseArrayLike(input: unknown): string[] {
  if (!input) return []
  if (Array.isArray(input))
    return input
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean)
  const s = String(input)
  // split by comma or pipe
  return s
    .split(/[,|]/g)
    .map((x) => x.trim())
    .filter(Boolean)
}

function toNumberSafe(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v))
  return Number.isFinite(n) ? n : fallback
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const type = (searchParams.get("type") || "hospital").toLowerCase() as Mode
    const q = (searchParams.get("q") || "").toLowerCase().trim()
    const minRating = toNumberSafe(searchParams.get("minRating"), 0)
    const hospitalType = (searchParams.get("hospitalType") || "all").toLowerCase()
    const specialtiesParam = searchParams.get("specialties") || ""
    const selectedSpecialties = specialtiesParam
      ? specialtiesParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    const location = (searchParams.get("location") || "").toLowerCase().trim()
    const languagesParam = searchParams.get("languages") || ""
    const selectedLanguages = languagesParam
      ? languagesParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    const minExperience = toNumberSafe(searchParams.get("minExperience"), 0)
    const maxConsultationFee = toNumberSafe(searchParams.get("maxConsultationFee"), 0)
    const minBeds = toNumberSafe(searchParams.get("minBeds"), 0)
    const accreditationsParam = searchParams.get("accreditations") || ""
    const selectedAccreditations = accreditationsParam
      ? accreditationsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    const category = (searchParams.get("category") || "").trim()
    const minCost = toNumberSafe(searchParams.get("minCost"), 0)
    const maxCost = toNumberSafe(searchParams.get("maxCost"), 0)
    const minSuccessRate = toNumberSafe(searchParams.get("minSuccessRate"), 0)
    const activeOnly = (searchParams.get("activeOnly") || "").toLowerCase() === "true"

    const COLLECTION_ID_HOSPITAL = "Hospital"
    const COLLECTION_ID_DOCTOR = "doctor"
    const COLLECTION_ID_TREATMENT = "treatment"

    const collectionId =
      type === "doctor" ? COLLECTION_ID_DOCTOR : type === "treatment" ? COLLECTION_ID_TREATMENT : COLLECTION_ID_HOSPITAL

    const res = await wixServerClient.items.query(collectionId).limit(1000).find({ consistentRead: true })
    const rawItems: any[] = res.items || []

    if (type === "doctor") {
      const doctors = rawItems.map((item) => {
        const specializations = parseArrayLike(item.specializations || item.specialty)
        const languages = parseArrayLike(item.languagesSpoken || item.languages)
        const hospitals = parseArrayLike(item.hospitals || item.working_hospital)
        return {
          _id: item._id,
          slug: item.slug || "",
          name: item.name || item["name"] || "Unknown Doctor",
          title: item.Title || item.title || "",
          profilePicture: item.profilePicture || item.Image || "",
          specializations,
          specialty: item.specialty || "",
          hospitals,
          working_hospital: item.working_hospital || "",
          yearsOfExperience: toNumberSafe(item.yearsOfExperience),
          rating: toNumberSafe(item.rating, 0),
          languages,
          description: item.description || item.about || "",
          whatsapp: item.whatsapp || "",
          consultationFee: toNumberSafe(item.consultationFee, 0),
          city: item.city || item.City || "",
          state: item.state || item.State || "",
          country: item.country || "",
          address: item.address || "",
        }
      })

      const filtered = doctors.filter((d) => {
        const hay = [
          d.name,
          d.title,
          d.specialty,
          d.specializations.join(" "),
          d.hospitals.join(" "),
          d.working_hospital,
          d.description,
          d.city,
          d.state,
          d.country,
          d.address,
        ]
          .join(" ")
          .toLowerCase()

        const matchesQ = !q || hay.includes(q)
        const matchesSpecs =
          selectedSpecialties.length === 0 ? true : d.specializations.some((s) => selectedSpecialties.includes(s))
        const matchesRating = d.rating >= minRating
        const matchesLocation = !location || hay.includes(location)
        const matchesLanguages =
          selectedLanguages.length === 0
            ? true
            : d.languages.some((lng) => selectedLanguages.includes(String(lng).trim()))
        const matchesExperience = minExperience <= 0 || (d.yearsOfExperience || 0) >= minExperience
        const matchesFee = maxConsultationFee <= 0 || (d.consultationFee || 0) <= maxConsultationFee

        return (
          matchesQ &&
          matchesSpecs &&
          matchesRating &&
          matchesLocation &&
          matchesLanguages &&
          matchesExperience &&
          matchesFee
        )
      })

      return Response.json({ items: filtered })
    }

    if (type === "treatment") {
      const treatments = rawItems.map((item) => {
        const firstImage =
          Array.isArray(item.images) && item.images.length > 0
            ? item.images[0]
            : typeof item.images === "string"
              ? item.images
              : item.image || ""
        return {
          _id: item._id,
          slug: item.slug || "",
          name: item.name || item.Title || "Unknown Treatment",
          category: item.category || "",
          overview: item.overview || "",
          description: item.description || "",
          image: firstImage || "",
          mode: item.mode || "",
          costRangeMin: toNumberSafe(item.costRangeMin, 0),
          costRangeMax: toNumberSafe(item.costRangeMax, 0),
          duration: item.duration || "",
          successRate: toNumberSafe(item.successRate, 0),
          isActive: String(item.isActive || "").toLowerCase() === "true",
        }
      })

      const filtered = treatments.filter((t) => {
        const hay = [t.name, t.category, t.description, t.overview, t.mode].join(" ").toLowerCase()
        const matchesQ = !q || hay.includes(q)
        const matchesCategory = !category || t.category === category
        const matchesActive = !activeOnly || t.isActive
        const matchesMinCost = minCost <= 0 || (t.costRangeMin || 0) >= minCost
        const matchesMaxCost = maxCost <= 0 || (t.costRangeMax || 0) <= maxCost
        const matchesSuccess = minSuccessRate <= 0 || (t.successRate || 0) >= minSuccessRate
        return matchesQ && matchesCategory && matchesActive && matchesMinCost && matchesMaxCost && matchesSuccess
      })

      return Response.json({ items: filtered })
    }

    const hospitals = rawItems.map((item) => {
      const department1Name = parseArrayLike(item.department1Name)
      return {
        _id: item._id,
        Name: item.name || "Unknown Hospital",
        Type: item.type || "",
        specialty: item.specialty || "",
        specialties: item.specialties || "",
        numberOfBranches: item.numberOfBranches || "",
        totalBeds: item.totalBeds || "",
        slug: item.slug || "",
        description: item.description || "",
        image: item.image,
        yearEstablished: item.yearEstablished || "",
        department1Name,
        Facilities: parseArrayLike(item.facilities),
        Services: parseArrayLike(item.services),
        InsurancePartners: parseArrayLike(item.insurancePartners),
        Rating: toNumberSafe(item.rating, 0),
        ReviewCount: toNumberSafe(item.reviewCount, 0),
        Website: item.website || "#",
        contactEmail: item.contactEmail || "",
        accreditations: parseArrayLike(item.accreditations),
        contactPhone: item.contactPhone || "",
        city: item.city || item.City || "",
        state: item.state || item.State || "",
        country: item.country || "",
        address: item.address || "",
      }
    })

    const filtered = hospitals.filter((h) => {
      const hay = [
        h.Name,
        h.Type,
        h.specialty,
        h.specialties,
        h.department1Name.join(" "),
        h.description,
        h.city,
        h.state,
        h.country,
        h.address,
      ]
        .join(" ")
        .toLowerCase()

      const matchesQ = !q || hay.includes(q)
      const matchesSpecs =
        selectedSpecialties.length === 0 ? true : h.department1Name.some((d) => selectedSpecialties.includes(d))
      const matchesHospitalType =
        hospitalType === "all" ||
        (hospitalType === "multi-specialty" && h.department1Name.length > 1) ||
        (hospitalType === "single-specialty" && h.department1Name.length <= 1)
      const matchesRating = h.Rating >= minRating
      const matchesLocation = !location || hay.includes(location)
      const bedsNum = toNumberSafe(h.totalBeds, 0)
      const matchesBeds = minBeds <= 0 || bedsNum >= minBeds
      const matchesAccred =
        selectedAccreditations.length === 0
          ? true
          : (h.accreditations || []).some((a: string) => selectedAccreditations.includes(String(a).trim()))

      return (
        matchesQ &&
        matchesSpecs &&
        matchesHospitalType &&
        matchesRating &&
        matchesLocation &&
        matchesBeds &&
        matchesAccred
      )
    })

    return Response.json({ items: filtered })
  } catch (err) {
    console.error("[/api/search] error:", err)
    return Response.json({ items: [] }, { status: 200 })
  }
}
