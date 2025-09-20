import { notFound } from "next/navigation";
import { wixServerClient } from "@/lib/wixServer";
import { getBestCoverImage } from "@/lib/wixMedia";
import { BackButton } from "@/components/BackButton";
import { OptimizedImage } from "@/components/optimized-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import type { Hospital, MedicalAdvisor } from "@/types/medical";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Shield,
  Users,
  Building2,
  Stethoscope,
  Award,
  Briefcase,
} from "lucide-react";
import { Metadata } from "next";
import { ReadMoreButton } from "@/components/read-more-button";

const COLLECTION_ID_HOSPITAL = "Hospital";
const COLLECTION_ID_DOCTOR = "Import2";

interface PageProps {
  params: {
    slug: string;
  };
}

// Helper function to format arrays from strings
function formatStringToArray(data: string[] | string | null | undefined): string[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.map((item) => String(item).trim());
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data.replace(/'/g, '"'));
      if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim());
    } catch (e) {
      return data.split("|").map((item) => item.trim());
    }
  }
  return [];
}

async function getHospitalBySlug(slug: string): Promise<Hospital | null> {
  try {
    const response = await wixServerClient.items
      .query(COLLECTION_ID_HOSPITAL)
      .eq("slug", slug)
      .find({ consistentRead: true });

    if (!response.items || response.items.length === 0) {
      return null;
    }

    const item = response.items[0];
    return {
      _id: item._id,
      Name: item.name || "Unknown Hospital",
      Type: item.type || "",
      Tagline: item.tagline || "",
      Description: item.description || "",
      Logo: item.logo,
      Departments: formatStringToArray(item.departments),
      Facilities: formatStringToArray(item.facilities),
      Services: formatStringToArray(item.services),
      "Insurance Partners": formatStringToArray(item.insurancePartners),
      Rating: item.rating ? Number.parseFloat(item.rating) : 0,
      "Review Count": item.reviewCount ? Number.parseInt(item.reviewCount) : 0,
      "Established Year": item.establishedYear ? Number.parseInt(item.establishedYear) : 0,
      Website: item.website || "#",
      "Contact Email": item.contactEmail || "",
      "Facebook Link": item.facebookLink || "",
      "Instagram Link": item.instagramLink || "",
      "LinkedIn Link": item.linkedinLink || "",
      slug: item.slug || "",
      type: "hospital",
      gallery: formatStringToArray(item.gallery),
      address: item.address || "",
      phone: item.phone || "",
      emergencyContact: item.emergencyContact || "",
    };
  } catch (error) {
    console.error("Error fetching hospital:", error);
    return null;
  }
}

