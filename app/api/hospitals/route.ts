// app/api/hospitals/route.ts - Updated to include references when fetching branches for nesting data
import { NextResponse } from "next/server"
import { wixClient } from "@/lib/wixClient"
import { de } from "date-fns/locale"

const BRANCHES_COLLECTION = "BranchesMaster"
const DOCTOR_COLLECTION_ID = "DoctorMaster"
const CITY_COLLECTION_ID = "CityMaster"
const TREATMENT_COLLECTION_ID = "TreatmentMaster"
const HOSPITAL_COLLECTION_ID = "HospitalMaster"

// Utility function to get value from nested fields
function val(item: any, ...keys: string[]): string | null | undefined {
  for (const key of keys) {
    const value = item?.[key]
    if (value !== undefined && value !== null && value !== "") {
      return value
    }
  }
  return undefined
}

// Map doctor data from Doctor Master
function mapDoctor(item: any) {
  

  return {
    _id: item._id || item.ID,
    name: val(item, "Doctor Name", "doctorName", "name") ?? "Doctor",
    specialization: val(item, "Specialization", "specialization") ?? null,
    qualification: val(item, "Qualification", "qualification") ?? null,
    experience: val(item, "Experience (Years)", "experience") ?? null,
    designation: val(item, "Designation", "designation") ?? null,
    languagesSpoken: val(item, "Languages Spoken", "languagesSpoken") ?? null,
    about: val(item, "About Doctor", "about") ?? null,
    profileImage: item["profileImage"] || item.profileImage || item.profileImage || null, // Raw for rich content
    cityId: val(item, "City (ID)", "cityId") ?? null,
    stateId: val(item, "State (ID)", "stateId") ?? null,
    countryId: val(item, "Country (ID)", "countryId") ?? null,
  }
}

// Map city data from City Master
function mapCity(item: any) {
  return {
    _id: item._id || item.ID,
    name: val(item, "city name", "cityName", "name") ?? "City",
    state: val(item, "state", "stateName") ?? null,
    country: val(item, "contery", "country", "countryName") ?? null,
  }
}

// Map treatment data
function mapTreatment(item: any) {
  return {
    _id: item._id || item.ID,
    name: val(item, "Treatment Name", "treatmentName", "name") ?? "Treatment",
    description: val(item, "Description", "description") ?? null,
    category: val(item, "Category", "category") ?? null,
    treatmentImage: item["Treatment Image"] || item.treatmentImage || item.image || null, // Raw for rich content
    duration: val(item, "Duration", "duration") ?? null,
    cost: val(item, "Cost", "cost", "price") ?? null,
  }
}

// Map hospital data - keep raw image/logo for rich content handling in frontend
function mapHospital(item: any) {
  return {
    _id: item._id || item.ID,
    name: val(item, "Hospital Name", "hospitalName", "name") ?? "Hospital",
    slug: val(item, "slug", "Slug") ?? null,
    image: item["Hospital Image"] || item.hospitalImage || item.image, // Raw for rich content
    logo: item["Logo"] || item.logo, // Raw for rich content
    yearEstablished: val(item, "Year Established", "yearEstablished") ?? null,
    accreditation: val(item, "Accreditation", "accreditation") ?? null,
    beds: val(item, "No. of Beds", "noOfBeds", "beds") ?? null,
    emergencyServices: val(item, "Emergency Services", "emergencyServices") ?? null,
    description: val(item, "Description", "description") ?? null,
    website: val(item, "Website", "website") ?? null,
    email: val(item, "Email", "email") ?? null,
    contactNumber: val(item, "Contact Number", "contactNumber") ?? null,
  }
}

