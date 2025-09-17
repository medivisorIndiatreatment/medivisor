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
  Stethoscope,
  Award,
  GraduationCap,
  Languages,
  Hospital,
  CheckCircle,
  User,
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

interface DoctorDetailProps {
  doctor: any
}

export function DoctorDetail({ doctor }: DoctorDetailProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [bookingOpen, setBookingOpen] = useState(false)

  // Get doctor's affiliated hospitals and branches
  const doctorBranches = db.branches.filter((branch) => doctor.affiliations.includes(branch.id))
  const doctorHospitals = db.hospitals.filter((hospital) =>
    doctorBranches.some((branch) => branch.hospitalId === hospital.id),
  )

  // Get treatments related to doctor's specialties
  const relatedTreatments = db.treatments
    .filter((treatment) =>
      doctor.specialties.some(
        (specialty: string) =>
          treatment.name.toLowerCase().includes(specialty.toLowerCase()) ||
          treatment.description.toLowerCase().includes(specialty.toLowerCase()) ||
          treatment.tags.some((tag: string) => tag.toLowerCase().includes(specialty.toLowerCase())),
      ),
    )
    .slice(0, 6)

  // Get similar doctors (same specialties)
  const similarDoctors = db.doctors
    .filter((d) => d.id !== doctor.id && d.specialties.some((spec) => doctor.specialties.includes(spec)))
    .slice(0, 6)

  // Prepare data for carousels
  const relatedTreatmentItems = relatedTreatments.map((treatment) => ({
    id: treatment.id,
    name: treatment.name,
    type: "treatment" as const,
    department: treatment.department,
    price: treatment.starting_price,
    location: doctorBranches.find((branch) => treatment.branches_available.includes(branch.id))?.city,
    description: treatment.description,
  }))

  const relatedHospitalItems = doctorHospitals.map((hospital) => ({
    id: hospital.id,
    name: hospital.name,
    type: "hospital" as const,
    rating: hospital.rating,
    reviewCount: hospital.reviewCount,
    location: doctorBranches.find((branch) => branch.hospitalId === hospital.id)?.city,
    department: hospital.tagline,
    specialties: hospital.departments,
    description: hospital.description,
  }))

  const similarDoctorItems = similarDoctors.map((d) => ({
    id: d.id,
    name: d.name,
    type: "doctor" as const,
    rating: d.rating,
    reviewCount: d.reviewCount,
    location: db.branches.find((branch) => d.affiliations.includes(branch.id))?.city,
    department: d.title,
    specialties: d.specialties,
    description: d.about,
  }))

  // Mock available time slots
  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleBooking = () => {
    // Mock booking logic
    alert(`Appointment booked with Dr. ${doctor.name} on ${selectedDate} at ${selectedTime}`)
    setBookingOpen(false)
    setSelectedDate("")
    setSelectedTime("")
  }

  return (
    <div className="container mx-auto px-2 md:px-0 py-8">
      {/* Back Button */}
      <div className="mb-6">
  <Button variant="ghost" className="gap-2" onClick={() => window.history.back()}>
    <ArrowLeft className="w-4 h-4" />
    Back 
  </Button>
</div>

      {/* Doctor Header */}
      <div className="bg-card rounded-lg p-8 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-balance">Dr. {doctor.name}</h1>
                <p className="text-lg text-muted-foreground">{doctor.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(doctor.rating)}
                <span className="ml-2 text-lg font-semibold">{doctor.rating}</span>
                <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {doctor.experienceYears} years experience
              </Badge>
            </div>

            <p className="text-muted-foreground text-pretty mb-6">{doctor.about}</p>

            <div className="flex flex-wrap gap-2">
              {doctor.specialties.map((specialty: string) => (
                <Badge key={specialty} variant="outline">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div className="lg:w-80">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Book Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book Appointment with Dr. {doctor.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="date">Select Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Select Time</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" placeholder="Enter your full name" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="Enter your phone number" />
                      </div>
                      <div>
                        <Label htmlFor="reason">Reason for Visit</Label>
                        <Textarea id="reason" placeholder="Brief description of your concern" />
                      </div>
                      <Button onClick={handleBooking} disabled={!selectedDate || !selectedTime} className="w-full">
                        Confirm Booking
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Doctor
                </Button>
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <MapPin className="w-4 h-4 mr-2" />
                  View Locations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="space-y-8 mb-8">
        {relatedTreatmentItems.length > 0 && (
          <RelatedCarousel title="Related Treatments" items={relatedTreatmentItems} type="treatment" />
        )}

        {relatedHospitalItems.length > 0 && (
          <RelatedCarousel title="Available at Hospitals" items={relatedHospitalItems} type="hospital" />
        )}

        {similarDoctorItems.length > 0 && (
          <RelatedCarousel title="Similar Doctors" items={similarDoctorItems} type="doctor" />
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <GraduationCap className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{doctor.experienceYears}</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{doctor.rating}</div>
                <div className="text-sm text-muted-foreground">Patient Rating</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <User className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{doctor.reviewCount}</div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Languages className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{doctor.languages.length}</div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </CardContent>
            </Card>
          </div>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Languages Spoken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((language: string) => (
                  <Badge key={language} variant="secondary">
                    {language}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Specializations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.specialties.map((specialty: string) => (
                  <div key={specialty} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{specialty}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-semibold">{doctor.title}</h4>
                <p className="text-muted-foreground">
                  {doctor.experienceYears} years of experience in {doctor.specialties.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{doctor.about}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Education & Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>Medical Degree (MBBS)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Specialization in {doctor.specialties[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Board Certified</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <div className="grid gap-6">
            {doctorBranches.map((branch) => {
              const hospital = doctorHospitals.find((h) => h.id === branch.hospitalId)
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
                        {branch.address}, {branch.city}, {branch.state} - {branch.pincode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{branch.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {branch.operatingHours.open} - {branch.operatingHours.close}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm">Book Here</Button>
                      <Button variant="outline" size="sm">
                        Get Directions
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
