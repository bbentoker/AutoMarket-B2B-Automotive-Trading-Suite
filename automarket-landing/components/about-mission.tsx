"use client"

import { motion } from "framer-motion"
import { Target, Eye } from "lucide-react"

export function AboutMission() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Mission */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-[#FF385C] p-3 rounded-full">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our mission is to simplify cross-border car trading for dealerships through a smart, transparent, and
              efficient platform. We remove traditional import hurdles and offer direct access to premium, inspected
              vehicles at the most competitive prices.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#FF385C]">
              <p className="text-gray-700 italic">
                "We believe every dealership deserves access to quality vehicles without the complexity of traditional
                import processes."
              </p>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-[#FF385C] p-3 rounded-full">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              A Europe where every dealership can access premium vehicles with fast delivery, transparent pricing, and
              full documentation support—seamlessly across all markets.
            </p>
            <div className="bg-[#FF385C]/5 p-6 rounded-lg border border-[#FF385C]/20">
              <h3 className="font-semibold text-gray-900 mb-2">By 2030, We Aim To:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Support over 10,000 dealerships in sourcing vehicles daily</li>
                <li>• Reduce vehicle delivery times by 40%</li>
                <li>• Streamline paperwork and compliance to near-zero dealer involvement</li>
                <li>• Ensure 100% vehicle inspections across all listed inventory</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