async function getRelatedDoctors(hospitalName: string): Promise<MedicalAdvisor[]> {
  try {
    const response = await wixServerClient.items
      .query(COLLECTION_ID_DOCTOR)
      .contains("hospitals", hospitalName)
      .limit(6)
      .find({ consistentRead: true });

    return (
      response.items?.map((item: any) => ({
        _id: item._id,
        name: item.name || "Medical Advisor",
        title: item.Title || item.title,
        specialty: item.specialty,
        image: item.image,
        experience: item.experience,
        languages: item.languages,
        hospitals: item.hospitals,
        contactPhone: item.contactPhone,
        whatsapp: item.whatsapp,
        about: item.about,
        workExperience: item.workExperience,
        education: item.education,
        memberships: item.memberships,
        awards: item.awards,
        specialtyInterests1: formatStringToArray(item.specialtyInterests1),
        slug: item.slug,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching related doctors:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const hospital = await getHospitalBySlug(params.slug);

  if (!hospital) {
    return {
      title: "Hospital Not Found | Medivisor India",
      description: "The requested hospital profile could not be found.",
    };
  }

  const hospitalName = hospital.Name || "Medical Hospital";
  const hospitalTagline = hospital.Tagline || "Providing quality healthcare services.";

  return {
    title: `${hospitalName} - ${hospitalTagline} | Medivisor India`,
    description: `${hospital.Description ? hospital.Description.substring(0, 160) + "..." : `Discover ${hospitalName}, a leading hospital in India offering expert healthcare services and modern facilities.`
      }`,
    keywords: `${hospitalName}, hospital, Medivisor India, healthcare India, ${hospital.Departments?.join(", ")}`,
    openGraph: {
      title: `${hospitalName} - ${hospitalTagline}`,
      description: `A leading healthcare institution with a focus on ${hospital.Departments?.slice(0, 2).join(", ")}.`,
      images: hospital.Logo ? [{ url: hospital.Logo, width: 800, height: 600, alt: hospitalName }] : [],
    },
  };
}

export default async function HospitalPage({ params }: PageProps) {
  const hospital = await getHospitalBySlug(params.slug);

  if (!hospital) {
    notFound();
  }

  const logoSrc = hospital.Logo ? getBestCoverImage({ image: hospital.Logo }) : null;
  const relatedDoctors = await getRelatedDoctors(hospital.Name);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Banner Section */}
      <section className="relative h-[250px] md:h-[70vh] w-full overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-10"
          style={{ backgroundImage: `url('/hospital-logo/max-super-specialit.webp')` }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        {/* Content */}
        <div className="relative z-20 flex items-end pb-10 h-full">
          <div className="container mx-auto px-4 md:px-0 pb-8">
            <div className="flex items-center gap-4">
              {logoSrc ? (
                <OptimizedImage
                  src={logoSrc}
                  alt={hospital.Name}
                  width={100}
                  height={100}
                  className="rounded- border-4 border-white shadow-xs flex-shrink-0"
                />
              ) : (
                <div className="w-[100px] h-[100px] rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                  <Building2 className="h-10 w-10 text-gray-500" />
                </div>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                {hospital.Name}
              </h1>
            </div>
          </div>
        </div>
      </section>


      {/* Main Content Section */}
      <section className="py-10 md:py-12 md:pt-4 bg-gray-50">
        <div className="container mx-auto px-4 md:px-0">
          <div className="pb-4">
            <BackButton />
          </div>
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* About */}
              <Card className="border-gray-100 bg-white p-6 shadow-xs rounded-xs">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="title-heading flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-gray-700" />
                    About {hospital.Name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <ReadMoreButton text={hospital.Description} />
                </CardContent>
              </Card>

              {/* Services Offered */}
              {hospital.Services.length > 0 && (
                <Card className="border-gray-100 bg-white shadow-xs rounded-xs">
                  <CardHeader className="px-5 py-4 border-b mb-3 border-gray-100">
                    <CardTitle className="title-heading flex items-center gap-2">
                      <Shield className="h-6 w-6 text-gray-700" />
                      Services Offered
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hospital.Services.map((service, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="description">{service}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Departments */}
              {hospital.Departments.length > 0 && (
                <Card className="border-gray-100 bg-white shadow-xs rounded-xs">
                  <CardHeader className="px-5 py-4 border-b border-gray-100">
                    <CardTitle className="title-heading flex items-center gap-2">
                      <Stethoscope className="h-6 w-6 text-gray-700" />
                      Departments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hospital.Departments.map((dept, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="description">{dept}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Doctors */}
              {relatedDoctors.length > 0 && (
                <Card className="bg-white border border-gray-100 shadow-xs rounded-xs">
                  <CardHeader className="px-5 py-4 border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 title-heading">
                      <Users className="h-8 w-8" />
                      Our Medical Team
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {relatedDoctors.map((doctor) => {
                          const doctorImageSrc = doctor.image ? getBestCoverImage({ image: doctor.image }) : null;
                          return (
                            <CarouselItem key={doctor._id} className="md:basis-1/2 lg:basis-1/3">
                              <Card className="bg-gray-50 border-gray-200 hover:shadow-md transition-shadow">
                                <CardHeader className="text-center pb-2">
                                  {doctorImageSrc ? (
                                    <OptimizedImage
                                      src={doctorImageSrc}
                                      alt={doctor.name}
                                      width={80}
                                      height={80}
                                      className="rounded-full mx-auto mb-3 border-2 border-gray-200"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gray-200 flex items-center justify-center">
                                      <Stethoscope className="h-10 w-10 text-gray-400" />
                                    </div>
                                  )}
                                  <CardTitle className="text-lg text-gray-900">{doctor.name}</CardTitle>
                                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                                </CardHeader>
                                <CardContent className="pt-0 text-center">
                                  <p className="text-sm text-gray-700 mb-3">{doctor.experience} experience</p>
                                  <Link href={`/medical-advisor/${doctor.slug}`}>
                                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                                      View Profile
                                    </Button>
                                  </Link>
                                </CardContent>
                              </Card>
                            </CarouselItem>
                          );
                        })}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Sticky Sidebar */}
            <div className="lg:col-span-1 lg:sticky lg:top-8 self-start space-y-4 hidden lg:block">
              {/* Quick Info */}
              <Card className="bg-white border border-gray-100 shadow-xs rounded-xs">
                <CardHeader className="px-5 py-4 border-b border-gray-100">
                  <CardTitle className="title-heading">
                    Quick Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-4">
                  {hospital.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 mt-1 w-5 text-gray-500" />
                      <div>
                        <p className="title-text">Address</p>
                        <p className="description">{hospital.establishedYear}</p>
                      </div>
                    </div>
                  )}

                  {hospital.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 mt-1 w-5 text-gray-500" />
                      <div>
                        <p className="title-text">Contact Phone</p>
                        <p className="description">{hospital.phone}</p>
                      </div>
                    </div>
                  )}

                  {hospital.Website !== "#" && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 mt-1 w-5 text-gray-500" />
                      <div>
                        <p className="title-text">Website</p>
                        <Link href={hospital.Website} target="_blank" className="text-blue-600 hover:underline description">
                          Visit Website
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Facilities */}
              {hospital.Facilities.length > 0 && (
                <Card className="bg-white border border-gray-100 shadow-xs rounded-xs">
                  <CardHeader className="px-5 py-4 border-b border-gray-100">
                    <CardTitle className="title-heading flex items-center gap-2">
                      <Award className="h-6 w-6 text-gray-700" />
                      Facilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4 space-y-3">
                    {hospital.Facilities.map((facility, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2" />
                        <p className="description">{facility}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Insurance Partners */}
              {hospital["Insurance Partners"].length > 0 && (
                <Card className="border-gray-100  shadow-xs bg-white">
                  <CardHeader className="px-5 py-4">
                    <CardTitle className="title-heading flex items-center gap-2">
                      <Briefcase className="h-8 w-8" />
                      Insurance Partners
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 ml-4">
                    <div className="space-y-3">
                      {hospital["Insurance Partners"].map((partner, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-500 rounded-full flex-shrink-0"></div>
                          <p className="description">{partner}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}