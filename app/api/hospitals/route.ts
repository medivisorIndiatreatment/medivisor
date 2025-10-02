// app/api/hospitals/route.ts
import { wixServerClient } from "@/lib/wixServer"
import type { NextRequest } from "next/server"

// --- Collection IDs for Wix Data Queries ---
const COLLECTION_IDS = {
  HOSPITALS: "HospitalList",
  BRANCHES: "hospitalbrancheslist",
  DOCTORS: "doctor",
  CITIES: "CityMaster",
  STATES: "StateMaster",
  COUNTRIES: "CountryMaster"
}

const DEFAULT_LIMIT = 50

// ----------------------------------------------------------------------
// Helper to map doctor data
// ----------------------------------------------------------------------
function mapDoctors(doctorsData: any[]) {
  if (!Array.isArray(doctorsData)) return []

  return doctorsData.map((doctor: any) => ({
    _id: doctor._id,
    name: doctor["Doctor Name"] || doctor.name || "Unknown Doctor",
    slug: doctor["Doctor Slug"] || doctor.slug || "",
    hospitalName: doctor["Hospital Name"] || "",
    branchName: doctor["Branch Name"] || "",
    specialty: doctor.Specialty || doctor.Specialist || doctor.specialty || "General",
    designation: doctor.Designation || doctor.designation || "",
    contactPhone: doctor["Contact Phone"] || doctor.phone || "",
    contactEmail: doctor["Contact Email"] || doctor.email || "",
    doctorPageUrl: doctor["Doctor Page URL"] || doctor.pageUrl || "",
    imageUrl: doctor["Doctor Image"] || doctor.imageUrl || "",
    hospitalBranch: doctor["Hospital Branch"] || "",
    createdDate: doctor._createdDate,
    updatedDate: doctor._updatedDate,
  }))
}

// ----------------------------------------------------------------------
// Helper to map country data
// ----------------------------------------------------------------------
function mapCountryData(country: any) {
  if (!country) return null

  return {
    _id: country._id,
    name: country["Country Name"] || country.name || country.title || "Unknown Country",
    createdDate: country._createdDate,
    updatedDate: country._updatedDate,
  }
}

// ----------------------------------------------------------------------
// Helper to map state data
// ----------------------------------------------------------------------
function mapStateData(state: any) {
  if (!state) return null

  return {
    _id: state._id,
    name: state["State Name"] || state.name || state.title || "Unknown State",
    country: mapCountryData(state.country),
    createdDate: state._createdDate,
    updatedDate: state._updatedDate,
  }
}

// ----------------------------------------------------------------------
// Helper to map city data
// ----------------------------------------------------------------------
function mapCityData(city: any) {
  if (!city) return null

  // Extract city name from different possible field names
  const cityName = city["city name"] || city.cityName || city.name || "Unknown City"
  
  // Handle state reference (could be array or single object)
  let stateData = null
  if (city.state) {
    if (Array.isArray(city.state)) {
      stateData = city.state.length > 0 ? mapStateData(city.state[0]) : null
    } else {
      stateData = mapStateData(city.state)
    }
  }

  // Handle country reference (could be array or single object)
  let countryData = null
  if (city.contery) {
    if (Array.isArray(city.contery)) {
      countryData = city.contery.length > 0 ? mapCountryData(city.contery[0]) : null
    } else {
      countryData = mapCountryData(city.contery)
    }
  }

  return {
    _id: city._id,
    name: cityName,
    state: stateData,
    country: countryData,
    createdDate: city._createdDate,
    updatedDate: city._updatedDate,
  }
}

