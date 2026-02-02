// app/api/hospitals/route.ts
import { NextResponse } from "next/server"
import { wixClient } from "@/lib/wixClient"
import { COLLECTIONS } from './collections'
import { searchIds, searchBranches, fetchAllBranches } from './fetchers'
import { getAllHospitals } from './handlers'
import { isStandaloneBranch } from './utils'
import type { ApiParams, FilterIds, ApiResponse } from './types'

// Cache for branches to avoid multiple expensive fetches
let branchesCache: any[] | null = null
let branchesCacheTime: number = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

async function getCachedBranches(): Promise<any[]> {
  const now = Date.now()
  if (branchesCache && (now - branchesCacheTime) < CACHE_DURATION) {
    return branchesCache
  }

  branchesCache = await fetchAllBranches()
  branchesCacheTime = now
  return branchesCache
}

// GET /api/hospitals
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const params: ApiParams = {
      q: url.searchParams.get("q")?.trim() || "",
      slug: url.searchParams.get("slug")?.trim() || "",
      page: Math.max(0, Number(url.searchParams.get("page") || 0)),
      pageSize: Math.min(1000, Number(url.searchParams.get("pageSize") || 100)),
      hospitalId: url.searchParams.get("hospitalId")?.trim(),
      hospitalText: url.searchParams.get("hospital")?.trim(),
      branchText: url.searchParams.get("branch")?.trim(),
      cityText: url.searchParams.get("city")?.trim(),
      doctorText: url.searchParams.get("doctor")?.trim(),
      specialtyText: url.searchParams.get("specialty")?.trim(),
      accreditationText: url.searchParams.get("accreditation")?.trim(),
      treatmentText: url.searchParams.get("treatment")?.trim(),
      specialistText: url.searchParams.get("specialist")?.trim(),
      departmentText: url.searchParams.get("department")?.trim(),
      branchId: url.searchParams.get("branchId")?.trim() || undefined,
      cityId: url.searchParams.get("cityId")?.trim() || undefined,
      doctorId: url.searchParams.get("doctorId")?.trim() || undefined,
      specialtyId: url.searchParams.get("specialtyId")?.trim() || undefined,
      accreditationId: url.searchParams.get("accreditationId")?.trim() || undefined,
      treatmentId: url.searchParams.get("treatmentId")?.trim() || undefined,
      specialistId: url.searchParams.get("specialistId")?.trim() || undefined,
      departmentId: url.searchParams.get("departmentId")?.trim() || undefined,
      includeStandalone: url.searchParams.get("includeStandalone") === "true",
      minimal: url.searchParams.get("minimal") === "true",
      showHospital: true,
    }

    // Perform text searches to get IDs
    const [
      branchIdsFromText,
      cityIdsFromText,
      doctorIdsFromText,
      specialtyIdsFromText,
      accreditationIdsFromText,
      treatmentIdsFromText,
      specialistIdsFromText,
      departmentIdsFromText,
    ] = await Promise.all([
      params.branchText
        ? searchBranches("branchName", params.branchText)
        : Promise.resolve([]),
      params.cityText ? searchIds(COLLECTIONS.CITIES, ["cityName"], params.cityText) : Promise.resolve([]),
      params.doctorText
        ? searchIds(COLLECTIONS.DOCTORS, ["doctorName"], params.doctorText)
        : Promise.resolve([]),
      params.specialtyText
        ? searchIds(COLLECTIONS.SPECIALTIES, ["specialty"], params.specialtyText)
        : Promise.resolve([]),
      params.accreditationText
        ? searchIds(COLLECTIONS.ACCREDITATIONS, ["title"], params.accreditationText)
        : Promise.resolve([]),
      params.treatmentText
        ? searchIds(COLLECTIONS.TREATMENTS, ["treatmentName"], params.treatmentText)
        : Promise.resolve([]),
      params.specialistText
        ? searchIds(COLLECTIONS.SPECIALTIES, ["specialist"], params.specialistText)
        : Promise.resolve([]),
      params.departmentText
        ? searchIds(COLLECTIONS.DEPARTMENTS, ["department", "name"], params.departmentText)
        : Promise.resolve([]),
    ])

    const filterIds: FilterIds = {
      branch: [...branchIdsFromText, ...(params.branchId ? [params.branchId] : [])],
      city: [...cityIdsFromText, ...(params.cityId ? [params.cityId] : [])],
      doctor: [...doctorIdsFromText, ...(params.doctorId ? [params.doctorId] : [])],
      specialty: [...specialtyIdsFromText, ...(params.specialtyId ? [params.specialtyId] : [])],
      accreditation: [...accreditationIdsFromText, ...(params.accreditationId ? [params.accreditationId] : [])],
      treatment: [...treatmentIdsFromText, ...(params.treatmentId ? [params.treatmentId] : [])],
      specialist: [...specialistIdsFromText, ...(params.specialistId ? [params.specialistId] : [])],
      department: [...departmentIdsFromText, ...(params.departmentId ? [params.departmentId] : [])],
    }

    // Removed console logs for production performance

    // For minimal requests or when we need counts, get all hospitals
    let allHospitals: any[] = [];
    let totalCount = 0;

    if (params.minimal || Object.keys(filterIds).some(key => filterIds[key as keyof FilterIds].length > 0) || params.q || params.slug) {
      // For filtered/search requests, we need to get all and filter
      const cachedBranches = await getCachedBranches();
      allHospitals = await getAllHospitals(
        filterIds,
        params.q || undefined,
        params.includeStandalone,
        params.minimal,
        params.slug || undefined,
        cachedBranches,
        params.showHospital
      );
      totalCount = allHospitals.length;

      // Apply pagination
      const startIndex = params.page * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedHospitals = allHospitals.slice(startIndex, endIndex);

      // Get total counts for metadata
      const regularHospitalCount = allHospitals.filter(h => !h.isStandalone).length;
      const standaloneBranchesCount = allHospitals.filter(h => h.isStandalone).length;

      const response: ApiResponse = {
        items: paginatedHospitals,
        total: totalCount,
        page: params.page,
        pageSize: params.pageSize,
        regularCount: regularHospitalCount,
        standaloneCount: standaloneBranchesCount,
        filteredCount: allHospitals.length,
      }

      // Dynamic caching based on request type
      const hasFilters = Object.keys(filterIds).some(key => filterIds[key as keyof FilterIds].length > 0) || params.q || params.slug;
      const cacheControl = hasFilters
        ? 'public, s-maxage=600, stale-while-revalidate=1200'  // 10 min cache, 20 min stale
        : 'public, s-maxage=600, stale-while-revalidate=1200'; // 10 min cache, 20 min stale

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': cacheControl,
        },
      });
    } else {
      // For unfiltered requests, get all hospitals using the handler
      const cachedBranches = await getCachedBranches();
      const allHospitalsList = await getAllHospitals(
        {
          branch: [],
          city: [],
          doctor: [],
          specialty: [],
          accreditation: [],
          treatment: [],
          specialist: [],
          department: []
        },
        "",
        true,
        params.minimal,
        undefined,
        cachedBranches,
        params.showHospital
      );

      totalCount = allHospitalsList.length;

      // Apply pagination
      const startIndex = params.page * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedHospitals = allHospitalsList.slice(startIndex, endIndex);

      // Get counts
      const regularHospitalCount = allHospitalsList.filter(h => !h.isStandalone).length;
      const standaloneBranchesCount = allHospitalsList.filter(h => h.isStandalone).length;

      const response: ApiResponse = {
        items: paginatedHospitals,
        total: totalCount,
        page: params.page,
        pageSize: params.pageSize,
        regularCount: regularHospitalCount,
        standaloneCount: standaloneBranchesCount,
        filteredCount: totalCount,
      }

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      });
    }
  } catch (error: any) {
    console.error("API Error:", error)
    const errorMessage = error.message || "An unknown error occurred on the server."
    return NextResponse.json({ error: "Failed to fetch hospitals", details: errorMessage }, { status: 500 })
  }
}