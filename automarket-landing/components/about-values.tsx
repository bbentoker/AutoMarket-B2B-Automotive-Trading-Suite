"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Users, Heart } from "lucide-react"

const values = [
  {
    icon: Shield,
    title: "Transparency",
    description:
      "Clear pricing, straightforward processes, inspected vehicles and complete traceability from purchase to delivery.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Continuous platform improvements for faster, smarter vehicle sourcing.",
  },
  {
    icon: Users,
    title: "Customer-First",
    description: "Every decision is made with our dealer partners' success in mind.",
  },
  {
    icon: Heart,
    title: "Reliability",
    description: "We deliver consistent quality and dependable service, every time.",
  },
]

export function AboutValues() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gray-50">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The principles that drive everything we do at AutoMarket
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="bg-[#FF385C] p-3 rounded-full w-fit mb-6">
                <value.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
