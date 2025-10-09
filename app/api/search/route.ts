// app/api/hospitals/route.ts
import { wixServerClient } from "@/lib/wixServer"
import type { NextRequest } from "next/server"

// --- Collection IDs for Wix Data Queries ---
const COLLECTION_IDS = {
  HOSPITALS: "HospitalMaster",
  BRANCHES: "HospitalList",
  CITIES: "CityMaster",
  STATES: "StateMaster",
  COUNTRIES: "CountryMaster"
}

const DEFAULT_LIMIT = 50

// ----------------------------------------------------------------------
// Helper to map city data for primary location
// ----------------------------------------------------------------------
function mapCityData(city: any) {
  if (!city) return null

  return {
    _id: city._id,
    name: city["city name"] || city.cityName || city.name || "Unknown City",
    state: city.state ? (Array.isArray(city.state) ? city.state[0] : city.state) : null,
    country: city.contery ? (Array.isArray(city.contery) ? city.contery[0] : city.contery) : null,
  }
}

// ----------------------------------------------------------------------
// Helper to map branch data (using CSV field names)
// ----------------------------------------------------------------------
function mapBranchData(branch: any) {
  if (!branch) return null

  // Handle primary location (single reference field - matches CSV "city" field)
  let primaryLocationData = null
  let primaryLocationName = ""
  
  if (branch.city) {
    if (Array.isArray(branch.city)) {
      primaryLocationData = branch.city.length > 0 ? mapCityData(branch.city[0]) : null
      primaryLocationName = primaryLocationData ? primaryLocationData.name : ""
    } else {
      primaryLocationData = mapCityData(branch.city)
      primaryLocationName = primaryLocationData ? primaryLocationData.name : ""
    }
  }

  // Handle HospitalMaster_branches reference (single reference)
  let hospitalReference = null
  if (branch.HospitalMaster_branches) {
    hospitalReference = Array.isArray(branch.HospitalMaster_branches) 
      ? branch.HospitalMaster_branches[0] 
      : branch.HospitalMaster_branches
  }

  // Handle doctor reference (multi-reference field)
  let doctorReferences = []
  if (branch.doctor) {
    doctorReferences = Array.isArray(branch.doctor) 
      ? branch.doctor 
      : [branch.doctor]
  }

  return {
    // CSV Fields (exact match with your CSV)
    "Hospital ID": branch["Hospital ID"] || "",
    "Branch Name": branch["Branch Name"] || "Unknown Branch",
    "city": primaryLocationData ? primaryLocationName : "",
    "doctor": doctorReferences,
    "HospitalMaster_branches": hospitalReference,
    
    // Additional data for internal use
    _id: branch._id,
    locationDetails: primaryLocationData,
    hospitalReference: hospitalReference,
    doctorReferences: doctorReferences,
  }
}

// ----------------------------------------------------------------------
// Helper to map hospital data (using CSV field names)
// ----------------------------------------------------------------------
function mapHospitalData(hospital: any) {
  if (!hospital) return null

  // Get hospital name from CSV fields
  const hospitalName = hospital["Hospital Name"] || hospital.Name || hospital.Title || "Unknown Hospital"

  // Handle branches reference (multi-reference field)
  const rawBranches = hospital.branches || []
  const mappedBranches = rawBranches.map(mapBranchData).filter(Boolean)

  // Handle established date
  const establishedDate = hospital["Year Established"] || hospital.yearEstablished || null

  return {
    // CSV Fields (exact match with your CSV)
    "Title": hospital.Title || "",
    "Hospital Name": hospitalName,
    "Hospital Image": hospital["Hospital Image"] || "",
    "Year Established": establishedDate,
    "Description": hospital.Description || "",
    "Website": hospital.Website || "",
    "Slug": hospital.Slug || "",
    "branches": mappedBranches,
    
    // Additional metadata
    _id: hospital._id,
    branchCount: mappedBranches.length,
  }
}

