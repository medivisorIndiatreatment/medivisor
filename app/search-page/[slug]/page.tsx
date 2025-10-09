import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { wixClient } from "@/lib/wixClient"
import type { Hospital, Branch } from "@/types/hospital"
import { getWixScaledToFitImageUrl, getWixImageUrl } from "@/lib/wixMedia"

const COLLECTION_ID = "HospitalMaster"
const BRANCHES_FIELD = "HospitalMaster_branches"

function mapHospital(item: any): Hospital {
  const get = (...keys: string[]) => keys.map((k) => item?.[k]).find((v) => v !== undefined && v !== null && v !== "")
  return {
    _id: item._id,
    slug: get("slug", "Slug"),
    name: get("Hospital Name", "hospitalName", "name") || "Hospital",
    image: get("Hospital Image", "hospitalImage", "image") ?? null,
    logo: get("Logo", "logo") ?? null,
    accreditation: get("Accreditation", "accreditation") ?? null,
    beds: get("No. of Beds", "noOfBeds", "beds") ?? null,
    website: get("Website", "website") ?? null,
    email: get("Email", "email") ?? null,
    contactNumber: get("Contact Number", "contactNumber") ?? null,
    countryId: get("Country (ID)", "countryId") ?? null,
    city: get("city", "City") ?? null,
  }
}

function mapBranch(b: any): Branch {
  return {
    _id: b?._id,
    slug: b?.slug ?? null,
    name: b?.["Branch Name"] ?? b?.branchName ?? b?.name ?? null,
    image: b?.["Branch Image"] ?? b?.branchImage ?? b?.image ?? null,
    address: b?.["Address"] ?? b?.address ?? null,
    city: b?.["City (ID)"] ?? b?.city ?? b?.cityId ?? null,
    state: b?.["State (ID)"] ?? b?.state ?? b?.stateId ?? null,
    country: b?.["Country (ID)"] ?? b?.country ?? b?.countryId ?? null,
    phone: b?.["Phone"] ?? b?.phone ?? null,
    email: b?.["Email"] ?? b?.email ?? null,
    totalBeds: b?.["Total Beds"] ?? b?.totalBeds ?? null,
    icuBeds: b?.["ICU Beds"] ?? b?.icuBeds ?? null,
  }
}

async function getHospitalBySlug(slug: string) {
  const res = await wixClient.items.query(COLLECTION_ID).eq("slug", slug).limit(1).find({ consistentRead: true })
  const item = res?.items?.[0]
  if (!item) return null
  return mapHospital(item)
}

async function getAllBranches(hospitalId: string) {
  const anyClient = wixClient as any
  const res = await anyClient.items.queryReferenced(COLLECTION_ID, hospitalId, BRANCHES_FIELD, {
    limit: 200,
    offset: 0,
  })
  const items: any[] = res?.items || res?.referencedItems || res?.data?.items || res?.results || []
  return items.map(mapBranch)
}

export default async function HospitalSlugPage({ params }: { params: { slug: string } }) {
  const hospital = await getHospitalBySlug(params.slug)
  if (!hospital) notFound()

  const branches = await getAllBranches(hospital._id)

  const cover =
    (hospital.image && (getWixScaledToFitImageUrl(hospital.image, 1200, 400) || getWixImageUrl(hospital.image))) ||
    (hospital.logo && (getWixScaledToFitImageUrl(hospital.logo, 1200, 400) || getWixImageUrl(hospital.logo))) ||
    "/hospital-cover-image.jpg"

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <section className="space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover || "/placeholder.svg"} alt={hospital.name} className="h-48 w-full rounded-lg object-cover" />
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">{hospital.name}</h1>
          <div className="text-sm text-muted-foreground">
            {hospital.accreditation ? `${hospital.accreditation} • ` : ""}
            {hospital.beds ? `${hospital.beds} beds` : ""}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Branches ({branches.length})</h2>
        {branches.length === 0 ? (
          <div className="text-sm text-muted-foreground">No branches found for this hospital.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((b) => {
              const img =
                (b.image && (getWixScaledToFitImageUrl(b.image, 480, 300) || b.image)) || "/hospital-branch.jpg"
              return (
                <Card key={b._id} className="overflow-hidden bg-background border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img || "/placeholder.svg"} alt={b.name || "Branch"} className="h-36 w-full object-cover" />
                  <CardHeader>
                    <CardTitle className="text-pretty text-base">{b.name || "Branch"}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    <div>{[b.city, b.state, b.country].filter(Boolean).join(", ")}</div>
                    {b.address && <div className="line-clamp-1">{b.address}</div>}
                    {b.phone && <div>Phone: {b.phone}</div>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <div className="pt-2">
        <Link href="/hospitals" className="text-sm text-primary hover:underline">
          ← Back to hospitals
        </Link>
      </div>
    </main>
  )
}
