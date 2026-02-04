"use client"
import Image from 'next/image';
import { Users, Award, Globe, Heart, Shield, Clock, Handshake, Lightbulb, MessageSquare, BriefcaseMedical, Quote } from 'lucide-react';
import { useState } from 'react';
import StatsSection from "@/components/StatsSection"
import Banner from "@/components/BannerService"
import TeamSilder from "@/components/teamSilder"
import MeetOurDoctors from "@/components/MeetOurDoctors"
import CtaSection from '@/components/CtaSection';
import Services from "@/components/Services"
import SafetyMeasures from '@/components/SafetyMeasures';
import HospitalCarousel from '@/components/hospitalCompo';
// The 'metadata' export has been removed from this file.
// In a Next.js App Router project, 'metadata' should be defined in a Server Component,
// typically in a parent layout.tsx or a server-side page.tsx that wraps this client component.


export default function AboutPage() {
  // State for the tabs in the 'Why Choose Us' section
  const [activeTab, setActiveTab] = useState('experience');

  // Data for the statistics section
  const stats = [
    { icon: <Users className="w-8 h-8" />, number: '2000+', label: 'Patients Helped' },
    { icon: <Award className="w-8 h-8" />, number: '95%+', label: 'Success Rate' },
    { icon: <Globe className="w-8 h-8" />, number: '50+', label: 'Countries Served' },
    { icon: <Heart className="w-8 h-8" />, number: '10+', label: 'Years Experience' },
  ];

  // Data for the core values section
  const values = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Patient Safety First',
      description: 'We prioritize patient safety above all else, ensuring every step of your medical journey is secure and well-monitored.'
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: 'Compassionate Care',
      description: 'Our team provides emotional support and personalized attention throughout your treatment journey.'
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: '24/7 Support',
      description: 'Round-the-clock assistance from our dedicated team, ensuring you never feel alone during your treatment.'
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: 'Global Reach',
      description: 'Serving patients from around the world with offices in multiple countries for local support.'
    }
  ];





  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Hero Section */}

      <Banner
        topSpanText="About Medivisor"
        title="Your Trusted Gateway to World-Class Healthcare in India."
        description="Medivisor India Treatment is a trusted medical travel partner for international patients seeking advanced, world-class healthcare in India. With over a decade of expertise, we have proudly assisted 2,500+ overseas patients, achieving a remarkable 95%+ success and satisfaction rate.<div class='mb-5'></div>
        Our unwavering commitment to compassionate care and professional service has earned us recognition from esteemed organizations, including the WHALE (World Health Alliance for Leadership and Excellence), the Indian Health Bureau, and the Mitra Foundation."
        buttonText="Discover How We Help"
        buttonLink="/contact"
        mainImageSrc="/about-main.png"
        mainImageAlt="Doctor providing expert medical guidance"
        bannerBgImage="/bg-about.png"
      />

      {/* <Partners/> */}
      {/* <About /> */}
      {/* Stats Section */}


      <StatsSection />
      <Services />


      <TeamSilder />

      <MeetOurDoctors />
      <HospitalCarousel />
      <SafetyMeasures />
      <CtaSection />

      {/* Our Story Section */}

    </div>
  );
}