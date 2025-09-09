"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Phone, Globe, Star, Users, Building2, Award, Heart, Stethoscope, Bone, Baby, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Partners from "@/components/Partners"
import Banner from "@/components/BannerService"
import WhyChooseUsSection from "@/components/StatsSection"
import CtaSection from "@/components/CtaSection"

// Types
interface Hospital {
  id: string
  name: string
  logo: string
  image: string
  location: string
  phone: string
  website: string
  rating: number
  reviews: number
  beds: number
  established: number
  specialties: string[]
  description: string
  achievements: string[]
  category: "multi-specialty" | "cardiac" | "cancer" | "orthopedic" | "pediatric"
}

interface SpecialtyCategory {
  id: string
  name: string
  icon: any
  color: string
}

interface PartnershipBenefit {
  icon: any
  title: string
  description: string
}

interface Testimonial {
  name: string
  position: string
  content: string
  rating: number
}

// Data
const HOSPITALS: Hospital[] = [
  {
    id: "apollo",
    name: "Apollo Hospitals",
    logo: "/hospital-logo/apollo.svg",
    image: "/hospital-logo/apollo-hospital.webp",
    location: "Multiple Locations across India",
    phone: "+91-1860-500-1066",
    website: "apollohospitals.com",
    rating: 4.8,
    reviews: 15420,
    beds: 10000,
    established: 1983,
    specialties: ["Cardiology", "Oncology", "Neurology", "Orthopedics", "Transplants"],
    description:
      "Apollo Hospitals is one of India's leading healthcare providers with over 70 hospitals across 13 countries. Known for pioneering medical treatments and advanced healthcare technology.",
    achievements: ["First hospital in India to perform heart transplant", "JCI Accredited", "NABH Certified"],
    category: "multi-specialty",
  },
  {
    id: "fortis",
    name: "Fortis Healthcare",
    logo: "/hospital-logo/fortis.png",
    image: "/hospital-logo/Fortis.jpg",
    location: "Pan India Network",
    phone: "+91-92-1234-5678",
    website: "fortishealthcare.com",
    rating: 4.7,
    reviews: 12350,
    beds: 4500,
    established: 2001,
    specialties: ["Cardiac Sciences", "Neurosciences", "Oncology", "Renal Sciences", "Orthopedics"],
    description:
      "Fortis Healthcare is a leading integrated healthcare delivery service provider in India with 36 healthcare facilities across the country.",
    achievements: ["NABH Accredited", "Green OT Certified", "ISO 9001:2015 Certified"],
    category: "multi-specialty",
  },
  {
    id: "max",
    name: "Max Healthcare",
    logo: "/hospital-logo/max-hospital.svg",
    image: "/hospital-logo/max-super-specialit.webp",
    location: "North & West India",
    phone: "+91-92-6666-6666",
    website: "maxhealthcare.in",
    rating: 4.6,
    reviews: 9870,
    beds: 3500,
    established: 2000,
    specialties: ["Oncology", "Neurosciences", "Cardiac Sciences", "Orthopedics", "Gastroenterology"],
    description:
      "Max Healthcare is one of India's leading private healthcare providers operating 17 healthcare facilities across the Delhi NCR, Punjab, Uttarakhand and Maharashtra.",
    achievements: ["JCI Accredited", "NABL Certified Labs", "NABH Accredited"],
    category: "multi-specialty",
  },
  {
    id: "medanta",
    name: "Medanta - The Medicity",
    logo: "/hospital-logo/medanta.svg",
    image: "/hospital-logo/medanta.jpg",
    location: "Gurugram, Delhi NCR",
    phone: "+91-124-414-1414",
    website: "medanta.org",
    rating: 4.9,
    reviews: 8920,
    beds: 1600,
    established: 2009,
    specialties: ["Cardiac Sciences", "Neurosciences", "Oncology", "Digestive & Hepatobiliary Sciences", "Orthopedics"],
    description:
      "Medanta is a multi-super specialty hospital with 1600 beds and 45 operation theatres. It is one of India's largest and most advanced medical institutes.",
    achievements: ["JCI Accredited", "NABH Certified", "NABL Accredited Labs"],
    category: "multi-specialty",
  },
  {
    id: "manipal",
    name: "Manipal Hospitals",
    logo: "/hospital-logo/manipal-hospitals.webp",
    image: "/hospital-logo/manipal.jpeg",
    location: "Pan India Network",
    phone: "+91-80-2502-4444",
    website: "manipalhospitals.com",
    rating: 4.5,
    reviews: 11200,
    beds: 6000,
    established: 1953,
    specialties: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Gastroenterology"],
    description:
      "Manipal Hospitals is a leading healthcare provider in India with 28 hospitals across 15 cities, known for clinical excellence and patient care.",
    achievements: ["NABH Accredited", "JCI Accredited Units", "NABL Certified"],
    category: "multi-specialty",
  },
  {
    id: "artemis",
    name: "Artemis Hospital",
    logo: "/hospital-logo/artemis-logo1.png",
    image: "/hospital-logo/artemis.jpeg",
    location: "Gurugram, Delhi NCR",
    phone: "+91-124-451-1111",
    website: "artemishospitals.com",
    rating: 4.7,
    reviews: 6540,
    beds: 600,
    established: 2007,
    specialties: ["Cardiac Sciences", "Neurosciences", "Oncology", "Orthopedics", "Gastroenterology"],
    description:
      "Artemis Hospital is a 600+ bed, state-of-the-art multi-specialty hospital located in Gurugram, Delhi NCR.",
    achievements: ["JCI Accredited", "NABH Certified", "NABL Accredited"],
    category: "multi-specialty",
  },
]





