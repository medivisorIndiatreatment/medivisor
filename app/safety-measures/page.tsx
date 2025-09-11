import { Mail, Phone, MessageCircle, CheckCircle, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Banner from "@/components/BannerService";
import TreatmentCost from "@/components/TreatmentCost"
import OurInitiativesSection from "@/components/OurInitiativesSection";
import Activities from "@/components/Activities";
import SafetyMeasures from "@/components/SafetyMeasures";
import CtaSection from "@/components/CtaSection";
export default function Treatment() {


  return (

    <>

      <Banner
        topSpanText="Safety Measures"
        title="Ensuring Care with Trust and Responsibility
"
        description="At Medivisor India Treatment, safety comes first. We follow strict protocols, partner with accredited hospitals, and take every precaution to make your healthcare journey secure and worry-free. Beyond patient care, we are committed to initiatives that improve healthcare access, raise awareness, and promote community well-being across India."
        buttonText="Learn More"
        buttonLink="/initiatives" 
        bannerBgImage="/service-banner.png" // Replace with an image relevant to your initiatives (e.g., community outreach, health camp, research)
        mainImageSrc="/about-main.png" // Replace with a compelling image representing your initiatives (e.g., a collage of different programs, a symbolic icon)
        mainImageAlt="Medivisor India Treatment Initiatives"
     
      />
      <SafetyMeasures/>
      <CtaSection/>
     {/* <Activities/> */}
    </>
  );
}