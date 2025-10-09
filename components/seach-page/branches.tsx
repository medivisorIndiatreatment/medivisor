"use client"

import useSWR from "swr"
import Link from "next/link"
import { wixClient } from "@/lib/wixClient"
import type { Branch } from "@/types/hospital"

type Props = {
  hospitalId: string
  hospitalSlug?: string
  className?: string
}

function mapBranch(b: any): Branch {
  return {
    _id: b?._id,
    slug: b?.slug,
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

async function fetchBranchesPreview(hospitalId: string) {
  const res = await (wixClient as any).items
    .query("hospitalbrancheslist")
    .eq("Hospital (ID)" as any, hospitalId)
    .limit(3) // fetch 3 so we can compute +X more
    .find({ consistentRead: true })

  const items: any[] = res?.items || []
  const total: number = res?.totalCount ?? items.length
  const mapped = items.map(mapBranch)
  return { preview: mapped.slice(0, 2), total }
}

export function BranchesPreview({ hospitalId, hospitalSlug, className }: Props) {
  const { data, error, isValidating } = useSWR(
    hospitalId ? ["branches-preview", hospitalId] : null,
    () => fetchBranchesPreview(hospitalId),
    { revalidateOnFocus: true, refreshInterval: 15000 },
  )

  if (error) return null
  if (!data) {
    return (
      <div className={className}>
        <div className="h-3 w-24 bg-muted rounded mb-1" />
        <div className="h-3 w-28 bg-muted rounded" />
      </div>
    )
  }

  const { preview, total } = data
  if (!preview?.length && !total) return null

  const more = Math.max(0, (total || 0) - Math.min(2, preview.length))

  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground mb-1">Branches</div>
      <ul className="text-sm text-muted-foreground space-y-1">
        {preview.map((b) => (
          <li key={b._id} className="line-clamp-1">
            {(b.name || "Branch") + (b.city ? ` · ${b.city}` : "")}
          </li>
        ))}
      </ul>
      {more > 0 && hospitalSlug && (
        <div className="mt-1">
          <Link href={`/hospitals/${hospitalSlug}`} className="text-sm text-primary hover:underline">
            +{more} more
          </Link>
        </div>
      )}
    </div>
  )
}
