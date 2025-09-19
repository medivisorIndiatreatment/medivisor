


"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Shield,
  MessageCircle,
  DollarSign,
  Package,
  HeartHandshake,
  Star,
  CheckCircle,
  Award,
  Heart,
  UserCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Banner from "@/components/BannerService";
import CtaSection from "@/components/CtaSection";
import WhyChooseUsSection from "@/components/StatsSection";
import { motion } from "framer-motion";

interface ChoiceReason {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  highlights?: string[];
}
const choiceReasons: ChoiceReason[] = [
  {
    id: "1",
    title: "Top-notch Healthcare Providers",
    description:
      "Collaborating exclusively with JCI and NABH accredited healthcare institutions and clinicians in India, Medivisor ensures that patients receive treatments and services of the highest quality, adhering to international healthcare standards.",
    icon: Shield,
    category: "Quality",
    highlights: ["JCI Accredited", "NABH Certified", "International Standards"],
  },
  {
    id: "2",
    title: "Tailored Treatment Plans",
    description:
      "Committed to personalized healthcare solutions, Medivisor works closely with medical experts to customize treatment plans based on the specific needs and preferences of each patient, enhancing the overall quality of care.",
    icon: UserCheck,
    category: "Personalization",
    highlights: ["Personalized Care", "Expert Collaboration", "Custom Solutions"],
  },
  {
    id: "3",
    title: "Clear and Open Communication",
    description:
      "Communication is at the core of the Medivisor experience. We prioritize transparency throughout the medical journey, covering treatment options, costs, and expected outcomes. This approach ensures that you are well-informed, empowering you to make decisions with confidence.",
    icon: MessageCircle,
    category: "Transparency",
    highlights: ["Full Transparency", "Informed Decisions", "Clear Communication"],
  },
  {
    id: "4",
    title: "Affordable Healthcare Options",
    description:
      "Recognizing the importance of affordability in healthcare, Medivisor strives to offer cost-effective treatment options without compromising on quality.",
    icon: DollarSign,
    category: "Affordability",
    highlights: ["Cost-Effective", "Quality Maintained", "Budget-Friendly"],
  },
  {
    id: "5",
    title: "One-Stop Shop – Streamlined Experience",
    description:
      "Medivisor provides a seamless and stress-free experience by managing everything from hospital booking to hotel accommodation, visa arrangements, and travel logistics. Eliminating the need to search for separate vendors, all services are efficiently provided under one roof.",
    icon: Package,
    category: "Convenience",
    highlights: ["All-in-One Service", "No Multiple Vendors", "Complete Management"],
  },
  {
    id: "6",
    title: "Comprehensive Assistance in India",
    description:
      "Going beyond paperwork, Medivisor ensures a hassle-free experience with a dedicated executive present both inside and outside the hospital. From airport pick-ups to hospital transfers and assisting you during treatment, we make the process seamless.",
    icon: HeartHandshake,
    category: "Support",
    highlights: ["Dedicated Executive", "Full Assistance", "Hospital Accompaniment"],
  },
  {
    id: "7",
    title: "Holistic Care – Embracing Life's Moments",
    description:
      "Medivisor believes in extending care beyond the clinic. We organize and facilitate patients to enjoy festivals and significant occasions, contributing to emotional well-being and recovery.",
    icon: Heart,
    category: "Wellness",
    highlights: ["Beyond Medical Care", "Festival Celebrations", "Recovery Activities"],
  },
  {
    id: "8",
    title: "Continued Relationship – Post-Treatment Support",
    description:
      "Our commitment doesn't end with treatment. We continue to assist even after patients return home, with follow-ups, medicine delivery, and video consultations.",
    icon: Clock,
    category: "Continuity",
    highlights: ["Post-Treatment Care", "Medicine Delivery", "Follow-up Support"],
  },
  {
    id: "9",
    title: "1800+ Testimonials – Real Stories, Real Satisfaction",
    description:
      "Over 1500 international patients, including 1200 from Pacific Island countries, have chosen Medivisor and shared their positive experiences.",
    icon: Star,
    category: "Trust",
    highlights: ["1500+ Patients", "1200 Pacific Islands", "Proven Results"],
  },
];

