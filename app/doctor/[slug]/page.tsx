import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { DoctorDetail } from "@/components/doctor-detail"
import { db } from "@/lib/facilities-data"

interface DoctorPageProps {
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

function findDoctorBySlug(slug: string) {
  return db.doctors.find((doctor) => createSlug(doctor.name) === slug)
}

export async function generateMetadata({ params }: DoctorPageProps): Promise<Metadata> {
  const doctor = findDoctorBySlug(params.slug)

  if (!doctor) {
    return {
      title: "Doctor Not Found",
    }
  }

  return {
    title: `Dr. ${doctor.name} - ${doctor.title}`,
    description: doctor.about,
  }
}

export async function generateStaticParams() {
  return db.doctors.map((doctor) => ({
    slug: createSlug(doctor.name),
  }))
}

export default function DoctorPage({ params }: DoctorPageProps) {
  const doctor = findDoctorBySlug(params.slug)

  if (!doctor) {
    notFound()
  }

  return <DoctorDetail doctor={doctor} />
}
