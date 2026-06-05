"use client"

import React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Linkedin, Mail, MapPin, Phone, Send, ExternalLink, ArrowRight, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { IconContainer } from "@/components/ui/icon-container"
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal"
import { CookiePolicyModal } from "@/components/cookie-policy-modal"
import { TermsAndConditionsModal } from "@/components/terms-and-conditions-modal"

export function SiteFooter() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [focusedSection, setFocusedSection] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showCookieModal, setShowCookieModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  // Handle scroll to top button visibility
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
        variant: "default",
      })
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault()
    toast({
      title: "Navigation Disabled",
      description: "Only the landing page is currently available.",
      variant: "default",
    })
  }

  const footerLinks = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "#" },
        { name: "Press", href: "#" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Services",
      links: [
        { name: "Browse Cars", href: process.env.NEXT_PUBLIC_BROWSE_APP_URL },
        { name: "Sell Cars", href: process.env.NEXT_PUBLIC_BROWSE_APP_URL },
        { name: "Register Free", href: "/register" },
        { name: "Dealer Login", href: "/login" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#" },
        { name: "FAQs", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Cookie Policy", href: "#" },
      ],
    },
  ]

  const socialLinks = [{ name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "#" }]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <>
      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
      
      {/* Cookie Policy Modal */}
      <CookiePolicyModal 
        isOpen={showCookieModal} 
        onClose={() => setShowCookieModal(false)} 
      />
      
      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
      
      <footer className="bg-gray-50 border-t border-gray-100">
      {/* Main Footer Content */}
      <div className="container px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 gap-y-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Company Info */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <div className="flex flex-col items-start gap-2 mb-6">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
              >
                <img src="/AutoMarket-logo.svg" alt="AutoMarket" className="h-10" />
              </motion.div>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              Your trusted partner in cross-border vehicle trade, connecting dealers with high-quality inspected cars at
              competitive prices.
            </p>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Subscribe to our newsletter</h3>
              {isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[#FF385C] font-medium"
                >
                  Thanks for subscribing!
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-full">
                  <div className="relative flex-1 w-full max-w-xs">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl border-gray-200/80 focus:border-[#FF385C]/50 focus:ring-[#FF385C]/50 focus-visible:ring-[#FF385C]/50 focus-visible:ring-offset-0 pr-10 w-full"
                      required
                    />
                    <Button
                      type="submit"
                      size="icon-sm"
                      rounded="lg"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#FF385C] hover:bg-[#E62E50] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                    >
                      <Send className="h-4 w-4 stroke-[2.5px]" />
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <IconContainer variant="subtle" size="sm" rounded="full" className="flex-shrink-0">
                  <MapPin className="h-4 w-4 stroke-[2.5px]" />
                </IconContainer>
                <div>
                  <p className="text-sm text-gray-600">Kersbeeklaan 308, 1180 Ukkel</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IconContainer variant="subtle" size="sm" rounded="full" className="flex-shrink-0">
                  <Phone className="h-4 w-4 stroke-[2.5px]" />
                </IconContainer>
                <div>
                  <p className="text-sm text-gray-600">+46 40 12 92 20</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IconContainer variant="subtle" size="sm" rounded="full" className="flex-shrink-0">
                  <Mail className="h-4 w-4 stroke-[2.5px]" />
                </IconContainer>
                <div>
                  <p className="text-sm text-gray-600">Info@automarket.example.com
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((column, idx) => (
            <motion.div
              key={idx}
              className={`${column.title === "Company" ? "relative" : ""}`}
              onMouseEnter={() => setFocusedSection(column.title)}
              onMouseLeave={() => setFocusedSection(null)}
              variants={itemVariants}
            >
              <h3
                className={`text-sm font-semibold mb-3 sm:mb-4 transition-colors duration-300 ${
                  column.title === "Company"
                    ? focusedSection === "Company"
                      ? "text-[#FF385C]"
                      : "text-gray-900"
                    : "text-gray-900"
                }`}
              >
                {column.title}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    {link.href === "#key-features" ? (
                      <button
                        onClick={() => {
                          const section = document.getElementById("key-features")
                          if (section) {
                            section.scrollIntoView({ behavior: "smooth" })
                          }
                        }}
                        className={`group flex items-center text-gray-600 hover:text-[#FF385C] transition-colors duration-300 text-sm ${
                          column.title === "Company" ? "font-medium" : ""
                        }`}
                      >
                        {column.title === "Company" && (
                          <span className="relative inline-flex items-center">
                            {link.name}
                            <span className="absolute -bottom-0.5 left-0 h-[2px] w-full scale-x-0 rounded-full bg-[#FF385C] opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"></span>
                          </span>
                        )}
                        {column.title !== "Company" && link.name}
                      </button>
                    ) : link.name === "Register Free" || link.name === "Dealer Login" || link.name === "Browse Cars" || link.name === "Sell Cars" || link.name === "About Us" || link.name === "Contact" ? (
                      <a
                        href={link.href}
                        target={link.name === "Browse Cars" || link.name === "Sell Cars" ? "_blank" : undefined}
                        rel={link.name === "Browse Cars" || link.name === "Sell Cars" ? "noopener noreferrer" : undefined}
                        className={`group flex items-center text-gray-600 hover:text-[#FF385C] transition-colors duration-300 text-sm ${
                          column.title === "Company" ? "font-medium" : ""
                        }`}
                      >
                        {column.title === "Company" && (
                          <span className="relative inline-flex items-center">
                            {link.name}
                            <span className="absolute -bottom-0.5 left-0 h-[2px] w-full scale-x-0 rounded-full bg-[#FF385C] opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"></span>
                          </span>
                        )}
                        {column.title !== "Company" && link.name}
                        {(link.name === "Browse Cars" || link.name === "Sell Cars") && (
                          <ExternalLink className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                        {column.title === "Company" && link.name === "About Us" && (
                          <ExternalLink className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                        {column.title === "Company" && link.name === "Contact" && (
                          <ArrowRight className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        )}
                      </a>
                    ) : (
                      <button
                        onClick={
                          link.name === "Privacy Policy" 
                            ? () => setShowPrivacyModal(true) 
                            : link.name === "Cookie Policy"
                            ? () => setShowCookieModal(true)
                            : link.name === "Terms of Service"
                            ? () => setShowTermsModal(true)
                            : handleNavigation
                        }
                        className={`group flex items-center text-gray-600 hover:text-[#FF385C] transition-colors duration-300 text-sm ${
                          column.title === "Company" ? "font-medium" : ""
                        }`}
                      >
                        {column.title === "Company" && (
                          <span className="relative inline-flex items-center">
                            {link.name}
                            <span className="absolute -bottom-0.5 left-0 h-[2px] w-full scale-x-0 rounded-full bg-[#FF385C] opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"></span>
                          </span>
                        )}
                        {column.title !== "Company" && link.name}
                        {column.title === "Company" && link.name === "About Us" && (
                          <ExternalLink className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                        {column.title === "Company" && link.name === "Contact" && (
                          <ArrowRight className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Links */}
        <motion.div
          className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <motion.button
                  key={idx}
                  onClick={handleNavigation}
                  className="bg-white p-2 rounded-xl text-gray-600 hover:text-[#FF385C] border border-gray-200/80 hover:border-[#FF385C]/30 hover:shadow-[#FF385C]/5 transition-all duration-300 hover:shadow-md"
                  whileHover={{
                    y: -3,
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  aria-label={social.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx + 0.5, duration: 0.3 }}
                >
                  {React.cloneElement(social.icon, { className: "h-5 w-5 stroke-[2px]" })}
                </motion.button>
              ))}
            </div>

            <div className="text-sm text-gray-500">© {new Date().getFullYear()} AutoMarket. All rights reserved.</div>
          </div>
        </motion.div>
      </div>

      {/* Back to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-[#FF385C] text-white shadow-lg hover:shadow-[#FF385C]/20 z-50 transition-all duration-300 hover:scale-110"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ y: -3 }}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
    </>
  )
}
