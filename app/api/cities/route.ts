import { type NextRequest, NextResponse } from "next/server"
import { wixClient, createClient } from "@/lib/wixClient"
import type { CitiesApiResponse, City } from "@/types/hospital"

const CITIES_COLLECTION = "CityMaster"

export async function GET(_req: NextRequest) {
  const client = createClient?.() || wixClient
  try {
    const res = await client.items.query(CITIES_COLLECTION).limit(200).find({ consistentRead: true })

    const items: City[] =
      (res.items || []).map((c: any) => ({
        _id: c._id,
        name: c["city name"] || c["City Name"] || c.cityName || "Unknown",

        // Multi-reference to state: map _id from each reference, or fallback
        state: Array.isArray(c.state)
          ? c.state.map((s: any) => (typeof s === "object" && s._id ? s._id : s)).filter(Boolean).join(", ")
          : typeof c.state === "object" && c.state?._id
          ? c.state._id
          : c.state || c.title || null,
        // Multi-reference to hospitals: map _id from each reference
        hospitalMasterCity: Array.isArray(c.HospitalMaster_city)
          ? c.HospitalMaster_city
              .map((h: any) => (typeof h === "object" && h._id ? h._id : h))
              .filter(Boolean)
          : [],
      })) ?? []

    const payload: CitiesApiResponse = { items }
    return NextResponse.json(payload)
  } catch (error: any) {
    console.log("[v0] /api/cities error:", error?.message || error)
    return NextResponse.json({ error: true, message: error?.message || "Unknown error" }, { status: 500 })
  }
}
