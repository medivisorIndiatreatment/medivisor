// components/seach-page/HospitalCard.tsx
import { Hospital } from '@/types/hospital'
import { MapPin, Phone, Mail, Calendar, Star, Users } from 'lucide-react'

interface HospitalCardProps {
  hospital: Hospital
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  const mainBranch = hospital.branches[0]
  
  // Safely handle specialtiesTags - ensure it's always an array
  const specialties = Array.isArray(hospital.specialtiesTags) 
    ? hospital.specialtiesTags.slice(0, 4) 
    : []

  // Safely handle other array fields
  const gallery = Array.isArray(hospital.gallery) ? hospital.gallery : []
  const branches = Array.isArray(hospital.branches) ? hospital.branches : []

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Hospital Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {hospital.logo && (
              <div className="flex-shrink-0">
                <img
                  src={hospital.logo}
                  alt={hospital.name}
                  className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                {hospital.name || "Unnamed Hospital"}
              </h3>
              <p className="mt-1 text-gray-600 line-clamp-2">
                {hospital.description || "No description available"}
              </p>
              {specialties.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {specialty}
                    </span>
                  ))}
                  {hospital.specialtiesTags && hospital.specialtiesTags.length > 4 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{hospital.specialtiesTags.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center justify-end space-x-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">4.8</span>
            </div>
            <div className="mt-1 text-sm text-gray-500 flex items-center justify-end space-x-1">
              <Users className="h-4 w-4" />
              <span>
                {hospital.branchCount || 0} branch{(hospital.branchCount || 0) !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Branches */}
      {branches.length > 0 && (
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Branches</h4>
          <div className="space-y-4">
            {branches.slice(0, 2).map((branch) => (
              <div key={branch._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900">
                    {branch.branchName || "Main Branch"}
                  </h5>
                  <div className="mt-1 space-y-1 text-sm text-gray-600">
                    {branch.primaryLocation && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {branch.primaryLocation.cityName || "Unknown City"}
                          {branch.primaryLocation.state && `, ${branch.primaryLocation.state.stateName}`}
                        </span>
                      </div>
                    )}
                    {branch.address && (
                      <p className="line-clamp-1">{branch.address}</p>
                    )}
                    {branch.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{branch.email}</span>
                      </div>
                    )}
                  </div>
                  {branch.doctors && branch.doctors.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500">Doctors:</span>
                        <div className="flex -space-x-2">
                          {branch.doctors.slice(0, 3).map((doctor, index) => (
                            <div
                              key={doctor._id}
                              className="relative group"
                              style={{ zIndex: 3 - index }}
                            >
                              <img
                                src={doctor.imageUrl || '/doctor-placeholder.jpg'}
                                alt={doctor.name}
                                className="h-6 w-6 rounded-full border-2 border-white bg-gray-300"
                                onError={(e) => {
                                  e.currentTarget.src = '/doctor-placeholder.jpg'
                                }}
                              />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {doctor.name}
                              </div>
                            </div>
                          ))}
                          {branch.doctors.length > 3 && (
                            <div className="h-6 w-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                              +{branch.doctors.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {branches.length > 2 && (
              <div className="text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View {branches.length - 2} more branches
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Branches Message */}
      {branches.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No branch information available</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {hospital.establishedDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Est. {new Date(hospital.establishedDate).getFullYear()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View Details
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}