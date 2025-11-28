// components/HeroSlider.js
'use client';

import React from 'react';
import Slider, { Settings } from 'react-slick';
import Banner1 from '@/components/Hero';
import Banner2 from '@/components/eyeBanner'; // Assuming this is now active or you want to use it
import Banner3 from '@/components/PacificBanner';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HeroSlider = () => {
  // 1. Define all your slide components/content here
  const slides = [
    { key: 'banner1', component: <Banner1 />, link: '/' },
    // Uncomment these to test with multiple slides:
    // { key: 'banner2', component: <a href="/fiji-eye-test "><Banner2 /></a>, link: '/fiji-eye-test' },
    // { key: 'banner3', component: <a href="/pacific-patient"><Banner3 /></a>, link: '/pacific-patient' },
  ];

  // 2. Check the number of slides
  const isSingleSlide = slides.length <= 1;

  // --- Custom Arrow Components ---
  const NextArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} custom-next-arrow`}
        style={{ ...style }}
        onClick={onClick}
      >
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#E22026] backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:scale-105 transition-transform">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  };

  const PrevArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} custom-prev-arrow`}
        style={{ ...style }}
        onClick={onClick}
      >
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#E22026] backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:scale-105 transition-transform">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  };
  // --- End Custom Arrow Components ---

  const settings: Settings = {
    // 3. Conditional settings based on slide count
    dots: !isSingleSlide,
    arrows: !isSingleSlide,
    nextArrow: !isSingleSlide ? <NextArrow /> : undefined,
    prevArrow: !isSingleSlide ? <PrevArrow /> : undefined,

    // Original settings
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: !isSingleSlide, // Only autoplay if there's more than one slide
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    adaptiveHeight: true, // ✅ dynamic height per slide
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    waitForAnimate: true,
    swipe: true,
    touchThreshold: 10,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          // On mobile, always hide arrows/dots (unless you want them for single slide)
          arrows: false,
          dots: false,
          speed: 800,
          adaptiveHeight: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          dots: false,
          speed: 600,
          adaptiveHeight: true,
        },
      },
    ],
  };

  return (
    <div className="hero-slider relative w-full mx-auto overflow-hidden">
      <Slider {...settings}>
        {/* 4. Map over the slides array to render them */}
        {slides.map((slide) => (
          <div key={slide.key}>
            {slide.component}
          </div>
        ))}
      </Slider>

      {/* 5. Keep the global CSS for styling when dots/arrows ARE visible */}
      <style jsx global>{`
        /* Hide default slick arrows since we're using custom ones */
        .hero-slider .slick-prev:before,
        .hero-slider .slick-next:before {
          display: none;
        }

        /* Arrow position */
        .hero-slider .slick-prev {
          left: 2rem;
          z-index: 10;
        }

        .hero-slider .slick-next {
          right: 2rem;
          z-index: 10;
        }

        /* Dot customization */
        .hero-slider .slick-dots {
          bottom: 2rem;
          z-index: 10;
        }

        .hero-slider .slick-dots li {
          margin: 0 0.375rem;
          width: 0.75rem;
          height: 0.75rem;
        }

        .hero-slider .slick-dots li button:before {
          content: '';
          width: 0.75rem;
          height: 0.75rem;
          background: #ccc;
          border-radius: 50%;
          opacity: 1;
          transition: all 0.3s ease;
        }

        .hero-slider .slick-dots li.slick-active button:before {
          background: #74BF44;
          opacity: 1;
          transform: scale(1.2);
        }

        /* Mobile adjustments (still necessary as they override desktop settings) */
        @media (max-width: 768px) {
          .hero-slider .slick-prev,
          .hero-slider .slick-next {
            display: none !important; /* ✅ hide arrows on mobile */
          }

          .hero-slider .slick-dots {
            display: none !important; /* ✅ hide dots on mobile */
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;