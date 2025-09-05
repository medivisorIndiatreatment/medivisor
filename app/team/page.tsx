"use client"

import { useState, useEffect } from "react"
import { Users, Mail, Linkedin, Twitter, Globe, ArrowRight, Star } from "lucide-react"
import { getBestCoverImage, getWixScaledToFillImageUrl } from "@/lib/wixMedia"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CtaSection from "@/components/CtaSection"
import Banner from "@/components/BannerService"
import DidYouKnowSection from "@/components/DidYouKnow"

const COLLECTION_ID = "Team1"

interface TeamMember {
  _id?: string
  name: string
  role: string
  image: string
  bio: string
  shortDescription: string
  longDescription: string
  order: number
  "link-team-1-title": string
  email?: string
  linkedin?: string
  twitter?: string
  website?: string
  rawData?: any
}

const SkeletonCard = () => (
  <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
    <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-3/4" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-5/6" />
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-4/5" />
      </div>
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
    </div>
  </Card>
)

const generateSlug = (name: string, id: string): string => {
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim()
  return nameSlug || id || "team-member"
}

const processWixImageUrl = (item: any): string => {
  const bestImage = getBestCoverImage(item)
  if (bestImage) {
    return bestImage
  }

  const imageFields = [
    "Photo", "photo", "image", "picture", "avatar", "profileImage", "mainImage", "featuredImage", "coverImage", "thumbnail",
  ]
  for (const field of imageFields) {
    if (item[field]) {
      let imageUrl = null
      if (typeof item[field] === "string" && item[field].startsWith("wix:image://")) {
        imageUrl = item[field]
      } else if (item[field]?.url && item[field].url.startsWith("wix:image://")) {
        imageUrl = item[field].url
      } else if (item[field]?.src && item[field].src.startsWith("wix:image://")) {
        imageUrl = item[field].src
      }
      if (imageUrl) {
        const processedUrl = getWixScaledToFillImageUrl(imageUrl, 400, 500)
        if (processedUrl) {
          return processedUrl
        }
      }
    }
  }
  return `/placeholder.svg?height=500&width=400&query=team member portrait`
}

const fetchTeamMembers = async () => {
  try {
    const { wixClient } = await import("@/lib/wixClient")
    const response = await wixClient.items
      .query(COLLECTION_ID)
      .skip(0)
      .limit(50)
      .ascending("order")
      .find({ consistentRead: true })
    if (!response?.items?.length) {
      return []
    }
    const teamMembersData: TeamMember[] = response.items.map((item: any) => {
      const itemData = item.data || item
      return {
        _id: item._id || item.ID,
        name: itemData.title || item.title || item.Name || item.name || "Team Member",
        role: itemData.jobTitle || item.jobTitle || item["Job Title"] || item.role || item.position || "Team Member",
        image: processWixImageUrl(itemData),
        bio: itemData.longDescription || item.longDescription || item["Long Description"] || item.bio || item.description || "Dedicated team member.",
        shortDescription: itemData.shortDescription || item.shortDescription || item["Short Description"] || item.excerpt || "",
        longDescription: itemData.longDescription || item.longDescription || item["Long Description"] || item.bio || item.description || "",
        order: Number.parseInt(itemData.order) || Number.parseInt(item.order) || Number.parseInt(item.Order) || 0,
        "link-team-1-title": itemData["link-team-1-title"] || item["link-team-1-title"] || item.link || item.profileUrl || item.website || "#",
        email: itemData.email || item.email || item.Email || "",
        linkedin: itemData.linkedin || item.linkedin || item.LinkedIn || "",
        twitter: itemData.twitter || item.twitter || item.Twitter || "",
        website: itemData.website || item.website || item.Website || "",
        rawData: item,
      }
    })
    return teamMembersData.sort((a, b) => a.order - b.order)
  } catch (error: any) {
    console.error("Error fetching team members:", error)
    throw error
  }
}

const loadData = async (setTeamMembers: any, setLoading: any) => {
  try {
    setLoading(true)
    const result = await fetchTeamMembers()
    setTeamMembers(result)
  } catch (error) {
    console.error("Failed to load team data:", error)
  } finally {
    setLoading(false)
  }
}

