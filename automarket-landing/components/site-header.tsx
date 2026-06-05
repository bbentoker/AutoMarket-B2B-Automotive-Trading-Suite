"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Globe, Menu, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function SiteHeader() {
  const pathname = usePathname()
  const [showMobileSearch, setShowMobileSearch] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#222222]/20 bg-[#222222]">
      {/* Top navigation bar */}
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img src="/AutoMarket-logo.svg" alt="AutoMarket" className="h-8" />
        </Link>

        {/* Search bar - desktop */}
        <div className="hidden flex-1 max-w-md px-6 lg:block">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search for vehicles..."
              className="bg-white/10 pl-10 text-white placeholder:text-white/60 focus-visible:ring-white/30"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden items-center space-x-1 md:flex">
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <Globe className="mr-1 h-4 w-4" />
                <span>EN</span>
                <ChevronDown className="ml-1 h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>Svenska</DropdownMenuItem>
              <DropdownMenuItem>Deutsch</DropdownMenuItem>
              <DropdownMenuItem>Français</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Login button */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/login">Inloggning</Link>
          </Button>
        </nav>

        {/* Mobile navigation */}
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="mr-1 text-white"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#222222] text-white">
              <div className="mt-6 flex flex-col space-y-3">
                <div className="mb-2">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search for vehicles..."
                      className="bg-white/10 pl-10 text-white placeholder:text-white/60 focus-visible:ring-white/30"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  </div>
                </div>
                <Link href={process.env.NEXT_PUBLIC_BROWSE_APP_URL || "https://browse.automarket.example.com"} className="py-2 text-sm font-medium hover:text-white/80">
                  Shop Cars
                </Link>
                <Link href="/how-it-works" className="py-2 text-sm font-medium hover:text-white/80">
                  How it works
                </Link>
                <Link href="/about" className="py-2 text-sm font-medium hover:text-white/80">
                  About Us
                </Link>
                <Link href="/contact" className="py-2 text-sm font-medium hover:text-white/80">
                  Contact
                </Link>
                <div className="h-px bg-slate-800" />
                <Link href="/login" className="py-2 text-sm font-medium hover:text-white/80">
                  Inloggning
                </Link>
                <div className="h-px bg-slate-800" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="justify-start px-0 text-white">
                      <Globe className="mr-2 h-4 w-4" />
                      <span>Choose language</span>
                      <ChevronDown className="ml-1 h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-[#222222] text-white">
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white">English</DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white">Svenska</DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white">Deutsch</DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white">Français</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile search bar */}
      {showMobileSearch && (
        <div className="border-t border-[#222222]/20 bg-[#222222] p-3 md:hidden">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search for vehicles..."
              className="bg-white/10 pl-10 text-white placeholder:text-white/60 focus-visible:ring-white/30"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <div className="container hidden h-12 md:block">
        <nav className="flex h-full items-center space-x-8">
          <Link
            href="/shop"
            className={`flex h-full items-center text-sm font-medium ${
              pathname === "/shop" ? "text-[#FF385C]" : "text-white/80 hover:text-[#FF385C]"
            }`}
          >
            Shop Cars
          </Link>
          <Link
            href="/how-it-works"
            className="flex h-full items-center text-sm font-medium text-white/80 hover:text-[#FF385C]"
          >
            How it works
          </Link>
          <Link
            href="/about"
            className="flex h-full items-center text-sm font-medium text-white/80 hover:text-[#FF385C]"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="flex h-full items-center text-sm font-medium text-white/80 hover:text-[#FF385C]"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  )
}
