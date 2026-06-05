"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function AboutHero() {
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
            About AutoMarket
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Who We Are
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-white/90 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            We're a Belgium-based company revolutionizing how dealerships source and import premium vehicles across
            Europe through our trusted B2B platform.
          </motion.p>

          {/* Company info */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="text-2xl font-bold text-[#FF385C] mb-1">2024</h3>
              <p className="text-white/80 text-sm">Founded</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="text-2xl font-bold text-[#FF385C] mb-1">2,831</h3>
              <p className="text-white/80 text-sm">Cars Sold</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="text-2xl font-bold text-[#FF385C] mb-1">1,200+</h3>
              <p className="text-white/80 text-sm">Dealer Clients</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