// ----------------------------------------------------------------------
// Helper to map branch data
// ----------------------------------------------------------------------
function mapBranchData(branch: any) {
  if (!branch) return null

  console.log('Processing branch:', branch["Branch Name"], branch._id)

  // Handle primary location
  let primaryLocationData = null
  if (branch["primary Location"]) {
    if (Array.isArray(branch["primary Location"])) {
      primaryLocationData = branch["primary Location"].length > 0 ? branch["primary Location"][0] : null
    } else {
      primaryLocationData = branch["primary Location"]
    }
  } else if (branch["Primary Location"]) {
    // Fallback to capitalized field name
    if (Array.isArray(branch["Primary Location"])) {
      primaryLocationData = branch["Primary Location"].length > 0 ? branch["Primary Location"][0] : null
    } else {
      primaryLocationData = branch["Primary Location"]
    }
  }

  // Handle doctors reference
  const doctorsData = branch.doctor_hospitalBranch || []
  const doctors = mapDoctors(doctorsData)

  const primaryLocation = mapCityData(primaryLocationData)

  return {
    _id: branch._id,
    branchName: branch["Branch Name"] || branch.branchName || "Unknown Branch",
    slug: branch.Slug || branch.slug || "",
    address: branch.Address || branch.address || "",
    pinCode: branch["Pin Code"] || branch.pinCode || "",
    phone: branch.Phone || branch.phone || "",
    email: branch.Email || branch.email || "",
    branchImageUrl: branch["Branch Image (Image URL)"] || branch["Branch Image"] || branch.branchImageUrl || "",
    mapEmbedUrl: branch["Map Embed (URL)"] || branch.mapEmbedUrl || "",
    primaryLocation,
    doctors,
    createdDate: branch._createdDate,
    updatedDate: branch._updatedDate,
  }
}

// ----------------------------------------------------------------------
// Helper to map hospital data
// ----------------------------------------------------------------------
function mapHospitalData(hospital: any) {
  if (!hospital) return null

  console.log('Processing hospital:', hospital.Name, hospital._id)

  // Handle branches reference
  const rawBranches = hospital.branches || hospital.HospitalList_branches || []
  console.log(`Hospital ${hospital.Name} has ${rawBranches.length} branches`)

  const mappedBranches = rawBranches.map(mapBranchData).filter(Boolean)
  console.log(`Mapped ${mappedBranches.length} branches for hospital ${hospital.Name}`)

  // Handle gallery images
  let gallery = []
  if (hospital["Gallery (Image URLs)"]) {
    gallery = Array.isArray(hospital["Gallery (Image URLs)"]) 
      ? hospital["Gallery (Image URLs)"] 
      : [hospital["Gallery (Image URLs)"]]
  }

  // Handle multi-specialty tags
  let specialtiesTags = []
  if (hospital["Multi-Specialty"]) {
    specialtiesTags = Array.isArray(hospital["Multi-Specialty"])
      ? hospital["Multi-Specialty"]
      : [hospital["Multi-Specialty"]]
  }

  return {
    _id: hospital._id,
    name: hospital.Name || hospital.name || "Unknown Hospital",
    slug: hospital.Slug || hospital.slug || "",
    logo: hospital["Logo (Image URL)"] || hospital.logo || "",
    bannerImage: hospital["Banner Image (Image URL)"] || hospital.bannerImage || "",
    description: hospital.Description || hospital.description || "",
    establishedDate: hospital["Established Date"] || hospital.establishedDate || null,
    specialtiesTags,
    gallery,
    branches: mappedBranches,
    branchCount: mappedBranches.length,
    createdDate: hospital._createdDate,
    updatedDate: hospital._updatedDate,
  }
}

// ----------------------------------------------------------------------
// Helper to filter branches by location
// ----------------------------------------------------------------------
function filterBranchesByLocation(branches: any[], cityId: string, stateId: string, countryId: string) {
  if (!cityId && !stateId && !countryId) {
    return branches
  }

  return branches.filter((branch: any) => {
    const location = branch.primaryLocation

    if (!location) {
      return false
    }

    if (cityId && location._id !== cityId) return false
    if (stateId && location.state?._id !== stateId) return false
    if (countryId && location.country?._id !== countryId) return false

    return true
  })
}

