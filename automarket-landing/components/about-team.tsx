"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Mail, Phone } from "lucide-react"

const teamMembers = [
  {
    name: "Noor Sangin",
    position: "CEO & Founder",
    image: "/placeholder.svg?height=300&width=300",
    bio: "15+ years in the automotive industry, multiple dealerships",
    email: "Noor@automarket.example.com",
    phone: "+46 40 12 92 20", 
  },
  {
    name: "Camilla Sangin",
    position: "Head Of Operations",
    image: "/placeholder.svg?height=300&width=300",
    bio: "11+ years in dealership sales, B2B leadership",
    email: "Camilla@automarket.example.com",
    phone: "+46 40 12 92 20",
  },
  {
    name: "Sophie Dubois",
    position: "Head Of Administration",
    image: "/placeholder.svg?height=300&width=300",
    bio: "8+ years in dealership admin",
    email: "info@automarket.example.com",
    phone: "+46 40 12 92 20",
  },
  {
    name: "Carl Sundström",
    position: "Head of Purchase",
    image: "/placeholder.svg?height=300&width=300",
    bio: "7+ years in car procurement",
    email: "carl@automarket.example.com",
    phone: "+46 40 12 92 20",
  },
]

export function AboutTeam() {
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Meet our leadership team driving innovation in autmotive B2B trading.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className="group h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
                {/* <div className="relative h-64 overflow-hidden">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div> */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-[#FF385C] font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm mb-4 flex-1">{member.bio}</p>
                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
