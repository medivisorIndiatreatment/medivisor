"use client"

import { useState } from "react"
import {
  Star,
  Phone,
  Calendar,
  Clock,
  Heart,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Stethoscope,
  Languages,
  Building2,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Data structure interface
interface DoctorProfile {
  _id: string
  name: string
  title: string
  specialty: string
  photo: string
  experience: string
  languages: string[]
  hospitals: string[]
  contactPhone: string
  whatsapp: string
  rating: number
  reviewsCount: number
  about: string
  workExperience: Array<{
    position: string
    organization: string
    period: string
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
  }>
  memberships: string[]
  awards: Array<{
    title: string
    year: string
    organization: string
  }>
  specialtyInterests: string[]
  faqs: Array<{
    q: string
    a: string
  }>
  testimonials: Array<{
    id: number
    name: string
    rating: number
    text: string
  }>
}

// Static data for the doctor profile
const mockDoctor: DoctorProfile = {
  _id: "doc1",
  name: "Dr. Ambrish Mithal",
  title: "Chairman & Head - Endocrinology & Diabetes",
  specialty: "Endocrinology & Diabetes",
  photo: "https://max-website20-images.s3.ap-south-1.amazonaws.com/Dr_Ambrish_4b333d76bd_2f57625e3f.jpg",
  experience: "36+",
  languages: ["English", "Hindi"],
  hospitals: ["Max Hospital, Gurugram, India", "Max Super Speciality Hospital, Saket, Delhi, India"],
  contactPhone: "+91 926 888 0303",
  whatsapp: "+91 926 888 0303",
  rating: 4.9,
  reviewsCount: 2150,
  about:
    "Dr. Ambrish Mithal is an endocrinologist and the Chairman and Head of Endocrinology and Diabetes at Max Healthcare, Saket, New Delhi. One of the most renowned names in the field of Endocrinology, Dr. Ambrish Mithal is considered to be a thought leader in the medical community. He has been nominated to the Governing Council of the National Health Authority and appointed as honorary President, All India Institute of Medical Sciences, Gorakhpur.",
  workExperience: [
    {
      position: "Chairman and Head of Endocrinology and Diabetes",
      organization: "Max Healthcare",
      period: "2019 - Present",
    },
    {
      position: "Chairman, Division of Endocrinology and Diabetes",
      organization: "Medanta - The Medicity",
      period: "2009 - 2019",
    },
    {
      position: "Senior Consultant",
      organization: "Indraprastha Apollo Hospital",
      period: "1998 - 2009",
    },
    {
      position: "Faculty member (Endocrinology)",
      organization: "Sanjay Gandhi PGI, Lucknow",
      period: "1988 - 1998",
    },
  ],
  education: [
    {
      degree: "D.M. (Endocrinology)",
      institution: "AIIMS, New Delhi",
      year: "1987",
    },
    {
      degree: "M.D.",
      institution: "Kanpur University",
      year: "1984",
    },
    {
      degree: "M.B.B.S.",
      institution: "Kanpur University",
      year: "1980",
    },
  ],
  memberships: [
    "Endocrine Society of India",
    "American Society for Bone and Mineral Research",
    "Founder-Secretary, Indian Society for Bone and Mineral Research",
    "President, Indian Society for Bone and Mineral Research",
    "Member, Governing Council, Indian Menopause Society",
    "Endocrine Society (US)",
    "Editorial Board, Apollo Medical Journal",
  ],
  awards: [
    {
      title: "Padma Bhushan",
      year: "2015",
      organization: "President of India",
    },
    {
      title: "Laureate Award 2021, International Excellence in Endocrinology Award",
      year: "2021",
      organization: "International Society",
    },
    {
      title: "Dr. B.C. Roy Award",
      year: "2015",
      organization: "Medical Council of India",
    },
    {
      title: "International Osteoporosis Foundation - President's Award",
      year: "2016",
      organization: "International Osteoporosis Foundation",
    },
    {
      title: "Boy Frame Award",
      year: "2004",
      organization: "American Society for Bone Mineral Research",
    },
  ],
  specialtyInterests: ["Endocrinology", "Diabetes", "Bone and Mineral Disorders", "Osteoporosis"],
  faqs: [
    {
      q: "What conditions does Dr. Mithal specialize in treating?",
      a: "Dr. Mithal specializes in endocrinology and diabetes, including thyroid disorders, diabetes management, osteoporosis, and other hormonal imbalances.",
    },
    {
      q: "How can I book an appointment with Dr. Mithal?",
      a: "You can book an appointment by calling +91 926 888 0303 or through WhatsApp. Online booking is also available through the hospital's website.",
    },
    {
      q: "Does Dr. Mithal see international patients?",
      a: "Yes, Dr. Mithal sees international patients at Max Healthcare facilities. The hospital provides comprehensive support for international patients including visa assistance and travel coordination.",
    },
    {
      q: "What are Dr. Mithal's consultation hours?",
      a: "Consultation hours vary by location. Please contact the hospital directly for current scheduling and availability.",
    },
  ],
  testimonials: [
    {
      id: 1,
      name: "Rajesh Kumar",
      rating: 5,
      text: "Dr. Mithal's expertise in diabetes management has been life-changing. His thorough approach and clear explanations make complex conditions understandable.",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      rating: 5,
      text: "Exceptional care and professionalism. Dr. Mithal took the time to explain my thyroid condition and treatment options in detail.",
    },
    {
      id: 3,
      name: "Ahmed Al-Rashid",
      rating: 5,
      text: "As an international patient, I received outstanding care. Dr. Mithal's reputation for excellence is well-deserved.",
    },
  ],
}

export default function DoctorProfileComponent() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  // The component now directly uses the mockDoctor object
  const doctor = mockDoctor

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white pt-8 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Doctor Photo */}
            <div className="lg:col-span-1">
              <div className="relative">
                <img
                  src={doctor.photo || "/placeholder.svg"}
                  alt={doctor.name}
                  className="w-full max-w-md mx-auto rounded-xs object-cover shadow-xs border border-gray-100"
                />
              </div>
            </div>

            {/* Doctor Info */}
            <div className="lg:col-span-2">
              <div className="space-y-5">
                <div>
                  <h1 className="text-4xl font-medium text-foreground mb-2 text-balance">{doctor.name}</h1>
                  <p className="text-xl text-gray-700 font-semibold mb-2">{doctor.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="flex bg-gray-50 p-2 px-4 items-center">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < Math.floor(doctor.rating) ? "fill-current" : ""}`} />
                        ))}
                      </div>
                      <span className="text-foreground font-semibold">{doctor.rating}</span>
                      <span className="text-gray-600 ml-1">({doctor.reviewsCount} reviews)</span>
                    </div>
                    <div className="flex bg-gray-50 p-2 px-4 items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-1" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Languages className="w-5 h-5 mr-2" />
                      <span>Languages: {doctor.languages.join(", ")}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <Building2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        {doctor.hospitals.map((hospital, index) => (
                          <div key={index}>{hospital}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-foreground text-lg leading-relaxed text-pretty">{doctor.about}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 px-4 bg-gray-50 lg:px-0">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Experience */}
              <Card className="border shadow-xs border-gray-50 bg-white">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-gray-700 flex items-center">
                    <Stethoscope className="w-8 h-8 mr-2 text-[#74BF44]" />
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.workExperience.map((exp, index) => (
                    <div key={index} className="rounded-xs p-4 bg-gray-50 shadow-xs border border-gray-100">
                      <h3 className="text-xl font-medium text-gray-700">{exp.position}</h3>
                      <p className="text-gray-600 mt-1 text-base">{exp.organization} ({exp.period})</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="border shadow-xs border-gray-50 bg-white">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-gray-700 flex items-center">
                    <GraduationCap className="w-8 h-8 mr-2 text-[#74BF44]" />
                    Education & Training
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.education.map((edu, index) => (
                    <div key={index} className="rounded-xs p-4 bg-gray-50 shadow-xs border border-gray-100">
                      <h3 className="text-xl font-medium text-gray-700">{edu.degree}</h3>
                      <p className="text-gray-600 mt-1 text-base">{edu.institution} ({edu.year})</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Awards */}
              <Card className="border shadow-xs border-gray-50 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground flex items-center">
                    <Trophy className="w-8 h-8 mr-2 text-[#74BF44]" />
                    Awards & Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.awards.map((award, index) => (
                    <div key={index} className="rounded-xs p-4 bg-gray-50 shadow-xs border border-gray-100">
                      <h3 className="text-xl font-medium text-gray-700">{award.title}</h3>
                      <p className="text-gray-600 mt-1 text-base">{award.organization} ({award.year})</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Specialty Interests */}
              <Card className="border shadow-xs border-gray-50 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-gray-700">Specialty Interests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.specialtyInterests.map((interest, index) => (
                    <div key={index} className="rounded-xs p-4 bg-gray-50 shadow-xs border border-gray-100">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-[#74BF44] flex-shrink-0" />
                        <span className="text-foreground">{interest}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

            

              {/* Contact Card */}
              <Card className="bg-white border-gray-100 shadow-xs">
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Need Medical Consultation?</h3>
                  <p className="text-gray-600 mb-4 text-lg text-pretty">
                    Book an appointment with Dr. Mithal for expert endocrinology care.
                  </p>
                  <Button className="w-full bg-primary text-lg text-gray-700 hover:bg-primary/90">
                    <Calendar className="w-6 h-6 mr-2" />
                    Schedule Appointment
                  </Button>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex items-center justify-center text-gray-600 text-lg">
                      <Phone className="w-5 h-5 mr-1" />
                      <span>{doctor.contactPhone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}