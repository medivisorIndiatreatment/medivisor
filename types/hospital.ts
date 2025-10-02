// types/hospital.ts
export interface Hospital {
  _id: string
  name: string
  hospitalName: string
  logo: string
  description: string
  branches: HospitalBranch[]
  specialtiesTags: string[] | null
  slug: string
  establishedDate: string | null
  bannerImage: string
  gallery: string[] | null
  branchCount: number
  createdDate: string
  updatedDate: string
}

export interface HospitalBranch {
  _id: string
  branchName: string
  address: string
  phone: string
  pinCode: string
  email: string
  branchImageUrl: string
  slug: string
  mapEmbedUrl: string
  primaryLocation: PrimaryLocation | null
  doctors: Doctor[]
  createdDate: string
  updatedDate: string
}

export interface PrimaryLocation {
  _id: string
  cityName: string
  state?: {
    _id: string
    stateName: string
  }
  country?: {
    _id: string
    countryName: string
  }
  city?: {
    _id: string
    cityName: string
  }
}

export interface Doctor {
  _id: string
  name: string
  specialization: string
  experience: string | null
  imageUrl: string
  slug: string
  designation: string
  contactPhone: string
  contactEmail: string
  doctorPageUrl: string
  createdDate: string
  updatedDate: string
}

export interface FilterOption {
  _id: string
  name: string
  type: 'city' | 'state' | 'country'
}