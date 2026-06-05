"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Mail, Send, Tag, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

const categories = [
  { name: "Market Trends", count: 12 },
  { name: "Trading Guide", count: 8 },
  { name: "Market Analysis", count: 15 },
  { name: "Best Practices", count: 6 },
  { name: "Technology", count: 9 },
  { name: "Regulations", count: 4 },
]

const popularTags = [
  "Cross-border trading",
  "Vehicle inspection",
  "Import documentation",
  "Market analysis",
  "Digital transformation",
  "European standards",
  "ROI optimization",
  "Wholesale",
  "B2B",
  "Automotive trends",
]

const recentPosts = [
  {
    title: "The Future of Cross-Border Car Trading",
    date: "2024-01-15",
    slug: "future-cross-border-car-trading-europe",
  },
  {
    title: "Complete Guide to Vehicle Import Documentation",
    date: "2024-01-12",
    slug: "complete-guide-vehicle-import-documentation",
  },
  {
    title: "Market Analysis: Premium SUV Demand",
    date: "2024-01-10",
    slug: "market-analysis-premium-suv-demand-q1-2024",
  },
]

export function BlogSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Search functionality",
      description: "Search feature will be implemented soon.",
    })
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our blog updates.",
      })
      setEmail("")
    }
  }

  return (
    <div className="space-y-8">
      {/* Search Widget */}
      

      {/* Newsletter Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-br from-[#FF385C] to-[#E62E50] rounded-xl text-white p-6"
      >
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Subscribe to Blog
        </h3>
        <p className="text-sm text-white/90 mb-4">
          Get the latest automotive industry insights delivered to your inbox.
        </p>
        <form onSubmit={handleSubscribe} className="space-y-3">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
            required
          />
          <Button type="submit" className="w-full bg-white text-[#FF385C] hover:bg-white/90">
            <Send className="h-4 w-4 mr-2" />
            Subscribe
          </Button>
        </form>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#FF385C]" />
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <button
              key={index}
              className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-gray-700">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Popular Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-[#FF385C]" />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-[#FF385C] hover:text-white hover:border-[#FF385C] transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#FF385C]" />
          Recent Posts
        </h3>
        <div className="space-y-4">
          {recentPosts.map((post, index) => (
            <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <h4 className="font-medium text-gray-900 mb-1 hover:text-[#FF385C] cursor-pointer transition-colors">
                {post.title}
              </h4>
              <p className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
