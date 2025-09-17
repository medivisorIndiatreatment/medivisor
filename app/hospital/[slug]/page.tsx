import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { HospitalDetail } from "@/components/hospital-detail"
import { db } from "@/lib/facilities-data"

interface HospitalPageProps {
  params: {
    slug: string
  }
}

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function findHospitalBySlug(slug: string) {
  return db.hospitals.find((hospital) => createSlug(hospital.name) === slug)
}

export async function generateMetadata({ params }: HospitalPageProps): Promise<Metadata> {
  const hospital = findHospitalBySlug(params.slug)

  if (!hospital) {
    return {
      title: "Hospital Not Found",
    }
  }

  return {
    title: `${hospital.name} - Healthcare Services`,
    description: hospital.description,
  }
}

export async function generateStaticParams() {
  return db.hospitals.map((hospital) => ({
    slug: createSlug(hospital.name),
  }))
}

export default function HospitalPage({ params }: HospitalPageProps) {
  const hospital = findHospitalBySlug(params.slug)

  if (!hospital) {
    notFound()
  }

  return <HospitalDetail hospital={hospital} />
}
