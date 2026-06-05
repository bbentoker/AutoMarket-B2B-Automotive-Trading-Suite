"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function AboutStory() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gray-50">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-lg text-gray-600">How AutoMarket came to life</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-lg text-gray-700 leading-relaxed">
                It all began in a showroom, where three automotive veterans grew tired of the inefficiencies in car
                imports for dealerships.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                After dealing with hidden fees, unreliable suppliers, poor inspections, and slow paperwork, they set out
                to build a smarter, more transparent solution for dealers across Europe.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                What started as a local idea has grown into one of Europe's most trusted B2B automotive platforms,
                connecting dealers across borders with ease.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-700 italic">
                  "We didn't set out to build just another marketplace—we wanted to create a platform that truly
                  understands and serves professional car dealers."
                </p>
                <p className="text-sm text-gray-500 mt-2">— AutoMarket Founders</p>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/luxury-vehicles-display.jpeg"
                  alt="AutoMarket office and team"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#FF385C] text-white p-4 rounded-lg shadow-lg">
                <p className="font-semibold">Founded in 2024</p>
                <p className="text-sm opacity-90">Brussels, Belgium</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutStory
