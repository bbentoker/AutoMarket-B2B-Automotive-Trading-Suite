"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, ArrowRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const relatedPosts = [
  {
    id: 2,
    title: "Complete Guide to Vehicle Import Documentation",
    excerpt: "Everything you need to know about paperwork, compliance, and regulations for importing vehicles in 2024.",
    category: "Trading Guide",
    author: "Michael Chen",
    date: "2024-01-12",
    readTime: "8 min read",
    image: "/bmw-luxury-sedans-showroom.jpeg",
    slug: "complete-guide-vehicle-import-documentation",
  },
  {
    id: 3,
    title: "Market Analysis: Premium SUV Demand in Q1 2024",
    excerpt: "Analyzing the latest trends in premium SUV sales and what it means for dealers across Europe.",
    category: "Market Analysis",
    author: "Emma Rodriguez",
    date: "2024-01-10",
    readTime: "6 min read",
    image: "/luxury-vehicles-display.jpeg",
    slug: "market-analysis-premium-suv-demand-q1-2024",
  },
  {
    id: 4,
    title: "How to Maximize ROI on Vehicle Inspections",
    excerpt: "Best practices for ensuring quality inspections while maintaining cost-effectiveness in your operations.",
    category: "Best Practices",
    author: "David Thompson",
    date: "2024-01-08",
    readTime: "7 min read",
    image: "/bmw-x5-interior.png",
    slug: "maximize-roi-vehicle-inspections",
  },
]

export function RelatedPosts() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Related Articles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Continue exploring our insights on automotive trading, market trends, and industry best practices.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {relatedPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-3 group-hover:text-[#FF385C] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center bg-gradient-to-r from-[#FF385C] to-[#E62E50] rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Stay Updated with Industry Insights</h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest automotive trading insights, market analysis, and expert tips
            delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button className="bg-white text-[#FF385C] hover:bg-white/90 px-6 py-3">
              Subscribe Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
