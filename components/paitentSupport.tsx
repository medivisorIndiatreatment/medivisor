"use client"

import { useState, useEffect } from "react";
import Image from 'next/image';

const LoadingSkeleton = () => (
  <section className="py-10 bg-white animate-pulse">
    <div className="container mx-auto md:px-0 px-4">
      <div className="md:grid lg:grid-cols-12 gap-12 items-center flex flex-col-reverse md:flex-row">
        {/* Skeleton for Content */}
        <div className="space-y-6 col-span-5 md:order-1 order-2 mt-0 md:mt-0">
          <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-4" />
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-5/6" />
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-4/5" />
        </div>

        {/* Skeleton for Video */}
        <div className="relative col-span-7 md:order-2 order-1">
          <div className="relative rounded-xs overflow-hidden shadow-md">
            <div className="relative rounded-xs shadow-lg aspect-[17/10] bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default function PaitentSupport() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a network request or data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust loading time as needed
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <section className="md:py-10 py-10 md:px-0 px-2 bg-gray-50" id="PatientSupport">
      <div className="container mx-auto md:px-0 px-4">
        {/* Use flex-col-reverse to place content first on mobile, then md:grid to restore original layout */}
        <div className="md:grid lg:grid-cols-12 md:gap-12 items-center flex flex-col-reverse">
          {/* Content Side */}
          <div className="space-y-3 mdLspacey-6 col-span-5 md:order-1 order-2 mb-2 md:mb-0">
            <h2 className="heading-base">
              We Stand by Our Patients Every Step of the Way
            </h2>

            <p className="description">
              Medivisor takes pride in providing unwavering support to our patients
              throughout their journey. From the moment they step foot in the
              Delhi airport, our dedicated team ensures that they are never left
              to navigate their medical experience alone.
            </p>

            <p className="description">
              At every juncture of their treatment process, at least one Medivisor
              staff member is by their side, offering escorting, guidance, and
              assistance every step of the way. Our commitment is to ensure that
              patients feel supported and cared for at all times, allowing them to
              focus on their recovery with peace of mind.
            </p>
          </div>

          {/* Video Side */}
         <div className="relative md:col-span-7 w-full mt-5 md:mt-0 md:order-2 order-1">
  <div className="relative rounded-xs overflow-hidden shadow-md">
    <div className="relative rounded-xs shadow-lg">
      <iframe
        src="https://www.youtube.com/embed/94RNiXZj8_8?modestbranding=1&controls=0&rel=0"
        title="YouTube video player"
        className="w-full aspect-[17/10]"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  </div>
</div>

        </div>
      </div>
    </section>
  );
}