"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export const ModernNavigation = () => {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/AutoMarket-logo.svg" alt="AutoMarket Logo" className="h-8 object-contain" />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/shop" className="text-gray-600 hover:text-[#FF385C] transition-colors">
            Shop
          </Link>
          <Link href="/offers" className="text-gray-600 hover:text-[#FF385C] transition-colors">
            Offers
          </Link>
          <Link href="/dealer-portal" className="text-gray-600 hover:text-[#FF385C] transition-colors">
            Dealer Portal
          </Link>
          <Link href="/vehicles" className="text-gray-600 hover:text-[#FF385C] transition-colors">
            Vehicles
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-[#FF385C] transition-colors">
            Login
          </Link>
          <Link href="/register" className="text-gray-600 hover:text-[#FF385C] transition-colors">
            Register
          </Link>
        </div>
      </div>
    </header>
  )
}
