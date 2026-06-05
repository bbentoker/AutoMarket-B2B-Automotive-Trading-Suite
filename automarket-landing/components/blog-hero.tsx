"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, TrendingUp, Users, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function BlogHero() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const stats = [
    { icon: BookOpen, label: "Articles", value: "150+" },
    { icon: Users, label: "Readers", value: "10K+" },
    { icon: TrendingUp, label: "Monthly Views", value: "50K+" },
  ]

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
      <div className="absolute inset-0 bg-[url('/luxury-vehicles-display.jpeg')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/60"></div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-2 bg-[#FF385C]/20 text-[#FF385C] rounded-full text-sm font-medium mb-6">
              Industry Insights & News
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AutoMarket <span className="text-[#FF385C]">Blog</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Stay ahead in the automotive industry with expert insights, market trends, and trading strategies for
              professional dealers.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSearch}
            className="max-w-md mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#FF385C] focus:ring-[#FF385C]"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#FF385C] hover:bg-[#FF385C]/80 px-4 py-1.5"
              >
                Search
              </Button>
            </div>
          </motion.form>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FF385C]/20 rounded-full mb-4">
                  <stat.icon className="h-6 w-6 text-[#FF385C]" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
