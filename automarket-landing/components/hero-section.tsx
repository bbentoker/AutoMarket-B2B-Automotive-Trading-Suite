"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useAnimation, useScroll, useTransform } from "framer-motion"
import { Search, ShoppingBag, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card"

export function HeroSection() {
  const pathname = usePathname()
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // For scroll-based animations
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, 100])

  // For floating elements animation
  const floatingControls = useAnimation()

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  useEffect(() => {
    setIsVisible(true)

    // Start floating animation
    floatingControls.start({
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        ease: "easeInOut",
        times: [0, 0.5, 1],
      },
    })

    // Reference to the current video element
    const videoElement = videoRef.current

    // Only attempt to play if the video element exists
    if (videoElement) {
      // Create a play promise
      const playPromise = videoElement.play()

      // If the browser supports promises, handle potential errors
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
            console.log("Video playback started")
          })
          .catch((error) => {
            // Auto-play was prevented or other error occurred
            console.log("Video autoplay was prevented:", error)

            // Set video to paused state as fallback
            videoElement.pause()
          })
      }
    }

    // Cleanup function to handle component unmounting
    return () => {
      // If the video element still exists when component unmounts
      if (videoElement) {
        videoElement.pause()
        videoElement.src = ""
        videoElement.load()
      }
    }
  }, [floatingControls])

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const navbar = document.querySelector("header")
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 80
      const offset = navbarHeight + 20

      const sectionPosition = section.getBoundingClientRect().top
      const offsetPosition = sectionPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  // Close mobile menu after clicking a link
  const handleMobileNavClick = (sectionId: string) => {
    setIsOpen(false)
    setShowMobileSearch(false)

    // Small delay to ensure the sheet closes before scrolling
    setTimeout(() => {
      scrollToSection(sectionId)
    }, 300)
  }

  const mainNavItems = [
    { href: "#", label: "Shop Cars", icon: <ShoppingBag className="h-4 w-4 mr-1.5" /> },
    { href: "#how-it-works", label: "How it works", isScroll: true, sectionId: "how-it-works" },
    { href: "#", label: "About Us" },
    { href: "#", label: "Contact" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const benefitItems = [
    { text: "Streamlined export process", icon: <CheckCircle2 className="h-4 w-4 text-yellow-700" /> },
    { text: "Verified premium vehicles", icon: <CheckCircle2 className="h-4 w-4 text-yellow-700" /> },
    { text: "Secure cross-border transactions", icon: <CheckCircle2 className="h-4 w-4 text-yellow-700" /> },
  ]

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white min-h-screen">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        {/* Fallback background in case video fails */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100"></div>

        <video ref={videoRef} className="h-full w-full object-cover opacity-10" muted loop playsInline preload="auto">
          <source src="https://v0.blob.com/ETZAR.mp4" type="video/mp4" />
          {/* Add fallback text for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/10 to-gray-200/10" />
      </div>

      {/* Car Image Background - Right Side */}
      <div className="absolute right-0 top-0 bottom-0 z-0 w-1/2 hidden lg:block">
        <div className="absolute inset-0 bg-contain bg-no-repeat bg-center" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column */}
          <div className="lg:pr-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Drive Your Dream Car Across Borders
            </h1>
            <p className="mt-4 text-lg text-gray-500">Experience seamless cross-border car shopping with us.</p>
            <div className="mt-8 flex gap-4">
              <Button variant="default" onClick={() => handleMobileNavClick("how-it-works")}>
                How it works
              </Button>
              <Button variant="outline">Browse All Cars</Button>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex justify-center lg:justify-end">
            <GlassmorphicCard className="p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Search Cars</h2>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" onClick={() => setShowMobileSearch(!showMobileSearch)}>
                      {showMobileSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </SheetTrigger>
                </Sheet>
              </div>
              <Input type="text" placeholder="Search for your dream car" className="mt-4" disabled={!isOpen} />
            </GlassmorphicCard>
          </div>
        </div>
      </div>
    </section>
  )
}
