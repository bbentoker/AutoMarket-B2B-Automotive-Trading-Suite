"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState, useEffect } from "react"

// Fallback data in case API fails
const fallbackBlogPosts = [
  {
    id: 1,
    title: "The Future of Cross-Border Car Trading in Europe",
    excerpt:
      "Exploring how digital platforms are revolutionizing the way dealerships source vehicles across European markets.",
    category: "Market Trends",
    date: "2024-01-15",
    readTime: "5 min read",
    image: "/premium-sports-cars-showroom.jpeg",
    slug: "future-cross-border-car-trading-europe",
    featured: true,
  },
  {
    id: 2,
    title: "Complete Guide to Vehicle Import Documentation",
    excerpt: "Everything you need to know about paperwork, compliance, and regulations for importing vehicles in 2024.",
    category: "Trading Guide",
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
    date: "2024-01-08",
    readTime: "7 min read",
    image: "/bmw-x5-interior.png",
    slug: "maximize-roi-vehicle-inspections",
  },
  {
    id: 5,
    title: "Digital Transformation in Automotive Wholesale",
    excerpt: "How technology is reshaping the wholesale automotive industry and what dealers need to know.",
    category: "Technology",
    date: "2024-01-05",
    readTime: "9 min read",
    image: "/hero-bg-showroom.jpeg",
    slug: "digital-transformation-automotive-wholesale",
  },
  {
    id: 6,
    title: "Understanding European Vehicle Standards",
    excerpt: "A comprehensive overview of vehicle standards and regulations across different European markets.",
    category: "Regulations",
    date: "2024-01-03",
    readTime: "10 min read",
    image: "/luxury-suv.png",
    slug: "understanding-european-vehicle-standards",
  },
]

export function BlogGrid() {
  const [blogPosts, setBlogPosts] = useState(fallbackBlogPosts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
        const response = await fetch(`${apiBaseUrl}/api/blogs`)
        
        console.log('API Response Status:', response.status)
        console.log('API Response Headers:', response.headers)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API Response Data:', data)
        
        // If API returns valid data, use it; otherwise keep fallback
        if (data && data.blogs && Array.isArray(data.blogs) && data.blogs.length > 0) {
          // Map the API response to match our component structure
          console.log('Total blogs received:', data.blogs.length)
          console.log('Blogs published status:', data.blogs.map((b: any) => `ID: ${b.id}, published: ${b.is_published}`))
          
          const mappedPosts = data.blogs
            .filter((post: any) => post.is_published !== false) // Show published posts (true or null/undefined)
            .map((post: any) => {
              // Debug image data
              console.log(`Blog ${post.id} image:`, post.image ? post.image.substring(0, 50) + '...' : 'No image')
              console.log(`Blog ${post.id} image empty/null:`, !post.image || post.image.trim() === '')
              
              return {
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                category: post.category,
                date: post.date,
                readTime: post.read_time ? `${post.read_time} min read` : '5 min read',
                image: post.image && post.image.trim() !== '' ? post.image : "/premium-sports-cars-showroom.jpeg",
                slug: post.slug,
                featured: post.featured || false, // Use only the featured field from API
                content: post.content,
                author_id: post.author_id,
                created_at: post.created_at,
                updated_at: post.updated_at
              }
            })
          
          console.log('Mapped blog posts:', mappedPosts)
          setBlogPosts(mappedPosts)
        } else {
          console.log('API returned empty or invalid data, using fallback')
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        console.log('Using fallback blog posts due to API error')
        // Keep fallback data on error
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const featuredPost = blogPosts.find((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Featured Post */}
      {featuredPost && (
        console.log("featuredPost.image", featuredPost.image),
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="absolute inset-0">
              <img
                src={featuredPost.image || "/placeholder.svg"}
                alt={featuredPost.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-gray-900/30"></div>
            </div>
            <div className="relative p-8 md:p-12">
              <Badge className="mb-4 bg-[#FF385C] hover:bg-[#FF385C]/80">Featured Article</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{featuredPost.title}</h2>
              <p className="text-lg text-gray-300 mb-6 max-w-2xl">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-6 mb-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(featuredPost.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {featuredPost.readTime}
                </div>
              </div>
              <Link href={`/blog/${featuredPost.slug}`}>
                <Button className="bg-[#FF385C] hover:bg-[#FF385C]/80 text-white">
                  Read Full Article
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Regular Posts Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regularPosts.map((post, index) => (
            console.log(post.image),
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
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-[#FF385C] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  )
}
