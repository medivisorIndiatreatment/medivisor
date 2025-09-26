"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Suspense } from 'react'

export interface BaseFilters {
  minRating: number
  location?: string
  minBeds?: number
  accreditations?: string[]
  languages?: string[]
  minExperience?: number
  maxConsultationFee?: number
  category?: string
  minCost?: number
  maxCost?: number
  minSuccessRate?: number
  activeOnly?: boolean
}

// Skeleton component for a single filter section
const FilterSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-24"></div>
    <div className="h-10 bg-gray-200 rounded-lg"></div>
  </div>
);

// Full loading UI with multiple skeletons
const FiltersSidebarLoading = () => (
  <Card className="p-6 lg:sticky lg:top-16 bg-white border border-gray-200 shadow-xs rounded-xs">
    <CardHeader className="p-0 mb-6 border-gray-200 pb-2 border-b">
      <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent className="p-0 space-y-6">
      <FilterSkeleton />
      <FilterSkeleton />
      <FilterSkeleton />
      <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
    </CardContent>
  </Card>
);

export function FiltersSidebar({
  mode,
  filters,
  uniqueCategories,
  onChange,
  onReset,
}: {
  mode: "hospital" | "doctor" | "treatment"
  filters: BaseFilters
  onChange: (updates: Partial<BaseFilters>) => void
  onReset: () => void
  uniqueCategories?: string[]
}) {
  const parseCsv = (v: string) =>
    v
      .split(/[,|]/g)
      .map((x) => x.trim())
      .filter(Boolean)

  return (
    <Suspense fallback={<FiltersSidebarLoading />}>
      <Card className="p-6 lg:sticky lg:top-16 bg-white border border-gray-200 shadow-xs rounded-xs">
        <CardHeader className="p-0 mb-6 border-gray-200 pb-2 border-b">
          <CardTitle className="text-2xl font-semibold text-gray-800">Filters</CardTitle>
        </CardHeader>

        <CardContent className="p-0 space-y-6 text-sm">
          {/* Location */}
          <div>
            <Label className="font-medium text-gray-700 mb-2 block">Location</Label>
            <Input
              placeholder="Enter city or state..."
              value={filters.location || ""}
              onChange={(e) => onChange({ location: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-lg"
            />
          </div>

          {/* Hospital-specific filters */}
          {mode === "hospital" && (
            <>
              {/* <div>
                <Label className="font-medium text-gray-700 mb-2 block">Minimum Beds</Label>
                <Input
                  type="number"
                  min={0}
                  value={filters.minBeds ?? ""}
                  onChange={(e) => onChange({ minBeds: Number(e.target.value || 0) })}
                  className="bg-gray-50 border-gray-200 rounded-lg"
                />
              </div> */}

              <div>
                <Label className="font-medium text-gray-700 mb-2 block">Accreditations</Label>
                <Input
                  placeholder="e.g. NABH, JCI"
                  value={(filters.accreditations || []).join(", ")}
                  onChange={(e) => onChange({ accreditations: parseCsv(e.target.value) })}
                  className="bg-gray-50 border-gray-200 rounded-lg"
                />
              </div>
            </>
          )}

          {/* Doctor-specific filters */}
          {mode === "doctor" && (
            <>
              <div>
                <Label className="font-medium text-gray-700 mb-2 block">Languages</Label>
                <Input
                  placeholder="e.g. English, Hindi"
                  value={(filters.languages || []).join(", ")}
                  onChange={(e) => onChange({ languages: parseCsv(e.target.value) })}
                  className="bg-gray-50 border-gray-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-medium text-gray-700 mb-2 block">Min Experience (yrs)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.minExperience ?? ""}
                    onChange={(e) => onChange({ minExperience: Number(e.target.value || 0) })}
                    className="bg-gray-50 border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="font-medium text-gray-700 mb-2 block">Max Fee (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.maxConsultationFee ?? ""}
                    onChange={(e) => onChange({ maxConsultationFee: Number(e.target.value || 0) })}
                    className="bg-gray-50 border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </>
          )}

          {/* Treatment-specific filters */}
          {mode === "treatment" && (
            <>
              <div>
                <Label className="font-medium text-gray-700 mb-2 block">Category</Label>
                <Select value={filters.category || ""} onValueChange={(v) => onChange({ category: v || undefined })}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200 rounded-lg">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(uniqueCategories || []).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-medium text-gray-700 mb-2 block">Min Cost (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.minCost ?? ""}
                    onChange={(e) => onChange({ minCost: Number(e.target.value || 0) })}
                    className="bg-gray-50 border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="font-medium text-gray-700 mb-2 block">Max Cost (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.maxCost ?? ""}
                    onChange={(e) => onChange({ maxCost: Number(e.target.value || 0) })}
                    className="bg-gray-50 border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <Label className="font-medium text-gray-700 mb-2 block">Min Success Rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={filters.minSuccessRate ?? ""}
                  onChange={(e) => onChange({ minSuccessRate: Number(e.target.value || 0) })}
                  className="bg-gray-50 border-gray-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="font-medium text-gray-700">Active Only</Label>
                <Switch checked={!!filters.activeOnly} onCheckedChange={(v) => onChange({ activeOnly: Boolean(v) })} />
              </div>
            </>
          )}

          {/* Rating */}
          <div>
            <Label className="font-medium text-gray-700 mb-2 block">Minimum Rating</Label>
            <Select value={String(filters.minRating)} onValueChange={(v) => onChange({ minRating: Number(v) })}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 rounded-lg">
                <SelectValue placeholder="Select minimum rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[
                    { value: "0", label: "All Ratings" },
                    { value: "4.5", label: "4.5+ Stars" },
                    { value: "4.0", label: "4.0+ Stars" },
                    { value: "3.5", label: "3.5+ Stars" },
                    { value: "3.0", label: "3.0+ Stars" },
                  ].map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.label}
                        {opt.value !== "0" && <Star size={12} className="text-yellow-500" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Reset */}
          <Button variant="outline" className="w-full bg-gray-50 hover:bg-gray-100" onClick={onReset}>
            Reset Filters
          </Button>
        </CardContent>
      </Card>
    </Suspense>
  )
}