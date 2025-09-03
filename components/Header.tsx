'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import ContactModal from '@/components/ContactModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [isSticky, setIsSticky] = useState(false);

  // Track window width and sticky state
  useEffect(() => {
    const updateWindowWidth = () => setWindowWidth(window.innerWidth);
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    updateWindowWidth();
    window.addEventListener('resize', updateWindowWidth);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', updateWindowWidth);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const navItems = [
    { href: '/', label: 'Home' },
    {
      label: 'About Us', // removed href
      subItems: [
        { href: '/aboutus', label: 'About Us' },
        { href: '/services', label: 'Our Services' },
        { href: '/team', label: 'Our Team' },
        { href: '/medical-advisors', label: 'Our Medical Advisors' },
        { href: '/hospital-network', label: 'Our Hospital Network' },
        { href: '/safety-measures', label: 'Our Safety Measures' },
      ],
    },
    {
      label: 'India Treatment', // removed href
      subItems: [
        { href: '/treatment-cost', label: 'Treatment Cost' },
        { href: '/treatment-process', label: 'Treatment Process' },
        { href: '/visa-process', label: 'Visa Process' },
        { href: '/travel-guide', label: 'Travel Guide' },
        { href: '/faqs', label: 'FAQs' },
      ],
    },
    {
      label: 'Gallery', // removed href
      subItems: [
        { href: '/patient-testimonials', label: 'Patient Testimonials' },
        { href: '/photo-albums', label: 'Patient Activities' },
        { href: '/media-coverage', label: 'News Coverage' },
        { href: '/blog', label: 'Blog' },
      ],
    },
    { href: '/contact', label: 'Contact Us' },
  ];

  const handleSubmenuToggle = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <>
      <div className={`h-[100px] ${isSticky ? 'block' : 'hidden'}`} />
      <header
        className={`bg-white transition-all duration-300 ${
          isSticky
            ? 'sticky top-0 left-0 py-3 w-full z-50 shadow-lg'
            : 'relative z-50 shadow-sm py-3'
        }`}
      >
        <nav
          className={`flex justify-between  container mx-auto items-center px-4 lg:px-0 transition-all duration-300 ${
            isSticky ? 'py-3' : 'md:py-2 py-3'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/Medivisor-logo.svg"
              alt="Medivisor India Treatment Logo"
              width={220}
              height={55}
              className={`w-full object-contain transition-all duration-300 ${
                isSticky ? 'h-12 md:h-16' : 'h-12 md:h-16'
              }`}
            />
          </Link>

          {/* Desktop & Mobile Navigation */}
          <div className="flex items-center gap-4">
            {/* Links */}
            <div
              className={`fixed inset-0 bg-white md:static md:bg-transparent transition-transform duration-500 ease-in-out md:translate-x-0 md:flex md:items-center md:gap-8 ${
                isMenuOpen ? 'translate-x-0' : 'translate-x-full'
              } z-40`}
            >
              {/* Mobile Close Icon */}
              <div className="flex justify-between items-center px-4 py-4 md:hidden border-b border-gray-200">
                <Image
                  src="/Medivisor-logo.svg"
                  alt="Medivisor India Treatment Logo"
                  width={180}
                  height={45}
                  className="h-12 w-auto object-contain"
                />
                <button
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={28} />
                </button>
              </div>

              <ul className="flex flex-col md:flex-row gap-2 md:gap-8 px-6 md:px-0 pt-6 md:pt-0">
                {navItems.map((item) => (
                  <li
                    key={item.label}
                    className="relative group font-medium text-gray-700 hover:text-[#E22026] transition-colors"
                    onMouseEnter={() =>
                      item.subItems && windowWidth >= 768 && setOpenSubmenu(item.label)
                    }
                    onMouseLeave={() =>
                      item.subItems && windowWidth >= 768 && setOpenSubmenu(null)
                    }
                  >
                    {/* Main Link (disabled if subItems exist) */}
                    <div className="flex items-center justify-between">
                      {item.subItems ? (
                        <span
                          className="py-2 px-0 cursor-default select-none"
                          onClick={() =>
                            windowWidth < 768 && handleSubmenuToggle(item.label)
                          }
                        >
                          {item.label}
                        </span>
                      ) : (
                        <Link
                          href={item.href!}
                          className="py-2 px-0 rounded hover:text-[#E22026] transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}

                      {item.subItems && (
                        <ChevronDown
                          size={18}
                          className={`ml-1 text-gray-500 cursor-pointer transition-transform duration-300 ${
                            openSubmenu === item.label ? 'rotate-180' : ''
                          } md:group-hover:rotate-180`}
                          onClick={() => handleSubmenuToggle(item.label)}
                        />
                      )}
                    </div>

                    {/* Submenu */}
                    {item.subItems && (
                      <ul
                        className={`transition-all duration-300 ease-in-out overflow-hidden md:absolute md:top-full md:left-0 md:bg-white md:shadow-md md:rounded-md md:py-2 md:min-w-[220px] md:opacity-0 md:invisible md:scale-95 md:group-hover:opacity-100 md:group-hover:visible md:group-hover:scale-100 ${
                          openSubmenu === item.label
                            ? 'max-h-screen md:opacity-100 md:visible md:scale-100'
                            : 'max-h-0 md:max-h-fit'
                        }`}
                      >
                        {item.subItems.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E22026] transition"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button
                className="bg-[#E22026] cursor-pointer md:block hidden hover:bg-[#74BF44] text-white font-medium px-5 py-2 rounded-md shadow-md transition-all"
                onClick={openModal}
                type="button"
              >
                Enquire Now
              </button>

              <button
                className="text-gray-700 md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </nav>
      </header>
      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
