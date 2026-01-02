// app/api/branches/route.ts
import { NextResponse } from "next/server"
import { wixClient } from "@/lib/wixClient"

const COLLECTIONS = {
  BRANCHES: "BranchesMaster",
  DOCTORS: "DoctorMaster",
  CITIES: "CityMaster",
  ACCREDITATIONS: "Accreditation",
  SPECIALTIES: "SpecialistsMaster",
  TREATMENTS: "TreatmentMaster",
}

// Helper functions from hospitals route
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

const normalizeDelhiNCR = (cityData: any) => {
  const cityName = (cityData.cityName || "").toLowerCase().trim();
  const stateName = (cityData.state || "").toLowerCase().trim();
  
  const isDelhiNCRCity =
    cityName.includes("delhi") || 
    cityName.includes("gurugram") || 
    cityName.includes("gurgaon") ||
    cityName.includes("noida") ||
    cityName.includes("faridabad") ||
    cityName.includes("ghaziabad");
  
  const isDelhiNCRState = 
    stateName.includes("delhi") || 
    stateName.includes("ncr") ||
    stateName === "delhi ncr";
  
  const isDelhiNCRRegion = 
    (stateName === "haryana" || stateName.includes("haryana")) && 
    (cityName.includes("gurugram") || cityName.includes("gurgaon") || cityName.includes("faridabad")) ||
    (stateName === "uttar pradesh" || stateName.includes("uttar pradesh") || stateName.includes("up")) && 
    (cityName.includes("noida") || cityName.includes("ghaziabad") || cityName.includes("greater noida"));
  
  if (isDelhiNCRCity || isDelhiNCRState || isDelhiNCRRegion) {
    return {
      ...cityData,
      cityName: cityData.cityName || "Unknown City",
      state: "Delhi NCR",
      country: "India",
    };
  }
  
  return {
    ...cityData,
    cityName: cityData.cityName || "Unknown City",
    state: cityData.state || "Unknown State",
    country: cityData.country || (cityData.state && cityData.state !== "Unknown State" ? "India" : "Unknown Country"),
  };
};

function extractRichText(richContent: any): string {
  if (!richContent) return ""
  if (typeof richContent === "string") return richContent.trim()

  if (richContent.data && richContent.data.aboutDoctor !== undefined) {
    richContent = richContent.data
  }

  try {
    if (richContent.nodes && Array.isArray(richContent.nodes)) {
      return richContent.nodes
        .map((node: any) => {
          if (node.nodes && Array.isArray(node.nodes)) {
            return node.nodes.map((child: any) => child.textData?.text || child.text || "").join("")
          }
          return node.textData?.text || node.text || ""
        })
        .filter(Boolean)
        .join("\n")
        .trim()
    }
  } catch (e) {
    console.warn("Rich text parse failed:", e)
  }

  return String(richContent).trim() || ""
}

function getValue(item: any, ...keys: string[]): string | null {
  for (const key of keys) {
    const val = item?.[key] ?? item?.data?.[key]
    if (val !== undefined && val !== null && val !== "") {
      return String(val).trim()
    }
  }
  return null
}

