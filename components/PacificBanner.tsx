// components/PacificBanner.tsx
import Image from "next/image";

export default function PacificBanner() {
  const scheduleItems = [
    { 
      flag: "/icon/flag/png.png", 
      country: "Papua New Guinea", 
      city: "Port Moresby", 
      date: "Nov 18–19" 
    },
    { 
      flag: "/icon/flag/solomon-flag.png", 
      country: "Solomon Islands", 
      city: "Honiara", 
      date: "Nov 20–21" 
    },
    { 
      flag: "/icon/flag/vanuatu.png", 
      country: "Vanuatu", 
      city: "Port Vila", 
      date: "Nov 23–24" 
    },
    { 
      flag: "/icon/flag/fiji.png", 
      country: "Fiji", 
      city: "Lautoka & Suva", 
      date: "Nov 25–26" 
    },
  ];

  return (
    <div className="relative px-2 bg-white border-b border-gray-200 overflow-hidden">
      <div className="grid md:grid-cols-2 items-end md:gap-12">
        {/* Left - Image */}
        <div className="relative order-2 md:order-1 group w-full h-full flex items-end">
          <div className="w-full h-auto md:h-[calc(90vh-100px)] relative">
            <Image
              src="/banner/Doctor-Team-1.png"
              alt="Mr. Kumar Sushant - Director, Medivisor India Treatment"
              width={800}
              height={500}
              className="w-full h-full object-contain object-bottom"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Right - Content */}
        <div className="space-y-2 mt-16 md:mt-0 flex items-center md:relative md:order-2 order-1 h-full">
          <div className="container mx-auto px-6 lg:px-12">
            <div>
              <div className="flex py-2 md:py-4 items-center justify-between">
                <div>
                  <Image
                    src="/Medivisor-logo.svg"
                    alt="Medivisor Logo"
                    width={240}
                    height={60}
                    className="w-full h-auto max-w-[240px] md:max-w-[300px]"
                    priority
                  />
                </div>
                <div className="relative justify-center z-10">
                  <Image
                    src="/hospital-logo/yasodha.png"
                    alt="Yashoda Hospital"
                    width={240}
                    height={120}
                    className="w-full h-auto max-w-[240px] md:max-w-[300px]"
                    priority
                  />
                </div>
              </div>
              
              <h2 className="text-4xl sm:text-6xl text-center font-semibold tracking-tight text-gray-900">
                Pacific Patient Visit
              </h2>
              <p className="heading-lg my-2 text-center font-medium">
                Nov 18 – 26, 2025
              </p>
            </div>

            {/* Schedule Section with Lazy Loading */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 h-full justify-between pt-4">
              {scheduleItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col col-span-1 items-center justify-center"
                >
                  <div className="w-16 h-12 md:w-20 md:h-14 flex items-center justify-center mb-2">
                    <Image
                      src={item.flag}
                      alt={`${item.country} Flag`}
                      width={64}
                      height={48}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                  <p className="font-semibold text-gray-800 text-xs md:text-sm text-center leading-tight mb-1">
                    {item.country}
                  </p>
                  <p className="text-gray-600 text-xs text-center leading-tight mb-1">
                    {item.city}
                  </p>
                  <p className="text-sm text-gray-800 md:text-xs font-medium">
                    {item.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}