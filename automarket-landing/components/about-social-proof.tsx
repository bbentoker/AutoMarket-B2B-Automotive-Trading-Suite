"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function AboutSocialProof() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Trusted by Leading Dealerships</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join the expanding network of dealers who rely on AutoMarket to source top-tier vehicles.
          </p>
        </motion.div>

        {/* Client logos */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
            <div className="flex items-center justify-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo2322-EAfMSR8Sk0rmQViHbzYXVkhk8avE10.png"
                alt="Göka Drive - Trusted Partner"
                width={200}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-center text-gray-600 mt-4 text-sm">
              "AutoMarket has transformed how we source premium vehicles. The process is transparent, fast, and reliable."
            </p>
            <p className="text-center text-gray-500 mt-2 text-xs">— Garage GDS, Dealership Partner</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-[#FF385C] mb-2">98%</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#FF385C] mb-2">9 Days</div>
            <div className="text-gray-600">Average Delivery Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#FF385C] mb-2">100%</div>
            <div className="text-gray-600">Inspected Vehicles</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