// Map branch data (nested under hospital, so omit hospital fields)
function mapBranch(item: any) {
  return {
    _id: item._id || item.ID,
    name: val(item, "Branch Name", "branchName", "name") ?? "Branch",
    address: val(item, "Address", "address") ?? null,
    city: mapMultiReferenceField(item.city, "city name", "cityName", "name"),
    contactNumber: val(item, "Phone", "Phone", "contactNumber") ?? null,
    email: val(item, "Email", "email") ?? null,
    totalBeds: val(item, "Total Beds", "totalBeds") ?? null,
    icuBeds: val(item, "ICU Beds", "icuBeds") ?? null,
    emergencyContact: val(item, "Emergency Contact", "emergencyContact") ?? null,
    branchImage: val(item, "Branch Image", "branchImage", "image") ?? null,
    description: val(item, "Description", "description") ?? null,
    // Multi-reference fields
    doctors: mapMultiReferenceField(item.doctor, "Doctor Name", "doctorName", "name"),
    treatments: mapMultiReferenceField(item.treatment, "Treatment Name", "treatmentName", "name"),
  }
}

// Generic function to handle multi-reference fields
function mapMultiReferenceField(field: any, ...nameFields: string[]): any[] {
  if (!field) return []

  if (Array.isArray(field)) {
    return field
      .map((item: any) => {
        if (typeof item === "string") {
          return { _id: item }
        }
        return {
          _id: item?._id || item?.ID,
          name: val(item, ...nameFields) ?? "Item",
          // Include additional fields based on the type of reference
          ...(nameFields.includes("Doctor Name") && {
            specialization: val(item, "Specialization", "specialization"),
            qualification: val(item, "Qualification", "qualification"),
            experience: val(item, "Experience (Years)", "experience"),
            profileImage: val(item, "Profile Image", "profileImage"),
          }),
          ...(nameFields.includes("Treatment Name") && {
            description: val(item, "Description", "description"),
            category: val(item, "Category", "category"),
            duration: val(item, "Duration", "duration"),
            cost: val(item, "Cost", "cost"),
          }),
          ...(nameFields.includes("city name") && {
            state: val(item, "state", "stateName"),
            country: val(item, "contery", "country"),
          }),
        }
      })
      .filter(Boolean)
  }

  return []
}

async function searchIdsByName(collectionId: string, nameFields: string[], queryString: string): Promise<string[]> {
  const client = wixClient
  const idSet = new Set<string>()

  // Try each possible field and union results (Wix contains() is single-field)
  for (const field of nameFields) {
    try {
      const res = await client.items
        .query(collectionId)
        .contains(field as any, queryString)
        .limit(500)
        .find()
      res.items.forEach((it: any) => {
        if (it?._id) idSet.add(it._id)
      })
    } catch (e) {
      console.warn(`searchIdsByName failed for ${collectionId}.${field}:`, e)
    }
  }

  return Array.from(idSet)
}

function buildBranchQuery(
  hospitalIds?: string[],
  cityIds?: string[] | undefined,
  doctorIds?: string[] | undefined,
  treatmentIds?: string[] | undefined,
  includeReferences = false,
) {
  const client = wixClient
  let query = client.items.query(BRANCHES_COLLECTION).descending("_createdDate")

  if (includeReferences) {
    query = query
      .include("hospital")
      .include("HospitalMaster_branches")
      .include("doctor")
      .include("treatment")
      .include("city")
  }

  if (hospitalIds && hospitalIds.length > 0) {
    query = query.hasSome("HospitalMaster_branches" as any, hospitalIds)
  }
  if (cityIds && cityIds.length > 0) {
    query = query.hasSome("city" as any, cityIds)
  }
  if (doctorIds && doctorIds.length > 0) {
    query = query.hasSome("doctor" as any, doctorIds)
  }
  if (treatmentIds && treatmentIds.length > 0) {
    query = query.hasSome("treatment" as any, treatmentIds)
  }

  return query
}

async function fetchDoctorsData(doctorIds: string[]) {
  if (!doctorIds.length) return {}

  try {
    const doctors = await wixClient.items.query(DOCTOR_COLLECTION_ID).hasSome("_id", doctorIds).find()

    return doctors.items.reduce(
      (acc, doctor) => {
        acc[doctor._id!] = mapDoctor(doctor)
        return acc
      },
      {} as Record<string, any>,
    )
  } catch (error) {
    console.error("Error fetching doctors data:", error)
    return {}
  }
}

