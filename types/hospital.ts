// Hospital types
export interface Hospital {
  _id: string
  slug?: string | null
  name: string
  image?: string | null // Wix image url (wix:image://...)
  logo?: string | null // Wix image url (wix:image://...)
  yearEstablished?: string | number | null
  accreditation?: string | null
  beds?: number | string | null
  emergencyServices?: boolean | string | null
  description?: string | null
  website?: string | null
  email?: string | null
  contactNumber?: string | null
  countryId?: string | null
  city?: string | null
  branches?: string[] | number[] | null // list of branch IDs
  branchesCount?: number | null
}

export interface HospitalWithBranchPreview extends Hospital {
  branchesPreview?: Branch[] | null
}

// Branch types
export interface Branch {
  _id: string
  slug?: string | null
  name?: string | null
  image?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  phone?: string | null
  email?: string | null
  totalBeds?: number | string | null
  icuBeds?: number | string | null
  doctorIds?: string[] | null // list of doctor IDs
  doctors?: Doctor[] | null
}

// Doctor types
export interface Doctor {
  _id: string
  slug?: string | null
  name: string
  profileImage?: string 
  specialization?: string | null
  qualification?: string | null
  experienceYears?: number | string | null
  designation?: string | null
  languagesSpoken?: string | null
  about?: string | null
  hospitalBranchIds?: string[] | null
  cityId?: string | null
  stateId?: string | null
  countryId?: string | null
  branchesMasterDoctor?: string[] | null
}

// API responses
export interface DoctorsApiResponse {
  items: Doctor[]
}

export interface CitiesApiResponse {
  items: City[]
}

// City types
export interface City {
  _id: string
  name: string
  state?: string | null
  createdDate?: string | null
  updatedDate?: string | null
  owner?: string | null
  hospitalMasterCity?: string[] | null // reference to hospitals
}