// Data Mappers
const DataMappers = {
  branch: (item: any) => ({
    _id: item._id || item.ID,
    branchName: getValue(item, "branchName", "Branch Name") || "Unknown Branch",
    address: getValue(item, "address", "Address"),
    city: [], // Will be enriched
    specialty: [], // Will be enriched
    accreditation: [], // Will be enriched
    description: extractRichText(item.description || item.data?.description || item.Description),
    totalBeds: getValue(item, "totalBeds", "Total Beds"),
    noOfDoctors: getValue(item, "noOfDoctors", "No of Doctors"),
    yearEstablished: getValue(item, "yearEstablished"),
    branchImage: item.branchImage || item.data?.branchImage || item["Branch Image"],
    doctors: [], // Will be enriched
    specialists: [], // Will be enriched
    treatments: [], // Will be enriched
    specialization: [], // Will be enriched
    popular: getValue(item, "popular") === "true",
  }),

  cityWithFullRefs: (item: any, stateMap: Record<string, any>, countryMap: Record<string, any>) => {
    const cityName = getValue(item, "cityName", "city name", "name", "City Name") || "Unknown City"
    
    let stateRefs = [] // Simplified for branches
    let stateName = "Unknown State"
    let countryName = "Unknown Country"
    let stateId: string | null = null
    let countryId: string | null = null
    
    // Specific Indian state detection based on city name patterns
    const lowerCityName = cityName.toLowerCase()
    if (stateName === "Unknown State") {
      if (lowerCityName.includes("mumbai") || lowerCityName.includes("pune") || lowerCityName.includes("nashik") || 
          lowerCityName.includes("nagpur") || lowerCityName.includes("aurangabad")) {
        stateName = "Maharashtra"
        countryName = "India"
      } else if (lowerCityName.includes("chennai") || lowerCityName.includes("coimbatore") || 
                  lowerCityName.includes("madurai")) {
        stateName = "Tamil Nadu"
        countryName = "India"
      } else if (lowerCityName.includes("bangalore") || lowerCityName.includes("bengaluru") || 
                  lowerCityName.includes("mysore")) {
        stateName = "Karnataka"
        countryName = "India"
      } else if (lowerCityName.includes("hyderabad") || lowerCityName.includes("vizag") || 
                  lowerCityName.includes("vijayawada")) {
        stateName = "Telangana/Andhra Pradesh"
        countryName = "India"
      } else if (lowerCityName.includes("kolkata") || lowerCityName.includes("howrah") || 
                  lowerCityName.includes("asansol")) {
        stateName = "West Bengal"
        countryName = "India"
      } else if (lowerCityName.includes("ahmedabad") || lowerCityName.includes("surat") || 
                  lowerCityName.includes("vadodara")) {
        stateName = "Gujarat"
        countryName = "India"
      } else if (lowerCityName.includes("jaipur") || lowerCityName.includes("jodhpur") || 
                  lowerCityName.includes("udaipur")) {
        stateName = "Rajasthan"
        countryName = "India"
      }
    }
    
    const cityData = {
      _id: item._id,
      cityName: cityName,
      stateId: stateId,
      state: stateName,
      countryId: countryId,
      country: countryName,
    }
    
    return normalizeDelhiNCR(cityData)
  },

  accreditation: (item: any) => ({
    _id: item._id,
    title: getValue(item, "title", "Title") || "Unknown Accreditation",
    image: item.image || item.data?.image || item.Image,
  }),

  specialty: (item: any) => ({
    _id: item._id,
    specialty: getValue(item, "specialty", "Specialty Name", "title", "name") || "Unknown Specialty",
  }),

  doctor: (item: any) => {
    const aboutField = item.aboutDoctor || item["aboutDoctor"] || item.data?.aboutDoctor || item.data?.["aboutDoctor"]
    const specialization = [] // Simplified

    return {
      _id: item._id || item.ID,
      doctorName: getValue(item, "doctorName", "Doctor Name") || "Unknown Doctor",
      specialization,
      qualification: getValue(item, "qualification", "Qualification"),
      experienceYears: getValue(item, "experienceYears", "Experience (Years)"),
      designation: getValue(item, "designation", "Designation"),
      aboutDoctor: extractRichText(aboutField),
      profileImage: item["profileImage"] || item["profile Image"] || item.profileImage || item.data?.profileImage,
      popular: getValue(item, "popular") === "true",
    }
  },

  treatment: (item: any) => ({
    _id: item._id || item.ID,
    name: getValue(item, "treatmentName", "Treatment Name", "title", "name") || "Unknown Treatment",
    description: extractRichText(item.Description || item.description),
    startingCost: getValue(item, "averageCost", "Starting Cost"),
    treatmentImage: item["treatmentImage"] || item.treatmentImage || item.data?.["treatment image"],
    popular: getValue(item, "popular") === "true",
    category: getValue(item, "category", "Category"),
    duration: getValue(item, "duration", "Duration"),
    cost: getValue(item, "cost", "Cost", "averageCost"),
  }),
}

