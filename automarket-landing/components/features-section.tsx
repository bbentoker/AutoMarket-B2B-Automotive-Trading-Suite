"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, useAnimation, useInView } from "framer-motion"
import { ArrowRight, Camera, Fuel, Clock, Settings, ChevronRight, Check, X, EuroIcon, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/ui/section-heading"
import { IconContainer } from "@/components/ui/icon-container"
import Link from "next/link"
import { fetchListings, type Listing } from "@/lib/api"
import { useRouter } from 'next/navigation'

// Types
interface VehicleImage {
  src: string;
  alt: string;
  view: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  category: string;
  trim: string;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  location: string;
  images: VehicleImage[];
  featured: boolean;
  photoCount: number;
}

interface Feature {
  title: string;
  description: string;
  visual: (isHovered: boolean) => React.ReactNode;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

interface VehicleCardProps {
  data: Listing | Vehicle;
  index: number;
  type: 'listing' | 'vehicle';
}

interface ComparisonItem {
  text: string;
  negative: boolean;
}

interface ComparisonSection {
  title: string;
  items: ComparisonItem[];
}

interface ComparisonData {
  traditional: ComparisonSection;
  fleetTrade: ComparisonSection;
  private: ComparisonSection;
}

// Data
const comparisonData: ComparisonData = {
  traditional: {
    title: "Traditional B2B Platforms",
    items: [
      { text: "Higher prices with markups", negative: true },
      { text: "Limited vehicle selection", negative: true },
      { text: "Long delivery times", negative: true },
      { text: "Hidden fees and charges", negative: true },
    ],
  },
  fleetTrade: {
    title: "AutoMarket",
    items: [
      { text: "Better pricing, no hidden fees", negative: false },
      { text: "Hundreds of inspected cars", negative: false },
      { text: "Fast delivery, guaranteed", negative: false },
      { text: "Complete documentation", negative: false },
    ],
  },
  private: {
    title: "Independent Import",
    items: [
      { text: "Seller withholds VAT as deposit", negative: true },
      { text: "You handle the entire process", negative: true },
      { text: "Unclear car condition", negative: true },
      { text: "Uncertainty regarding documents", negative: true },
    ],
  },
}

// Components
const VehicleCard: React.FC<VehicleCardProps> = ({ data, index, type }) => {
  const handleCardClick = () => {
    if (type === 'listing') {
      const listing = data as Listing
      const browseAppUrl = process.env.NEXT_PUBLIC_BROWSE_APP_URL
      window.location.href = `${browseAppUrl}/listings/${listing.id}`
    }
  }

  if (type === 'listing') {
    const listing = data as Listing
    const price = parseFloat(listing.listing_price)

    // Function to format currency display
    const formatCurrency = () => {
      if (listing.currency.toLowerCase() === 'euro' || listing.currency.toLowerCase() === 'eur' || listing.currency === '€') {
        return `€${price.toLocaleString()}`
      } else {
        return `${price.toLocaleString()} ${listing.currency}`
      }
    }

    // Format model for title and subtitle like CarCard
    const modelParts = listing.model?.split(' ') || []
    const firstModelPart = modelParts.length > 1 ? modelParts[0] : listing.model
    const secondModelPart = modelParts.length > 1 ? modelParts[1] : modelParts[0]

    return (
      <div onClick={handleCardClick} className="block">
        <div 
          className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-xs h-full flex flex-col cursor-pointer" 
          style={{ border: '1px solid rgba(236, 236, 236, 1)' }}
        >
          <div className="relative h-48">
            <img 
              src={listing.first_photo || '/placeholder.svg'}
              alt={`${listing.brand_name} ${listing.model}`}
              className="w-full h-full object-cover" 
              onError={(e) => {
                console.warn('Failed to load image:', listing.first_photo);
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder.svg';
              }}
              onLoad={() => {
                console.log('Successfully loaded image:', listing.first_photo);
              }}
            />
            {listing.remaining_time && (
              <div className="absolute top-4 right-0 bg-[#FF385C] text-white px-3 py-1 rounded-l-lg text-sm font-light">
                {listing.remaining_time}
              </div>
            )}
          </div>
          
          <div className="p-4 flex flex-col flex-grow">
            <div className="text-sm font-semibold text-gray-900 min-h-6">
              {listing.brand_name} - {firstModelPart} - {new Date(listing.first_registration).getFullYear()}
            </div>

            <p className="text-sm text-gray-400 h-8 line-clamp-2">{listing.model}</p>
            <div className="w-full h-px bg-gray-200 mb-3"></div>
            <div className="flex items-center justify-between px-4 mb-2">
              <div className="flex flex-col items-center text-center">
                <img src="/mileage-icon.svg" alt="Mileage" className="h-5 w-5 mb-1.5" />
                <span className="text-sm truncate w-full" style={{ color: 'rgb(144, 149, 191)' }}>{listing.km_stand.toLocaleString()} km</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <img src="/fuel-icon.svg" alt="Fuel Type" className="h-5 w-5 mb-1.5" />
                <span className="text-sm truncate w-full" style={{ color: 'rgba(144, 163, 191, 1)' }}>{listing.fuel_type}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <img src="/transmission-icon.svg" alt="Transmission" className="h-5 w-5 mb-1.5" />
                <span className="text-sm truncate w-full" style={{ color: 'rgba(144, 163, 191, 1)' }}>{listing.transmission_type}</span>
              </div>
            </div>
            <div className="w-full h-px bg-gray-200 my-1"></div>
            <div className="flex justify-between items-center mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-base text-gray-500 text-center h-12 pt-2 flex items-center">
                  Excl. VAT
                </span>
                <span className="text-base font-bold text-gray-900 h-7 pt-2 flex items-center">{formatCurrency()}</span>
              </div>
              <img 
                src="/details-icon.svg" 
                alt="Details" 
                className="h-10 w-20 pt-1 pl-1 hover:opacity-80 transition-opacity duration-200" 
              />
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    const vehicle = data as Vehicle

    // Format model for title and subtitle like CarCard
    const modelParts = vehicle.model?.split(' ') || []
    const firstModelPart = modelParts.length > 1 ? modelParts[0] : vehicle.model
    const secondModelPart = modelParts.length > 1 ? modelParts[1] : modelParts[0]

    return (
      <div className="block">
        <div 
          className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-xs h-full flex flex-col cursor-pointer" 
          style={{ border: '1px solid rgba(236, 236, 236, 1)' }}
        >
          <div className="relative h-48">
            <img 
              src={vehicle.images[0]?.src || "/placeholder.svg"}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover" 
              onError={(e) => {
                console.warn('Failed to load vehicle image:', vehicle.images[0]?.src);
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder.svg';
              }}
              onLoad={() => {
                console.log('Successfully loaded vehicle image:', vehicle.images[0]?.src);
              }}
            />
            {vehicle.featured && (
              <div className="absolute top-4 right-0 bg-[#FF385C] text-white px-3 py-1 rounded-l-lg text-sm font-light">
                Featured
              </div>
            )}
          </div>
          
          <div className="p-4 flex flex-col flex-grow">
            <div className="text-sm font-semibold text-gray-900 min-h-6">
              {vehicle.make} - {firstModelPart} - {vehicle.year}
            </div>

            <p className="text-sm text-gray-400 h-8 line-clamp-2">{secondModelPart}</p>
            <div className="w-full h-px bg-gray-200 mb-3"></div>
            <div className="flex items-center justify-between px-4 mb-2">
              <div className="flex flex-col items-center text-center">
                <img src="/mileage-icon.svg" alt="Mileage" className="h-5 w-5 mb-1.5" />
                <span className="text-sm truncate w-full" style={{ color: 'rgb(144, 149, 191)' }}>{vehicle.mileage.toLocaleString()} km</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <img src="/fuel-icon.svg" alt="Fuel Type" className="h-5 w-5 mb-1.5" />
                <span className="text-sm truncate w-full" style={{ color: 'rgba(144, 163, 191, 1)' }}>{vehicle.fuel}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <img src="/transmission-icon.svg" alt="Transmission" className="h-5 w-5 mb-1.5" />
                <span className="text-sm truncate w-full" style={{ color: 'rgba(144, 163, 191, 1)' }}>{vehicle.transmission}</span>
              </div>
            </div>
            <div className="w-full h-px bg-gray-200 my-1"></div>
            <div className="flex justify-between items-center mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-base text-gray-500 text-center h-12 pt-2 flex items-center">
                  Excl. VAT
                </span>
                <span className="text-base font-bold text-gray-900 h-7 pt-2 flex items-center">€{vehicle.price.toLocaleString()}</span>
              </div>
              <img 
                src="/details-icon.svg" 
                alt="Details" 
                className="h-10 w-20 pt-1 pl-1 hover:opacity-80 transition-opacity duration-200" 
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="p-8 md:p-10 relative overflow-hidden"
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 70,
            damping: 12,
            duration: 0.6,
            delay: index * 0.1,
          },
        },
      }}
      initial={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual illustration container */}
      <div className="mb-8 flex justify-center">
        <motion.div
          className="relative w-40 h-32 overflow-hidden"
          whileHover={{
            scale: 1.05,
          }}
          animate={{
            y: isHovered ? -5 : 0,
          }}
          transition={{ duration: 0.4 }}
        >
          {feature.visual(isHovered)}
        </motion.div>
      </div>

      {/* Feature title with enhanced animation */}
      <motion.h3
        className="text-xl font-bold mb-2 text-gray-900 text-center"
        animate={{
          color: isHovered ? "#222222" : "#111827",
          scale: isHovered ? 1.03 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {feature.title.includes(" & ") ? (
          <>
            {feature.title.split(" & ")[0]} <span className="text-gray-900">&</span> {feature.title.split(" & ")[1]}
          </>
        ) : (
          feature.title
        )}
      </motion.h3>

      {/* Feature description */}
      <p className="text-gray-800 text-center">{feature.description}</p>

      {/* Enhanced interactive indicator */}
      <motion.div
        className="absolute bottom-0 left-1/2 w-12 h-1 bg-gray-900 rounded-t-full"
        initial={{ opacity: 0, y: 1, x: "-50%" }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 1,
          width: isHovered ? "70%" : "12px",
        }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  )
}

// Data
const featuredVehicles: Vehicle[] = [
  {
    id: 1,
    make: "Mercedes-Benz",
    model: "S-Class",
    year: 2023,
    category: "Sedan",
    trim: "S 580 4MATIC",
    price: 89500,
    mileage: 1200,
    fuel: "Hybrid",
    transmission: "Auto",
    location: "Stockholm",
    images: [
      {
        src: "/silver-s-class-driving.png",
        alt: "Mercedes-Benz S-Class exterior front view",
        view: "Front",
      },
      {
        src: "/placeholder.svg?key=qmi2m",
        alt: "Mercedes-Benz S-Class interior view",
        view: "Interior",
      },
      {
        src: "/placeholder.svg?key=122rq",
        alt: "Mercedes-Benz S-Class exterior rear view",
        view: "Rear",
      },
    ],
    featured: true,
    photoCount: 8,
  },
  {
    id: 2,
    make: "BMW",
    model: "X5",
    year: 2022,
    category: "SUV",
    trim: "xDrive40i",
    price: 68900,
    mileage: 5600,
    fuel: "Diesel",
    transmission: "Auto",
    location: "Gothenburg",
    images: [
      {
        src: "/bmw-x5-2022.jpeg",
        alt: "BMW X5 exterior front view",
        view: "Front",
      },
      {
        src: "/bmw-x5-interior.png",
        alt: "BMW X5 interior view",
        view: "Interior",
      },
      {
        src: "/placeholder.svg?key=xe45u",
        alt: "BMW X5 exterior rear view",
        view: "Rear",
      },
    ],
    featured: true,
    photoCount: 6,
  },
  {
    id: 3,
    make: "Audi",
    model: "e-tron GT",
    year: 2023,
    category: "Coupe",
    trim: "Prestige",
    price: 104800,
    mileage: 800,
    fuel: "Electric",
    transmission: "Auto",
    location: "Malmö",
    images: [
      {
        src: "/audi-etron-gt-2023.png",
        alt: "Audi e-tron GT exterior front view",
        view: "Front",
      },
      {
        src: "/placeholder.svg?key=tklwv",
        alt: "Audi e-tron GT interior view",
        view: "Interior",
      },
      {
        src: "/placeholder.svg?key=wmv2u",
        alt: "Audi e-tron GT exterior rear view",
        view: "Rear",
      },
    ],
    featured: false,
    photoCount: 5,
  },
]

const keyFeaturesData: Feature[] = [
  {
    title: "Register Free",
    description:
      "Create an account for free, once approved, gain access to a curated selection of thoroughly inspected cars at competitive prices with dealer-friendly margins across Europe.",
    visual: (isHovered: boolean) => (
      <div className="relative w-full h-full">
        {/* Main illustration */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            width="160"
            height="120"
            viewBox="0 0 160 120"
            className="transform scale-110 drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Login Form */}
            <motion.rect
              x="40"
              y="20"
              width="80"
              height="80"
              rx="6"
              fill="white"
              stroke="#FF385C"
              strokeWidth="2"
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -4 : 0 }}
              transition={{ duration: 0.4 }}
            />

            {/* Form Header */}
            <rect x="40" y="20" width="80" height="16" rx="6" fill="#FF385C" />
            <circle cx="50" cy="28" r="4" fill="white" />
            <rect x="58" y="26" width="30" height="4" rx="2" fill="white" />

            {/* Username Field */}
            <rect x="50" y="46" width="60" height="8" rx="2" fill="#F3F4F6" />
            <rect x="50" y="42" width="20" height="3" rx="1" fill="#FF385C" />

            {/* Password Field */}
            <rect x="50" y="64" width="60" height="8" rx="2" fill="#F3F4F6" />
            <rect x="50" y="60" width="20" height="3" rx="1" fill="#FF385C" />

            {/* Login Button */}
            <motion.rect
              x="50"
              y="80"
              width="60"
              height="10"
              rx="5"
              fill="#FF385C"
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.3 }}
            />
            <rect x="65" y="83" width="30" height="4" rx="2" fill="white" />

            {/* User Icon */}
            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: isHovered ? 10 : 0, scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.4 }}
            >
              <circle cx="120" cy="40" r="15" fill="#FF385C" />
              <circle cx="120" cy="35" r="6" fill="white" />
              <path d="M105 55C105 47 111 40 120 40C129 40 135 47 135 55" fill="#FF385C" />
            </motion.g>

            {/* Dealer Badge */}
            <motion.g
              initial={{ scale: 1, x: 0, y: 0 }}
              animate={{ scale: isHovered ? 1.15 : 1, x: isHovered ? -3 : 0, y: isHovered ? 3 : 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <circle cx="30" cy="70" r="12" fill="#1F2937" />
              <path
                d="M25 70L28 73L35 66"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>
          </svg>
        </div>

        {/* Animated particles with enhanced effects */}
        {isHovered && (
          <>
            <motion.div
              className="absolute h-3 w-3 rounded-full bg-[#FF385C]"
              initial={{ opacity: 0, x: 70, y: 50 }}
              animate={{ opacity: [0, 1, 0], x: 120, y: 40 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
            <motion.div
              className="absolute h-2.5 w-2.5 rounded-full bg-[#FF385C]"
              initial={{ opacity: 0, x: 90, y: 60 }}
              animate={{ opacity: [0, 1, 0], x: 30, y: 70 }}
              transition={{ duration: 1.3, delay: 0.3, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
          </>
        )}
      </div>
    ),
  },
  {
    title: "Reserve & Offers",
    description:
      "Browse our inventory, reserve the vehicles you're interested in, or submit competitive offers on available stock to secure the best opportunities.",
    visual: (isHovered: boolean) => (
      <div className="relative w-full h-full">
        {/* Main illustration */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            width="160"
            height="120"
            viewBox="0 0 160 120"
            className="transform scale-110 drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Offer Banner */}
            <motion.rect
              x="30"
              y="20"
              width="100"
              height="20"
              rx="4"
              fill="#FF385C"
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -4 : 0 }}
              transition={{ duration: 0.4 }}
            />
            <rect x="40" y="28" width="40" height="4" rx="2" fill="white" />
            <rect x="85" y="28" width="35" height="4" rx="2" fill="white" />
            <path
              d="M35 30L38 33L32 27"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Vehicle Cards */}
            <motion.g
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -3 : 0, x: isHovered ? -2 : 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Card 1 */}
              <rect x="30" y="50" width="45" height="50" rx="4" fill="white" stroke="#FF385C" strokeWidth="1.5" />
              <rect x="30" y="50" width="45" height="25" rx="4" fill="#FF385C" fillOpacity="0.1" />
              <rect x="35" y="80" width="35" height="3" rx="1.5" fill="#222222" />
              <rect x="35" y="86" width="25" height="3" rx="1.5" fill="#6B7280" />
              <rect x="35" y="92" width="15" height="3" rx="1.5" fill="#9CA3AF" />

              {/* Car in Card 1 - Make it more prominent */}
              <path d="M50 65H40C39 65 38 66 38 67V68H52V67C52 66 51 65 50 65Z" fill="#222222" />
              <path d="M48 60H42L40 65H50L48 60Z" fill="#FF385C" />
              <circle cx="41" cy="67" r="1.5" fill="#6B7280" />
              <circle cx="49" cy="67" r="1.5" fill="#6B7280" />
            </motion.g>

            <motion.g
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -5 : 0, x: isHovered ? 2 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Card 2 */}
              <rect x="85" y="50" width="45" height="50" rx="4" fill="white" stroke="#FF385C" strokeWidth="1.5" />
              <rect x="85" y="50" width="45" height="25" rx="4" fill="#FF385C" fillOpacity="0.1" />
              <rect x="90" y="80" width="35" height="3" rx="1.5" fill="#222222" />
              <rect x="90" y="86" width="25" height="3" rx="1.5" fill="#6B7280" />
              <rect x="90" y="92" width="15" height="3" rx="1.5" fill="#9CA3AF" />

              {/* Car in Card 2 - Make it more prominent */}
              <path d="M105 65H95C94 65 93 66 93 67V68H107V67C107 66 106 65 105 65Z" fill="#222222" />
              <path d="M103 60H97L95 65H105L103 60Z" fill="#FF385C" />
              <circle cx="96" cy="67" r="1.5" fill="#6B7280" />
              <circle cx="104" cy="67" r="1.5" fill="#6B7280" />
            </motion.g>

            {/* Reservation Button */}
            <motion.rect
              x="55"
              y="105"
              width="50"
              height="10"
              rx="5"
              fill="#FF385C"
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.3 }}
            />
            <rect x="65" y="108" width="30" height="4" rx="2" fill="white" />

            {/* Special Offer Badge */}
            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: isHovered ? 20 : 0, scale: isHovered ? 1.15 : 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <circle cx="120" cy="85" r="12" fill="#1F2937" />
              <text x="120" y="88" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                %
              </text>
            </motion.g>
          </svg>
        </div>

        {/* Enhanced animated elements */}
        {isHovered && (
          <>
            <motion.div
              className="absolute h-3 w-3 rounded-full bg-[#FF385C]"
              initial={{ opacity: 0, x: 80, y: 60 }}
              animate={{ opacity: [0, 1, 0], x: 120, y: 85 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
            <motion.div
              className="absolute h-3 w-3 rounded-full bg-[#FF385C]"
              initial={{ opacity: 0, x: 80, y: 50 }}
              animate={{ opacity: [0, 1, 0], x: 55, y: 105 }}
              transition={{ duration: 1.2, delay: 0.2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
          </>
        )}
      </div>
    ),
  },
  {
    title: "Transport & Documentation",
    description:
      "Our trusted transport partners ensure quick delivery, while we provide your car documents without delay. Stay fully informed from purchase to final delivery.",
    visual: (isHovered: boolean) => (
      <div className="relative w-full h-full">
        {/* Main illustration */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            width="160"
            height="120"
            viewBox="0 0 160 120"
            className="transform scale-110 drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Transport & Documentation Visual */}
            <motion.g initial={{ y: 0 }} animate={{ y: isHovered ? -4 : 0 }} transition={{ duration: 0.4 }}>
              {/* Black Truck Image - Left Side */}
              <foreignObject x="15" y="28" width="100" height="70">
                <img 
                  src="/black-truck.svg" 
                  alt="Transport Truck" 
                  className="w-full h-full object-contain"
                />
              </foreignObject>

              {/* Document - Right Side */}
              <motion.path
                d="M120 80V35H140L150 45V80H120Z"
                fill="#F3F4F6"
                initial={{ y: 0 }}
                animate={{ y: isHovered ? -2 : 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
              <path d="M120 80V35H140L150 45V80H120Z" stroke="#6B7280" strokeWidth="2" />
              <path d="M140 35V45H150" stroke="#6B7280" strokeWidth="2" />

              {/* Document lines */}
              <motion.g
                initial={{ opacity: 0.7 }}
                animate={{ opacity: isHovered ? 1 : 0.7 }}
                transition={{ duration: 0.3 }}
              >
                <path d="M125 55H145" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
                <path d="M125 65H145" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
                <path d="M125 75H135" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
              </motion.g>
            </motion.g>

            {/* Checkmark badge */}
            <motion.g
              initial={{ scale: 1, x: 0, y: 0 }}
              animate={{
                scale: isHovered ? 1.15 : 1,
                x: isHovered ? 3 : 0,
                y: isHovered ? -3 : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              <circle cx="115" cy="30" r="12" fill="#1F2937" />
              <path
                d="M110 30L113 33L120 26"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>
          </svg>
        </div>

        {/* Enhanced animated elements */}
        {isHovered && (
          <>
            <motion.div
              className="absolute h-3 w-3 rounded-full bg-[#FF385C]"
              initial={{ opacity: 0, x: 50, y: 60 }}
              animate={{ opacity: [0, 1, 0], x: 115, y: 30 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
            <motion.div
              className="absolute h-2.5 w-2.5 rounded-full bg-[#FF385C]"
              initial={{ opacity: 0, x: 85, y: 60 }}
              animate={{ opacity: [0, 1, 0], x: 115, y: 30 }}
              transition={{ duration: 1.3, delay: 0.3, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
          </>
        )}
      </div>
    ),
  },
]

// Main Component
export function FeaturesSection() {
  const controls = useAnimation()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    once: true,
    amount: 0.15,
    margin: "0px 0px -100px 0px",
  })

  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getListings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchListings()
        // do not change from data.listings
        setListings(data.listings)
        console.log('Fetched listings in features section:', data)
      } catch (error) {
        console.error('Error fetching listings:', error)
        setError('Failed to fetch listings. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    getListings()
  }, [])

  useEffect(() => {
    // Mobil görünümde animasyonları devre dışı bırak
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768

    if (isInView || isMobile) {
      // Mobil cihazlarda animasyonları hemen başlat
      if (isMobile) {
        controls.start({
          opacity: 1,
          y: 0,
          transition: { duration: 0.1 },
        })
      } else {
        // Masaüstünde normal animasyonları kullan
        const timer = setTimeout(() => {
          controls.start("visible")
        }, 150)

        return () => clearTimeout(timer)
      }
    }
  }, [controls, isInView])

  // Sayfa yüklendiğinde tüm bölümleri görünür yap
  useEffect(() => {
    // Mobil cihazlarda tüm bölümleri hemen görünür yap
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768

    if (isMobile) {
      document.querySelectorAll("section").forEach((section) => {
        section.style.opacity = "1"
        section.style.transform = "none"
        section.style.visibility = "visible"
      })
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 12,
        duration: 0.6,
      },
    },
  }

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const browseAppUrl = process.env.NEXT_PUBLIC_BROWSE_APP_URL
    window.location.href = browseAppUrl || '#'
  }

  return (
    // Update the section padding for better mobile display
    <section
      className="overflow-hidden bg-white py-16 sm:py-20 md:py-24"
      id="how-it-works"
      style={{ opacity: 1, transform: "none" }}
    >
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Featured Vehicles */}
        <motion.div
          ref={ref}
          initial={{ opacity: 1, y: 0 }}
          animate={controls}
          variants={containerVariants}
          className="mx-auto"
          style={{ opacity: 1, transform: "none" }}
        >
          <SectionHeading
            badge="Featured Cars"
            title="Inspected Cars Available For Sale"
            description="Explore export-ready B2B cars, inspected and certified for your peace of mind."
          />
          <div className="relative">
            {isLoading ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-10 w-10">
                    <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-gray-200"></div>
                    <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-[#FF385C] border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-gray-500 text-sm">Loading available cars...</p>
                </div>
              </div>
            ) : error ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center max-w-md">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="h-6 w-6 text-red-500" />
                  </div>
                  <p className="text-gray-900 font-medium">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-[#FF385C] hover:text-[#E62E50] font-medium flex items-center gap-1"
                  >
                    Try Again
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 justify-items-center max-w-5xl mx-auto"
                initial={{ opacity: 1, y: 0 }}
                style={{ opacity: 1, transform: "none" }}
              >
                {listings.length > 0 ? (
                  listings.slice(0, 3).map((listing, index) => (
                    <VehicleCard key={listing.id} data={listing} index={index} type="listing" />
                  ))
                ) : (
                  featuredVehicles.slice(0, 3).map((vehicle, index) => (
                    <VehicleCard key={vehicle.id} data={vehicle} index={index} type="vehicle" />
                  ))
                )}
              </motion.div>
            )}

            {/* Decorative Elements */}
            <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-yellow-100 opacity-30 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-yellow-100 opacity-30 blur-3xl" />
          </div>

          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            className="mt-12 text-center"
            initial={{ opacity: 1, y: 0 }}
            style={{ opacity: 1, transform: "none" }}
          >
            <Button 
              size="lg" 
              rounded="lg" 
              className="group hover:scale-105 transition-transform duration-300"
              onClick={handleBrowseClick}
            >
              Browse All Cars
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Key Features section */}
          <motion.div
            variants={itemVariants}
            className="mt-24"
            id="key-features"
            initial={{ opacity: 1, y: 0 }}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2, margin: "0px 0px -150px 0px" }}
            style={{ opacity: 1, transform: "none" }}
          >
            <SectionHeading badge="Key Features" title="Designed for Dealership Success" />

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Update the key features grid for better mobile display */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {keyFeaturesData.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} index={index} />
                ))}
              </div>

              {/* Login and Register buttons */}
              <div className="bg-gray-50 p-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link href="/register" passHref className="w-full sm:w-1/2 max-w-[240px]">
                  <motion.button
                    className="w-full px-8 py-3 bg-[#FF385C] border-2 border-[#FF385C] rounded-lg text-gray-900 font-medium hover:bg-[#E62E50] hover:border-[#FF385C] transition-all hover:shadow-[#FF385C]/20 hover:scale-105"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Register Free
                  </motion.button>
                </Link>
                <Link href="/login" passHref className="w-full sm:w-1/2 max-w-[240px]">
                  <motion.button
                    className="w-full px-8 py-3 bg-transparent border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-[#FF385C] hover:text-[#FF385C] transition-all hover:shadow-[#FF385C]/10 hover:scale-105"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Dealer Login
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Why Fleet Trade section - Reintegrated */}
          <motion.div
            variants={itemVariants}
            className="mt-24 relative"
            id="why-fleet-trade"
            initial={{ opacity: 1, y: 0 }}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2, margin: "0px 0px -150px 0px" }}
            transition={{ delay: 0.2 }}
            style={{ opacity: 1, transform: "none" }}
          >
            {/* "Why Fleet Trade" label */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.div
                variants={itemVariants}
                className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium"
                initial={{ opacity: 1, y: 0 }}
              >
                Why AutoMarket
              </motion.div>
            </div>

            {/* Main content card */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6"
              initial={{ opacity: 1, y: 0 }}
              style={{ opacity: 1, transform: "none" }}
            >
              {/* Update the "Why Fleet Trade" section for better mobile display */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Left column - Pay less */}
                <motion.div
                  className="p-8 md:p-12"
                  variants={itemVariants}
                  transition={{ delay: 0.3 }}
                  initial={{ opacity: 1, y: 0 }}
                  style={{ opacity: 1, transform: "none" }}
                >
                  <div className="flex items-center mb-6">
                    <IconContainer variant="primary" size="md" rounded="full" className="mr-4 bg-[#FF385C] text-white">
                      <EuroIcon className="h-6 w-6" />
                    </IconContainer>
                    <h3 className="text-3xl font-bold text-gray-900">Profit More</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    We've eliminated traditional middlemen and simplified the import process, giving you direct access
                    to inspected, high-quality vehicles at competitive prices. With improved margins and streamlined
                    operations, your dealership can increase profitability and stay ahead of the competition.
                  </p>
                  <Link
                    href="/about"
                    className="group bg-transparent hover:bg-[#FF385C]/10 text-[#FF385C] px-0 font-medium inline-flex items-center"
                  >
                    Learn about our pricing
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>

                {/* Right column - More cars */}
                <motion.div
                  className="p-8 md:p-12"
                  variants={itemVariants}
                  transition={{ delay: 0.4 }}
                  initial={{ opacity: 1, y: 0 }}
                  style={{ opacity: 1, transform: "none" }}
                >
                  <div className="flex items-center mb-6">
                    <IconContainer variant="primary" size="md" rounded="full" className="mr-4 bg-[#FF385C] text-white">
                      <Car className="h-6 w-6" />
                    </IconContainer>
                    <h3 className="text-3xl font-bold text-gray-900">More Cars. Trusted Supplier.</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    AutoMarket is Europe's trusted B2B platform for cross-border car imports, giving dealerships access to
                    a wide selection of inspected vehicles at competitive prices. We offer reliable supply, transparent
                    pricing, and a streamlined process designed specifically for professional car dealers.
                  </p>
                  <Link
                    href="/shop"
                    className="group bg-transparent hover:bg-[#FF385C]/10 text-[#FF385C] px-0 font-medium inline-flex items-center"
                  >
                    Browse our inventory
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Our Promise section - Kept as a separate section */}
          <motion.div
            variants={itemVariants}
            className="mt-24 relative"
            id="our-promise"
            initial={{ opacity: 1, y: 0 }}
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: "0px 0px -200px 0px" }}
            transition={{ delay: 0.2 }}
            style={{ opacity: 1, transform: "none" }}
          >
            {/* "Our Promise" label */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.div
                variants={itemVariants}
                className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium"
                initial={{ opacity: 1, y: 0 }}
              >
                Our Promise
              </motion.div>
            </div>

            {/* Main content card */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mt-6 mb-12 px-6 py-12"
              initial={{ opacity: 1, y: 0 }}
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Import with confidence</h2>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                  AutoMarket makes sourcing high-quality cars easy — transparent, efficient, and tailored to increase your
                  dealership's success.
                </p>
              </div>

              {/* Update the "Our Promise" section for better mobile display */}
              <div className="grid grid-cols-1 gap-6 sm:gap-6 md:grid-cols-3 mt-6 sm:mt-10">
                {/* Traditional Exporters Column */}
                <motion.div
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  variants={itemVariants}
                  transition={{ delay: 0.3 }}
                  initial={{ opacity: 1, y: 0 }}
                  style={{ opacity: 1, transform: "none" }}
                >
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 text-center">{comparisonData.traditional.title}</h3>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {comparisonData.traditional.items.map((item, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start"
                          variants={itemVariants}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          initial={{ opacity: 1, y: 0 }}
                          style={{ opacity: 1, transform: "none" }}
                        >
                          <IconContainer
                            variant="default"
                            size="sm"
                            rounded="full"
                            className="flex-shrink-0 mr-3 mt-0.5 bg-red-100"
                          >
                            <X className="h-3 w-3 text-red-500" />
                          </IconContainer>
                          <span className="text-gray-700">{item.text}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Fleet Trade Column */}
                <motion.div
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transform md:scale-105 z-10"
                  variants={itemVariants}
                  transition={{ delay: 0.4 }}
                  initial={{ opacity: 1, y: 0 }}
                  style={{ opacity: 1, transform: "none" }}
                >
                  <div className="p-6 border-b border-gray-100 flex justify-center">
                    <div className="relative h-12 w-40">
                      <Image src="/AutoMarket-logo.svg" alt="AutoMarket Logo" fill className="object-contain" />
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {comparisonData.fleetTrade.items.map((item, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start"
                          variants={itemVariants}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          initial={{ opacity: 1, y: 0 }}
                          style={{ opacity: 1, transform: "none" }}
                        >
                          <IconContainer
                            variant="default"
                            size="sm"
                            rounded="full"
                            className="flex-shrink-0 mr-3 mt-0.5 bg-green-100"
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </IconContainer>
                          <span className="text-gray-700">{item.text}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Private Imports Column */}
                <motion.div
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  variants={itemVariants}
                  transition={{ delay: 0.5 }}
                  initial={{ opacity: 1, y: 0 }}
                  style={{ opacity: 1, transform: "none" }}
                >
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 text-center">{comparisonData.private.title}</h3>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {comparisonData.private.items.map((item, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start"
                          variants={itemVariants}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          initial={{ opacity: 1, y: 0 }}
                          style={{ opacity: 1, transform: "none" }}
                        >
                          <IconContainer
                            variant="default"
                            size="sm"
                            rounded="full"
                            className="flex-shrink-0 mr-3 mt-0.5 bg-red-100"
                          >
                            <X className="h-3 w-3 text-red-500" />
                          </IconContainer>
                          <span className="text-gray-700">{item.text}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>

              {/* CTA Button */}
              <motion.div
                className="mt-12 text-center"
                variants={itemVariants}
                transition={{ delay: 0.6 }}
                initial={{ opacity: 1, y: 0 }}
                style={{ opacity: 1, transform: "none" }}
              >
                <Link href="/register" passHref>
                  <Button size="lg" rounded="lg" className="group hover:scale-105 transition-transform duration-300">
                    Register Free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