// Custom Hooks
const useHospitalFilter = (hospitals: Hospital[], searchTerm: string, selectedCategory: string) => {
  return hospitals.filter((hospital) => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || hospital.category === selectedCategory

    return matchesSearch && matchesCategory
  })
}

// Components
const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center mb-12">
    <h2 className="text-4xl font-bold text-gray-900 mb-4  ">
      {title}
    </h2>
    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
  </div>
)

const SpecialtyCard = ({
  category,
  isSelected,
  onClick,
}: {
  category: SpecialtyCategory
  isSelected: boolean
  onClick: () => void
}) => {
  const IconComponent = category.icon

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${isSelected ? "ring-2 ring-blue-500 shadow-xl scale-105" : "hover:shadow-lg"
        }`}
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        <div
          className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
        >
          <IconComponent className="h-8 w-8 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
      </CardContent>
    </Card>
  )
}

const HospitalCard = ({ hospital, onViewDetails }: { hospital: Hospital; onViewDetails: () => void }) => (
  <Card className="overflow-hidden hover:shadow-sm shadow-none transition-all duration-500 group border border-gray-200">
    <div className="relative h-60 overflow-hidden">
      <Image
        src={hospital.image || "/placeholder.svg"}
        alt={hospital.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute top-4 right-4">
        <Badge className="bg-white/90 text-gray-900 shadow-lg backdrop-blur-sm">
          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
          {hospital.rating}
        </Badge>
      </div>
    </div>

    <CardHeader className="pb-4 px-3 md:px-4">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
          <Image
            src={hospital.logo || "/placeholder.svg"}
            alt={hospital.name}
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <CardTitle className="text-2xl md:text-xl text-gray-900">{hospital.name}</CardTitle>
      </div>
      <CardDescription className="flex md:text-base text-lg items-center text-gray-600">
        <MapPin className="h-4 w-4 mr-1 text-[#E22026]" />
        {hospital.location}
      </CardDescription>
    </CardHeader>

    <CardContent className="pt-0">
      <p className="text-gray-600 md:text-base text-lg mb-4 line-clamp-3 leading-relaxed">{hospital.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center bg-blue-50 p-2 rounded-lg">
          <Building2 className="h-4 w-4 mr-2 text-[#E22026]" />
          <span className="font-medium">{hospital.beds} beds</span>
        </div>
        <div className="flex items-center bg-green-50 p-2 rounded-lg">
          <Users className="h-4 w-4 mr-2 text-green-500" />
          <span className="font-medium">{hospital.reviews.toLocaleString()} reviews</span>
        </div>
      </div>



      <div className="flex space-x-2">
        <Button
          className=" text-left cursor-pointer bg-gray-100 justify-center md:justify-start gap-2  text-gray-700 px-8 md:w-auto w-full text-center text-base"
          onClick={onViewDetails}
        >
          View Details
        </Button>

      </div>
    </CardContent>
  </Card>
)

const BenefitCard = ({ benefit, index }: { benefit: PartnershipBenefit; index: number }) => {
  const IconComponent = benefit.icon

  return (
    <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
      <CardContent className="p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <IconComponent className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-900">{benefit.title}</h3>
        <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
      </CardContent>
    </Card>
  )
}

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => (
  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
    <CardContent className="p-6">
      <div className="flex mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-600 mb-4 italic leading-relaxed">"{testimonial.content}"</p>
      <div className="border-t pt-4">
        <div className="font-semibold text-gray-900">{testimonial.name}</div>
        <div className="text-sm text-gray-500">{testimonial.position}</div>
      </div>
    </CardContent>
  </Card>
)

const HospitalDetailModal = ({
  hospital,
  onClose,
}: {
  hospital: Hospital
  onClose: () => void
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="relative h-64">
        <Image
          src={hospital.image || "/placeholder.svg"}
          alt={hospital.name}
          fill
          className="object-cover rounded-t-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-2xl" />
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
            <Image
              src={hospital.logo || "/placeholder.svg"}
              alt={hospital.name}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{hospital.name}</h2>
            <p className="text-gray-600 flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1 text-[#E22026]" />
              {hospital.location}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg">
              Overview
            </TabsTrigger>
            <TabsTrigger value="specialties" className="rounded-lg">
              Specialties
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-lg">
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">{hospital.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{hospital.rating}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-2xl font-bold text-[#74c044]">{hospital.beds}</div>
                  <div className="text-sm text-gray-600">Beds</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{hospital.established}</div>
                  <div className="text-sm text-gray-600">Established</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{hospital.reviews.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specialties" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hospital.specialties.map((specialty) => (
                <div key={specialty} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
                  <div className="font-semibold text-blue-900">{specialty}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="space-y-4">
              {hospital.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl"
                >
                  <Award className="h-6 w-6 text-[#74c044]" />
                  <span className="font-medium text-gray-900">{achievement}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <Phone className="h-6 w-6 text-blue-600" />
                <span className="font-medium">{hospital.phone}</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <Globe className="h-6 w-6 text-[#74c044]" />
                <span className="font-medium">{hospital.website}</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
                <MapPin className="h-6 w-6 text-red-600" />
                <span className="font-medium">{hospital.location}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
)

// Main Component
export default function MediviosHospitalPartners() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)

  const filteredHospitals = useHospitalFilter(HOSPITALS, searchTerm, selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section with Medivios Branding */}
      <Banner
        topSpanText="Explore Our Hospital Network"
        title="Connecting You to India’s Leading Hospitals
"
        description="Medivisor India Treatment partners with trusted hospitals across India — from multi-specialty centers to super-specialty institutes. With advanced facilities and expert doctors, you get the right care at the right place. Check below to explore our hospital network."
        buttonText="Find a Hospital"
        buttonLink="/hospital-network/#hospital-partners" // Changed the link to reflect hospital network

        bannerBgImage="/hospital-network-bg.jpeg" // Assuming this image is still relevant for the hospital network
        mainImageSrc="/about-main.png" // Replace with an actual image representing your hospital network (e.g., a map with hospital pins, a collage of hospital exteriors)
        mainImageAlt="Medivisor India Treatment Hospital Network"

      />
      {/* Partner Logos Section */}
      <Partners />



      {/* Featured Hospital Partners Section */}
      <section className="py-10 px-2 md:px-0 bg-gray-50" id="hospital-partners">
        <div className="container mx-auto ">


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredHospitals.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} onViewDetails={() => setSelectedHospital(hospital)} />
            ))}
          </div>

          {filteredHospitals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building2 className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hospitals found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or category filter</p>
            </div>
          )}
        </div>
      </section>




      <WhyChooseUsSection />

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <HospitalDetailModal hospital={selectedHospital} onClose={() => setSelectedHospital(null)} />
      )}
      <CtaSection />
    </div>
  )
}
