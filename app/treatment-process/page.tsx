'use client';

import React, { useState } from 'react';
import {
  FileText,
  MessageCircle,
  Plane,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Globe,
  Heart,
  Users,
  Award,
  Shield,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import TreatmentProcess from "@/components/TreatmentProcess"
import Banner from "@/components/BannerService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CtaSection from '@/components/CtaSection';
import WorkflowCompo from "@/components/QuickEVisaFlow"
const Treatment = () => { // Renamed the component to 'Treatment'
  const [activeStep, setActiveStep] = useState(1);





  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Banner Section */}
      <Banner
  topSpanText=" Treatment Process"
  title="Your Medical Journey in India, Step by Step"
  description="Every healing journey starts with trust. At Medivisor, we guide you at every step — from understanding your concerns and connecting you with trusted doctors and hospitals, to explaining costs clearly and managing travel and stay. During treatment and recovery, our team stays close, so you always feel cared for, supported, and confident in your choices."
  buttonText="Start Your Journey"
  buttonLink="/contact"
  bannerBgImage="/grandparents-grandchildren-globe-with-inclusion-text-concept-as-abstract-vector-featuring-g_980716-652718.jpg"
  mainImageSrc="/about-main.png"
  mainImageAlt="Friendly Medivisor Advisors Guiding Patients Through Treatment"
/>


        <TreatmentProcess />
        
      <WorkflowCompo/>
    
       <CtaSection/>
      </div>
    </>
  );
};

export default Treatment; // Corrected export to match component name