// Reference Mapper
const ReferenceMapper = {
  multiReference: (field: any, ...nameKeys: string[]): any[] => {
    let items = []
    if (field) {
        items = Array.isArray(field) ? field : [field]
    }
    
    return items
      .filter(Boolean)
      .map((ref: any) => {
        if (typeof ref !== "object" && typeof ref !== "string") return null
        
        if (typeof ref === "string") return { _id: ref, name: "ID Reference" }
        
        if (typeof ref === "object") {
            const name = getValue(ref, ...nameKeys) || ref.name || ref.title || "Unknown"
            const id = ref._id || ref.ID || ref.data?._id || ref.wixId
            
            const finalName = name === "Unknown" ? (id ? "ID Reference" : "Unknown") : name
            return finalName && id ? { _id: id, name: finalName, ...ref } : null
        }
        return null;
      })
      .filter(Boolean)
  },
  
  extractIds: (refs: any[]): string[] =>
    refs.map((r) => (typeof r === "string" ? r : r?._id || r?.ID || r?.data?._id)).filter(Boolean) as string[],
}

// Data Fetcher
const DataFetcher = {
  async fetchCitiesWithStateAndCountry(ids: string[]) {
    if (!ids.length) return {}

    try {
      const cityRes = await wixClient.items
        .query(COLLECTIONS.CITIES)
        .hasSome("_id", ids)
        .limit(500)
        .find()
      
      // Simplified, no state fetching for branches
      const statesMap = {}
      const countriesMap = {}
      
      return cityRes.items.reduce((acc, item) => {
        acc[item._id!] = DataMappers.cityWithFullRefs(item, statesMap, countriesMap)
        return acc
      }, {} as Record<string, any>)
      
    } catch (error) {
      console.error("Error fetching cities:", error)
      return {}
    }
  },

  async fetchDoctors(ids: string[]) {
    if (!ids.length) return {}
    const res = await wixClient.items.query(COLLECTIONS.DOCTORS).hasSome("_id", ids).find()
    return res.items.reduce(
      (acc, d) => {
        acc[d._id!] = DataMappers.doctor(d)
        return acc
      },
      {} as Record<string, any>,
    )
  },

  async fetchByIds(collection: string, ids: string[], mapper: (i: any) => any) {
    if (!ids.length) return {}
    const res = await wixClient.items.query(collection).hasSome("_id", ids).find()
    return res.items.reduce(
      (acc, item) => {
        acc[item._id!] = mapper(item)
        return acc
      },
      {} as Record<string, any>,
    )
  },
}

// Enrich Branches
async function enrichBranches(branches: any[]) {
  const doctorIds = new Set<string>()
  const cityIds = new Set<string>()
  const accreditationIds = new Set<string>()
  const treatmentIds = new Set<string>()
  const specialistIds = new Set<string>()

  branches.forEach((b: any) => {
    ReferenceMapper.extractIds(b.doctors).forEach((id) => doctorIds.add(id))
    ReferenceMapper.extractIds(b.city).forEach((id) => cityIds.add(id))
    ReferenceMapper.extractIds(b.accreditation).forEach((id) => accreditationIds.add(id))
    ReferenceMapper.extractIds(b.specialists).forEach((id) => specialistIds.add(id))
    ReferenceMapper.extractIds(b.treatments).forEach((id) => treatmentIds.add(id))

    b.specialization.forEach((s: any) => {
      if (s.isTreatment) {
        treatmentIds.add(s._id)
      } else {
        specialistIds.add(s._id)
      }
    })
  })

  const [doctors, cities, accreditations, treatments, specialists] = await Promise.all([
    DataFetcher.fetchDoctors(Array.from(doctorIds)),
    DataFetcher.fetchCitiesWithStateAndCountry(Array.from(cityIds)),
    DataFetcher.fetchByIds(COLLECTIONS.ACCREDITATIONS, Array.from(accreditationIds), DataMappers.accreditation),
    DataFetcher.fetchByIds(COLLECTIONS.TREATMENTS, Array.from(treatmentIds), DataMappers.treatment),
    DataFetcher.fetchByIds(COLLECTIONS.SPECIALTIES, Array.from(specialistIds), DataMappers.specialty),
  ])

  return branches.map((branch) => {
    const enrichedCities = branch.city.map((c: any) => {
      const enrichedCity = cities[c._id] || c
      return normalizeDelhiNCR(enrichedCity)
    })
      
    if (enrichedCities.length === 0) {
      enrichedCities.push(normalizeDelhiNCR({
        _id: `fallback-${branch._id}`,
        cityName: "Unknown City",
        state: "Unknown State",
        country: "Unknown Country",
      }))
    }
      
    return {
      ...branch,
      doctors: branch.doctors.map((d: any) => doctors[d._id] || d),
      city: enrichedCities,
      accreditation: branch.accreditation.map((a: any) => accreditations[a._id] || a),
      specialists: branch.specialists.map((s: any) => specialists[s._id] || s),
      treatments: branch.treatments.map((t: any) => treatments[t._id] || t),
      specialization: branch.specialization.map((s: any) => {
        if (s.isTreatment) {
          return treatments[s._id] || s
        } else {
          return specialists[s._id] || s
        }
      }),
    }
  })
}

