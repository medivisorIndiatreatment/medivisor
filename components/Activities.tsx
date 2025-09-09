'use client';

import { useRef, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Activities() {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const swiperRef = useRef<any>(null);

  const activities = [
    {
      title: "Fiji Day Festivities",
      description: "Cultural pride and joyous moments on Fiji's special day.",
      image: "/activities/Fiji-Day.jpg",
    },
    {
      title: "Festival of Colors – Holi",
      description: "Vibrant celebrations of color, unity, and happiness.",
      image: "/activities/holi.webp",
    },
    {
      title: "Empowering Women on Women's Day",
      description: "A day to honor strength, grace, and the achievements of women.",
      image: "/activities/Womens-Day.jpg",
    },
    {
      title: "Splash of Joy at the Water Park",
      description: "Fun-filled water adventures and refreshing memories.",
      image: "/activities/Water-Park.jpg",
    },
    {
      title: "Spreading Love on Valentine's Day",
      description: "Celebrating affection with heartfelt gestures and smiles.",
      image: "/activities/Valentines-Day.jpg",
    },
    {
      title: "Honoring Moms on Mother's Day",
      description: "A tribute to love, care, and the strength of mothers.",
      image: "/activities/Mothers-Day.jpg",
    },
  ];

  useEffect(() => {
    if (
      swiperRef.current &&
      swiperRef.current.params &&
      swiperRef.current.params.navigation
    ) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, []);

  return (
    <section className="overflow-hidden relative px-2 md:px-0 py-10 bg-white">
      <div className="container mx-auto">
        {/* Heading */}
        <div className="md:text-center md:mb-8 mb-4 max-w-3xl mx-auto">
          <h2 className="md:text-4xl text-3xl font-bold text-gray-700">
            We Go Beyond Care —<br className="md:hidden block" /> We Celebrate Life
          </h2>
          <p className="mt-2 text-gray-700 md:text-lg text-[19px]">
          Beyond treatment, we bring care, joy, and unforgettable moments. From warm personal visits to lively events, your healing journey with us is filled with smiles and celebration — because your happiness is our true mission.
          </p>
        </div>

        {/* Slider */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={3}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-10"
          >
            {activities.map((activity, index) => (
              <SwiperSlide key={index}>
                <div className="p-2">
                  <div className="relative group cursor-pointer overflow-hidden rounded-xs shadow">
                    <Image
                      src={activity.image}
                      alt={activity.title}
                      width={600}
                      height={400}
                      className="w-full h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-1">
                        {activity.title}
                      </h2>
                      <p className="text-xs md:text-sm lg:text-base">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Buttons */}
          <Button
            ref={prevRef}
            className="absolute top-[45%] -translate-y-1/2 border-gray-200 cursor-pointer left-4 md:left-8 -ml-4 z-40 rounded-full bg-white md:w-8 w-8 h-8 md:h-8 p-0 shadow-md hover:shadow-lg transition-shadow"
            variant="outline"
          >
            <ChevronLeft className="md:w-5 w-4 md:h-5 h-4" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            ref={nextRef}
            className="absolute top-[45%] -translate-y-1/2 border-gray-200 cursor-pointer right-4 md:right-8 -mr-4 z-40 rounded-full bg-white md:w-8 w-8 h-8 md:h-8 p-0 shadow-md hover:shadow-lg transition-shadow"
            variant="outline"
          >
            <ChevronRight className="md:w-5 w-4 md:h-5 h-4" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
