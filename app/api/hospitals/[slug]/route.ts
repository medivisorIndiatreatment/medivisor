// app/api/branches/route.ts - Updated with proper multi-reference handling
import { NextResponse } from "next/server";
import { wixClient } from "@/lib/wixClient";

const BRANCHES_COLLECTION = "BranchesMaster";
const DOCTOR_COLLECTION_ID = "DoctorMaster";
const CITY_COLLECTION_ID = "CityMaster";
const TREATMENT_COLLECTION_ID = "TreatmentMaster";
const HOSPITAL_COLLECTION_ID = "HospitalMaster";

// Utility function to get value from nested fields
function val(item: any, ...keys: string[]): string | null | undefined {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

// Map doctor data from Doctor Master
function mapDoctor(item: any) {
  // Handle profile image - can be string or rich content object
  let profileImage = null;
  const rawImage = val(item, "Profile Image", "profileImage");
  if (rawImage) {
    if (typeof rawImage === "string") {
      profileImage = rawImage;
    } else if (rawImage.url) {
      profileImage = rawImage.url;
    } else if (rawImage.image && rawImage.image.url) {
      profileImage = rawImage.image.url;
    }
  }

  return {
    _id: item._id || item.ID,
    name: val(item, "Doctor Name", "doctorName", "name") ?? "Doctor",
    specialization: val(item, "Specialization", "specialization") ?? null,
    qualification: val(item, "Qualification", "qualification") ?? null,
    experience: val(item, "Experience (Years)", "experience") ?? null,
    designation: val(item, "Designation", "designation") ?? null,
    languagesSpoken: val(item, "Languages Spoken", "languagesSpoken") ?? null,
    about: val(item, "About Doctor", "about") ?? null,
    profileImage,
    cityId: val(item, "City (ID)", "cityId") ?? null,
    stateId: val(item, "State (ID)", "stateId") ?? null,
    countryId: val(item, "Country (ID)", "countryId") ?? null,
  };
}

// Map city data from City Master
function mapCity(item: any) {
  return {
    _id: item._id || item.ID,
    name: val(item, "city name", "cityName", "name") ?? "City",
    state: val(item, "state", "stateName") ?? null,
    country: val(item, "contery", "country", "countryName") ?? null,
  };
}

// Map treatment data
function mapTreatment(item: any) {
  return {
    _id: item._id || item.ID,
    name: val(item, "Treatment Name", "treatmentName", "name") ?? "Treatment",
    description: val(item, "Description", "description") ?? null,
    category: val(item, "Category", "category") ?? null,
    duration: val(item, "Duration", "duration") ?? null,
    cost: val(item, "Cost", "cost", "price") ?? null,
  };
}

// Map branch data with proper multi-reference handling
function mapBranch(item: any) {
  // Handle hospital reference
  const hospitalRef = item.hospital || item.HospitalMaster_branches;
  let hospitalId: string | null = null;
  let hospitalData: any = null;
  
  if (Array.isArray(hospitalRef)) {
    hospitalId = hospitalRef[0]?._id || hospitalRef[0] || null;
    hospitalData = hospitalRef[0] || null;
  } else if (hospitalRef?._id) {
    hospitalId = hospitalRef._id;
    hospitalData = hospitalRef;
  } else if (typeof hospitalRef === "string") {
    hospitalId = hospitalRef;
  }

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
    
    // Multi-reference fields
    hospital: hospitalId,
    hospitalData: hospitalData ? {
      _id: hospitalData._id || hospitalData.ID,
      name: val(hospitalData, "Hospital Name", "hospitalName", "name") ?? "Hospital",
      slug: val(hospitalData, "slug", "Slug") ?? null,
      image: val(hospitalData, "Hospital Image", "hospitalImage", "image") ?? null,
      logo: val(hospitalData, "Logo", "logo") ?? null,
    } : null,
    
    doctors: mapMultiReferenceField(item.doctor, "Doctor Name", "doctorName", "name"),
    treatments: mapMultiReferenceField(item.treatment, "Treatment Name", "treatmentName", "name"),
  };
}

// Generic function to handle multi-reference fields
function mapMultiReferenceField(field: any, ...nameFields: string[]): any[] {
  if (!field) return [];
  
  if (Array.isArray(field)) {
    return field.map((item: any) => {
      if (typeof item === "string") {
        return { _id: item };
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
      };
    }).filter(Boolean);
  }
  
  return [];
}

async function buildBranchesQuery(
  cityId?: string,
  doctorId?: string,
  treatmentId?: string,
  hospitalId?: string,
  includeReferences: boolean = true
) {
  const client = wixClient;
  let query = client.items
    .query(BRANCHES_COLLECTION)
    .descending("_createdDate");

  // Include referenced fields if requested
  if (includeReferences) {
    query = query
      .include("hospital")
      .include("doctor")  
      .include("treatment")
      .include("city");
  }

  // Apply filters
  if (cityId) {
    query = query.hasSome("city" as any, [cityId]);
  }

  if (doctorId) {
    query = query.hasSome("doctor" as any, [doctorId]);
  }

  if (treatmentId) {
    query = query.hasSome("treatment" as any, [treatmentId]);
  }

  if (hospitalId) {
    query = query.hasSome("hospital" as any, [hospitalId]);
  }

  return query;
}

