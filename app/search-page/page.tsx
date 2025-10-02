// app/hospitals/page.tsx
'use client'

import { useState, useEffect } from 'react'
import HospitalSearch from '@/components/seach-page/HospitalSearch'
import HospitalCard from '@/components/seach-page/HospitalCard'
// import SearchFilters from '@/components/seach-page/SearchFilters'
import { Hospital, FilterOption } from '@/types/hospital'

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [cities, setCities] = useState<FilterOption[]>([])
  const [states, setStates] = useState<FilterOption[]>([])
  const [countries, setCountries] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')

  useEffect(() => {
    fetchHospitals()
  }, [])

  useEffect(() => {
    if (hospitals.length > 0) {
      extractLocationFilters()
      filterHospitals()
    }
  }, [hospitals, searchQuery, selectedCity, selectedState, selectedCountry])

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hospitals?limit=100')
      const data = await response.json()
      console.log('Fetched hospitals:', data.data)
      setHospitals(data.data || [])
    } catch (error) {
      console.error('Error fetching hospitals:', error)
    } finally {
      setLoading(false)
    }
  }

  const extractLocationFilters = () => {
    const citySet = new Set<string>()
    const stateSet = new Set<string>()
    const countrySet = new Set<string>()

    hospitals.forEach(hospital => {
      hospital.branches.forEach(branch => {
        if (branch.primaryLocation) {
          const location = branch.primaryLocation
          
          // Extract cities
          if (location._id && location.cityName) {
            citySet.add(JSON.stringify({ _id: location._id, name: location.cityName }))
          }
          
          // Extract states
          if (location.state?._id && location.state.stateName) {
            stateSet.add(JSON.stringify({ 
              _id: location.state._id, 
              name: location.state.stateName 
            }))
          }
          
          // Extract countries
          if (location.country?._id && location.country.countryName) {
            countrySet.add(JSON.stringify({ 
              _id: location.country._id, 
              name: location.country.countryName 
            }))
          }
        }
      })
    })

    // Convert Sets to arrays
    setCities(Array.from(citySet).map(str => ({ ...JSON.parse(str), type: 'city' as const })))
    setStates(Array.from(stateSet).map(str => ({ ...JSON.parse(str), type: 'state' as const })))
    setCountries(Array.from(countrySet).map(str => ({ ...JSON.parse(str), type: 'country' as const })))

    console.log('Extracted filters:', {
      cities: Array.from(citySet).map(str => JSON.parse(str)),
      states: Array.from(stateSet).map(str => JSON.parse(str)),
      countries: Array.from(countrySet).map(str => JSON.parse(str))
    })
  }

  const filterHospitals = () => {
    let filtered = [...hospitals]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.description.toLowerCase().includes(query) ||
        (hospital.specialtiesTags ?? []).some(tag => 
          tag.toLowerCase().includes(query)
        ) ||
        hospital.branches.some(branch =>
          branch.branchName.toLowerCase().includes(query) ||
          branch.primaryLocation?.cityName.toLowerCase().includes(query)
        )
      )
    }

    // Country filter
    if (selectedCountry) {
      filtered = filtered.filter(hospital =>
        hospital.branches.some(branch =>
          branch.primaryLocation?.country?._id === selectedCountry
        )
      )
    }

    // State filter
    if (selectedState) {
      filtered = filtered.filter(hospital =>
        hospital.branches.some(branch =>
          branch.primaryLocation?.state?._id === selectedState
        )
      )
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(hospital =>
        hospital.branches.some(branch =>
          branch.primaryLocation?._id === selectedCity
        )
      )
    }

    console.log('Filtered hospitals:', filtered.length)
    setFilteredHospitals(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCity('')
    setSelectedState('')
    setSelectedCountry('')
  }

  const hasActiveFilters = searchQuery || selectedCity || selectedState || selectedCountry

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hospitals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Hospitals</h1>
              <p className="mt-2 text-gray-600">
                Discover {hospitals.length} healthcare facilities
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {filteredHospitals.length}
              </div>
              <div className="text-gray-500">
                {hasActiveFilters ? 'Filtered Results' : 'Total Hospitals'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            {/* <SearchFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              cities={cities}
              states={states}
              countries={countries}
              onClearFilters={clearFilters}
            /> */}
          </div>

          {/* Hospital List */}
          <div className="lg:col-span-3">
            <HospitalSearch
              hospitals={filteredHospitals}
              searchQuery={searchQuery}
              totalHospitals={hospitals.length}
            />
          </div>
        </div>
      </div>
    </div>
  )
}