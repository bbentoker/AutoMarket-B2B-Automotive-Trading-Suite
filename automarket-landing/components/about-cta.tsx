"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, UserPlus } from "lucide-react"

export function AboutCTA() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-red-900/20">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Transform Your Dealership?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join the growing network of successful dealerships who trust AutoMarket for premium vehicle sourcing across
            Europe.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" passHref>
              <Button
                size="lg"
                className="group bg-[#FF385C] hover:bg-[#E62E50] text-white px-8 py-4 rounded-lg hover:scale-105 transition-all duration-300"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Register Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact" passHref>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 px-8 py-4 rounded-lg hover:scale-105 transition-all duration-300"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
