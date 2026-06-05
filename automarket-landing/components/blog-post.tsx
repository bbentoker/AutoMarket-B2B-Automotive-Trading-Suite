"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

interface BlogPostProps {
  slug: string
}

// Fallback blog post data
const fallbackBlogPost = {
  title: "The Future of Cross-Border Car Trading in Europe",
  content: `
    <p>The automotive industry is experiencing a digital revolution, and cross-border car trading is at the forefront of this transformation. As European markets become increasingly interconnected, dealerships are seeking more efficient ways to source vehicles across borders.</p>
    
    <h2>The Current Landscape</h2>
    <p>Traditional car trading methods have long been plagued by inefficiencies, hidden costs, and lengthy processes. Dealers often struggle with:</p>
    <ul>
      <li>Complex import documentation</li>
      <li>Unreliable vehicle inspections</li>
      <li>Hidden fees and unclear pricing</li>
      <li>Lengthy delivery times</li>
    </ul>
    
    <h2>Digital Transformation</h2>
    <p>Modern B2B platforms are addressing these challenges by providing:</p>
    <ul>
      <li>Transparent pricing with no hidden fees</li>
      <li>Comprehensive vehicle inspections</li>
      <li>Streamlined documentation processes</li>
      <li>Faster delivery times</li>
    </ul>
    
    <h2>Looking Ahead</h2>
    <p>The future of cross-border car trading lies in technology-driven solutions that prioritize transparency, efficiency, and reliability. Platforms like AutoMarket are leading this charge, offering dealers unprecedented access to premium vehicles across European markets.</p>
  `,
  category: "Market Trends",
  date: "2024-01-15",
  readTime: "5 min read",
  image: "/premium-sports-cars-showroom.jpeg",
  id: 1,
  excerpt: "Exploring how digital platforms are revolutionizing the way dealerships source vehicles across European markets.",
  featured: false,
  author_id: null,
  created_at: "2024-01-15T00:00:00.000Z",
  updated_at: "2024-01-15T00:00:00.000Z"
}

export function BlogPost({ slug }: BlogPostProps) {
  const [post, setPost] = useState(fallbackBlogPost)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
        
        // First, try to fetch by slug (if slug is actually an ID)
        // Or try to find the blog by slug from the list
        let blogId = slug
        
        // If slug is not a number, we need to find the blog by slug first
        if (isNaN(Number(slug))) {
          console.log('Slug is not a number, fetching all blogs to find by slug:', slug)
          const allBlogsResponse = await fetch(`${apiBaseUrl}/api/blogs`)
          console.log('All blogs response status:', allBlogsResponse.status)
          
          if (allBlogsResponse.ok) {
            const allBlogsData = await allBlogsResponse.json()
            console.log('All blogs data:', allBlogsData)
            
            const foundBlog = allBlogsData.blogs?.find((blog: any) => blog.slug === slug)
            if (foundBlog) {
              blogId = foundBlog.id.toString()
              console.log('Found blog ID by slug:', blogId)
            } else {
              console.log('Blog not found by slug, using fallback')
              return
            }
          } else {
            console.log('Failed to fetch all blogs, using fallback')
            return
          }
        }
        
        // Now fetch the specific blog by ID
        console.log('Fetching blog by ID:', blogId)
        const response = await fetch(`${apiBaseUrl}/api/blogs/${blogId}`)
        
        console.log('Blog API Response Status:', response.status)
        console.log('Blog API Response Headers:', response.headers)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Blog API Response Data:', data)
        
        // Map the API response to match our component structure
        if (data) {
          const mappedPost = {
            id: data.id,
            title: data.title,
            content: data.content || fallbackBlogPost.content,
            category: data.category,
            date: data.date,
            readTime: data.read_time ? `${data.read_time} min read` : '5 min read',
            image: data.image || "/placeholder.svg",
            excerpt: data.excerpt,
            featured: data.featured || data.is_published || false,
            author_id: data.author_id,
            created_at: data.created_at,
            updated_at: data.updated_at,
            slug: data.slug
          }
          
          console.log('Mapped blog post:', mappedPost)
          setPost(mappedPost)
        } else {
          console.log('API returned empty data, using fallback')
        }
      } catch (error) {
        console.error('Error fetching blog post:', error)
        setError('Failed to load blog post')
        console.log('Using fallback blog post due to API error')
        // Keep fallback data on error
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPost()
  }, [slug])

  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = post.title

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          "_blank",
        )
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
        break
      case "copy":
        navigator.clipboard.writeText(url)
        toast({
          title: "Link copied!",
          description: "The article link has been copied to your clipboard.",
        })
        break
    }
  }

  if (loading) {
    return (
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </article>
    )
  }

  if (error) {
    return (
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <p className="text-gray-600 mt-2">Showing fallback content...</p>
        </div>
      </article>
    )
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-4 bg-[#FF385C] hover:bg-[#FF385C]/80">{post.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Social Share */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share:
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("facebook")}
                className="hover:bg-blue-600 hover:text-white hover:border-blue-600"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("twitter")}
                className="hover:bg-sky-500 hover:text-white hover:border-sky-500"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("linkedin")}
                className="hover:bg-blue-700 hover:text-white hover:border-blue-700"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("copy")}
                className="hover:bg-gray-600 hover:text-white hover:border-gray-600"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-8">
          <img
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl"
          />
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </motion.div>
    </article>
  )
}