// GET /api/branches
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const params = {
      page: Math.max(0, Number(url.searchParams.get("page") || 0)),
      pageSize: Math.min(100, Number(url.searchParams.get("pageSize") || 30)),
      branchId: url.searchParams.get("branchId")?.trim(),
      branchText: url.searchParams.get("branch")?.trim(),
      cityText: url.searchParams.get("city")?.trim(),
      doctorText: url.searchParams.get("doctor")?.trim(),
      specialtyText: url.searchParams.get("specialty")?.trim(),
      accreditationText: url.searchParams.get("accreditation")?.trim(),
      treatmentText: url.searchParams.get("treatment")?.trim(),
    }

    // Simplified search - direct queries
    const branchIdsFromText = params.branchText
      ? await DataFetcher.searchIds(COLLECTIONS.BRANCHES, ["branchName"], params.branchText)
      : []

    const cityIdsFromText = params.cityText 
      ? await DataFetcher.searchIds(COLLECTIONS.CITIES, ["cityName"], params.cityText) 
      : []

    const doctorIdsFromText = params.doctorText
      ? await DataFetcher.searchIds(COLLECTIONS.DOCTORS, ["doctorName"], params.doctorText)
      : []

    const specialtyIdsFromText = params.specialtyText
      ? await DataFetcher.searchIds(COLLECTIONS.SPECIALTIES, ["specialty"], params.specialtyText)
      : []

    const accreditationIdsFromText = params.accreditationText
      ? await DataFetcher.searchIds(COLLECTIONS.ACCREDITATIONS, ["title"], params.accreditationText)
      : []

    const treatmentIdsFromText = params.treatmentText
      ? await DataFetcher.searchIds(COLLECTIONS.TREATMENTS, ["treatmentName"], params.treatmentText)
      : []

    let query = wixClient.items
      .query(COLLECTIONS.BRANCHES)
      .include("city", "doctor", "specialty", "accreditation", "treatment", "specialist")
      .descending("_createdDate")
      .limit(params.pageSize)
      .skip(params.page * params.pageSize)

    if (params.branchId) {
      query = query.eq("_id", params.branchId)
    }

    // Apply filters directly
    if (branchIdsFromText.length > 0) {
      query = query.hasSome("_id", branchIdsFromText)
    }
    if (cityIdsFromText.length > 0) {
      query = query.hasSome("city", cityIdsFromText)
    }
    if (doctorIdsFromText.length > 0) {
      query = query.hasSome("doctor", doctorIdsFromText)
    }
    if (specialtyIdsFromText.length > 0) {
      query = query.hasSome("specialty", specialtyIdsFromText)
    }
    if (accreditationIdsFromText.length > 0) {
      query = query.hasSome("accreditation", accreditationIdsFromText)
    }
    if (treatmentIdsFromText.length > 0) {
      query = query.hasSome("treatment", treatmentIdsFromText)
    }

    const result = await query.find()
    const mappedBranches = result.items.map(DataMappers.branch)
    const enriched = await enrichBranches(mappedBranches)

    return NextResponse.json({
      items: enriched,
      total: result.totalCount || enriched.length,
      page: params.page,
      pageSize: params.pageSize,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    const errorMessage = error.message || "An unknown error occurred on the server."
    return NextResponse.json({ error: "Failed to fetch branches", details: errorMessage }, { status: 500 })
  }
}

// Add searchIds to DataFetcher
DataFetcher.searchIds = async function(collection: string, fields: string[], query: string): Promise<string[]> {
  const ids = new Set<string>()
  for (const field of fields) {
    try {
      const res = await wixClient.items
        .query(collection)
        .contains(field as any, query)
        .limit(500)
        .find()
      res.items.forEach((i: any) => i._id && ids.add(i._id))
    } catch (e) {
      console.warn(`Search failed on ${collection}.${field}:`, e)
    }
  }
  return Array.from(ids)
}