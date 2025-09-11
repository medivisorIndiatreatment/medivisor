import TreatmentProcessPage from './TreatmentProcessPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Treatment Process | Medivisor India',
  description: 'Learn about the Medivisor India treatment process for international patients. From initial consultation to post-treatment care, we ensure a smooth and safe medical journey.',
  keywords: 'Medivisor India treatment process, medical process India, international patient care, hospital procedures India, treatment steps India, patient journey, medical tourism India',
  robots: 'index, follow',
  openGraph: {
    title: 'Treatment Process | Medivisor India',
    description: 'Step-by-step guide to Medivisor India’s treatment process for international patients, ensuring safe and effective medical care.',
    url: 'https://www.medivisorindia.com/treatment-process',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://www.medivisorindia.com/medical-help-india.jpg',
        width: 1200,
        height: 630,
        alt: 'Medivisor India Treatment Process',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Treatment Process | Medivisor India',
    description: 'Explore Medivisor India’s treatment process for international patients, from consultation to post-treatment follow-up.',
    site: '@MedivisorIndia',
  },
};

export default function Page() {
  return <TreatmentProcessPage />;
}