async function fetchCitiesData(cityIds: string[]) {
  if (!cityIds.length) return {}

  try {
    const cities = await wixClient.items.query(CITY_COLLECTION_ID).hasSome("_id", cityIds).find()

    return cities.items.reduce(
      (acc, city) => {
        acc[city._id!] = mapCity(city)
        return acc
      },
      {} as Record<string, any>,
    )
  } catch (error) {
    console.error("Error fetching cities data:", error)
    return {}
  }
}

async function fetchTreatmentsData(treatmentIds: string[]) {
  if (!treatmentIds.length) return {}

  try {
    const treatments = await wixClient.items.query(TREATMENT_COLLECTION_ID).hasSome("_id", treatmentIds).find()

    return treatments.items.reduce(
      (acc, treatment) => {
        acc[treatment._id!] = mapTreatment(treatment)
        return acc
      },
      {} as Record<string, any>,
    )
  } catch (error) {
    console.error("Error fetching treatments data:", error)
    return {}
  }
}

// Extract IDs from multi-reference fields
function extractIdsFromReferences(references: any[]): string[] {
  return references
    .map((ref) => {
      if (typeof ref === "string") return ref
      if (ref?._id) return ref._id
      return null
    })
    .filter((id): id is string => id !== null)
}

// Extract referenced hospital IDs from a branch record regardless of field naming/shape
function extractHospitalIdsFromBranch(branch: any): string[] {
  const ids = new Set<string>()

  const push = (val: any) => {
    if (!val) return
    if (typeof val === "string") {
      ids.add(val)
    } else if (Array.isArray(val)) {
      val.forEach((v) => push(v))
    } else if (typeof val === "object" && val?._id) {
      ids.add(val._id)
    }
  }

  // Common possibilities
  push(branch?.hospital) // direct reference field on BranchesMaster
  push(branch?.HospitalMaster_branches) // backref array if available
  push(branch?.Hospital) // fallback misc field name
  if (branch?.hospitalId) push(branch.hospitalId)
  if (branch?.["Hospital (ID)"]) push(branch["Hospital (ID)"])

  return Array.from(ids)
}

async function searchHospitalsByName(searchQuery: string) {
  try {
    // Try multiple name fields that may exist in Wix CMS
    const ids = await searchIdsByName(HOSPITAL_COLLECTION_ID, ["name", "Hospital Name", "hospitalName"], searchQuery)
    return ids
  } catch (error) {
    console.error("Error searching hospitals by name:", error)
    return []
  }
}

async function getHospitalIdsFromBranchFilters(
  cityIds?: string[],
  doctorIds?: string[],
  treatmentIds?: string[],
): Promise<string[]> {
  if (
    (!cityIds || cityIds.length === 0) &&
    (!doctorIds || doctorIds.length === 0) &&
    (!treatmentIds || treatmentIds.length === 0)
  ) {
    return []
  }

  try {
    const branchQuery = buildBranchQuery(undefined, cityIds, doctorIds, treatmentIds, true)
    const branchesRes = await branchQuery.limit(1000).find()

    const hospitalIds = new Set<string>()

    branchesRes.items.forEach((branch: any) => {
      extractHospitalIdsFromBranch(branch).forEach((id) => hospitalIds.add(id))
    })

    return Array.from(hospitalIds)
  } catch (error) {
    console.error("Error getting hospital IDs from branch filters:", error)
    return []
  }
}

