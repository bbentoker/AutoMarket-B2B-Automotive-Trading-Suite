"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowRight,
  CheckCircle,
  UserPlus,
  Phone,
  Mail,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Globe,
  Menu,
  User,
  ChevronDown,
  LogIn,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Define the background images
const backgroundImages = [
  
  // {
  //   src: "/bmw-luxury-sedans-showroom.jpeg",
  //   alt: "Elegant BMW luxury sedans in a modern white showroom",
  //   subtitle: "",
  // }
  {
    src: "/car_lot.jpg",
    alt: "Elegant BMW luxury sedans in a modern white showroom",
    subtitle: "",
  }
]

export function AutoMarketHero() {
  const { toast } = useToast()
  const pathname = usePathname()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [language, setLanguage] = useState("EN")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle image cycling with smoother transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  // Handle scroll effect for navbar with optimized performance
  useEffect(() => {
    let frameId: number | null = null
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrolled = currentScrollY > 20

      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }

      lastScrollY = currentScrollY
      frameId = null
    }

    const onScroll = () => {
      if (frameId === null) {
        frameId = requestAnimationFrame(handleScroll)
      }
    }

    window.addEventListener("scroll", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [scrolled])

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()

      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    toast({
      title: `Language changed to ${lang}`,
      description: "This is a demo with limited functionality.",
      variant: "default",
    })
  }

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const browseAppUrl = process.env.NEXT_PUBLIC_BROWSE_APP_URL
    window.location.href = browseAppUrl || '#'
  }

  const mainNavItems = [
    {
      id: "home",
      href: "/",
      label: "Home",
    },
    // {
    //   id: "shop",
    //   href: process.env.NEXT_PUBLIC_BROWSE_APP_URL || "https://browse.automarket.example.com",
    //   label: "Shop Cars",
    // },
    // {
    //   id: "about",
    //   href: "/about",
    //   label: "About Us",
    // },
    // {
    //   id: "blog",
    //   href: "/blog",
    //   label: "Blog",
    // },
    // {
    //   id: "contact",
    //   href: "/contact",
    //   label: "Contact Us",
    // },
  ]

  const languages = [
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "fr", label: "FR" },
    { code: "de", label: "DE" },
  ]

  return (
    <section className="relative content-section min-h-screen bg-[#0f3460] overflow-hidden">
      {/* Additional decorative elements for visual balance */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      {/* Dynamic Background Images with Crossfade */}
      {/* <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentImageIndex === index ? 1 : 0,
              zIndex: currentImageIndex === index ? 1 : 0,
            }}
            transition={{
              opacity: { duration: 1.2, ease: "easeInOut" },
              zIndex: { delay: currentImageIndex === index ? 0 : 0.8 },
            }}
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-blue-900/85 via-blue-900/75 to-blue-900/90" />

            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-cover object-center"
              priority={index === 0}
              quality={90}
              sizes="100vw"
            />
          </motion.div>
        ))}
      </div> */}

      {/* Integrated Navigation Bar */}
      <motion.header
        className={cn(
          "sticky top-0 z-50 mx-4 sm:mx-8 md:mx-12 lg:mx-16 mt-3 sm:mt-4 transition-all duration-300",
          scrolled
            ? "shadow-lg py-1.5 sm:py-2 rounded-lg bg-gradient-to-br from-white/80 to-white/70 backdrop-blur-md border border-white/20"
            : "py-2 sm:py-4 rounded-lg bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10",
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full flex items-center justify-between px-4">
          {/* Logo and Navigation Group */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div
                className="relative h-10 w-auto"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image
                  src="https://s3.automarket.example.com/automarket/automarket-logo.png"
                  alt="AutoMarket Logo"
                  width={180}
                  height={48}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center ml-8">
              <nav>
                <ul className="flex space-x-6">
                  {mainNavItems.map((item) => (
                    <li key={item.id}>
                      <motion.div
                        className="relative"
                        whileHover={{
                          scale: 1.03,
                          transition: { type: "spring", stiffness: 300, damping: 20 },
                        }}
                      >
                        <a
                          href={item.href}
                          onClick={(e) => handleNavigation(e, item.href)}
                          className={cn(
                            "flex items-center text-base font-circular-medium transition-colors relative",
                            pathname === item.href
                              ? "text-[#FF385C]"
                              : scrolled
                                ? "text-gray-800 hover:text-[#FF385C]"
                                : "text-white hover:text-[#FF385C]",
                          )}
                        >
                          {item.label}

                          <span
                            className={cn(
                              "absolute -bottom-1 left-0 h-0.5 bg-[#FF385C] transition-all duration-300 ease-out",
                              pathname === item.href ? "w-full" : "w-0 group-hover:w-full",
                            )}
                          />
                        </a>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Right Side Elements */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center space-x-1 transition-colors px-2 py-1 rounded-md border border-transparent",
                  scrolled
                    ? "text-gray-700 hover:text-gray-900 hover:border-gray-200"
                    : "text-white hover:text-white/90 hover:border-white/20",
                )}
              >
                <Globe className="h-4 w-4 stroke-[2.5px]" />
                <span className="text-sm font-medium">{language}</span>
                <ChevronDown className="h-3 w-3 opacity-70 stroke-[2.5px]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang.label)}>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Icon */}
            <button
              className={cn(
                "transition-colors",
                scrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-white/90",
              )}
              onClick={(e) => handleNavigation(e, "#")}
              aria-label="User account"
            >
              <User className="h-5 w-5 stroke-[2.5px]" />
            </button>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              <Link href="/login" passHref>
                <Button
                  variant={scrolled ? "outline" : "secondary"}
                  size="sm"
                  className={cn(
                    "rounded-lg px-6 font-medium",
                    scrolled
                      ? "border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      : "bg-white/10 text-white hover:bg-white/20 border-white/20",
                  )}
                >
                  <LogIn className="h-4 w-4 mr-1.5 stroke-[2.5px]" />
                  Log In
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button
                  size="sm"
                  className="rounded-lg px-6 bg-[#FF385C] text-white hover:bg-[#FF385C]/80 transition-colors font-medium"
                >
                  <UserPlus className="h-4 w-4 mr-1.5 stroke-[2.5px]" />
                  Register Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 lg:hidden">
            {/* Mobile Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn("flex items-center space-x-1", scrolled ? "text-gray-700" : "text-white")}
              >
                <Globe className="h-4 w-4 stroke-[2.5px]" />
                <span className="text-sm font-medium">{language}</span>
                <ChevronDown className="h-3 w-3 opacity-70 stroke-[2.5px]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang.label)}>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile User Icon */}
            <button
              className={scrolled ? "text-gray-700" : "text-white"}
              onClick={(e) => handleNavigation(e, "#")}
              aria-label="User account"
            >
              <User className="h-5 w-5 stroke-[2.5px]" />
            </button>

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    "p-2 transition-colors",
                    scrolled ? "text-gray-700 hover:text-[#FF385C]" : "text-white hover:text-[#FF385C]",
                  )}
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6 stroke-[2.5px]" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex h-16 items-center justify-between border-b px-4">
                  <div className="flex items-center">
                    <img src="/AutoMarket-logo.svg" alt="AutoMarket Logo" className="h-6 object-contain" />
                  </div>
                </div>

                {/* Mobile Navigation */}
                <div className="py-4 px-4">
                  <nav>
                    <ul className="space-y-1">
                      {mainNavItems.map((item) => (
                        <li key={item.id}>
                          <a
                            href={item.href}
                            onClick={(e) => handleNavigation(e, item.href)}
                            className={cn(
                              "flex w-full items-center py-3 px-4 rounded-md text-base font-circular-medium transition-colors",
                              pathname === item.href
                                ? "bg-[#FF385C]/10 text-[#FF385C]"
                                : "text-gray-800 hover:bg-gray-100 hover:text-[#FF385C]",
                            )}
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  {/* Mobile Auth Buttons */}
                  <div className="mt-8 space-y-6 flex flex-col">
                    <Link href="/login" passHref className="w-full">
                      <Button
                        variant="outline"
                        className="w-full rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
                      >
                        <LogIn className="h-4 w-4 mr-1.5 stroke-[2.5px]" />
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register" passHref className="w-full mt-8">
                      <Button className="w-full rounded-lg bg-[#FF385C] text-white hover:bg-[#FF385C]/80 transition-colors font-medium">
                        <UserPlus className="h-4 w-4 mr-1.5 stroke-[2.5px]" />
                        Register Free
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile Contact Info */}
                  <div className="mt-8 border-t pt-4">
                    <div className="text-sm font-circular-book text-gray-600">
                      <div className="flex items-center mb-2">
                        <Phone className="h-4 w-4 mr-2 text-[#FF385C] stroke-[2.5px]" />
                        <span>+88 1900 6789 56</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-[#FF385C] stroke-[2.5px]" />
                        <span>test@example.com</span>
                      </div>
                    </div>

                    {/* Mobile Social Icons */}
                    <div className="flex items-center space-x-4 mt-4">
                      <a
                        href="#"
                        onClick={(e) => handleNavigation(e, "#")}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-[#FF385C] hover:text-white transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter className="h-4 w-4 stroke-[2.5px]" />
                      </a>
                      <a
                        href="#"
                        onClick={(e) => handleNavigation(e, "#")}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-[#FF385C] hover:text-white transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-4 w-4 stroke-[2.5px]" />
                      </a>
                      <a
                        href="#"
                        onClick={(e) => handleNavigation(e, "#")}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-[#FF385C] hover:text-white transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-4 w-4 stroke-[2.5px]" />
                      </a>
                      <a
                        href="#"
                        onClick={(e) => handleNavigation(e, "#")}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-[#FF385C] hover:text-white transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4 stroke-[2.5px]" />
                      </a>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      {/* Spacer to prevent content from being hidden under sticky header */}
      <div className="h-12 sm:h-16 md:h-20 lg:h-24"></div>

      {/* Image Navigation Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-20 hidden sm:flex justify-center space-x-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              currentImageIndex === index ? "bg-[#FF385C] w-8" : "bg-white/50 hover:bg-white/80"
            }`}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>

      {/* Centered Logo */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src="https://s3.automarket.example.com/automarket/automarket-logo.png"
            alt="AutoMarket Logo"
            width={400}
            height={120}
            className="h-32 sm:h-40 md:h-48 lg:h-56 w-auto object-contain"
            priority
          />
        </motion.div> */}
      </div>

    </section>
  )
}
