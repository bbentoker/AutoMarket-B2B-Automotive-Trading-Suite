"use client"
import Image from "next/image"

// Custom animation style
const scrollAnimationStyle = `
  @keyframes scrollLogos {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`

// Use the new automotive partner logos
const customerLogos = [
  // {
  //   name: "Autoland",
  //   logo: "/autoland-logo.svg",
  //   alt: "Autoland logo",
  //   height: "h-8 sm:h-20",
  // },
  // {
  //   name: "GDS",
  //   logo: "/GDSLogo_WhiteBG_4K.png",
  //   alt: "GDS logo",
  //   height: "h-8 sm:h-28",
  // },
  {
    name: "Hosch",
    logo: "/Hosch.jpg",
    alt: "Hosch logo",
    height: "h-8 sm:h-40",
  },
  {
    name: "Louwman",
    logo: "/Louwman.jpg",
    alt: "Louwman logo",
    height: "h-8 sm:h-20",
  },
  {
    name: "Volkswagen",
    logo: "/Volkswagen-logo.png",
    alt: "Volkswagen logo",
    height: "h-8 sm:h-20",
  },
  {
    name: "Wensink",
    logo: "/Wensink.png",
    alt: "Wensink logo",
    height: "h-12 sm:h-40",
  },
  {
    name: "BravoAuto",
    logo: "/bravoauto.jpg",
    alt: "BravoAuto logo",
    height: "h-8 sm:h-16",
  },
  {
    name: "Ford",
    logo: "/ford.png",
    alt: "Ford logo",
    height: "h-20 sm:h-60",
  },
]

// Create an array of logos for the scrolling effect - repeat the array for seamless scrolling
const logoArray = [...customerLogos, ...customerLogos]

export function CustomerLogosSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white overflow-hidden">
      <style jsx>{scrollAnimationStyle}</style>
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-block bg-gray-900 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Trusted Supplier
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Trusted by leading dealerships</h2>
        </div>

        {/* Update the logos container for better mobile display */}
        <div className="relative w-full overflow-hidden py-6 sm:py-8 max-w-full">
          {/* Continuous scrolling logo marquee */}
          <div className="logo-scroll-container relative">
            <div
              className="flex"
              style={{
                animation: "scrollLogos 40s linear infinite",
                animationDuration: "40s !important",
              }}
            >
              {/* Double the logos to create seamless loop */}
              {[...logoArray, ...logoArray].map((logo, index) => (
                <div key={`logo-${index}`} className="flex-shrink-0 mx-3 sm:mx-6">
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm w-[120px] sm:w-[180px] h-[100px] sm:h-[140px] flex items-center justify-center">
                    <Image
                      src={logo.logo || "/placeholder.svg"}
                      alt={logo.alt}
                      width={180}
                      height={60}
                      className={`w-auto object-contain transition-all duration-300 ${logo.height}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
