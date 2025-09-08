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
import { useSearchParams, useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

const TreatmentCard = ({
  treatment,
  onOpenModal,
}: {
  treatment: Treatment;
  onOpenModal: () => void;
}) => {
  const imageUrl = treatment.image
    ? getBestCoverImage(treatment.image)
    : "/placeholder.svg?height=224&width=400&text=Image Not Found";

  return (
    <Card className="bg-white rounded-xs shadow-xs overflow-hidden transform transition-transform duration-300 border-gray-100">
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

export default function TreatmentsClientPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [hospitalNames, setHospitalNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCheckboxChange = useCallback(
    (hospital: string, isChecked: boolean) => {
      const selectedHospitals = new Set(
        searchParams.get("hospitals")?.split(",") || []
      );
      if (isChecked) {
        selectedHospitals.add(hospital);
      } else {
        selectedHospitals.delete(hospital);
      }
      const params = new URLSearchParams(searchParams.toString());
      if (selectedHospitals.size > 0) {
        params.set("hospitals", Array.from(selectedHospitals).join(","));
      } else {
        params.delete("hospitals");
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const fetchTreatments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allResponse = await wixClient.items
        .query(TREATMENTS_COLLECTION_ID)
        .find({ consistentRead: true });
      const uniqueHospitals = Array.from(
        new Set(
          allResponse.items
            .map((item: any) => item.hospitalName)
            .filter(Boolean)
        )
      ).sort();
      setHospitalNames(uniqueHospitals);

      const selectedHospitals = searchParams.get("hospitals")?.split(",") || [];
      const query = wixClient.items.query(TREATMENTS_COLLECTION_ID);

      if (selectedHospitals.length > 0) {
        query.hasSome("hospitalName", selectedHospitals);
      }

      const response = await query.find({ consistentRead: true });

      if (!response || !response.items) {
        setTreatments([]);
        return;
      }

      const fetchedTreatments = response.items.map((item: any) => ({
        _id: item._id,
        hospitalName: item.hospitalName || "Untitled Treatment",
        treatmentName: item.treatmentName || "No description available.",
        image: item.image || null,
        richContent: item.richContent || null,
      }));

      setTreatments(fetchedTreatments);
    } catch (err) {
      console.error("Error fetching Treatments:", err);
      setError("Failed to load treatments.");
      setTreatments([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transform transition-transform duration-300 animate-pulse p-6">
      <div className="w-full h-40 bg-gray-200"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 my-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </div>
  );

  const selectedHospitals = new Set(searchParams.get("hospitals")?.split(",") || []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
        <Banner
          topSpanText=" Treatments"
          title="Explore Medical Treatments in India"
          description="Find a comprehensive list of medical treatments available across our network of world-class hospitals. Our curated list helps you explore options and connect with leading healthcare providers."
          buttonText="Contact Us"
          buttonLink="#treatments-gallery"
          bannerBgImage="/treatment-banner.png"
          mainImageSrc="/about-main.png"
          mainImageAlt="Affordable Medical Treatment Costs in India"
        />
        <section
          id="treatments-gallery"
          className="container mx-auto px-2 py-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="space-y-6 p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                <Separator />
                <Accordion type="single" collapsible defaultValue="hospital-filter">
                  <AccordionItem value="hospital-filter">
                    <AccordionTrigger className="text-lg font-semibold text-gray-700">
                      Hospitals
                    </AccordionTrigger>
                    <AccordionContent className="mt-4 space-y-3">
                      {hospitalNames.length > 0 ? (
                        hospitalNames.map((name) => (
                          <div key={name} className="flex items-center space-x-2">
                            <Checkbox
                              id={`hospital-${name}`}
                              checked={selectedHospitals.has(name)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(name, !!checked)
                              }
                            />
                            <Label htmlFor={`hospital-${name}`} className="text-gray-600">
                              {name}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No hospitals available.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && (
                  <>
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
                      Try adjusting your filters or search terms.
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
            </div>
          </div>
        </section>
        <Ctasection />
      </div>
      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}