const extractTextFromRichText = (richTextObj: any): string => {
  if (typeof richTextObj === "string") return richTextObj
  if (richTextObj?.nodes && Array.isArray(richTextObj.nodes)) {
    return richTextObj.nodes
      .map((node: any) => {
        if (node.type === "PARAGRAPH" && node.nodes) {
          return node.nodes.map((textNode: any) => textNode.textData?.text || "").join("")
        }
        return ""
      })
      .join(" ")
      .trim()
  }
  return ""
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    loadData(setTeamMembers, setLoading)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center mb-16">
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-64 mx-auto mb-4" />
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => <SkeletonCard key={index} />)}
          </div>
        </div>
      </div>
    )
  }

  if (teamMembers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4 py-10">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-red-100 via-red-50 to-purple-100 rounded-full mb-8 shadow-lg">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-red-600" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-600 bg-clip-text text-transparent mb-6">
            Our Amazing Team
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Our team information is currently being updated. Check back soon to meet our incredible professionals!
          </p>
        </div>
      </div>
    )
  }

  const featuredMembers = teamMembers.slice(0, 4)
  const remainingMembers = teamMembers.slice(4)
  const activeMember = featuredMembers[activeTab]

  return (
    <>
      <Banner
        topSpanText="Meet Our Team"
        title="The Dedicated Team Behind Medivisor India Treatment"
        description="At Medivisor India Treatment, our strength lies in our compassionate and highly experienced team. From world-renowned specialists to dedicated patient coordinators, we are united by a singular mission: to provide unparalleled medical care and support for every international patient."
        buttonText="Enquire Now"
        buttonLink="/contact"
        mainImageSrc="/about-main.png"
        mainImageAlt="Medivisor India Treatment Team"
        bannerBgImage="/teams-bg.png"
      />
      <DidYouKnowSection/>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 py-10 px-2 md:px-0 via-white to-red-50">
        <div className="container mx-auto ">
          {featuredMembers.length > 0 && (
            <div className="md:mb-20 mb-10">
              <div className="flex overflow-x-auto whitespace-nowrap justify-right md:justify-center gap-3 mb-5 py-2">
                {featuredMembers.map((member, index) => (
                  <button
                    key={member._id}
                    onClick={() => setActiveTab(index)}
                    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 transform flex-shrink-0 ${
                      activeTab === index
                        ? "bg-[#74BF44] text-white shadow-lg shadow-red-100"
                        : "bg-white text-gray-700 hover:bg-gray-50 shadow-xs hover:shadow-xs border border-gray-200"
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
              <Card className="overflow-hidden shadow-sm border-gray-100 border bg-white">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative aspect-[4/5] md:aspect-auto overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={activeMember.image || "/placeholder.svg"}
                      alt={activeMember.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `/placeholder.svg?height=500&width=400&query=${encodeURIComponent(activeMember.name + " team member")}`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                  <div className="p-4 md:p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50">
                    <div className="mb-2">
                      <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{activeMember.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl md:text-xl text-gray-600 font-medium">{activeMember.role}</p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-3">
                      {activeMember.shortDescription && (
                        <p className="text-gray-800 font-medium text-[19px] md:text-base leading-relaxed">
                          {extractTextFromRichText(activeMember.shortDescription)}
                        </p>
                      )}
                      <p className="text-gray-800 h-[250px] overflow-y-scroll md:h-full leading-relaxed text-[19px] md:text-base">
                        {extractTextFromRichText(activeMember.longDescription) || extractTextFromRichText(activeMember.bio)}
                      </p>
                    </div>
                    <div className="flex gap-2 mb-0">
                      {activeMember.email && (
                        <a href={`mailto:${activeMember.email}`} className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-full transition-all duration-300 transform hover:scale-110 group shadow-md">
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:text-blue-700" />
                        </a>
                      )}
                      {activeMember.linkedin && (
                        <a href={activeMember.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-full transition-all duration-300 transform hover:scale-110 group shadow-md">
                          <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:text-blue-700" />
                        </a>
                      )}
                      {activeMember.twitter && (
                        <a href={activeMember.twitter} target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 bg-gradient-to-r from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300 rounded-full transition-all duration-300 transform hover:scale-110 group shadow-md">
                          <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 group-hover:text-sky-700" />
                        </a>
                      )}
                      {activeMember.website && (
                        <a href={activeMember.website} target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 rounded-full transition-all duration-300 transform hover:scale-110 group shadow-md">
                          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 group-hover:text-green-700" />
                        </a>
                      )}
                    </div>
                    <Button asChild className="w-fit px-0 py-0 text-gray-700 text-base">
                      <Link href={`/team/${generateSlug(activeMember.name, activeMember._id || "")}`}>
                        View Full Profile <ArrowRight className="inline-block w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {remainingMembers.length > 0 && (
            <div className="p-0 md:px-0">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4 md:mb-10">All Team Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {remainingMembers.map((member) => (
                  <Card key={member._id} className="group overflow-hidden hover:shadow-lg transition-all duration-500 border border-gray-100 shadow-sm bg-white">
                    <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=500&width=400&query=${encodeURIComponent(member.name + " team member")}`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                        <div className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                          <Star className="w-4 h-4 text-red-600" />
                        </div>
                      </div>
                    </div>
                    <div className="md:p-6 p-4 bg-gradient-to-br from-white to-gray-50">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors duration-300">
                          {member.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-700 font-medium text-xl md:text-lg line-clamp-1">{member.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-[19px] md:text-sm leading-relaxed mb-3 line-clamp-3">
                        {extractTextFromRichText(member.shortDescription) || extractTextFromRichText(member.bio)}
                      </p>
                      <div className="flex gap-2 mb-0">
                        {member.email && (
                          <a href={`mailto:${member.email}`} className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-full transition-all duration-300 transform hover:scale-110 group/icon shadow-sm">
                            <Mail className="w-4 h-4 text-blue-600 group-hover/icon:text-blue-700" />
                          </a>
                        )}
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-full transition-all duration-300 transform hover:scale-110 group/icon shadow-sm">
                            <Linkedin className="w-4 h-4 text-blue-600 group-hover/icon:text-blue-700" />
                          </a>
                        )}
                        {member.twitter && (
                          <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gradient-to-r from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300 rounded-full transition-all duration-300 transform hover:scale-110 group/icon shadow-sm">
                            <Twitter className="w-4 h-4 text-sky-600 group-hover/icon:text-sky-700" />
                          </a>
                        )}
                        {member.website && (
                          <a href={member.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 rounded-full transition-all duration-300 transform hover:scale-110 group/icon shadow-sm">
                            <Globe className="w-4 h-4 text-green-600 group-hover/icon:text-green-700" />
                          </a>
                        )}
                      </div>
                      <Button asChild className="w-fit px-0 py-0 text-gray-700 text-base">
                        <Link href={`/team/${generateSlug(member.name, member._id || "")}`}>
                          View Full Profile <ArrowRight className="inline-block w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <CtaSection />
    </>
  )
}