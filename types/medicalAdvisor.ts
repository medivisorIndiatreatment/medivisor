export interface MedicalAdvisor {
  _id?: string;
  name: string;
  title?: string;
  specialty?: string;
  image?: string;
  photo?: string; 
  experience?: string;
  languages?: string;
  hospitals?: string;
  contactPhone?: string;
  whatsapp?: string;
  about?: string;
  workExperience?: string;
  education?: string;
  memberships?: string;
  awards?: string;
  specialtyInterests1?: string[] | null;
  slug?: string;
}