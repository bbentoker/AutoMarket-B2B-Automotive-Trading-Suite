"use client"

import { motion } from "framer-motion"
import { Clock, Phone, Linkedin } from "lucide-react"

export function ContactInfo() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Hours */}
          <motion.div
            className="bg-gray-50 rounded-xl p-8 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-[#FF385C] p-3 rounded-full">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monday – Friday:</span>
                <span className="font-medium text-gray-900">09:00 – 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saturday & Sunday:</span>
                <span className="font-medium text-gray-900">13:00 – 17:00</span>
              </div>
            </div>
          </motion.div>

          {/* Prefer to Talk */}
          <motion.div
            className="bg-gray-50 rounded-xl p-8 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-[#FF385C] p-3 rounded-full">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Prefer to Talk?</h3>
            </div>
            <p className="text-gray-600 mb-4">Give us a call during business hours and speak directly with our team.</p>
            <a
              href="tel:+46 40 12 92 20"
              className="inline-flex items-center text-[#FF385C] hover:text-[#E62E50] font-medium transition-colors"
            >
              <Phone className="h-4 w-4 mr-2" />
              +46 40 12 92 20
            </a>
          </motion.div>

          {/* Connect With Us */}
          <motion.div
            className="bg-gray-50 rounded-xl p-8 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-[#FF385C] p-3 rounded-full">
                <Linkedin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Connect With Us</h3>
            </div>
            <p className="text-gray-600 mb-4">Follow us on LinkedIn for industry updates and company news.</p>
            <a
              href="https://linkedin.com/company/AutoMarket-com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#FF385C] hover:text-[#E62E50] font-medium transition-colors"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              {""}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
