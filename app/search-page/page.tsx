"use client"

import { useState, useEffect } from "react"
import type { HospitalWithBranchPreview, Doctor } from "@/types/hospital"

export default function HospitalDirectory() {
  const [hospitals, setHospitals] = useState<HospitalWithBranchPreview[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [cities, setCities] = useState<{ id: string; name: string }[]>([])
  const [search, setSearch] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [loading, setLoading] = useState(false)

  // Fetch doctors for filter dropdown
  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/doctor")
      const data = await res.json()
      setDoctors(data.items || [])
    } catch (err) {
      console.error("Error fetching doctors:", err)
    }
  }

  // Fetch hospitals for filter dropdown (unique cities)
  const fetchCities = async () => {
    try {
      const res = await fetch("/api/hospitals")
      const data = await res.json()
      const cityMap: Record<string, string> = {}
      data.items.forEach((h: HospitalWithBranchPreview) => {
        if (h.city) cityMap[h.city] = h.city
      })
      setCities(Object.entries(cityMap).map(([id, name]) => ({ id, name })))
    } catch (err) {
      console.error("Error fetching cities:", err)
    }
  }

  // Fetch hospitals with filters
  const fetchHospitals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("q", search)
      if (selectedCity) params.append("cityId", selectedCity)
      if (selectedDoctor) params.append("doctorId", selectedDoctor)

      const res = await fetch(`/api/hospitals?${params.toString()}`)
      const data = await res.json()
      setHospitals(data.items || [])
    } catch (err) {
      console.error("Error fetching hospitals:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
    fetchCities()
    fetchHospitals()
  }, [])

  // Refetch hospitals when filters change
  useEffect(() => {
    fetchHospitals()
  }, [search, selectedCity, selectedDoctor])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Hospital Directory</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search hospitals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
        />

        {/* City filter */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Doctor filter */}
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Doctors</option>
          {doctors.map((d) => (
            <option className="text-gray-600" key={d._id} value={d._id}>
              {d.DoctorName} {d.specialization ? `(${d.specialization})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Hospital list */}
      {loading ? (
        <p>Loading hospitals...</p>
      ) : hospitals.length === 0 ? (
        <p>No hospitals found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <div key={hospital._id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                {hospital.logo && (
                  <img
                    src={hospital.logo}
                    alt={hospital.name}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{hospital.name}</h2>
                  {hospital.city && <p className="text-sm text-gray-500">{hospital.city}</p>}
                </div>
              </div>

              {hospital.description && <p className="text-gray-700 mb-3">{hospital.description}</p>}

              {/* Branches */}
              {hospital.branchesPreview && hospital.branchesPreview.length > 0 && (
                <div className="mb-3">
                  <h3 className="font-semibold">Branches:</h3>
                  <ul className="text-gray-700 list-disc list-inside">
                    {hospital.branchesPreview.map((branch) => (
                      <li key={branch._id}>
                        {branch.name} {branch.city && `(${branch.city})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Doctors */}
              {hospital.branchesPreview?.some((b) => b.doctor?.length) && (
                <div>
                  <h3 className="font-semibold">Doctors:</h3>
                  <ul className="text-gray-700 list-disc list-inside">
                    {hospital.branchesPreview
                      .flatMap((b) => b.doctor || [])
                      .map((doc) => (
                        <li key={doc._id}>
                          {doc.name} {doc.specialization && `(${doc.specialization})`}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {hospital.website && (
                <a
                  href={hospital.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
