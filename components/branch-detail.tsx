"use client"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  Calendar,
  Stethoscope,
  Car,
  Wifi,
  Coffee,
  Shield,
  Heart,
  Users,
  Award,
  CheckCircle,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RelatedCarousel } from "@/components/related-carousel"
import { db } from "@/lib/facilities-data"

interface BranchDetailProps {
  hospital: any
  branch: any
}

export function BranchDetail({ hospital, branch }: BranchDetailProps) {
  // Get doctors at this specific branch
  const branchDoctors = db.doctors.filter((doctor) => doctor.affiliations.includes(branch.id))

  // Get treatments available at this branch
  const branchTreatments = db.treatments.filter((treatment) => treatment.branches_available.includes(branch.id))

  // Get other branches of the same hospital
  const otherBranches = db.branches.filter((b) => b.hospitalId === hospital.id && b.id !== branch.id)

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-gray-900 text-gray-900" : "text-gray-300"}`}
      />
    ))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
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

  const relatedDoctors = branchDoctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    type: "doctor" as const,
    rating: doctor.rating,
    reviewCount: doctor.reviewCount,
    location: branch.city,
    department: doctor.title,
    specialties: doctor.specialties,
    description: doctor.about,
  }))

  const relatedTreatments = branchTreatments.map((treatment) => ({
    id: treatment.id,
    name: treatment.name,
    type: "treatment" as const,
    department: treatment.department,
    price: treatment.starting_price,
    location: branch.city,
    description: treatment.description,
  }))

  const relatedBranches = otherBranches.map((b) => ({
    id: b.id,
    name: b.name,
    type: "branch" as const,
    location: `${b.city}, ${b.state}`,
    description: `${b.address}, ${b.city}`,
    phone: b.phone,
    operatingHours: `${b.operatingHours.open} - ${b.operatingHours.close}`,
  }))

  return (
    <div className="container mx-auto md:px-0 px-2 py-10">
      {/* Back Button */}
      <div className="mb-8">
        <Link href={`/hospital/${createSlug(hospital.name)}`}>
          <Button variant="ghost" className="gap-2 text-gray-600 hover:bg-gray-100 transition-colors rounded-full">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Branch Header */}
      <div className="bg-white rounded-2xl p-8 mb-10 shadow-md border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gray-100 rounded-xl">
                <Building className="w-10 h-10 text-gray-900" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{branch.name}</h1>
                <p className="text-lg text-gray-500 mt-1">{hospital.name}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 mb-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>
                  {branch.address}, {branch.city}, {branch.state} - {branch.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>
                  {branch.operatingHours.open} - {branch.operatingHours.close}
                </span>
              </div>
            </div>

            {/* Branch Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{branchDoctors.length}</div>
                <div className="text-sm text-gray-500">Doctors</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{branchTreatments.length}</div>
                <div className="text-sm text-gray-500">Treatments</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{hospital.departments.length}</div>
                <div className="text-sm text-gray-500">Departments</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-500">Emergency</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {hospital.departments.map((dept: string) => (
                <Badge key={dept} variant="outline" className="text-sm px-3 py-1 bg-white text-gray-700 border-gray-200 rounded-full">
                  {dept}
                </Badge>
              ))}
            </div>
          </div>

          <div className="lg:w-80 flex-shrink-0">
            <Card className="bg-gray-50 border-gray-100 rounded-2xl shadow-sm">
              <CardHeader className="pb-4 border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <Button className="w-full h-12 bg-gray-900 text-white hover:bg-gray-700 transition-colors rounded-full text-base font-semibold">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                </Button>
                <Button variant="outline" className="w-full h-12 bg-white text-gray-900 border-gray-200 hover:bg-gray-100 transition-colors rounded-full text-base font-semibold">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Branch
                </Button>
                <Button variant="outline" className="w-full h-12 bg-white text-gray-900 border-gray-200 hover:bg-gray-100 transition-colors rounded-full text-base font-semibold">
                  <MapPin className="w-5 h-5 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Content Carousels */}
      <div className="space-y-12 mb-12">
        {relatedDoctors.length > 0 && (
          <RelatedCarousel title="Doctors at This Branch" items={relatedDoctors} type="doctor" />
        )}

        {relatedTreatments.length > 0 && (
          <RelatedCarousel title="Available Treatments" items={relatedTreatments} type="treatment" />
        )}

        {relatedBranches.length > 0 && <RelatedCarousel title="Other Branches" items={relatedBranches} type="branch" />}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="doctors" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-full">
          <TabsTrigger value="doctors" className="rounded-full px-6 py-2 text-base font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-colors">Doctors ({branchDoctors.length})</TabsTrigger>
          <TabsTrigger value="treatments" className="rounded-full px-6 py-2 text-base font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-colors">Treatments ({branchTreatments.length})</TabsTrigger>
          <TabsTrigger value="facilities" className="rounded-full px-6 py-2 text-base font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-colors">Facilities</TabsTrigger>
        </TabsList>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-6">
          <div className="grid gap-6">
            {branchDoctors.map((doctor) => (
              <Card key={doctor.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow duration-200 rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <Stethoscope className="w-6 h-6 text-gray-900" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-gray-500">{doctor.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(doctor.rating)}
                      <span className="ml-1 text-sm font-medium text-gray-700">{doctor.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{doctor.about}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {doctor.specialties.map((specialty: string) => (
                      <Badge key={specialty} variant="secondary" className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full border-transparent">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">{doctor.experienceYears} years experience</div>
                    <Link href={`/doctor/${createSlug(doctor.name)}`}>
                      <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-700 transition-colors rounded-full px-6 py-2 text-sm">
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
            {branchTreatments.map((treatment) => (
              <Card key={treatment.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow duration-200 rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{treatment.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{treatment.department}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatPrice(treatment.starting_price)}
                      </div>
                      <div className="text-xs text-gray-500">Starting from</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{treatment.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {treatment.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs text-gray-500 border-gray-300 px-3 py-1 rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{treatment.duration_minutes} minutes</span>
                      </div>
                    </div>
                    <Link href={`/treatment/${createSlug(treatment.name)}`}>
                      <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-700 transition-colors rounded-full px-6 py-2 text-sm">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-6">
          <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900">Available Facilities</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {hospital.facilities.map((facility: string) => {
                  const IconComponent = facilityIcons[facility] || CheckCircle
                  return (
                    <div key={facility} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <IconComponent className="w-6 h-6 text-gray-900" />
                      <span className="text-sm font-medium text-gray-700">{facility}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900">Medical Services</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospital.services.map((service: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-gray-900" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}