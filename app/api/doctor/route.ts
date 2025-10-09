import { type NextRequest, NextResponse } from "next/server"
import { wixClient, createClient } from "@/lib/wixClient"
import type { DoctorsApiResponse } from "@/types/hospital"

const DOCTORS_COLLECTION = "DoctorMaster"

export async function GET(_req: NextRequest) {
  const client = createClient?.() || wixClient
  try {
    const res = await client.items.query(DOCTORS_COLLECTION).limit(200).find({ consistentRead: true })
    const items = (res.items || []).map((d: any) => ({
      ID: d._id,
      "Created date": d._createdDate || null,
      "Updated date": d._updatedDate || null,
      Owner: d._owner || null,
      DoctorName: d["Doctor Name"] || d.doctorName || "Unknown",
      ProfileImage: d["Profile Image"] || d.profileImage || null,
      Specialization: d["Specialization"] || d.specialization || null,
      Qualification: d["Qualification"] || d.qualification || null,
      "Experience (Years)": d["Experience (Years)"] || d.experienceYears || null,
      Designation: d["Designation"] || d.designation || null,
      "Languages Spoken": d["Languages Spoken"] || d.languagesSpoken || null,
      "About Doctor": d["About Doctor"] || d.aboutDoctor || null,
      "Hospital Branches (IDs)": d["Hospital Branches (IDs)"] || d.hospitalBranchesIds || [],
      "City (ID)": d["City (ID)"] || d.cityId || null,
      "State (ID)": d["State (ID)"] || d.stateId || null,
      "Country (ID)": d["Country (ID)"] || d.countryId || null,
      BranchesMaster_doctor: d.BranchesMaster_doctor || [],
      slug: d["Doctor Slug"] || d.slug || null,
    })) ?? []
    const payload: DoctorsApiResponse = { items }
    return NextResponse.json(payload)
  } catch (error: any) {
    console.log("[v0] /api/doctors error:", error?.message || error)
    return NextResponse.json({ error: true, message: error?.message || "Unknown error" }, { status: 500 })
  }
}