// ----------------------------------------------------------------------
// Helper to map doctor data (using CSV field names)
// ----------------------------------------------------------------------
function mapDoctorData(doctor: any) {
  if (!doctor) return null

  // Handle HospitalList_doctor reference (multi-reference field)
  let hospitalBranchReferences = []
  if (doctor.HospitalList_doctor) {
    hospitalBranchReferences = Array.isArray(doctor.HospitalList_doctor) 
      ? doctor.HospitalList_doctor 
      : [doctor.HospitalList_doctor]
  }

  // Handle specialist reference (multi-reference field)
  let specialistReferences = []
  if (doctor.Specialist) {
    specialistReferences = Array.isArray(doctor.Specialist) 
      ? doctor.Specialist 
      : [doctor.Specialist]
  }

  // Handle treatment reference (multi-reference field)
  let treatmentReferences = []
  if (doctor.treatment) {
    treatmentReferences = Array.isArray(doctor.treatment) 
      ? doctor.treatment 
      : [doctor.treatment]
  }

  return {
    // CSV Fields (exact match with your CSV)
    "Doctor Name": doctor["Doctor Name"] || "Unknown Doctor",
    "HospitalList_doctor": hospitalBranchReferences,
    "Doctor Slug": doctor["Doctor Slug"] || "",
    "Designation": doctor.Designation || "",
    "Contact Phone": doctor["Contact Phone"] || "",
    "Contact Email": doctor["Contact Email"] || "",
    "Doctor Page URL": doctor["Doctor Page URL"] || "",
    "Doctor Image": doctor["Doctor Image"] || "",
    "Specialist": specialistReferences,
    "treatment": treatmentReferences,
    
    // Additional data for internal use
    _id: doctor._id,
  }
}

// ----------------------------------------------------------------------
// Filter helpers
// ----------------------------------------------------------------------
function filterHospitalsByName(hospitals: any[], search: string) {
  if (!search) return hospitals

  const searchLower = search.toLowerCase()
  return hospitals.filter((hospital: any) => {
    const hospitalName = hospital["Hospital Name"] || ""
    return hospitalName.toLowerCase().includes(searchLower)
  })
}

function filterBranchesByName(branches: any[], search: string) {
  if (!search) return branches

  const searchLower = search.toLowerCase()
  return branches.filter((branch: any) => {
    const branchName = branch["Branch Name"] || ""
    return branchName.toLowerCase().includes(searchLower)
  })
}

function filterDoctorsByName(doctors: any[], search: string) {
  if (!search) return doctors

  const searchLower = search.toLowerCase()
  return doctors.filter((doctor: any) => {
    const doctorName = doctor["Doctor Name"] || ""
    return doctorName.toLowerCase().includes(searchLower)
  })
}

