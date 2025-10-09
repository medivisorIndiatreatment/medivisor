import { NextResponse } from "next/server"
import { wixClient } from "@/lib/wixClient"
import type { Hospital, HospitalWithBranchPreview, Branch, Doctor } from "@/types/hospital"

const HOSPITAL_COLLECTION_ID = "HospitalMaster"
const BRANCHES_COLLECTION = "BranchesMaster"
const DOCTOR_COLLECTION_ID = "DoctorMaster"
const BRANCHES_FIELD = "branches"

// Helper to safely get value
function val(item: any, ...keys: string[]) {
  for (const k of keys) {
    const v = item?.[k]
    if (v !== undefined && v !== null && v !== "") return v
  }
  return undefined
}

// Map Doctor
function mapDoctor(item: any): Doctor {
  return {
    _id: item._id || item.id,
    name: val(item, "Doctor Name", "name") || "Doctor",
    specialization: val(item, "Specialization") ?? undefined,
    qualification: val(item, "Qualification") ?? undefined,
    experienceYears: val(item, "Experience (Years)") ?? undefined,
    designation: val(item, "Designation") ?? undefined,
    languagesSpoken: val(item, "Languages Spoken") ?? undefined,
    about: val(item, "About Doctor") ?? undefined,
    profileImage: val(item, "Profile Image") ?? null,
    hospitalBranchIds: Array.isArray(item.branch) ? item.branch.map((b: any) => b?._id).filter(Boolean) : [],
    cityId: val(item, "City (ID)") ?? null,
    stateId: val(item, "State (ID)") ?? null,
    countryId: val(item, "Country (ID)") ?? null,
    branchesMasterDoctor: val(item, "BranchesMaster_doctor") ?? [],
    hospitalId: Array.isArray(item.hospital) ? item.hospital[0]?._id : val(item, "hospital", "Hospital (ID)"),
    slug: val(item, "Doctor Slug") ?? null,
  }
}

// Map Branch
function mapBranch(branch: any, doctorMap: Record<string, Doctor[]>): Branch & { doctors: Doctor[] } {
  const doctorRefs = Array.isArray(branch?.doctor) ? branch.doctor : []

  const doctorIds: string[] = doctorRefs
    .map((d: any) => (typeof d === "string" ? d : d?._id || d?.id))
    .filter(Boolean) as string[]

  const doctors: Doctor[] = doctorIds.flatMap(id => doctorMap[id] || [])

  return {
    _id: branch._id,
    slug: branch?.slug ?? null,
    name: branch?.["Branch Name"] ?? branch?.branchName ?? branch?.name ?? null,
    image: branch?.["Branch Image"] ?? branch?.branchImage ?? branch?.image ?? null,
    address: branch?.["Address"] ?? branch?.address ?? null,
    city: branch?.["City (ID)"] ?? branch?.city ?? branch?.cityId ?? null,
    state: branch?.["State (ID)"] ?? branch?.state ?? branch?.stateId ?? null,
    country: branch?.["Country (ID)"] ?? branch?.country ?? branch?.countryId ?? null,
    phone: branch?.["Phone"] ?? branch?.phone ?? null,
    email: branch?.["Email"] ?? branch?.email ?? null,
    totalBeds: branch?.["Total Beds"] ?? branch?.totalBeds ?? null,
    icuBeds: branch?.["ICU Beds"] ?? branch?.icuBeds ?? null,
    doctorIds,
    doctors,
  }
}

// Map Hospital
function mapHospital(item: any): Hospital {
  return {
    _id: item._id,
    slug: val(item, "slug", "Slug") ?? null,
    name: val(item, "Hospital Name", "hospitalName", "name") || "Hospital",
    image: val(item, "Hospital Image", "hospitalImage", "image") ?? null,
    logo: val(item, "Logo", "logo") ?? null,
    yearEstablished: val(item, "Year Established", "yearEstablished") ?? null,
    accreditation: val(item, "Accreditation", "accreditation") ?? null,
    beds: val(item, "No. of Beds", "noOfBeds", "beds") ?? null,
    emergencyServices: val(item, "Emergency Services", "emergencyServices") ?? null,
    description: val(item, "Description", "description") ?? null,
    website: val(item, "Website", "website") ?? null,
    email: val(item, "Email", "email") ?? null,
    contactNumber: val(item, "Contact Number", "contactNumber") ?? null,
    countryId: val(item, "Country (ID)", "countryId") ?? null,
    city: val(item, "city", "City") ?? null,
  }
}

