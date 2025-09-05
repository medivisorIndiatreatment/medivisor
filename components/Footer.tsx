import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#333] px-4 md:px-0 text-white md:pt-16 pt-10 pb-6">
      <div className="container mx-auto px-0">
        <div className="grid gap-4 md:gap-10 grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-full md:w-[250px] -ml-3 flex items-center">
                <Image
                     src="/MRX-Logo-PNG.png"
                  alt="Medivisor Logo"
                  width={250}
                  height={60}
                  className="h-20 w-auto object-contain"
                />
              </div>
            </div>
            <p className="md:text-base text-[19px] md:leading-[20px] text-white">
              Connecting patients worldwide to world-class medical care in India with comprehensive support
              services.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-2 md:mb-4 text-2xl md:text-3xl">Services</h4>
            <ul className="md:space-y-5 space-y-2 text-[16px] md:text-sm leading-[20px]">
              <li><Link href="#Services" className="hover:text-[#74BF44]">Medical Consultation</Link></li>
              <li><Link href="#Services" className="hover:text-[#74BF44]">Hospital Selection</Link></li>
              <li><Link href="#Services" className="hover:text-[#74BF44]">Visa Assistance</Link></li>
              <li><Link href="#Services" className="hover:text-[#74BF44]">Travel Arrangements</Link></li>
              <li><Link href="#Services" className="hover:text-[#74BF44]">Accommodation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-2 md:mb-4 text-2xl md:text-3xl">Treatments</h4>
            <ul className="md:space-y-5 space-y-2 text-[16px] md:text-sm leading-[20px]">
              <li><a href="https://wa.me/918340780250" className="hover:text-[#74BF44]">Cardiac Surgery</a></li>
              <li><a href="https://wa.me/918340780250" className="hover:text-[#74BF44]">Orthopedics</a></li>
              <li><a href="https://wa.me/918340780250" className="hover:text-[#74BF44]">Oncology</a></li>
              <li><a href="https://wa.me/918340780250" className="hover:text-[#74BF44]">Neurosurgery</a></li>
              <li><a href="https://wa.me/918340780250" className="hover:text-[#74BF44]">Transplants</a></li>
            </ul>
          </div>
          
          <div className="col-span-2 mt-10 md:mt-0 md:col-span-1">
            <h4 className="font-medium text-white mb-2 md:mb-4 text-2xl md:text-3xl">Contact</h4>
            <ul className="md:space-y-5 space-y-3 text-sm md:leading-[20px]">
              <li className="flex items-start gap-2">
                <MapPin className="text-white mt-2 md:mt-1 md:w-4 w-5 h-5 md:h-4 flex-shrink-0" />
                <span>
                  <a 
                    href="https://maps.google.com/?q=Medivisor" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-[#74BF44] text-[19px]"
                  >
                    Medivisor House 359, Sector 1, Vaishali, Ghaziabad, (Delhi/NCR) India
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="text-white mt-1 md:w-4 w-5 h-5 md:h-4 flex-shrink-0" />
                <span><a href="tel:+918340780250" className="hover:text-[#74BF44] text-[19px] md:text-base">+91 8340 780 250</a></span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="text-white mt-1 md:w-4 w-5 h-5 md:h-4 flex-shrink-0" />
                <span><a href="mailto:info@medivisorhealth.com" className="hover:text-[#74BF44] text-[19px] md:text-base">info@medivisorhealth.com</a></span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-center text-[#fff]">
            © 2025 Medivisor India Treatment. All rights reserved.
          </p>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="https://www.facebook.com/medivisorindiatreatment"
              title="Facebook"
              className="text-white hover:text-[#74BF44] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@medivisorindiatreatment"
              title="YouTube"
              className="text-white hover:text-[#74BF44] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/medivisorindiatreatment"
              title="Instagram"
              className="text-white hover:text-[#74BF44] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.299C3.182 14.65 2.288 12.947 2.288 11.987s.894-2.664 1.838-3.702c.875-.809 2.026-1.299 3.323-1.299s2.447.49 3.322 1.299c.944 1.038 1.838 2.741 1.838 3.702s-.894 2.663-1.838 3.701c-.875.81-2.025 1.3-3.322 1.3zm7.119 0c-1.297 0-2.448-.49-3.323-1.299-.944-1.038-1.838-2.74-1.838-3.701s.894-2.664 1.838-3.702c.875-.809 2.026-1.299 3.323-1.299s2.447.49 3.322 1.299c.944 1.038 1.838 2.741 1.838 3.702s-.894 2.663-1.838 3.701c-.875.81-2.025 1.3-3.322 1.3z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}