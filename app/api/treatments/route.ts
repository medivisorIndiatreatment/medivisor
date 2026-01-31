// app/api/treatments/route.ts
// API endpoint to fetch all treatments directly from TreatmentMaster collection

import { NextResponse } from "next/server"
import { wixClient } from "@/lib/wixClient"
import { COLLECTIONS } from '@/app/api/hospitals/collections'
import { DataMappers } from '@/app/api/hospitals/mappers'
import type { ExtendedTreatmentType } from '@/types/search'

// Cache for all treatments to avoid multiple expensive fetches
let treatmentsCache: ExtendedTreatmentType[] | null = null
let treatmentsCacheTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// GET /api/treatments
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const searchQuery = url.searchParams.get("q")?.trim().toLowerCase() || ""
    const category = url.searchParams.get("category")?.trim() || ""
    const popular = url.searchParams.get("popular") === "true"
    const page = Math.max(0, Number(url.searchParams.get("page") || 0))
    const pageSize = Math.min(500, Number(url.searchParams.get("pageSize") || 500)) // Increased limit for 200+ treatments

    const now = Date.now()

    // Check cache first
    if (treatmentsCache && (now - treatmentsCacheTime) < CACHE_DURATION) {
      let filteredTreatments = treatmentsCache

      // Apply filters from cache
      if (searchQuery) {
        filteredTreatments = filteredTreatments.filter(t => 
          (t.name ?? '').toLowerCase().includes(searchQuery) ||
          (t.category ?? '').toLowerCase().includes(searchQuery)
        )
      }

      if (category) {
        filteredTreatments = filteredTreatments.filter(t => t.category === category)
      }

      if (popular) {
        filteredTreatments = filteredTreatments.filter(t => t.popular)
      }

      // Apply pagination
      const total = filteredTreatments.length
      const startIndex = page * pageSize
      const endIndex = startIndex + pageSize
      const paginatedTreatments = filteredTreatments.slice(startIndex, endIndex)

      return NextResponse.json({
        items: paginatedTreatments,
        total,
        page,
        pageSize,
        filteredCount: total,
      })
    }

    // Fetch all treatments from TreatmentMaster collection
    const res = await wixClient.items
      .query(COLLECTIONS.TREATMENTS)
      .limit(1000) // Get all treatments
      .find()

    // Map treatments to ExtendedTreatmentType format
    const allTreatments: ExtendedTreatmentType[] = res.items.map((item: any) => {
      const treatment = DataMappers.treatment(item)
      return {
        ...treatment,
        branchesAvailableAt: [],
        departments: [],
      } as ExtendedTreatmentType
    })

    // Cache the results
    treatmentsCache = allTreatments
    treatmentsCacheTime = now

    // Apply filters
    let filteredTreatments = allTreatments

    if (searchQuery) {
      filteredTreatments = filteredTreatments.filter(t => 
        (t.name ?? '').toLowerCase().includes(searchQuery) ||
        (t.category ?? '').toLowerCase().includes(searchQuery)
      )
    }

    if (category) {
      filteredTreatments = filteredTreatments.filter(t => t.category === category)
    }

    if (popular) {
      filteredTreatments = filteredTreatments.filter(t => t.popular)
    }

    // Sort alphabetically
    filteredTreatments.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))

    // Apply pagination
    const total = filteredTreatments.length
    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize
    const paginatedTreatments = filteredTreatments.slice(startIndex, endIndex)

    return NextResponse.json({
      items: paginatedTreatments,
      total,
      page,
      pageSize,
      filteredCount: total,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error: any) {
    console.error("API Error:", error)
    const errorMessage = error.message || "An unknown error occurred on the server."
    return NextResponse.json({ error: "Failed to fetch treatments", details: errorMessage }, { status: 500 })
  }
}