// Fetch all doctors
async function getAllDoctors(): Promise<Record<string, Doctor[]>> {
  const res = await wixClient.items.query(DOCTOR_COLLECTION_ID).limit(1000).find({ consistentRead: true })
  const allDoctors = (res?.items || []).map(mapDoctor)
  const doctorMap: Record<string, Doctor[]> = {}
  allDoctors.forEach(d => {
    if (!doctorMap[d._id]) doctorMap[d._id] = []
    doctorMap[d._id].push(d)
  })
  return doctorMap
}

// Fetch branches for multiple hospitals
async function getBranchesForHospitals(hospitalIds: string[], doctorMap: Record<string, Doctor[]>): Promise<Record<string, (Branch & { doctors: Doctor[] })[]>> {
  const branchesByHospital: Record<string, (Branch & { doctors: Doctor[] })[]> = {}

  for (const hospitalId of hospitalIds) {
    const res: any = await wixClient.items.queryReferenced(HOSPITAL_COLLECTION_ID, hospitalId, BRANCHES_FIELD, { limit: 1000, offset: 0 })
    const items: any[] = res?.items || res?.referencedItems || res?.data?.items || res?.results || []
    branchesByHospital[hospitalId] = items.map(b => mapBranch(b, doctorMap))
  }

  return branchesByHospital
}

// API: GET /api/hospitals
export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get("q")?.trim()
  const cityId = url.searchParams.get("cityId")?.trim()
  const doctorId = url.searchParams.get("doctorId")?.trim()
  const page = Number(url.searchParams.get("page") || "0")
  const pageSize = Math.min(50, Number(url.searchParams.get("pageSize") || "20"))

  // Step 1: Fetch all doctors
  const doctorMap = await getAllDoctors()

  // Step 2: Build hospital query
  let query = wixClient.items.query(HOSPITAL_COLLECTION_ID).descending("_createdDate")
  if (q) query = query.contains("Hospital Name" as any, q)
  if (cityId) query = query.eq("City (ID)" as any, cityId)

  // Filter by doctor
  let hospitalIds: string[] | undefined
  if (doctorId) {
    const branchesWithDoctor = await wixClient.items.query(BRANCHES_COLLECTION).contains("doctor", doctorId).find()
    hospitalIds = Array.from(new Set(
      branchesWithDoctor.items.flatMap((b: any) => Array.isArray(b.hospital) ? b.hospital.map((h: any) => h?._id).filter(Boolean) : b.hospital?._id ? [b.hospital._id] : [])
    ))
    if (hospitalIds.length > 0) query = query.hasSome("_id", hospitalIds)
  }

  // Step 3: Fetch hospitals
  const res = await query.skip(page * pageSize).limit(pageSize).find({ consistentRead: true })
  const hospitals = (res?.items || []).map(mapHospital)
  const hospitalIdsToFetch = hospitals.map(h => h._id)

  // Step 4: Fetch branches
  const branchesByHospital = await getBranchesForHospitals(hospitalIdsToFetch, doctorMap)

  // Step 5: Attach branches and doctors
  const output: HospitalWithBranchPreview[] = hospitals.map(h => {
    const branches = branchesByHospital[h._id] || []
    return {
      ...h,
      branchesPreview: branches.slice(0, 2),
      branchesCount: branches.length,
      branches,
    }
  })

  return NextResponse.json({
    items: output,
    totalCount: res?.totalCount ?? output.length,
    page,
    pageSize,
  })
}