// ----------------------------------------------------------------------
// GET handler for fetching hospitals, branches, and doctors
// ----------------------------------------------------------------------
export async function GET(request: NextRequest) {
  console.log(`[api/hospitals] GET request received`)

  try {
    const { searchParams } = new URL(request.url)
    const skip = Number(searchParams.get("skip") || 0)
    const limit = Math.min(Number(searchParams.get("limit") || DEFAULT_LIMIT), 100)
    const search = searchParams.get("search") || ""
    const hospitalId = searchParams.get("hospitalId") || ""
    const branchId = searchParams.get("branchId") || ""
    const dataType = searchParams.get("dataType") || "hospitals" // "hospitals", "branches", or "doctors"
    const debug = searchParams.get("debug") === "true"

    console.log(`[api/hospitals] Query params:`, {
      skip, limit, search, hospitalId, branchId, dataType, debug
    })

    if (dataType === "branches") {
      // Fetch branches directly
      let branchesQuery = wixServerClient.items
        .query(COLLECTION_IDS.BRANCHES)
        .include("city", "city.state", "city.contery", "HospitalMaster_branches")
        .skip(skip)
        .limit(limit)

      if (search) {
        branchesQuery = branchesQuery.contains("Branch Name", search)
      }

      if (hospitalId) {
        branchesQuery = branchesQuery.eq("HospitalMaster_branches", hospitalId)
      }

      const branchesResponse = await branchesQuery.find({ consistentRead: true })

      if (!branchesResponse?.items || branchesResponse.items.length === 0) {
        return Response.json({ 
          data: [], 
          totalCount: 0, 
          hasMore: false 
        }, { 
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        })
      }

      const mappedBranches = branchesResponse.items.map(mapBranchData).filter(Boolean)
      const filteredBranches = filterBranchesByName(mappedBranches, search)

      const hasMore = (branchesResponse.totalCount || 0) > skip + filteredBranches.length

      const responseData: any = {
        data: filteredBranches,
        totalCount: filteredBranches.length,
        hasMore,
      }

      if (debug && branchesResponse.items.length > 0) {
        responseData.debug = {
          firstItemFields: Object.keys(branchesResponse.items[0]),
        }
      }

      return Response.json(responseData, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      })
    } 
    else if (dataType === "doctors") {
      // Fetch doctors directly
      let doctorsQuery = wixServerClient.items
        .query("doctor")
        .include("HospitalList_doctor", "Specialist", "treatment")
        .skip(skip)
        .limit(limit)

      if (search) {
        doctorsQuery = doctorsQuery.contains("Doctor Name", search)
      }

      if (branchId) {
        doctorsQuery = doctorsQuery.eq("HospitalList_doctor", branchId)
      }

      const doctorsResponse = await doctorsQuery.find({ consistentRead: true })

      if (!doctorsResponse?.items || doctorsResponse.items.length === 0) {
        return Response.json({ 
          data: [], 
          totalCount: 0, 
          hasMore: false 
        }, { 
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        })
      }

      const mappedDoctors = doctorsResponse.items.map(mapDoctorData).filter(Boolean)
      const filteredDoctors = filterDoctorsByName(mappedDoctors, search)

      const hasMore = (doctorsResponse.totalCount || 0) > skip + filteredDoctors.length

      const responseData: any = {
        data: filteredDoctors,
        totalCount: filteredDoctors.length,
        hasMore,
      }

      return Response.json(responseData, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      })
    }
    else {
      // Fetch hospitals (default)
      let query = wixServerClient.items
        .query(COLLECTION_IDS.HOSPITALS)
        .include("branches", "branches.city", "branches.city.state", "branches.city.contery")
        .skip(skip)
        .limit(limit)

      if (search) {
        query = query.contains("Hospital Name", search)
      }
      if (hospitalId) {
        query = query.eq("_id", hospitalId)
      }

      const response = await query.find({ consistentRead: true })
      console.log(`[api/hospitals] Wix response received, total hospitals: ${response.totalCount || 0}`)

      if (!response?.items || response.items.length === 0) {
        return Response.json({ 
          data: [], 
          totalCount: 0, 
          hasMore: false 
        }, { 
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        })
      }

      // Process hospitals
      const mappedHospitals = response.items.map((hospital: any) => {
        try {
          return mapHospitalData(hospital)
        } catch (error) {
          console.error(`[api/hospitals] Error mapping hospital ${hospital._id}:`, error)
          return null
        }
      }).filter(Boolean)

      // Apply search filter if needed
      const filteredHospitals = filterHospitalsByName(mappedHospitals, search)

      const hasMore = (response.totalCount || 0) > skip + filteredHospitals.length

      const responseData: any = {
        data: filteredHospitals,
        totalCount: filteredHospitals.length,
        hasMore,
      }

      return Response.json(responseData, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      })
    }
  } catch (error: any) {
    console.error("[api/hospitals] GET Error:", error)
    return Response.json(
      {
        error: "Failed to fetch data",
        message: error.message,
        data: [],
        totalCount: 0,
        hasMore: false
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      }
    )
  }
}

