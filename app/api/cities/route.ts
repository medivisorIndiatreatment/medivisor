// app/api/cities/route.ts
import { NextResponse } from "next/server";
import { wixClient } from "@/lib/wixClient";
import type { City, PopulatedBranch, Hospital } from "@/types/hospital";

const CITY_COLLECTION_ID = "CityMaster";
const BRANCHES_COLLECTION = "BranchesMaster";
const HOSPITAL_COLLECTION_ID = "HospitalMaster";
const CITY_FIELD_IN_BRANCHES = "city";
const HOSPITAL_FIELD_IN_BRANCHES = "hospital";
const DOCTOR_FIELD_IN_BRANCHES = "doctor";
const TREATMENT_FIELD_IN_BRANCHES = "treatment";

// Utility function
function val(item: any, ...keys: string[]): string | null | undefined {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

// Map city data
function mapCity(item: any): City {
  return {
    _id: item._id,
    name: item["cityName"] || item["City Name"] || item.cityName || "Unknown",
    state: val(item, "State", "state") ?? null,
    stateId: val(item, "State (ID)", "stateId") ?? null,
    countryId: val(item, "Country (ID)", "countryId") ?? null,
    createdDate: val(item, "_createdDate") ?? null,
  };
}

// Map hospital data
function mapHospital(item: any): Hospital {
  return {
    _id: item._id || item.ID,
    slug: val(item, "slug", "Slug") ?? null,
    name: val(item, "Hospital Name", "hospitalName", "name") ?? "Hospital",
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
  };
}

// Map branch data for city context
function mapBranchForCity(branch: any, hospitals: Hospital[]): PopulatedBranch {
  // Extract hospital reference from branch
  let hospital: Hospital | null = null;
  const hospitalRef = branch[HOSPITAL_FIELD_IN_BRANCHES];
  
  if (hospitalRef) {
    if (Array.isArray(hospitalRef)) {
      // Handle array of hospital references
      const hospitalId = hospitalRef[0]?._id || hospitalRef[0];
      hospital = hospitals.find(h => h._id === hospitalId) || null;
    } else if (typeof hospitalRef === 'object' && hospitalRef._id) {
      // Handle single hospital object reference
      hospital = hospitals.find(h => h._id === hospitalRef._id) || null;
    } else if (typeof hospitalRef === 'string') {
      // Handle single hospital ID reference
      hospital = hospitals.find(h => h._id === hospitalRef) || null;
    }
  }

  return {
    _id: branch._id,
    slug: branch.slug ?? null,
    name: val(branch, "Branch Name", "branchName", "name") || "Branch",
    image: val(branch, "Branch Image", "branchImage", "image"),
    address: val(branch, "address", "Address"),
    phone: val(branch, "phone", "Phone"),
    email: val(branch, "email", "Email"),
    totalBeds: val(branch, "totalBeds", "Total Beds"),
    icuBeds: val(branch, "icuBeds", "ICU Beds"),
    emergencyContact: val(branch, "emergencyContact", "Emergency Contact"),
    doctors: [], // You can populate this if needed
    treatments: [], // You can populate this if needed
    city: null, // Will be set by parent city
    hospital: hospital,
  } as PopulatedBranch;
}

// Extended City type with branches
interface CityWithBranches extends City {
  branches: PopulatedBranch[];
  hospitals: Hospital[];
  branchesCount: number;
}

/**
 * Extract hospital IDs from branches with proper multi-reference handling
 */
function extractHospitalIdsFromBranches(branches: any[]): string[] {
  const hospitalIds = new Set<string>();

  branches.forEach((branch) => {
    const hospitalRef = branch[HOSPITAL_FIELD_IN_BRANCHES];
    
    if (hospitalRef) {
      if (Array.isArray(hospitalRef)) {
        // Handle array of references
        hospitalRef.forEach((ref) => {
          if (typeof ref === 'string') {
            hospitalIds.add(ref);
          } else if (ref && ref._id) {
            hospitalIds.add(ref._id);
          }
        });
      } else if (typeof hospitalRef === 'object' && hospitalRef._id) {
        // Handle single object reference
        hospitalIds.add(hospitalRef._id);
      } else if (typeof hospitalRef === 'string') {
        // Handle single ID reference
        hospitalIds.add(hospitalRef);
      }
    }
  });

  return Array.from(hospitalIds);
}

/**
 * Fetches all cities with their associated branches and hospitals
 */
async function getCitiesWithBranches(cityId?: string): Promise<CityWithBranches[]> {
  const client = wixClient;
  
  // Build base query for cities
  let cityQuery = client.items
    .query(CITY_COLLECTION_ID)
    .ascending("name")
    .limit(1000);

  // Filter by specific city if ID provided
  if (cityId) {
    cityQuery = cityQuery.eq("_id", cityId);
  }

  const citiesRes = await cityQuery.find({ consistentRead: true });
  const cities = (citiesRes?.items || []).map(mapCity);

  const citiesWithBranches: CityWithBranches[] = [];

  for (const city of cities) {
    try {
      // Find branches in this city
      const branchesRes = await client.items
        .query(BRANCHES_COLLECTION)
        .eq(CITY_FIELD_IN_BRANCHES as any, city._id)
        .limit(1000)
        .find({ consistentRead: true });

      const branches = branchesRes?.items || [];
      
      if (branches.length === 0) {
        // No branches in this city
        citiesWithBranches.push({
          ...city,
          branches: [],
          hospitals: [],
          branchesCount: 0,
        });
        continue;
      }

      // Extract hospital IDs from all branches
      const hospitalIds = extractHospitalIdsFromBranches(branches);
      
      let hospitals: Hospital[] = [];
      
      // Fetch hospital details if we have hospital IDs
      if (hospitalIds.length > 0) {
        try {
          const hospitalsRes = await client.items
            .query(HOSPITAL_COLLECTION_ID)
            .hasSome("_id", hospitalIds)
            .limit(1000)
            .find({ consistentRead: true });
          
          hospitals = (hospitalsRes?.items || []).map(mapHospital);
        } catch (hospitalError) {
          console.error(`Error fetching hospitals for city ${city.name}:`, hospitalError);
          hospitals = [];
        }
      }

      // Map branches with hospital information
      const populatedBranches = branches.map((branch: any) => 
        mapBranchForCity(branch, hospitals)
      );

      citiesWithBranches.push({
        ...city,
        branches: populatedBranches,
        hospitals: hospitals,
        branchesCount: populatedBranches.length,
      });

    } catch (error) {
      console.error(`Error processing city ${city.name}:`, error);
      // Push city with empty branches on error
      citiesWithBranches.push({
        ...city,
        branches: [],
        hospitals: [],
        branchesCount: 0,
      });
    }
  }

  return citiesWithBranches;
}

/**
 * Debug function to check branch data structure
 */
async function debugBranchData(cityId: string) {
  const client = wixClient;
  
  const branchesRes = await client.items
    .query(BRANCHES_COLLECTION)
    .eq(CITY_FIELD_IN_BRANCHES as any, cityId)
    .limit(5)
    .find({ consistentRead: true });

  console.log('Debug - Branch data structure:');
  branchesRes.items.forEach((branch: any, index: number) => {
    console.log(`Branch ${index + 1}:`, {
      id: branch._id,
      name: branch.name || branch.branchName,
      hospitalField: branch[HOSPITAL_FIELD_IN_BRANCHES],
      hospitalFieldType: typeof branch[HOSPITAL_FIELD_IN_BRANCHES],
      isArray: Array.isArray(branch[HOSPITAL_FIELD_IN_BRANCHES]),
    });
  });

  return branchesRes.items;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cityId = url.searchParams.get("cityId")?.trim();
    const withBranches = url.searchParams.get("withBranches") === "true";
    const debug = url.searchParams.get("debug") === "true";
    const page = Number(url.searchParams.get("page") || "0");
    const pageSize = Math.min(100, Number(url.searchParams.get("pageSize") || "50"));

    // Debug mode to check data structure
    if (debug && cityId) {
      const debugData = await debugBranchData(cityId);
      return NextResponse.json({ debug: debugData });
    }

    if (withBranches || cityId) {
      // Get cities with full branch data
      const citiesWithBranches = await getCitiesWithBranches(cityId || undefined);
      
      if (cityId) {
        // Return single city
        const city = citiesWithBranches[0] || null;
        
        // Log for debugging
        if (city) {
          console.log(`City ${city.name} has ${city.branchesCount} branches and ${city.hospitals.length} hospitals`);
          city.branches.forEach(branch => {
            console.log(`Branch ${branch.name} has hospital:`, branch.hospital?.name || 'No hospital');
          });
        }
        
        return NextResponse.json({
          item: city,
        });
      }

      // Return paginated list
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCities = citiesWithBranches.slice(startIndex, endIndex);

      return NextResponse.json({
        items: paginatedCities,
        totalCount: citiesWithBranches.length,
        page,
        pageSize,
      });
    } else {
      // Get basic cities list only
      const client = wixClient;
      const res = await client.items
        .query(CITY_COLLECTION_ID)
        .ascending("name")
        .skip(page * pageSize)
        .limit(pageSize)
        .find({ consistentRead: true });

      const cities = (res?.items || []).map(mapCity);

      return NextResponse.json({
        items: cities,
        totalCount: res?.totalCount ?? cities.length,
        page,
        pageSize,
      });
    }
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}