// Fetch additional data for references that might be missing
async function fetchDoctorsData(doctorIds: string[]) {
  if (!doctorIds.length) return {};

  try {
    const doctors = await wixClient.items
      .query(DOCTOR_COLLECTION_ID)
      .hasSome("_id", doctorIds)
      .find();

    return doctors.items.reduce((acc, doctor) => {
      acc[doctor._id!] = mapDoctor(doctor);
      return acc;
    }, {} as Record<string, any>);
  } catch (error) {
    console.error("Error fetching doctors data:", error);
    return {};
  }
}

async function fetchCitiesData(cityIds: string[]) {
  if (!cityIds.length) return {};

  try {
    const cities = await wixClient.items
      .query(CITY_COLLECTION_ID)
      .hasSome("_id", cityIds)
      .find();

    return cities.items.reduce((acc, city) => {
      acc[city._id!] = mapCity(city);
      return acc;
    }, {} as Record<string, any>);
  } catch (error) {
    console.error("Error fetching cities data:", error);
    return {};
  }
}

async function fetchTreatmentsData(treatmentIds: string[]) {
  if (!treatmentIds.length) return {};

  try {
    const treatments = await wixClient.items
      .query(TREATMENT_COLLECTION_ID)
      .hasSome("_id", treatmentIds)
      .find();

    return treatments.items.reduce((acc, treatment) => {
      acc[treatment._id!] = mapTreatment(treatment);
      return acc;
    }, {} as Record<string, any>);
  } catch (error) {
    console.error("Error fetching treatments data:", error);
    return {};
  }
}

// Extract IDs from multi-reference fields
function extractIdsFromReferences(references: any[]): string[] {
  return references
    .map(ref => {
      if (typeof ref === 'string') return ref;
      if (ref?._id) return ref._id;
      return null;
    })
    .filter((id): id is string => id !== null);
}

export async function GET(req: Request) {
  try {
    const client = wixClient;
    const url = new URL(req.url);
    
    // Query parameters
    const cityId = url.searchParams.get("cityId")?.trim();
    const doctorId = url.searchParams.get("doctorId")?.trim();
    const treatmentId = url.searchParams.get("treatmentId")?.trim();
    const hospitalId = url.searchParams.get("hospitalId")?.trim();
    const includeReferences = url.searchParams.get("includeReferences") !== "false";
    const page = Number(url.searchParams.get("page") || "0");
    const pageSize = Math.min(50, Number(url.searchParams.get("pageSize") || "20"));

    // Build and execute branches query
    const query = await buildBranchesQuery(cityId, doctorId, treatmentId, hospitalId, includeReferences);
    const res = await query
      .skip(page * pageSize)
      .limit(pageSize)
      .find({ consistentRead: true });

    let branches = (res?.items || []).map(mapBranch);

    // If references are missing or incomplete, fetch them separately
    if (branches.length > 0) {
      // Collect all reference IDs that need to be fetched
      const allDoctorIds: string[] = [];
      const allCityIds: string[] = [];
      const allTreatmentIds: string[] = [];

      branches.forEach(branch => {
        // Extract IDs from multi-reference arrays
        if (branch.doctors) {
          allDoctorIds.push(...extractIdsFromReferences(branch.doctors));
        }
        if (branch.city) {
          allCityIds.push(...extractIdsFromReferences(branch.city));
        }
        if (branch.treatments) {
          allTreatmentIds.push(...extractIdsFromReferences(branch.treatments));
        }
      });

      // Fetch missing data in parallel
      const [doctorsMap, citiesMap, treatmentsMap] = await Promise.all([
        fetchDoctorsData([...new Set(allDoctorIds)]),
        fetchCitiesData([...new Set(allCityIds)]),
        fetchTreatmentsData([...new Set(allTreatmentIds)]),
      ]);

      // Enrich branch data with complete reference information
      branches = branches.map(branch => {
        const enrichedDoctors = branch.doctors.map((doctor: any) => {
          const doctorId = typeof doctor === 'string' ? doctor : doctor._id;
          return doctorsMap[doctorId] || doctor;
        });

        const enrichedCities = branch.city.map((city: any) => {
          const cityId = typeof city === 'string' ? city : city._id;
          return citiesMap[cityId] || city;
        });

        const enrichedTreatments = branch.treatments.map((treatment: any) => {
          const treatmentId = typeof treatment === 'string' ? treatment : treatment._id;
          return treatmentsMap[treatmentId] || treatment;
        });

        return {
          ...branch,
          doctors: enrichedDoctors,
          city: enrichedCities,
          treatments: enrichedTreatments,
        };
      });
    }

    return NextResponse.json({
      items: branches,
      totalCount: res?.totalCount ?? branches.length,
      page,
      pageSize,
      filters: {
        cityId,
        doctorId,
        treatmentId,
        hospitalId
      }
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}