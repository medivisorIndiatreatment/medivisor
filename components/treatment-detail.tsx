"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Calendar,
  Pill,
  DollarSign,
  Info,
  CheckCircle,
  AlertCircle,
  Hospital,
  Stethoscope,
  Shield,
  Heart,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RelatedCarousel } from "@/components/related-carousel"
import { db } from "@/lib/facilities-data"

interface TreatmentDetailProps {
  treatment: any
}

export function TreatmentDetail({ treatment }: TreatmentDetailProps) {
  const [selectedBranch, setSelectedBranch] = useState("")
  const [inquiryOpen, setInquiryOpen] = useState(false)

  // Get available branches for this treatment
  const availableBranches = db.branches.filter((branch) => treatment.branches_available.includes(branch.id))
  const availableHospitals = db.hospitals.filter((hospital) =>
    availableBranches.some((branch) => branch.hospitalId === hospital.id),
  )

  // Get doctors who can perform this treatment (based on specialties)
  const qualifiedDoctors = db.doctors.filter((doctor) =>
    doctor.specialties.some((specialty) => treatment.tags.includes(specialty.toLowerCase())),
  )

  // Get similar treatments (same department)
  const similarTreatments = db.treatments
    .filter((t) => t.id !== treatment.id && t.department === treatment.department)
    .slice(0, 6)

  // Prepare data for carousels
  const relatedDoctorItems = qualifiedDoctors.slice(0, 6).map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    type: "doctor" as const,
    rating: doctor.rating,
    reviewCount: doctor.reviewCount,
    location: availableBranches.find((branch) => doctor.affiliations.includes(branch.id))?.city,
    department: doctor.title,
    specialties: doctor.specialties,
    description: doctor.about,
  }))

  const relatedHospitalItems = availableHospitals.map((hospital) => ({
    id: hospital.id,
    name: hospital.name,
    type: "hospital" as const,
    rating: hospital.rating,
    reviewCount: hospital.reviewCount,
    location: availableBranches.find((branch) => branch.hospitalId === hospital.id)?.city,
    department: hospital.tagline,
    specialties: hospital.departments,
    description: hospital.description,
  }))

  const similarTreatmentItems = similarTreatments.map((t) => ({
    id: t.id,
    name: t.name,
    type: "treatment" as const,
    department: t.department,
    price: t.starting_price,
    location: availableBranches.find((branch) => t.branches_available.includes(branch.id))?.city,
    description: t.description,
  }))

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleInquiry = () => {
    // Mock inquiry logic
    alert(`Inquiry sent for ${treatment.name}. We'll contact you soon!`)
    setInquiryOpen(false)
  }

  const treatmentIcons: { [key: string]: any } = {
    surgery: Activity,
    diagnostic: Heart,
    therapy: Shield,
    consultation: Stethoscope,
  }

  const getTreatmentIcon = () => {
    const category = treatment.tags.find((tag: string) =>
      ["surgery", "diagnostic", "therapy", "consultation"].includes(tag.toLowerCase()),
    )
    return treatmentIcons[category?.toLowerCase()] || Pill
  }

  const TreatmentIcon = getTreatmentIcon()

  return (
    <div className="container mx-auto px-2 md:px-0 py-10">
      {/* Back Button */}
      <div className="mb-6">
  <Button variant="ghost" className="gap-2" onClick={() => window.history.back()}>
    <ArrowLeft className="w-4 h-4" />
    Back
  </Button>
</div>

      {/* Treatment Header */}
      <div className="bg-card rounded-lg p-8 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TreatmentIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-balance">{treatment.name}</h1>
                <p className="text-lg text-muted-foreground">{treatment.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-2xl font-bold text-primary">{formatPrice(treatment.starting_price)}</div>
              <Badge variant="secondary" className="px-3 py-1">
                Starting from
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{treatment.duration_minutes} minutes</span>
              </div>
            </div>

            <p className="text-muted-foreground text-pretty mb-6">{treatment.description}</p>

            <div className="flex flex-wrap gap-2">
              {treatment.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="lg:w-80">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Get Treatment Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Info className="w-4 h-4 mr-2" />
                      Send Inquiry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Inquiry for {treatment.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" placeholder="Enter your full name" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="Enter your phone number" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Enter your email" />
                      </div>
                      <div>
                        <Label htmlFor="branch">Preferred Location</Label>
                        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose location" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBranches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.city} - {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Any specific questions or requirements?" />
                      </div>
                      <Button onClick={handleInquiry} className="w-full">
                        Send Inquiry
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call for Info
                </Button>
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="space-y-8 mb-8">
        {relatedDoctorItems.length > 0 && (
          <RelatedCarousel title="Qualified Doctors" items={relatedDoctorItems} type="doctor" />
        )}

        {relatedHospitalItems.length > 0 && (
          <RelatedCarousel title="Available at Hospitals" items={relatedHospitalItems} type="hospital" />
        )}

        {similarTreatmentItems.length > 0 && (
          <RelatedCarousel title="Similar Treatments" items={similarTreatmentItems} type="treatment" />
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="doctors">All Doctors</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{treatment.duration_minutes}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{formatPrice(treatment.starting_price)}</div>
                <div className="text-sm text-muted-foreground">Starting Price</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Hospital className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{availableBranches.length}</div>
                <div className="text-sm text-muted-foreground">Locations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Stethoscope className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{qualifiedDoctors.length}</div>
                <div className="text-sm text-muted-foreground">Qualified Doctors</div>
              </CardContent>
            </Card>
          </div>

          {/* Treatment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What is {treatment.name}?</h4>
                <p className="text-muted-foreground">{treatment.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Duration</h4>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{treatment.duration_minutes} minutes</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Department</h4>
                <Badge variant="secondary">{treatment.department}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Benefits & Considerations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Effective treatment option</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Experienced medical team</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Modern equipment and facilities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Comprehensive care approach</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>Consultation required before treatment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>Prices may vary based on complexity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>Insurance coverage may apply</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>Follow-up appointments may be needed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{formatPrice(treatment.price_range.min)}</div>
                  <div className="text-sm text-muted-foreground">Minimum Price</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-primary/5">
                  <div className="text-2xl font-bold text-primary">{formatPrice(treatment.starting_price)}</div>
                  <div className="text-sm text-muted-foreground">Starting Price</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{formatPrice(treatment.price_range.max)}</div>
                  <div className="text-sm text-muted-foreground">Maximum Price</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Price Factors</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Treatment complexity and duration</li>
                  <li>• Hospital location and facilities</li>
                  <li>• Doctor's experience and specialization</li>
                  <li>• Additional services and follow-up care</li>
                  <li>• Insurance coverage and payment options</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Insurance & Payment</h4>
                <p className="text-blue-700 text-sm">
                  Most insurance plans cover this treatment. Contact us to verify your coverage and discuss payment
                  options including EMI facilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-6">
          <div className="grid gap-6">
            {qualifiedDoctors.slice(0, 6).map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Stethoscope className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Dr. {doctor.name}</h3>
                        <p className="text-muted-foreground">{doctor.title}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{doctor.experienceYears} years exp.</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{doctor.about}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {doctor.specialties.slice(0, 3).map((specialty: string) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Languages: {doctor.languages.slice(0, 2).join(", ")}
                    </div>
                    <Link href={`/doctor/${createSlug(doctor.name)}`}>
                      <Button size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Consultation
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <div className="grid gap-6">
            {availableBranches.map((branch) => {
              const hospital = availableHospitals.find((h) => h.id === branch.hospitalId)
              return (
                <Card key={branch.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hospital className="w-5 h-5" />
                      {hospital?.name} - {branch.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {branch.address}, {branch.city}, {branch.state}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{branch.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        Weekdays: {branch.operatingHours.weekdays}, Weekends: {branch.operatingHours.weekends}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm">Book Here</Button>
                      <Button variant="outline" size="sm">
                        Get Directions
                      </Button>
                      <Button variant="outline" size="sm">
                        Call Branch
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
