"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { ArrowRight, UserPlus, Search, Car, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { SectionHeading } from "@/components/ui/section-heading"
import Link from "next/link"

export function GettingStartedSection() {
  const { toast } = useToast()
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: 0.15,
    margin: "0px 0px -150px 0px",
  })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        controls.start("visible")
      }, 150)

      return () => clearTimeout(timer)
    }
  }, [controls, isInView])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 12,
        duration: 0.6,
      },
    },
  }

  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault()
    toast({
      title: "Navigation Disabled",
      description: "Only the landing page is currently available.",
      variant: "default",
    })
  }

  // Updated steps data with consistent styling
  const stepsData = [
    {
      icon: <UserPlus className="h-5 w-5" />,
      title: "Register Free",
      description: "Create a dealer account to access our platform.",
      number: "01",
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Browse Cars",
      description: "Explore hundreds of vehicles tailored to your business needs.",
      number: "02",
    },
    {
      icon: <Car className="h-5 w-5" />,
      title: "Reserve & Make Offers",
      description: "Reserve or submit offers on cars that suit your dealership.",
      number: "03",
    },
    {
      icon: <FileCheck className="h-5 w-5" />,
      title: "End-to-End Service",
      description: "Track each car's status from pickup to delivery and document processing in your dashboard.",
      number: "04",
    },
  ]

  return (
    <section className="overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-red-900/20 py-16 sm:py-20 md:py-24 relative">
      {/* Decorative elements - subtle gradient overlays */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF385C] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl bg-gradient-to-br from-red-900/10 to-gray-900/30 rounded-[40%] blur-3xl"></div>

      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div ref={ref} initial="hidden" animate={controls} variants={containerVariants} className="mx-auto">
          <SectionHeading
            badge="Get Started"
            title="Easy Steps to Get Started"
            description="Start sourcing premium vehicles with our streamlined process designed for dealerships"
            badgeClassName="bg-[#FF385C] text-white border border-red-500/20 shadow-lg"
            titleClassName="text-white"
            descriptionClassName="text-gray-300"
          />

          {/* Steps Grid with connecting lines */}
          <div className="relative">
            {/* Connecting line for desktop - more subtle */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent transform -translate-y-1/2 z-0"></div>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative z-10"
            >
              {stepsData.map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  custom={index}
                  transition={{
                    delay: 0.1 + index * 0.1,
                    duration: 0.5,
                  }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:bg-gray-800/70 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Step Number - Enhanced prominence with consistent styling */}
                  <div className="absolute right-3 top-3 flex items-center justify-center">
                    <span className="text-5xl font-bold text-gray-700/30 select-none group-hover:text-gray-600/40 transition-colors duration-300">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon - Consistent styling with brand colors */}
                  <div className="mb-5 relative z-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FF385C] text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                      {step.icon}
                    </div>
                  </div>

                  {/* Content - Improved typography and consistent colors */}
                  <h3 className="text-xl font-bold mb-2 text-white relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 relative z-10 group-hover:text-gray-200 transition-colors duration-300">
                    {step.description}
                  </p>

                  {/* Subtle hover indicator */}
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#FF385C] to-red-400 group-hover:w-full transition-all duration-500 ease-in-out"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* CTA Buttons - Enhanced styling with shadows and contrast */}
          <motion.div variants={itemVariants} className="mt-12 text-center" transition={{ delay: 0.5 }}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/shop" passHref>
                <Button
                  size="lg"
                  variant="default"
                  rounded="lg"
                  className="group w-full sm:w-auto hover:scale-105 transition-all duration-300 bg-[#FF385C] text-white hover:bg-[#E62E50] border border-red-500/20 shadow-lg hover:shadow-xl"
                >
                  Browse Our Cars
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 stroke-[2.5px]" />
                </Button>
              </Link>

              <Link href="/register" passHref>
                <Button
                  size="lg"
                  variant="outline"
                  rounded="lg"
                  className="group w-full sm:w-auto hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 shadow-lg hover:shadow-xl"
                >
                  <UserPlus className="mr-2 h-4 w-4 stroke-[2.5px]" />
                  Register Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 stroke-[2.5px]" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