// ----------------------------------------------------------------------
// Helper to filter hospitals by location
// ----------------------------------------------------------------------
function filterHospitalsByLocation(hospitals: any[], cityId: string, stateId: string, countryId: string) {
  if (!cityId && !stateId && !countryId) {
    return hospitals
  }

  return hospitals.map((hospital: any) => {
    const filteredBranches = filterBranchesByLocation(hospital.branches, cityId, stateId, countryId)
    
    if (filteredBranches.length === 0) {
      return null
    }

    return {
      ...hospital,
      branches: filteredBranches,
      branchCount: filteredBranches.length
    }
  }).filter(Boolean)
}

// ----------------------------------------------------------------------
// GET handler for fetching hospitals with all related data
// ----------------------------------------------------------------------
export async function GET(request: NextRequest) {
  console.log(`[api/hospitals] GET request received`)

  try {
    const { searchParams } = new URL(request.url)
    const skip = Number(searchParams.get("skip") || 0)
    const limit = Math.min(Number(searchParams.get("limit") || DEFAULT_LIMIT), 100)
    const search = searchParams.get("search") || ""
    const cityId = searchParams.get("cityId") || ""
    const stateId = searchParams.get("stateId") || ""
    const countryId = searchParams.get("countryId") || ""
    const hospitalId = searchParams.get("hospitalId") || ""
    const action = searchParams.get("action") || ""

    console.log(`[api/hospitals] Query params:`, {
      skip, limit, search, cityId, stateId, countryId, hospitalId, action
    })

    // Direct cities collection fetch
    if (action === 'getCities') {
      console.log(`[api/hospitals] Direct cities fetch requested`)
      
      const citiesQuery = wixServerClient.items
        .query(COLLECTION_IDS.CITIES)
        .include("state", "contery")
        .limit(1000)

      const citiesResponse = await citiesQuery.find({ consistentRead: true })

      console.log(`[api/hospitals] Raw cities response count:`, citiesResponse.items?.length)

      if (!citiesResponse?.items || citiesResponse.items.length === 0) {
        return Response.json({
          data: [],
          cities: [],
          totalCount: 0,
          success: true,
          message: "No cities found"
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        })
      }

      const mappedCities = citiesResponse.items.map(mapCityData).filter(Boolean)

      return Response.json({
        data: mappedCities,
        cities: mappedCities,
        totalCount: mappedCities.length,
        success: true,
        message: "Cities fetched successfully"
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      })
    }

    // Build main query for hospitals
    let query = wixServerClient.items
      .query(COLLECTION_IDS.HOSPITALS)
      .include(
        "branches",
        "branches.primaryLocation",
        "branches.primaryLocation.state",
        "branches.primaryLocation.contery",
        "branches.doctor_hospitalBranch"
      )
      .skip(skip)
      .limit(limit)

    // Apply filters
    if (search) {
      query = query.contains("Name", search)
    }
    if (hospitalId) {
      query = query.eq("_id", hospitalId)
    }

    const response = await query.find({ consistentRead: true })
    console.log(`[api/hospitals] Wix response received, total hospitals: ${response.totalCount || 0}`)
    console.log(`[api/hospitals] Raw hospital items:`, response.items?.map((h: any) => ({
      id: h._id,
      name: h.Name,
      branchesCount: h.branches?.length || 0
    })))

    if (!response?.items || response.items.length === 0) {
      console.log(`[api/hospitals] No hospitals found in Wix response`)
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

    // Process hospitals with detailed logging
    const mappedHospitals = response.items.map((hospital: any) => {
      try {
        return mapHospitalData(hospital)
      } catch (error) {
        console.error(`[api/hospitals] Error mapping hospital ${hospital._id}:`, error)
        return null
      }
    }).filter(Boolean)

    console.log(`[api/hospitals] Mapped ${mappedHospitals.length} hospitals`)

    const filteredHospitals = filterHospitalsByLocation(mappedHospitals, cityId, stateId, countryId)
    console.log(`[api/hospitals] After location filtering: ${filteredHospitals.length} hospitals`)

    const hasMore = (response.totalCount || 0) > skip + filteredHospitals.length

    return Response.json(
      {
        data: filteredHospitals,
        totalCount: filteredHospitals.length,
        hasMore,
        filters: {
          applied: { cityId, stateId, countryId, hospitalId, search },
          originalCount: response.totalCount || 0,
          filteredCount: filteredHospitals.length
        }
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      }
    )
  } catch (error: any) {
    console.error("[api/hospitals] GET Error:", error)
    return Response.json(
      {
        error: "Failed to fetch hospitals",
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
    const { action, cityId, stateId, countryId, limit = 50, skip = 0, search } = body

    console.log(`[api/hospitals] POST request:`, { action, cityId, stateId, countryId, limit, skip, search })

    if (action === 'getBranchesWithCities') {
      // Query branches with all related data
      let branchesQuery = wixServerClient.items
        .query(COLLECTION_IDS.BRANCHES)
        .include(
          "primaryLocation",
          "primaryLocation.state",
          "primaryLocation.contery",
          "doctor_hospitalBranch"
        )
        .limit(Math.min(limit, 100))
        .skip(skip)

      if (search) {
        branchesQuery = branchesQuery.contains("Branch Name", search)
      }

      const branchesResponse = await branchesQuery.find({ consistentRead: true })

      console.log(`[api/hospitals] Raw branches response:`, branchesResponse.items?.length)

      if (!branchesResponse?.items || branchesResponse.items.length === 0) {
        return Response.json({
          branches: [],
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
      const filteredBranches = filterBranchesByLocation(mappedBranches, cityId, stateId, countryId)

      return Response.json({
        branches: filteredBranches,
        totalCount: filteredBranches.length,
        success: true,
        message: "Branches with city data fetched successfully"
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      })
    }

    if (action === 'getCities') {
      // Direct cities collection fetch via POST
      console.log(`[api/hospitals] Direct cities fetch via POST requested`)
      
      const citiesQuery = wixServerClient.items
        .query(COLLECTION_IDS.CITIES)
        .include("state", "contery")
        .limit(Math.min(limit, 1000))
        .skip(skip)

      if (search) {
        citiesQuery.contains("city name", search)
      }

      const citiesResponse = await citiesQuery.find({ consistentRead: true })

      console.log(`[api/hospitals] Raw cities response count:`, citiesResponse.items?.length)

      if (!citiesResponse?.items || citiesResponse.items.length === 0) {
        return Response.json({
          cities: [],
          totalCount: 0,
          success: true,
          message: "No cities found"
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        })
      }

      const mappedCities = citiesResponse.items.map(mapCityData).filter(Boolean)

      return Response.json({
        cities: mappedCities,
        totalCount: mappedCities.length,
        success: true,
        message: "Cities fetched successfully"
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      })
    }

    if (action === 'getDoctors') {
      // Fetch doctors directly
      let doctorsQuery = wixServerClient.items
        .query(COLLECTION_IDS.DOCTORS)
        .limit(Math.min(limit, 100))
        .skip(skip)

      if (search) {
        doctorsQuery = doctorsQuery.contains("Doctor Name", search)
      }

      const doctorsResponse = await doctorsQuery.find({ consistentRead: true })

      if (!doctorsResponse?.items || doctorsResponse.items.length === 0) {
        return Response.json({
          doctors: [],
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

      const mappedDoctors = mapDoctors(doctorsResponse.items)

      return Response.json({
        doctors: mappedDoctors,
        totalCount: mappedDoctors.length,
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

    return Response.json({
      error: "Invalid action",
      message: `Action '${action}' is not supported.`
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
      branches: [],
      cities: [],
      doctors: [],
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