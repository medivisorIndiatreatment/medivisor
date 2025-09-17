import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { TreatmentDetail } from "@/components/treatment-detail"
import { db } from "@/lib/facilities-data"

interface TreatmentPageProps {
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

function findTreatmentBySlug(slug: string) {
  return db.treatments.find((treatment) => createSlug(treatment.name) === slug)
}

export async function generateMetadata({ params }: TreatmentPageProps): Promise<Metadata> {
  const treatment = findTreatmentBySlug(params.slug)

  if (!treatment) {
    return {
      title: "Treatment Not Found",
    }
  }

  return {
    title: `${treatment.name} - Treatment Details`,
    description: treatment.description,
  }
}

export async function generateStaticParams() {
  return db.treatments.map((treatment) => ({
    slug: createSlug(treatment.name),
  }))
}

export default function TreatmentPage({ params }: TreatmentPageProps) {
  const treatment = findTreatmentBySlug(params.slug)

  if (!treatment) {
    notFound()
  }

  return <TreatmentDetail treatment={treatment} />
}