const categories = Array.from(new Set(choiceReasons.map((item) => item.category)));

const categoryIcons: Record<string, React.ElementType> = {
  Quality: Shield,
  Personalization: UserCheck,
  Transparency: MessageCircle,
  Affordability: DollarSign,
  Convenience: Package,
  Support: HeartHandshake,
  Wellness: Heart,
  Continuity: Clock,
  Trust: Star,
};

export default function WhyChooseUsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredReasons =
    selectedCategory === "All"
      ? choiceReasons
      : choiceReasons.filter((item) => item.category === selectedCategory);

  const getCategoryCount = (category: string) =>
    category === "All"
      ? choiceReasons.length
      : choiceReasons.filter((item) => item.category === category).length;

  const scrollToCard = (index: number) => {
    if (cardRefs.current[index]) {
      cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      
<Banner
  topSpanText="Why Choose Medivisor?"
  title="Your Partner for Clear, Confident Healthcare Decisions"
  description="At Medivisor India, we simplify complex medical choices by connecting you with leading hospitals and specialists. Our expert guidance, transparent cost breakdowns, and personalized support ensure a smooth, stress-free treatment journey—so you can focus on healing."
  buttonText="Speak with a Medivisor Expert"
  buttonLink="/contact"
  bannerBgImage="/faq-banner.png"
  mainImageSrc="/about-main.png"
  mainImageAlt="Trusted Medical Experts at Medivisor India"
/>

      <WhyChooseUsSection />

      <section className="bg-gray-50 p">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-xs shadow-xs border border-gray-100 sticky top-16">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="title-heading">Our Strengths</h2>
                  <p className="description">Explore what makes us different</p>
                </div>

                <nav className="p-4 space-y-2">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xs transition ${
                      selectedCategory === "All"
                        ? "bg-gray-100 text-gray-900 border border-gray-200"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">All Reasons</span>
                    </div>
                    <Badge>{getCategoryCount("All")}</Badge>
                  </button>

                  <div className="border-t border-gray-200 my-2" />

                  {categories.map((category) => {
                    const Icon = categoryIcons[category] || Award;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xs transition ${
                          selectedCategory === category
                            ? "bg-gray-100 text-gray-900 border border-gray-200"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{category}</span>
                        </div>
                        <Badge>{getCategoryCount(category)}</Badge>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <header className="my-6">
                <h2 className="title-heading">
                  {selectedCategory === "All" ? "All Our Strengths" : selectedCategory}
                </h2>
                <p className="text-gray-600">
                  {filteredReasons.length} reason{filteredReasons.length !== 1 ? "s" : ""} why Medivisor stands out
                </p>
              </header>

              <div className="space-y-6">
                {filteredReasons.map((reason, index) => {
                  const Icon = reason.icon;
                  return (
                    <motion.div
                      key={reason.id}
                      ref={(el) => (cardRefs.current[index] = el)}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}
                      onClick={() => scrollToCard(index)}
                    >
                      <Card className="bg-white border border-gray-100 shadow-xs rounded-xs cursor-pointer transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-6">
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xs">
                              <Icon className="w-6 h-6 text-gray-700" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 description-1">
                                  {index + 1}
                                </div>
                                <Badge variant="outline" className="bg-gray-50  description-1 font-medium border-gray-100">
                                  {reason.category}
                                </Badge>
                              </div>

                              <h3 className="title-text mb-2">
                                {reason.title}
                              </h3>
                              <p className=" description">
                                {reason.description}
                              </p>

                              {reason.highlights && (
                                <div className="flex mt-2 flex-wrap gap-2">
                                  {reason.highlights.map((highlight, idx) => (
                                    <span
                                      key={idx}
                                      className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1 rounded-xs description-1"
                                    >
                                      <CheckCircle className="w-4 h-4 text-[#74BF44]" />
                                      {highlight}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

            
            </div>
          </div>
        </div>
          <CtaSection />
      </section>
    </>
  );
}