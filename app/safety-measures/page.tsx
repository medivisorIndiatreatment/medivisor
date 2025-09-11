import { Metadata } from "next";
import Banner from "@/components/BannerService";
import SafetyMeasures from "@/components/SafetyMeasures";
import OurInitiativesSection from "@/components/OurInitiativesSection";
import Activities from "@/components/Activities";

export const metadata: Metadata = {
  title: "Safety Measures & Patient Care | Medivisor India Treatment",
  description: "Medivisor India Treatment prioritizes patient safety with strict protocols, accredited hospitals, and expert medical care. Explore our initiatives to improve healthcare access and ensure a secure medical journey.",
  keywords: "Medivisor India, patient safety, safety measures, accredited hospitals India, healthcare initiatives, international patient care, medical tourism India",

  robots: "index, follow",
  openGraph: {
    title: "Safety Measures & Patient Care | Medivisor India Treatment",
    description: "Discover how Medivisor India ensures patient safety through strict protocols, accredited hospitals, and community healthcare initiatives.",
    url: "https://www.medivisorindia.com/treatment",
    siteName: "Medivisor India",
    images: [
      {
        url: "https://www.medivisorindia.com/medical-help-india.jpg",
        width: 1200,
        height: 630,
        alt: "Medivisor India Safety Measures",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safety Measures & Patient Care | Medivisor India Treatment",
    description: "Learn about Medivisor India's strict safety protocols, accredited hospitals, and healthcare initiatives ensuring secure medical journeys for international patients.",
   
    site: "@MedivisorIndia",
  },
};

export default function Treatment() {
  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Hero Banner */}
      <Banner
        topSpanText="Safety Measures"
        title="Ensuring Care with Trust and Responsibility"
        description="At Medivisor India Treatment, patient safety comes first. We follow strict protocols, partner with accredited hospitals, and take every precaution to make your healthcare journey secure and worry-free. Beyond patient care, we actively work on initiatives to improve healthcare access, raise awareness, and promote community well-being across India."
        buttonText="Learn More"
        buttonLink="/initiatives"
        bannerBgImage="/service-banner.png"
        mainImageSrc="/about-main.png"
        mainImageAlt="Medivisor India Treatment Initiatives"
      />

      {/* Safety Measures Section */}
    
        <SafetyMeasures />

      {/* Optional Initiatives / Activities */}
      <section className="py-16 md:px-0 px-4 bg-gray-50">
        <OurInitiativesSection />
      </section>

      {/* Optional Activities Section */}
      <section className="py-16 container mx-auto px-4">
        <Activities />
      </section>
    </div>
  );
}
