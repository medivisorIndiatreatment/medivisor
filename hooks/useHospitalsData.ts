"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useQuery } from '@tanstack/react-query'
import type { HospitalType, ExtendedDoctorType, ExtendedTreatmentType, FilterState, FilterKey, FilterValue } from '@/types/search'
import { getAllExtendedDoctors, getAllExtendedTreatments, getMatchingBranches, getVisibleFiltersByView, enforceOnePrimaryFilter } from '@/utils/search'
import { isUUID } from '@/types/search'

type AvailableOptions = Record<FilterKey, { id: string; name: string }[]>

export const useHospitalsData = () => {
   const searchParams = useSearchParams()
   const router = useRouter()
   const pathname = usePathname()

   // Use React Query for data fetching with 10-minute caching
   const { data: hospitalsData, isLoading: loading } = useQuery({
     queryKey: ['hospitals', 'search'],
     queryFn: async () => {
       const res = await fetch('/api/hospitals?search=true&pageSize=1000&page=0')
       if (!res.ok) throw new Error('Failed to fetch hospital data')
       return res.json() as Promise<{ items: HospitalType[], total: number }>
     },
     staleTime: 10 * 60 * 1000, // 10 minutes
     gcTime: 15 * 60 * 1000, // 15 minutes
   })

   // Fetch all treatments directly from TreatmentMaster collection with 10-minute caching
   const { data: allTreatmentsData } = useQuery({
     queryKey: ['treatments', 'all'],
     queryFn: async () => {
       const res = await fetch('/api/treatments?pageSize=500')
       if (!res.ok) throw new Error('Failed to fetch treatments')
       return res.json() as Promise<{ items: ExtendedTreatmentType[], total: number }>
     },
     staleTime: 10 * 60 * 1000, // 10 minutes
     gcTime: 15 * 60 * 1000, // 15 minutes
   })

   const allTreatmentsFromApi = allTreatmentsData?.items || []
   const allHospitals = hospitalsData?.items || []

  const [filters, setFilters] = useState<FilterState>(() => {
    const getParam = (key: string) => searchParams.get(key)
    const initialView = (getParam("view") as "doctors" | "treatments" | "hospitals" | null) || "hospitals"
    const getFilterState = (key: string) => {
      const value = getParam(key)
      if (!value) return { id: "", query: "" }
      if (isUUID(value)) {
        return { id: value, query: "" }
      } else {
        return { id: "", query: value }
      }
    }
    return {
      view: initialView,
      city: getFilterState("city"),
      state: getFilterState("state"),
      treatment: getFilterState("treatment"),
      specialization: getFilterState("specialization"),
      department: getFilterState("department"),
      doctor: getFilterState("doctor"),
      branch: getFilterState("branch"),
      location: getFilterState("location"),
      sortBy: "all",
    }
  })

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateSubFilter = useCallback(<K extends FilterKey>(key: K, subKey: "id" | "query", value: string) => {
    setFilters(prev => {
      const newFilterValue: FilterValue = { ...prev[key], [subKey]: value }
      let newFilters = {
        ...prev,
        [key]: newFilterValue,
      } as FilterState
      newFilters = enforceOnePrimaryFilter(key, newFilters, newFilterValue)
      return newFilters
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      city: { id: "", query: "" },
      state: { id: "", query: "" },
      treatment: { id: "", query: "" },
      specialization: { id: "", query: "" },
      department: { id: "", query: "" },
      doctor: { id: "", query: "" },
      branch: { id: "", query: "" },
      location: { id: "", query: "" },
      sortBy: "all",
    }))
  }, [])

  // Computed properties for filtered results
  const filteredBranches = useMemo(() => {
    return getMatchingBranches(allHospitals, filters, allTreatmentsFromApi)
  }, [allHospitals, filters, allTreatmentsFromApi])

  const filteredDoctors = useMemo(() => {
    return getAllExtendedDoctors(allHospitals)
  }, [allHospitals])

  // For treatments view, use treatments from API (with hospital mapping)
  // For other views, extract from hospital data
  const filteredTreatments = useMemo(() => {
    if (filters.view === "treatments") {
      // Use treatments from API with hospital/branch mapping
      return allTreatmentsFromApi.map(t => ({
        ...t,
        baseId: t._id,
        locations: t.branchesAvailableAt?.map(b => ({
          hospitalName: b.hospitalName,
          hospitalId: b.hospitalId,
          branchName: b.branchName,
          branchId: b.branchId,
          cities: b.cities,
        })) || []
      }))
    }
    return getAllExtendedTreatments(allHospitals)
  }, [allHospitals, filters.view, allTreatmentsFromApi])

  const currentCount = useMemo(() => {
    switch (filters.view) {
      case "doctors":
        return filteredDoctors.length
      case "treatments":
        return filteredTreatments.length
      default:
        return filteredBranches.length
    }
  }, [filters.view, filteredBranches, filteredDoctors, filteredTreatments])

  // Available options for filters - always populate all filters needed by the UI
  const availableOptions = useMemo(() => {
    const visibleKeys = getVisibleFiltersByView(filters.view)
    const options: AvailableOptions = {
      city: [],
      state: [],
      treatment: [],
      specialization: [],
      department: [],
      doctor: [],
      branch: [],
      location: [],
    }
    
    // Always populate city options from filtered branches
    const cities = new Map<string, { id: string; name: string }>()
    filteredBranches.forEach(b => {
      b.city?.forEach(c => {
        if (c._id && c.cityName && !cities.has(c._id)) {
          cities.set(c._id, { id: c._id, name: c.cityName })
        }
      })
    })
    options.city = Array.from(cities.values())
    
    // Populate location options (city + state)
    const locations = new Map<string, { id: string; name: string }>()
    filteredBranches.forEach(b => {
      b.city?.forEach(c => {
        // Add city
        if (c._id && c.cityName) {
          locations.set(`city:${c._id}`, { id: `city:${c._id}`, name: c.cityName })
        }
        // Add state
        if (c.state) {
          const stateId = `state:${c.state}`
          if (!locations.has(stateId)) {
            locations.set(stateId, { id: stateId, name: c.state })
          }
        }
      })
    })
    options.location = Array.from(locations.values())
    
    // Populate branch options
    if (visibleKeys.includes("branch")) {
      options.branch = filteredBranches.map(b => ({ id: b._id || '', name: b.branchName || '' }))
    }
    
    // Populate treatment options from all treatments (not just filtered)
    if (visibleKeys.includes("treatment")) {
      options.treatment = allTreatmentsFromApi.map(t => ({ id: t._id || '', name: t.name || '' }))
    }
    
    // Populate doctor options
    if (visibleKeys.includes("doctor")) {
      options.doctor = filteredDoctors.map(d => ({ id: d._id || '', name: d.doctorName || '' }))
    }
    
    // Populate specialization options
    if (visibleKeys.includes("specialization")) {
      const specs = new Map<string, { id: string; name: string }>()
      filteredDoctors.forEach(d => {
        const specsArr = Array.isArray(d.specialization) ? d.specialization : d.specialization ? [d.specialization] : []
        specsArr.forEach(s => {
          const id = typeof s === 'string' ? s : s._id
          const name = typeof s === 'string' ? s : s.name || s.title || ''
          if (id && name && !specs.has(id)) {
            specs.set(id, { id, name })
          }
        })
      })
      options.specialization = Array.from(specs.values())
    }
    
    // Populate department options
    if (visibleKeys.includes("department")) {
      const depts = new Map<string, { id: string; name: string }>()
      filteredDoctors.forEach(d => {
        d.departments?.forEach(dept => {
          if (dept._id && dept.name && !depts.has(dept._id)) {
            depts.set(dept._id, { id: dept._id, name: dept.name })
          }
        })
      })
      options.department = Array.from(depts.values())
    }
    
    return options
  }, [filters.view, filteredBranches, filteredDoctors, allTreatmentsFromApi])

  // Get display value for filter - matches FilterSidebar expected signature
  const getFilterValueDisplay = useCallback((key: FilterKey, currentFilters: FilterState, currentAvailableOptions: AvailableOptions) => {
    const filter = currentFilters[key]
    if (!filter.id && !filter.query) return null
    
    const options = currentAvailableOptions[key]
    if (options && Array.isArray(options)) {
      const found = options.find(opt => opt.id === filter.id)
      return found?.name || filter.query || filter.id || null
    }
    return filter.query || filter.id || null
  }, [])

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.view !== "hospitals") params.set("view", filters.view)
    if (filters.city.id) params.set("city", filters.city.id)
    else if (filters.city.query) params.set("city", filters.city.query)
    if (filters.state.id) params.set("state", filters.state.id)
    else if (filters.state.query) params.set("state", filters.state.query)
    if (filters.treatment.id) params.set("treatment", filters.treatment.id)
    else if (filters.treatment.query) params.set("treatment", filters.treatment.query)
    if (filters.specialization.id) params.set("specialization", filters.specialization.id)
    else if (filters.specialization.query) params.set("specialization", filters.specialization.query)
    if (filters.department.id) params.set("department", filters.department.id)
    else if (filters.department.query) params.set("department", filters.department.query)
    if (filters.doctor.id) params.set("doctor", filters.doctor.id)
    else if (filters.doctor.query) params.set("doctor", filters.doctor.query)
    if (filters.branch.id) params.set("branch", filters.branch.id)
    else if (filters.branch.query) params.set("branch", filters.branch.query)
    if (filters.location.id) params.set("location", filters.location.id)
    else if (filters.location.query) params.set("location", filters.location.query)
    
    const currentParams = searchParams.toString()
    const newParams = params.toString()
    
    if (currentParams !== newParams) {
      router.replace(`${pathname}?${newParams}`, { scroll: false })
    }
  }, [filters, pathname, router, searchParams])

  return {
    loading,
    filters,
    updateFilter,
    updateSubFilter,
    clearFilters,
    availableOptions,
    filteredBranches,
    filteredDoctors,
    filteredTreatments,
    currentCount,
    getFilterValueDisplay,
  }
}
