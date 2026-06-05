"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"

export function ContactHero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-red-900/20 py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF385C] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF385C] opacity-5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

      {/* Header with Home button */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center px-3 sm:px-4 py-2 rounded-lg backdrop-blur-md bg-black/20 border border-white/10 text-white hover:text-[#FF385C] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </div>

      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-block bg-[#FF385C] text-white px-6 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Contact Us
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Get In Touch
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-white/90 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            We'd love to hear from you. Whether you have a question, want to Register Free, or need help — we're
            here to help.
          </motion.p>

          {/* Quick contact info */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Mail className="h-6 w-6 text-[#FF385C] mx-auto mb-2" />
              <p className="text-white/80 text-sm">Email Us</p>
              <p className="text-white font-medium">info@automarket.example.com</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Phone className="h-6 w-6 text-[#FF385C] mx-auto mb-2" />
              <p className="text-white/80 text-sm">Call Us</p>
              <p className="text-white font-medium">+46 40 12 92 20</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <MapPin className="h-6 w-6 text-[#FF385C] mx-auto mb-2" />
              <p className="text-white/80 text-sm">Visit Us</p>
              <p className="text-white font-medium">Svedala, Sweden</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
