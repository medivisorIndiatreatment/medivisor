import { notFound } from "next/navigation"
import { BranchDetail } from "@/components/branch-detail"
import { db } from "@/lib/facilities-data"

interface BranchPageProps {
  params: {
    slug: string
    branchSlug: string
  }
}

export default function BranchPage({ params }: BranchPageProps) {
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  // Find hospital by slug
  const hospital = db.hospitals.find((h) => createSlug(h.name) === params.slug)
  if (!hospital) {
    notFound()
  }

  // Find branch by slug
  const branch = db.branches.find((b) => b.hospitalId === hospital.id && createSlug(b.name) === params.branchSlug)
  if (!branch) {
    notFound()
  }

  return <BranchDetail hospital={hospital} branch={branch} />
}
