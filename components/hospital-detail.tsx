"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  Calendar,
  Hospital,
  Stethoscope,
  Car,
  Wifi,
  Coffee,
  Shield,
  Heart,
  Users,
  Award,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RelatedCarousel } from "@/components/related-carousel"
import { db } from "@/lib/facilities-data"

interface HospitalDetailProps {
  hospital: any
}

export function HospitalDetail({ hospital }: HospitalDetailProps) {
  const [selectedBranch, setSelectedBranch] = useState(0)

  // Get hospital branches
  const hospitalBranches = db.branches.filter((branch) => branch.hospitalId === hospital.id)

  // Get doctors affiliated with this hospital
  const hospitalDoctors = db.doctors.filter((doctor) =>
    doctor.affiliations.some((branchId) => hospitalBranches.some((branch) => branch.id === branchId))
  )

  // Get treatments available at this hospital
  const hospitalTreatments = db.treatments.filter((treatment) =>
    treatment.branches_available.some((branchId) => hospitalBranches.some((branch) => branch.id === branchId))
  )

  const totalDoctors = hospitalDoctors.length
  const totalBranches = hospitalBranches.length
  const totalTreatments = hospitalTreatments.length
  const averageRating = hospitalDoctors.reduce((sum, doctor) => sum + doctor.rating, 0) / hospitalDoctors.length || 0
  const totalExperience = hospitalDoctors.reduce((sum, doctor) => sum + doctor.experienceYears, 0)
  const uniqueSpecialties = [...new Set(hospitalDoctors.flatMap((doctor) => doctor.specialties))].length

  // Get similar hospitals (same departments)
  const similarHospitals = db.hospitals
    .filter((h) => h.id !== hospital.id && h.departments.some((dept) => hospital.departments.includes(dept)))
    .slice(0, 6)

  const relatedDoctors = hospitalDoctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    type: "doctor" as const,
    rating: doctor.rating,
    reviewCount: doctor.reviewCount,
    location: hospitalBranches.find((branch) => doctor.affiliations.includes(branch.id))?.city,
    department: doctor.title,
    specialties: doctor.specialties,
    description: doctor.about,
  }))

  const relatedTreatments = hospitalTreatments.map((treatment) => ({
    id: treatment.id,
    name: treatment.name,
    type: "treatment" as const,
    department: treatment.department,
    price: treatment.starting_price,
    location: hospitalBranches.find((branch) => treatment.branches_available.includes(branch.id))?.city,
    description: treatment.description,
  }))

  const relatedHospitals = similarHospitals.map((h) => ({
    id: h.id,
    name: h.name,
    type: "hospital" as const,
    rating: h.rating,
    reviewCount: h.reviewCount,
    location: db.branches.find((branch) => branch.hospitalId === h.id)?.city,
    department: h.tagline,
    specialties: h.departments,
    description: h.description,
  }))

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-gray-900 text-gray-900" : "text-gray-300"}`}
      />
    ))
  }

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const facilityIcons: { [key: string]: any } = {
    Parking: Car,
    WiFi: Wifi,
    Cafeteria: Coffee,
    Emergency: Shield,
    ICU: Heart,
    OPD: Users,
    Pharmacy: Award,
  }

  return (
    <div className="container mx-auto px-2 md:px-0 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2 bg-gray-100 mt-5 text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" />
            Back 
          </Button>
        </Link>
      </div>

      {/* Hospital Header */}
      <div className="bg-white rounded-xs p-8 mb-8 shadow-xs border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-900/5 rounded-lg">
                <Hospital className="w-8 h-8 text-gray-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 text-balance">{hospital.name}</h1>
                <p className="text-lg text-gray-600">{hospital.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(hospital.rating)}
                <span className="ml-2 text-lg font-semibold text-gray-900">{hospital.rating}</span>
                <span className="text-gray-500">({hospital.reviewCount} reviews)</span>
              </div>
              <Badge variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-800 border-transparent">
                {hospital.type}
              </Badge>
            </div>

            <p className="text-gray-600 text-pretty mb-6">{hospital.description}</p>

            <div className="flex flex-wrap gap-2">
              {hospital.departments.map((dept: string) => (
                <Badge key={dept} variant="outline" className="text-gray-700 border-gray-200">
                  {dept}
                </Badge>
              ))}
            </div>
          </div>

          <div className="lg:w-80 flex-shrink-0">
            <Card className="border-gray-200 rounded-xs shadow-xs">
              <CardHeader className="p-4 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-full" size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
                <Button variant="outline" className="w-full bg-white text-gray-700 border-gray-200 hover:bg-gray-100 rounded-full" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Hospital
                </Button>
                <Button variant="outline" className="w-full bg-white text-gray-700 border-gray-200 hover:bg-gray-100 rounded-full" size="lg">
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card className="text-center border-gray-200 shadow-xs rounded-xs">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{totalDoctors}</div>
            <div className="text-sm text-gray-500">Total Doctors</div>
          </CardContent>
        </Card>
        <Card className="text-center border-gray-200 shadow-xs rounded-xs">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{totalBranches}</div>
            <div className="text-sm text-gray-500">Branches</div>
          </CardContent>
        </Card>
        <Card className="text-center border-gray-200 shadow-xs rounded-xs">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{totalTreatments}</div>
            <div className="text-sm text-gray-500">Treatments</div>
          </CardContent>
        </Card>
        <Card className="text-center border-gray-200 shadow-xs rounded-xs">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Avg Rating</div>
          </CardContent>
        </Card>
        <Card className="text-center border-gray-200 shadow-xs rounded-xs">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{uniqueSpecialties}</div>
            <div className="text-sm text-gray-500">Specialties</div>
          </CardContent>
        </Card>
        <Card className="text-center border-gray-200 shadow-xs rounded-xs">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{Math.round(totalExperience / totalDoctors) || 0}</div>
            <div className="text-sm text-gray-500">Avg Experience</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 border-gray-200 rounded-xs shadow-xs">
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
            <span>Our Doctors ({totalDoctors})</span>
            <Button variant="outline" size="sm" asChild className="rounded-full text-xs text-gray-700 border-gray-200 hover:bg-gray-100">
              <Link href="#doctors-tab">View All Details</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospitalDoctors.slice(0, 6).map((doctor) => (
              <div key={doctor.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-900/5 rounded-lg">
                    <Stethoscope className="w-4 h-4 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{doctor.name}</h4>
                    <p className="text-xs text-gray-600">{doctor.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(doctor.rating)}
                  <span className="text-xs text-gray-700 ml-1">{doctor.rating}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {doctor.specialties.slice(0, 2).map((specialty: string) => (
                    <Badge key={specialty} variant="secondary" className="text-xs bg-gray-100 text-gray-800 border-transparent px-2 py-0">
                      {specialty}
                    </Badge>
                  ))}
                  {doctor.specialties.length > 2 && (
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 px-2 py-0">
                      +{doctor.specialties.length - 2}
                    </Badge>
                  )}
                </div>
                <Link href={`/doctor/${createSlug(doctor.name)}`}>
                  <Button size="sm" className="w-full text-xs bg-gray-900 text-white hover:bg-gray-800 rounded-full">
                    Book Appointment
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          {hospitalDoctors.length > 6 && (
            <div className="text-center mt-4">
              <Button variant="outline" asChild className="rounded-full text-gray-700 border-gray-200 hover:bg-gray-100">
                <Link href="#doctors-tab">View All {totalDoctors} Doctors</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8 border-gray-200 rounded-xs shadow-xs">
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
            <span>All Branches ({totalBranches})</span>
            <Button variant="outline" size="sm" asChild className="rounded-full text-xs text-gray-700 border-gray-200 hover:bg-gray-100">
              <Link href="#branches-tab">View All Details</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitalBranches.map((branch) => {
              const branchDoctors = db.doctors.filter((doctor) => doctor.affiliations.includes(branch.id))
              const branchTreatments = db.treatments.filter((treatment) =>
                treatment.branches_available.includes(branch.id)
              )

              return (
                <div key={branch.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                    <Link href={`/hospital/${createSlug(hospital.name)}/branch/${createSlug(branch.name)}`}>
                      <Button size="sm" variant="outline" className="rounded-full text-xs text-gray-700 border-gray-200 hover:bg-gray-100">
                        View Details
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-gray-900/5 rounded">
                      <div className="font-bold text-gray-900">{branchDoctors.length}</div>
                      <div className="text-xs text-gray-500">Doctors</div>
                    </div>
                    <div className="text-center p-2 bg-gray-900/5 rounded">
                      <div className="font-bold text-gray-900">{branchTreatments.length}</div>
                      <div className="text-xs text-gray-500">Treatments</div>
                    </div>
                    <div className="text-center p-2 bg-gray-900/5 rounded">
                      <div className="font-bold text-gray-900">24/7</div>
                      <div className="text-xs text-gray-500">Emergency</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="truncate">
                        {branch.city}, {branch.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>
                        {branch.operatingHours.open} - {branch.operatingHours.close}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8 mb-8">
        {relatedDoctors.length > 0 && <RelatedCarousel title="Our Doctors" items={relatedDoctors} type="doctor" />}

        {relatedTreatments.length > 0 && (
          <RelatedCarousel title="Available Treatments" items={relatedTreatments} type="treatment" />
        )}

        {relatedHospitals.length > 0 && (
          <RelatedCarousel title="Similar Hospitals" items={relatedHospitals} type="hospital" />
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-full">
          <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="doctors" id="doctors-tab" className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            All Doctors
          </TabsTrigger>
          <TabsTrigger value="treatments" className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white">All Treatments</TabsTrigger>
          <TabsTrigger value="branches" id="branches-tab" className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Branches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Facilities */}
          <Card className="border-gray-200 rounded-xs shadow-xs">
            <CardHeader className="p-4 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Facilities & Services</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {hospital.facilities.map((facility: string) => {
                  const IconComponent = facilityIcons[facility] || CheckCircle
                  return (
                    <div key={facility} className="flex items-center gap-2 p-3 bg-gray-900/5 rounded-lg">
                      <IconComponent className="w-5 h-5 text-gray-900" />
                      <span className="text-sm font-medium text-gray-800">{facility}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="border-gray-200 rounded-xs shadow-xs">
            <CardHeader className="p-4 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Medical Services</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospital.services.map((service: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-900" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-6">
          <div className="grid gap-6">
            {hospitalDoctors.map((doctor) => (
              <Card key={doctor.id} className="border-gray-200 rounded-xl hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-900/5 rounded-lg">
                        <Stethoscope className="w-6 h-6 text-gray-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-gray-600">{doctor.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(doctor.rating)}
                      <span className="ml-1 text-sm font-medium text-gray-700">{doctor.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{doctor.about}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {doctor.specialties.map((specialty: string) => (
                      <Badge key={specialty} variant="secondary" className="text-xs bg-gray-100 text-gray-800 border-transparent">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">{doctor.experienceYears} years experience</div>
                    <Link href={`/doctor/${createSlug(doctor.name)}`}>
                      <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 rounded-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-6">
          <div className="grid gap-6">
            {hospitalTreatments.map((treatment) => (
              <Card key={treatment.id} className="border-gray-200 rounded-xl hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{treatment.name}</h3>
                      <p className="text-gray-600">{treatment.department}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ₹{treatment.starting_price.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Starting from</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{treatment.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {treatment.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs border-gray-300 text-gray-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{treatment.duration_minutes} minutes</span>
                      </div>
                    </div>
                    <Link href={`/treatment/${createSlug(treatment.name)}`}>
                      <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 rounded-full">Learn More</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-6">
          <div className="grid gap-6">
            {hospitalBranches.map((branch, index) => {
              const branchDoctors = db.doctors.filter((doctor) => doctor.affiliations.includes(branch.id))
              const branchTreatments = db.treatments.filter((treatment) =>
                treatment.branches_available.includes(branch.id)
              )

              return (
                <Card key={branch.id} className="border-gray-200 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="p-4 border-b border-gray-200">
                    <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
                      <span>{branch.name}</span>
                      <div className="flex gap-2">
                        <Badge variant={index === selectedBranch ? "default" : "outline"} className={`${index === selectedBranch ? "bg-gray-900 text-white" : "text-gray-700 border-gray-200"}`}>
                          {index === selectedBranch ? "Selected" : "Available"}
                        </Badge>
                        <Link href={`/hospital/${createSlug(hospital.name)}/branch/${createSlug(branch.name)}`}>
                          <Button size="sm" variant="outline" className="rounded-full text-xs text-gray-700 border-gray-200 hover:bg-gray-100">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4">
                    {/* Branch Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-900/5 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{branchDoctors.length}</div>
                        <div className="text-xs text-gray-500">Doctors</div>
                      </div>
                      <div className="text-center p-3 bg-gray-900/5 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{branchTreatments.length}</div>
                        <div className="text-xs text-gray-500">Treatments</div>
                      </div>
                      <div className="text-center p-3 bg-gray-900/5 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">24/7</div>
                        <div className="text-xs text-gray-500">Emergency</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>
                        {branch.address}, {branch.city}, {branch.state} - {branch.pincode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{branch.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {branch.operatingHours.open} - {branch.operatingHours.close}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => setSelectedBranch(index)} className="bg-gray-900 text-white hover:bg-gray-800 rounded-full">
                        Select Branch
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-gray-700 border-gray-200 hover:bg-gray-100">
                        Get Directions
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-gray-700 border-gray-200 hover:bg-gray-100">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}