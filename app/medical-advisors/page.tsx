import MedicalAdvisorsPage from './MedicalAdvisorsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical Advisors | Medivisor India',
  description: 'Meet the expert medical advisors at Medivisor India. Our advisors guide international patients to the best treatment options, ensuring safe and effective healthcare decisions.',
  keywords: 'Medivisor India medical advisors, expert doctors India, healthcare advisors, medical guidance India, international patient care, trusted medical advisors',
  robots: 'index, follow',
  openGraph: {
    title: 'Medical Advisors | Medivisor India',
    description: 'Meet Medivisor India’s experienced medical advisors who help international patients make informed decisions about advanced medical treatments.',
    url: 'https://www.medivisorindia.com/medical-advisors',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://www.medivisorindia.com/medical-help-india.jpg',
        width: 1200,
        height: 630,
        alt: 'Medivisor India Medical Advisors',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medical Advisors | Medivisor India',
    description: 'Get guidance from our medical advisors for international patients seeking world-class medical care in India.',
  
    site: '@MedivisorIndia',
  },
};

export default function Page() {
  return <MedicalAdvisorsPage />;
}
