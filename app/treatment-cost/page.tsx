"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { wixClient } from "@/lib/wixClient";
import ContactModal from "@/components/ContactModal";
import { getBestCoverImage } from "@/lib/wixMedia";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Loader2,
  AlertTriangle,
  Award,
  ArrowRight,
  Mail,
  MessageCircle,
} from "lucide-react";

// Assume these components exist in your project
import Banner from "@/components/BannerService";
import Ctasection from "@/components/CtaSection";

interface Treatment {
  _id: string;
  hospitalName: string;
  treatmentName: string;
  image: string;
  ID?: string;
  createdDate?: string;
  updatedDate?: string;
  owner?: string;
  richContent?: Record<string, any> | null;
  enquireNow?: string;
}

const TREATMENTS_COLLECTION_ID = "PersonalizedTreatmentQuotation";
const ITEMS_PER_PAGE = 29;

// New TreatmentCard Component with proper Wix Media URL handling
const TreatmentCard = ({
  treatment,
  onOpenModal,
}: {
  treatment: Treatment;
  onOpenModal: () => void;
}) => {
  // Use getBestCoverImage to get a proper Wix Media URL
  const imageUrl = treatment.image
    ? getBestCoverImage(treatment.image)
    : "/placeholder.svg?height=224&width=400&text=Image Not Found";

  return (
    <Card className="bg-white rounded-xs shadow-xs overflow-hidden transform transition-transform duration-300 border-gray-100 ">
      <Link href={`/treatments/${treatment._id}`}>
        <Image
          src={imageUrl}
          alt={treatment.hospitalName}
          width={400}
          height={204}
          className="w-full h-48 object-cover"
        />
        <CardHeader>
          <div className="flex items-center text-primary-500 mb-2">
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              {treatment.hospitalName}
            </Badge>
          </div>
          <CardTitle className="text-xl font-medium text-gray-700 line-clamp-2">
            {treatment.treatmentName}
          </CardTitle>
        </CardHeader>
      </Link>
      <CardFooter className="flex justify-between items-center pt-1">
        <Button
          variant="outline"
          className="border-gray-200 text-gray-600 hover:bg-gray-50"
          onClick={onOpenModal}
        >
          Read More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main page component
export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchTreatments = async () => {
    try {
      const response = await wixClient.items
        .query(TREATMENTS_COLLECTION_ID)
        .limit(ITEMS_PER_PAGE)
        .find({ consistentRead: true });

      if (!response || !response.items) return [];

      const fetchedTreatments = response.items.map((item: any) => ({
        _id: item._id,
        hospitalName: item.hospitalName || "Untitled Treatment",
        treatmentName: item.treatmentName || "No description available.",
        image: item.image || null,
        richContent: item.richContent || null,
      }));

      setTotalCount(response.totalCount || 0);
      return fetchedTreatments;
    } catch (err) {
      console.error("Error fetching Treatments:", err);
      setError("Failed to load treatments.");
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const data = await fetchTreatments();
      setTreatments(data);
      setLoading(false);
    })();
  }, []);

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transform transition-transform duration-300 animate-pulse p-6">
      <div className="w-full h-40 bg-gray-200"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 my-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
        <Banner
          topSpanText=" Treatment Costs "
          title="Understanding Treatment Costs in India"
          description="We know that cost is one of the biggest concerns when planning medical treatment. In India, you can access world-class doctors and hospitals at prices that are often much lower than abroad. The exact cost depends on your treatment type, hospital choice, and recovery needs — but our goal is always to give you clear, upfront information so you can make the best decision for your health."
          buttonText="See Cost Details"
          buttonLink="#treatment-costs"
          bannerBgImage="/treatment-banner.png"
          mainImageSrc="/about-main.png"
          mainImageAlt="Affordable Medical Treatment Costs in India"
        />
        <section className="bg-gray-100 px-2 md:px-0 py-10">
          <div className="container mx-auto ">
            <Card className="md:bg-white/80 md:shadow-xs shadow-none md:w-2/3 md:px-6 px-0 mx-auto md:p-7  md:backdrop-blur-sm border-0 ">
              <CardContent className="space-y-6 px-0 md:px-3">
                <div className="prose prose-lg max-w-none">
                  <p className="text-[19px] md:text-lg text-gray-700 mt-2 z-10">
                    As Medivisor, our expertise lies in orchestrating medical
                    treatments in India, and we take pride in delivering
                    detailed and personalized cost estimates. To initiate the
                    process, we encourage you to email us your medical reports
                    and a concise history of your health concern at{" "}
                    <a
                      href="mailto:info@medivisorhealth.com"
                      className="text-gray-700 hover:text-[#74c044] font-semibold decoration-teal-200 hover:decoration-teal-300 transition-colors"
                    >
                      info@medivisorhealth.com
                    </a>
                    . Alternatively, you can share the same information with us
                    via Viber or WhatsApp at{" "}
                    <a
                      href="tel:+919643015697"
                      className="text-gray-700 hover:text-[#74c044] font-semibold decoration-teal-200 hover:decoration-teal-300 transition-colors"
                    >
                      +91-9643015697
                    </a>
                    . The information will allow us to tailor a quotation to
                    your individual needs and preferences.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <Card className="border border-gray-200 shadow-xs bg-white md:bg-gray-50/50">
                    <CardContent className="md:p-6 p-3">
                      <div className="flex items-center gap-3 mb-1 md:mb-4">
                        <Mail className="md:h-5 w-6 h-6 md:w-5 text-gray-700" />
                        <h3 className="font-semibold text-xl md:text-lg text-gray-800">
                          Email Your Reports
                        </h3>
                      </div>
                      <p className="text-base text-gray-600 mb-4">
                        Send your medical reports and health history for a
                        detailed cost estimate.
                      </p>
                      <Button asChild className="w-full bg-[#74c044] text-white">
                        <a href="mailto:info@medivisorhealth.com">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Reports
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 shadow-xs bg-white md:bg-gray-50/50">
                    <CardContent className="md:p-6 p-3">
                      <div className="flex items-center gap-3 mb-1 md:mb-4">
                        <MessageCircle className="md:h-5 w-6 h-6 md:w-5 text-green-500" />
                        <h3 className="font-semibold text-xl md:text-lg text-gray-800">
                          WhatsApp / Viber
                        </h3>
                      </div>
                      <p className="text-base text-gray-600 mb-4">
                        Quick consultation via WhatsApp or Viber for immediate
                        assistance.
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-[#74c044] text-green-600 hover:bg-green-50 bg-transparent"
                      >
                        <a
                          href="https://wa.me/919643015697"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact via WhatsApp
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="treatments-gallery" className=" px-2 py-10">
          <div className="space-y-6 container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading && (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              )}
              {!loading &&
                treatments.map((treatment) => (
                  <TreatmentCard
                    key={treatment._id}
                    treatment={treatment}
                    onOpenModal={openModal}
                  />
                ))}
              {!loading && treatments.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No treatments found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We couldn't find any treatments. Please try again later.
                  </p>
                </div>
              )}
              {error && (
                <div className="col-span-full text-center py-10">
                  <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Error loading treatments
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
              )}
            </div>
            {!hasMore && treatments.length > 0 && (
              <div className="text-center pt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">
                    You've explored all {totalCount} available treatments!
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        <Ctasection />
      </div>
      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}