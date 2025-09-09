"use client";
import React, { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Award,
  Users,
  Globe,
  Heart,
  Shield,
  CheckCircle,
  Download,
  MessageCircle,
  Video,
  X,
  ChevronDown,
  ChevronUp,
  Plane,
  FileText,
  Languages,
  CreditCard
} from 'lucide-react';
import ContactModal from '@/components/ContactModal';

interface DoctorProfile {
  _id: string;
  name: string;
  specialty: string;
  photo: string;
  experience: string;
  bio: string;
  education: string[];
  certifications: string[];
  languages: string[];
  consultationFee: number;
  availability: string;
  rating: number;
  reviewsCount: number;
  yearsOfExperience: number;
  hospitalAffiliations: string[];
  contactEmail: string;
  contactPhone: string;
  internationalServices: {
    visaAssistance: boolean;
    travelConcierge: boolean;
    airportPickup: boolean;
    icuFacilities: boolean;
    languageInterpreter: string[];
  };
  packages: Array<{
    id: string;
    title: string;
    priceINR: number;
    priceUSD: number;
    includes: string[];
    turnaround: string;
  }>;
  faqs: Array<{
    q: string;
    a: string;
  }>;
  testimonials: Array<{
    id: number;
    name: string;
    country: string;
    rating: number;
    text: string;
  }>;
}

const mockDoctor: DoctorProfile = {
  _id: "1",
  name: "Sarah Johnson",
  specialty: "Interventional Cardiology",
  photo: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=1200",
  experience: "Dr. Sarah Johnson is a world-renowned interventional cardiologist with over 18 years of experience in treating complex cardiovascular conditions.",
  bio: "A beacon of excellence in global cardiac care, Dr. Sarah Johnson has dedicated her career to advancing patient well-being through innovative, minimally invasive treatments. Patients from around the world choose Dr. Johnson for her distinguished expertise and empathetic, patient-first approach.",
  education: [
    "MD - Cardiology, Harvard Medical School (2008)",
    "MBBS - Johns Hopkins University (2004)",
    "Fellowship in Interventional Cardiology - Mayo Clinic (2010)",
  ],
  certifications: [
    "Board Certified in Cardiovascular Disease",
    "Fellow of American College of Cardiology (FACC)",
    "Certified in Advanced Cardiac Life Support (ACLS)",
  ],
  languages: ["English", "Spanish", "French", "Hindi"],
  consultationFee: 3500,
  availability: "Mon - Fri: 09:00 - 18:00 (IST)",
  rating: 4.9,
  reviewsCount: 347,
  yearsOfExperience: 18,
  hospitalAffiliations: [
    "Apollo Hospital, New Delhi",
    "Fortis Escorts Heart Institute, New Delhi",
    "Medanta - The Medicity, Gurugram",
  ],
  contactEmail: "dr.sarah.johnson@medivisor.com",
  contactPhone: "+91 98765 43210",
  internationalServices: {
    visaAssistance: true,
    travelConcierge: true,
    airportPickup: true,
    icuFacilities: true,
    languageInterpreter: ["Hindi", "English", "Arabic"],
  },
  packages: [
    {
      id: "pkg-basic",
      title: "Teleconsult + Report Review",
      priceINR: 4999,
      priceUSD: 60,
      includes: ["Initial teleconsult", "Second opinion report review", "Language support"],
      turnaround: "48 hours",
    },
    {
      id: "pkg-surgery",
      title: "Surgical Package (incl. stay)",
      priceINR: 450000,
      priceUSD: 5400,
      includes: [
        "Pre-op consultation",
        "Surgery & anesthesia",
        "7-night hospital stay",
        "Local transfer & concierge",
      ],
      turnaround: "Custom planning",
    },
  ],
  faqs: [
    {
      q: "Do you provide visa invitation letters?",
      a: "Yes — we provide formal medical invitation letters and an estimated cost breakdown to support visa applications.",
    },
    {
      q: "Can international patients get help with travel and stay?",
      a: "Yes, our travel concierge helps with airport pickup, hotel booking, and ground transport.",
    },
    {
      q: "What languages do you speak during consultations?",
      a: "I'm fluent in English, Spanish, French, and Hindi. We also provide professional medical interpreters for other languages.",
    },
    {
      q: "How do I get a second opinion remotely?",
      a: "You can book a teleconsultation and share your medical reports. I'll review everything and provide detailed recommendations within 48 hours.",
    },
  ],
  testimonials: [
    {
      id: 1,
      name: "Aisha K.",
      country: "UAE",
      rating: 5,
      text: "Dr. Johnson and the team took excellent care of me. The concierge service made everything effortless.",
    },
    {
      id: 2,
      name: "James P.",
      country: "UK",
      rating: 5,
      text: "Clear communication, high clinical standards and fast recovery support. Highly recommend.",
    },
    {
      id: 3,
      name: "Maria S.",
      country: "Spain",
      rating: 5,
      text: "Professional, caring, and thorough. The entire process from consultation to recovery was seamless.",
    },
  ],
};

