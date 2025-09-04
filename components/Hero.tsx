'use client';
import React from 'react';
import { CircleCheck } from 'lucide-react';
import { FaCheckCircle } from 'react-icons/fa';
const HeroSection = () => {
  return (
    <section
      aria-label="Hero Section"
      className="relative  md:px-0 px-2 md:h-[calc(100vh-10px)]  overflow-hidden md:py-10"
      id="home"
    >
      <div className="absolute inset-0 z-20 bg-contain md:bg-cover bg-center bg-shadow-1"></div>
      <div className="absolute inset-0 z-10 bg-banner"></div>
      <div className="relative z-30 container mx-auto px-4 md:px-0 md:pt-10 grid grid-cols-1 md:grid-cols-12 items-end md:items-center gap-3 h-full">
        {/* Left Content */}
        <div className="order-1 md:order-1 mt-32 md:mt-0 text-white relative md:col-span-7 z-40 h-full w-full flex items-end">
          <div>
            <h1 className="text-2xl md:text-5xl lg:text-5xl leading-tight mb-4 text-left uppercase font-semibold"> {/* Adjusted font sizes and added font-light */}
              <span className="block">
                Affordable, World-Class Medical Treatment{' '}
                {/* Made "for Globally" more subtle */}
                for{' '}
                <strong className="font-semibold"> {/* Kept "Globally" strong but slightly less heavy */}
                  International Patients
                </strong>
              </span>

            </h1>
            <p className="mt-4 text-white mb-6 text-lg md:text-left  md:text-xl leading-relaxed"> {/* Increased font size and line height */}
              Looking for advanced medical treatment overseas? India could be your best choice—thanks to world-class clinical expertise, cost advantages, and fast visa and treatment processes.
            </p>
          </div>
        </div>

        {/* Right Card */}
        <div className="order-2 md:block hidden md:order-2 w-full max-w-md mx-auto md:col-span-5 bg-[#E22026] text-white backdrop-blur-sm md:shadow-xl rounded-md overflow-hidden z-40">
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="font-semibold text-2xl md:text-2xl">
                  Comprehensive Medical Travel Services Under One Roof
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm md:text-base leading-relaxed font-normal"> {/* Adjusted line-height and font-weight */}
              Medivisor provides end-to-end medical travel solutions, ensuring
              that patients receive everything they need for a smooth and
              hassle-free experience:
            </p>

            <ul className="my-5 text-sm md:text-base leading-relaxed grid grid-cols-2 sm:grid-cols-2 gap-y-2"> {/* Increased font size and line height */}
              {[
                'Hospital Arrangement',
                'Hotel-Hospital Transfer',
                'Visa Assistance',
                'SIM Card',
                'Flight Booking',
                'Foreign Exchange',
                'Hotel Booking',
                'Language Assistance',
                'Airport Pickup & Drop',
                'On-ground Support',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-x-2">
                  <FaCheckCircle className="text-white fill-[#74BF44] mt-1" /> {/* Icon remains as requested */}
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="my-4 text-sm md:text-base leading-relaxed font-medium"> {/* Adjusted line-height and font-weight */}
              <strong>Over 2,000 from Fiji, PNG, and Pacific Island Countries</strong> have
              already benefited from our services. <strong>You could be next.</strong>
            </p>

            <a href='/contact'>
              <button
                aria-label="Get a free quote"
                className="w-full bg-[#74BF44] cursor-pointer text-white text-base md:text-lg md:font-medium py-3 rounded-md hover:bg-[#74BF44]/90 transition duration-300 mb-3" // Slightly increased button text size

                type="button"
              >
                Get a free quotation today!
              </button>
            </a>

            {/* <div className="text-center cursor-pointer mt-0 px-2 flex items-center justify-start">
              <div className="relative flex ml-6 my-3 items-center justify-center gap-x-2">
                <a
                  className="relative flex items-center gap-x-2"
                  href="https://wa.me/9354146089?text=Hello%2C%20I%20am%20interested%20in%20your%20services"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="font-medium text-white text-sm z-10">
                    We Are Online!
                  </span>
                </a>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;