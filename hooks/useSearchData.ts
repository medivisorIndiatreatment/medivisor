import { useState, useCallback } from "react"
import { wixServerClient } from "@/lib/wixServer"
import { SearchableItem } from "@/types/searchtype"
import { formatStringToArray, parseSocialLinks, parseFaqs } from "@/lib/dataUtils"

interface UseSearchDataProps {
  COLLECTION_ID_DOCTOR: string
  COLLECTION_ID_HOSPITAL: string
  COLLECTION_ID_TREATMENT: string
}

export function useSearchData({ 
  COLLECTION_ID_DOCTOR, 
  COLLECTION_ID_HOSPITAL, 
  COLLECTION_ID_TREATMENT 
}: UseSearchDataProps) {
  const [allData, setAllData] = useState<SearchableItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [doctorsResponse, hospitalResponse, treatmentResponse] = await Promise.all([
        wixServerClient.items.query(COLLECTION_ID_DOCTOR).limit(1000).find({ consistentRead: true }),
        wixServerClient.items.query(COLLECTION_ID_HOSPITAL).limit(1000).find({ consistentRead: true }),
        wixServerClient.items.query(COLLECTION_ID_TREATMENT).limit(1000).find({ consistentRead: true }),
      ])

      const doctors: SearchableItem[] = doctorsResponse.items?.map((item: any) => ({
        ...item,
        _id: item._id,
        name: item.name || "Medical Advisor",
        title: item.Title || item.title,
        specialty: item.specialty,
        branches: item.branches,
        totalBeds: item.totalBeds,
        slug: item.slug || "",
        image: item.image,
        experience: item.experience,
        languages: formatStringToArray(item.languages),
        hospital: item.hospital,
        contactPhone: item.contactPhone,
        whatsapp: item.whatsapp,
        about: item.about,
        workExperience: item.workExperience,
        education: item.education,
        memberships: item.memberships,
        awards: item.awards,
        specialtyInterests1yy: formatStringToArray(item.specialtyInterests1yy),
        type: "doctor",
      })) || []

      const hospitals: SearchableItem[] = hospitalResponse.items?.map((item: any) => {
        const socialLinks = parseSocialLinks(item.socialLinks)
        return {
          _id: item._id,
          Name: item.name || "Unknown Hospital",
          Type: item.type || "",
          specialty: item.specialty || "",
          branches: item.branches || "",
          totalBeds: item.totalBeds || "",
          Tagline: item.tagline || "",
          slug: item.slug || "",
          Description: item.description || "",
          Logo: item.logo,
          department1Name: formatStringToArray(item.department1Name),
          Facilities: formatStringToArray(item.facilities),
          Services: formatStringToArray(item.services),
          "Insurance Partners": formatStringToArray(item.insurancePartners),
          Rating: item.rating ? Number.parseFloat(item.rating) : 0,
          "Review Count": item.reviewCount ? Number.parseInt(item.reviewCount) : 0,
          "Established Year": item.establishedYear ? Number.parseInt(item.establishedYear) : 0,
          Website: item.website || "#",
          "Contact Email": item.contactEmail || "",
          "Facebook Link": socialLinks.facebook || "",
          "Instagram Link": socialLinks.instagram || "",
          "LinkedIn Link": socialLinks.linkedin || "",
          type: "hospital",
        }
      }) || []

      const treatments: SearchableItem[] = treatmentResponse.items?.map((item: any) => ({
        ...item,
        _id: item._id,
        name: item.name || "Treatment",
        description: item.description || "",
        slug: item.slug || "",
        department: item.department || "",
        tags: formatStringToArray(item.tags),
        priceRangeMin: item.priceRangeMin || 0,
        priceRangeMax: item.priceRangeMax || 0,
        relatedDoctors: formatStringToArray(item.relatedDoctors),
        durationMinutes: item.durationMinutes || 0,
        faqs: parseFaqs(item.faqs),
        image: item.image,
        type: "treatment",
      })) || []

      setAllData([...doctors, ...hospitals, ...treatments])
    } catch (error) {
      console.error("Error fetching combined data:", error)
      setAllData([])
    } finally {
      setIsLoading(false)
    }
  }, [COLLECTION_ID_DOCTOR, COLLECTION_ID_HOSPITAL, COLLECTION_ID_TREATMENT])

  return { allData, isLoading, fetchData }
}