// ----------------------------------------------------------------------
// POST handler for additional actions
// ----------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, limit = 50, skip = 0, search, hospitalId, branchId } = body

    console.log(`[api/hospitals] POST request:`, { action, limit, skip, search, hospitalId, branchId })

    if (action === 'getBranches') {
      let branchesQuery = wixServerClient.items
        .query(COLLECTION_IDS.BRANCHES)
        .include("city", "city.state", "city.contery", "HospitalMaster_branches")
        .limit(Math.min(limit, 100))
        .skip(skip)

      if (search) {
        branchesQuery = branchesQuery.contains("Branch Name", search)
      }

      if (hospitalId) {
        branchesQuery = branchesQuery.eq("HospitalMaster_branches", hospitalId)
      }

      const branchesResponse = await branchesQuery.find({ consistentRead: true })

      if (!branchesResponse?.items || branchesResponse.items.length === 0) {
        return Response.json({
          data: [],
          totalCount: 0,
          success: true,
          message: "No branches found"
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        })
      }

      const mappedBranches = branchesResponse.items.map(mapBranchData).filter(Boolean)
      const filteredBranches = filterBranchesByName(mappedBranches, search)

      return Response.json({
        data: filteredBranches,
        totalCount: filteredBranches.length,
        success: true,
        message: "Branches fetched successfully"
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      })
    }

    if (action === 'getDoctors') {
      let doctorsQuery = wixServerClient.items
        .query("doctor")
        .include("HospitalList_doctor", "Specialist", "treatment")
        .limit(Math.min(limit, 100))
        .skip(skip)

      if (search) {
        doctorsQuery = doctorsQuery.contains("Doctor Name", search)
      }

      if (branchId) {
        doctorsQuery = doctorsQuery.eq("HospitalList_doctor", branchId)
      }

      const doctorsResponse = await doctorsQuery.find({ consistentRead: true })

      if (!doctorsResponse?.items || doctorsResponse.items.length === 0) {
        return Response.json({
          data: [],
          totalCount: 0,
          success: true,
          message: "No doctors found"
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        })
      }

      const mappedDoctors = doctorsResponse.items.map(mapDoctorData).filter(Boolean)
      const filteredDoctors = filterDoctorsByName(mappedDoctors, search)

      return Response.json({
        data: filteredDoctors,
        totalCount: filteredDoctors.length,
        success: true,
        message: "Doctors fetched successfully"
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      })
    }

    if (action === 'getHospitals') {
      let hospitalsQuery = wixServerClient.items
        .query(COLLECTION_IDS.HOSPITALS)
        .include("branches", "branches.city")
        .limit(Math.min(limit, 100))
        .skip(skip)

      if (search) {
        hospitalsQuery = hospitalsQuery.contains("Hospital Name", search)
      }

      if (hospitalId) {
        hospitalsQuery = hospitalsQuery.eq("_id", hospitalId)
      }

      const hospitalsResponse = await hospitalsQuery.find({ consistentRead: true })

      if (!hospitalsResponse?.items || hospitalsResponse.items.length === 0) {
        return Response.json({
          data: [],
          totalCount: 0,
          success: true,
          message: "No hospitals found"
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        })
      }

      const mappedHospitals = hospitalsResponse.items.map(mapHospitalData).filter(Boolean)
      const filteredHospitals = filterHospitalsByName(mappedHospitals, search)

      return Response.json({
        data: filteredHospitals,
        totalCount: filteredHospitals.length,
        success: true,
        message: "Hospitals fetched successfully"
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      })
    }

    return Response.json({
      error: "Invalid action",
      message: `Action '${action}' is not supported. Supported actions: getBranches, getDoctors, getHospitals`
    }, {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    })
  } catch (error: any) {
    console.error("[api/hospitals] POST Error:", error)
    return Response.json({
      error: "Failed to process POST request",
      message: error.message,
      data: [],
      totalCount: 0,
      success: false
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    })
  }
}

// ----------------------------------------------------------------------
// OPTIONS handler for CORS preflight requests
// ----------------------------------------------------------------------
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}