export async function GET(req: Request) {
  try {
    const client = wixClient
    const url = new URL(req.url)

    // Query parameters
    const q = url.searchParams.get("q")?.trim()
    const cityId = url.searchParams.get("cityId")?.trim()
    const doctorId = url.searchParams.get("doctorId")?.trim()
    const treatmentId = url.searchParams.get("treatmentId")?.trim()

    // New: text inputs
    const cityText = url.searchParams.get("city")?.trim()
    const doctorText = url.searchParams.get("doctor")?.trim()
    const treatmentText = url.searchParams.get("treatment")?.trim()

    const hospitalId = url.searchParams.get("hospitalId")?.trim()
    const page = Number(url.searchParams.get("page") || "0")
    const pageSize = Math.min(50, Number(url.searchParams.get("pageSize") || "20"))

    console.log("Fetching hospitals with filters:", {
      q,
      cityId,
      doctorId,
      treatmentId,
      cityText,
      doctorText,
      treatmentText,
      hospitalId,
      page,
      pageSize,
    })

    let cityIds: string[] = []
    let doctorIds: string[] = []
    let treatmentIds: string[] = []

    if (cityText) {
      cityIds = await searchIdsByName(CITY_COLLECTION_ID, ["city name", "cityName", "name"], cityText)
    }
    if (doctorText) {
      doctorIds = await searchIdsByName(DOCTOR_COLLECTION_ID, ["Doctor Name", "doctorName", "name"], doctorText)
    }
    if (treatmentText) {
      treatmentIds = await searchIdsByName(
        TREATMENT_COLLECTION_ID,
        ["Treatment Name", "treatmentName", "name"],
        treatmentText,
      )
    }

    // include single ID if provided
    if (cityId) cityIds.push(cityId)
    if (doctorId) doctorIds.push(doctorId)
    if (treatmentId) treatmentIds.push(treatmentId)

    // Step 1: Get hospital IDs from branch filters (if any)
    let hospitalIds: string[] = []
    if (cityIds.length || doctorIds.length || treatmentIds.length) {
      hospitalIds = await getHospitalIdsFromBranchFilters(cityIds, doctorIds, treatmentIds)
      console.log("Hospital IDs from branch filters:", hospitalIds.length)

      if (hospitalIds.length === 0) {
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          pageSize,
        })
      }
    }

    // Step 2: Build hospital query
    let hospitalQuery = client.items
      .query(HOSPITAL_COLLECTION_ID)
      .descending("_createdDate")
      .limit(pageSize)
      .skip(page * pageSize)

    if (hospitalId) {
      hospitalQuery = hospitalQuery.eq("_id", hospitalId)
    } else if (hospitalIds.length > 0) {
      hospitalQuery = hospitalQuery.hasSome("_id", hospitalIds)
    }

    // Apply hospital text search
    if (q) {
      const searchHospitalIds = await searchHospitalsByName(q)
      console.log("Hospital IDs from search:", searchHospitalIds.length)

      if (searchHospitalIds.length === 0) {
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          pageSize,
        })
      }

      if (hospitalIds.length > 0) {
        const intersection = hospitalIds.filter((id) => searchHospitalIds.includes(id))
        console.log("Intersection of branch filters and search:", intersection.length)
        if (intersection.length === 0) {
          return NextResponse.json({
            items: [],
            total: 0,
            page,
            pageSize,
          })
        }
        hospitalQuery = hospitalQuery.hasSome("_id", intersection)
      } else {
        hospitalQuery = hospitalQuery.hasSome("_id", searchHospitalIds)
      }
    }

    // Step 3: Fetch hospitals
    const hospitalsRes = await hospitalQuery.find()
    console.log("Fetched hospitals count:", hospitalsRes.items.length)

    // Step 4: Get all branch IDs for these hospitals to fetch complete branch data
    const hospitalIdList = hospitalsRes.items.map((h) => h._id!)

    let branchesRes
    if (hospitalIdList.length > 0) {
      // Fetch branches with all references included
      branchesRes = await buildBranchQuery(
        hospitalIdList,
        undefined, // Don't apply city filter again as we already filtered hospitals
        undefined, // Don't apply doctor filter again
        undefined, // Don't apply treatment filter again
        true, // Include all references
      )
        .limit(1000)
        .find()
    } else {
      branchesRes = { items: [] }
    }

    console.log("Fetched branches count:", branchesRes.items.length)

    // Step 5: Group branches by hospital
    const branchesByHospital: Record<string, any[]> = {}
    const allDoctorIds = new Set<string>()
    const allCityIds = new Set<string>()
    const allTreatmentIds = new Set<string>()

    branchesRes.items.forEach((branch) => {
      const hostIds = extractHospitalIdsFromBranch(branch)
      hostIds.forEach((hospitalId) => {
        if (hospitalId && hospitalIdList.includes(hospitalId)) {
          if (!branchesByHospital[hospitalId]) {
            branchesByHospital[hospitalId] = []
          }
          const mappedBranch = mapBranch(branch)
          branchesByHospital[hospitalId].push(mappedBranch)

          // Collect IDs for additional data fetching
          extractIdsFromReferences(mappedBranch.doctors).forEach((id) => allDoctorIds.add(id))
          extractIdsFromReferences(mappedBranch.city).forEach((id) => allCityIds.add(id))
          extractIdsFromReferences(mappedBranch.treatments).forEach((id) => allTreatmentIds.add(id))
        }
      })
    })

    // Step 6: Fetch additional data for references
    const [doctorsData, citiesData, treatmentsData] = await Promise.all([
      fetchDoctorsData(Array.from(allDoctorIds)),
      fetchCitiesData(Array.from(allCityIds)),
      fetchTreatmentsData(Array.from(allTreatmentIds)),
    ])

    // Step 7: Build final hospital objects with enriched branch data
    const hospitals = hospitalsRes.items.map((hospital) => {
      const hospitalBranches = branchesByHospital[hospital._id!] || []

      // Enrich branch data with complete reference data
      const enrichedBranches = hospitalBranches.map((branch) => ({
        ...branch,
        doctors: branch.doctors.map((doctor: any) => {
          const doctorData = doctorsData[doctor._id]
          return doctorData || doctor
        }),
        city: branch.city.map((city: any) => {
          const cityData = citiesData[city._id]
          return cityData || city
        }),
        treatments: branch.treatments.map((treatment: any) => {
          const treatmentData = treatmentsData[treatment._id]
          return treatmentData || treatment
        }),
      }))

      const hasCityFilter = (cityIds ?? []).length > 0
      const hasTreatmentFilter = (treatmentIds ?? []).length > 0
      const filteredBranches = enrichedBranches.filter((b: any) => {
        const cityOk = !hasCityFilter || b.city?.some((c: any) => (cityIds ?? []).includes(c._id))
        const treatmentOk = !hasTreatmentFilter || b.treatments?.some((t: any) => (treatmentIds ?? []).includes(t._id))
        return cityOk && treatmentOk
      })

      // Aggregate doctors and treatments from pruned branches
      const allDoctors = new Map()
      const allTreatments = new Map()

      filteredBranches.forEach((branch) => {
        branch.doctors.forEach((doctor: any) => {
          if (doctor._id && !allDoctors.has(doctor._id)) {
            allDoctors.set(doctor._id, doctor)
          }
        })
        branch.treatments.forEach((treatment: any) => {
          if (treatment._id && !allTreatments.has(treatment._id)) {
            allTreatments.set(treatment._id, treatment)
          }
        })
      })

      return {
        ...mapHospital(hospital),
        branches: filteredBranches, // return only relevant branches
        doctors: Array.from(allDoctors.values()),
        treatments: Array.from(allTreatments.values()),
      }
    })

    console.log("Final hospitals with enriched data:", hospitals.length)

    return NextResponse.json({
      items: hospitals,
      total: hospitalsRes.totalCount || hospitals.length,
      page,
      pageSize,
    })
  } catch (error) {
    console.error("Error fetching hospitals:", error)
    return NextResponse.json({ error: "Failed to fetch hospitals", details: String(error) }, { status: 500 })
  }
}