const DoctorProfile: React.FC = () => {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setDoctor(mockDoctor);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-8 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-1">
              <div className="flex items-start space-x-6">
                <img
                  src={doctor.photo}
                  alt={`Dr. ${doctor.name}`}
                  className="w-100 h-100 rounded-xs object-cover border border-white shadow-xs"
                />
              </div>
            </div>
            {/* Quick Contact Card */}
            <div className="lg:col-span-2">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-700 mb-1">
                  Dr. {doctor.name}
                </h1>
                <p className="text-3xl text-gray-800 font-semibold mb-3">{doctor.specialty}</p>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(doctor.rating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-gray-700 font-semibold">{doctor.rating}</span>
                    <span className="text-gray-500 ml-1">({doctor.reviewsCount} reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Award className="w-5 h-5 mr-1" />
                    <span>{doctor.yearsOfExperience}+ years</span>
                  </div>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">{doctor.bio}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={openModal}
                    className="px-6 py-3 bg-gray-50 text-gray-800 rounded-xs font-semibold hover:bg-gray-100 transition-colors shadow-xs"
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Book Appointment
                  </button>
                  <button
                    onClick={openModal}
                    className="px-6 py-3 bg-white border border-gray-100 text-gray-700 rounded-xs font-semibold hover:bg-gray-50 transition-colors shadow-xs"
                  >
                    <Globe className="w-4 h-4 inline mr-2" />
                    International Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <section className=" px-2 bg-gray-50 lg:px-0 py-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-xs p-5 border border-gray-100 shadow-xs">
                <h2 className="text-3xl font-medium text-gray-900 mb-4">About Dr. {doctor.name}</h2>
                <p className="text-gray-700 leading-relaxed text-lg mb-6">{doctor.experience}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Education</h3>
                    <ul className="space-y-2">
                      {doctor.education.map((edu, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-6 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-lg">{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Certifications</h3>
                    <ul className="space-y-2">
                      {doctor.certifications.map((cert, index) => (
                        <li key={index} className="flex items-start">
                          <Award className="w-5 h-6 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-lg">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {/* International Services */}
              <div className="bg-white rounded-xs p-5 border border-gray-100 shadow-xs">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">International Patient Services</h2>
                <p className="text-gray-700 text-lg mb-6">
                  Comprehensive support for international patients seeking world-class medical care in India.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-100 rounded-xs">
                    <div className="flex items-center mb-3">
                      <FileText className="w-10 h-10 bg-white rounded-xs p-2 text-gray-600 mr-2" />
                      <h3 className="text-xl font-medium text-gray-700">Visa & Documentation</h3>
                    </div>
                    <p className="text-gray-600 text-lg">
                      Medical invitation letters, cost estimates, and documentation support for visa applications.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-xs">
                    <div className="flex items-center mb-3">
                      <Plane className="w-10 h-10 bg-white rounded-xs p-2 text-gray-600 mr-2" />
                      <h3 className="text-xl font-medium text-gray-700">Travel Concierge</h3>
                    </div>
                    <p className="text-gray-600 text-lg">
                      Airport pickup, hotel arrangements, local transportation, and cultural support services.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-xs">
                    <div className="flex items-center mb-3">
                      <Languages className="w-10 h-10 bg-white rounded-xs p-2 text-gray-600 mr-2" />
                      <h3 className="text-xl font-medium text-gray-700">Language Support</h3>
                    </div>
                    <p className="text-gray-600 text-lg">
                      Professional medical interpreters and multilingual patient coordinators available.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-xs">
                    <div className="flex items-center mb-3">
                      <CreditCard className="w-10 h-10 bg-white rounded-xs p-2 text-gray-600 mr-2" />
                      <h3 className="text-xl font-medium text-gray-700">Insurance & Billing</h3>
                    </div>
                    <p className="text-gray-600 text-lg">
                      Insurance claim assistance, transparent pricing, and flexible payment options.
                    </p>
                  </div>
                </div>
              </div>
              {/* FAQ Section */}
              <div className="bg-white rounded-xs p-5 border border-gray-100 shadow-xs">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {doctor.faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-xs">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full px-6 py-3 text-left flex items-center justify-between bg-gray-50 hover:bg-white transition-colors rounded-xl"
                      >
                        <span className="font-medium text-lg text-gray-700">{faq.q}</span>
                        {expandedFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-700 leading-relaxed text-base">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Column - Hospital Affiliations & Quick Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xs p-5 border border-gray-100 shadow-xs">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Hospital Affiliations</h3>
                <ul className="space-y-3">
                  {doctor.hospitalAffiliations.map((hospital, index) => (
                    <li key={index} className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-lg">{hospital}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className=" bg-white  rounded-xs p-5 border border-gray-100 shadow-xs">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-left">
                  International Patient Journey 🌍
                </h3>
                <ol className="relative border-l-2 border-gray-200 space-y-6 pl-6">
                  <li className="group">
                    <div className="absolute -left-3 w-6 h-6 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-lg font-medium ring-2 ring-gray-100 transition group-hover:scale-110">
                      1
                    </div>
                    <p className="text-gray-700 text-lg font-medium">Share medical records & reports</p>
                  </li>
                  <li className="group">
                    <div className="absolute -left-3 w-6 h-6 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-lg font-medium ring-2 ring-gray-100 transition group-hover:scale-110">
                      2
                    </div>
                    <p className="text-gray-700 text-lg font-medium">Receive treatment plan & visa letter</p>
                  </li>
                  <li className="group">
                    <div className="absolute -left-3 w-6 h-6 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-lg font-medium ring-2 ring-gray-100 transition group-hover:scale-110">
                      3
                    </div>
                    <p className="text-gray-700 text-lg font-medium">Travel arrangements & arrival</p>
                  </li>
                  <li className="group">
                    <div className="absolute -left-3 w-6 h-6 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-lg font-medium ring-2 ring-gray-100 transition group-hover:scale-110">
                      4
                    </div>
                    <p className="text-gray-700 text-lg font-medium">Treatment & recovery support</p>
                  </li>
                </ol>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="text-center">
                  <Heart className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Need Immediate Help?</h3>
                  <p className="text-gray-700 text-lg mb-4">
                    Our international patient coordinators are available 24/7 to assist you.
                  </p>
                  <button
                    onClick={openModal}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Contact Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Booking Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default DoctorProfile;