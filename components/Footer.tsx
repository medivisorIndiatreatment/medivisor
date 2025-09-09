import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#333] px-4 md:px-0 text-white md:pt-16 pt-10 pb-6">
      <div className="container mx-auto px-0">
        <div className="grid gap-4 md:gap-10 grid-cols-2 md:grid-cols-4">
          {/* Logo + About */}
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

          {/* Services */}
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

          {/* Treatments */}
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

          {/* Contact */}
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

        {/* Footer Bottom */}
        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-center text-[#fff]">
            © 2025 Medivisor India Treatment. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="https://www.facebook.com/medivisorindiatreatment"
              title="Facebook"
              className="text-white hover:text-[#74BF44] transition-colors"
            >
              <FaFacebookF size={24} />
            </a>
            <a
              href="https://www.youtube.com/@medivisorindiatreatment"
              title="YouTube"
              className="text-white hover:text-[#74BF44] transition-colors"
            >
              <FaYoutube size={24} />
            </a>
            <a
              href="https://www.instagram.com/medivisorindiatreatment"
              title="Instagram"
              className="text-white hover:text-[#74BF44] transition-colors"
            >
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
