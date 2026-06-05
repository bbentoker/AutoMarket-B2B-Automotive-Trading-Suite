"use client"

import type React from "react"
import { useState } from "react"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    // Clear error when user types
    if (error) {
      setError("")
    }
  }

  const validateEmail = () => {
    if (!email) {
      setError("Email is required")
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail()) {
      return
    }

    setIsLoading(true)

    try {
      // Log the email to console as requested
      console.log("Forgot password request for email:", email)
      
      // Make API call to forgot-password endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        // Check if the response contains an error message
        if (responseData.error) {
          throw new Error(responseData.error)
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Show success message
      toast.success("Reset link sent", {
        description: "If an account with this email exists, you will receive a password reset link.",
      })
      
      // Clear the form
      setEmail("")
      
    } catch (error) {
      console.error('Forgot password error:', error)
      
      // Show specific error message if available
      if (error instanceof Error) {
        toast.error("Failed to send reset link", {
          description: error.message,
        })
      } else {
        toast.error("Failed to send reset link", {
          description: "Please try again later.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail className="h-5 w-5 text-white/50" />
          </div>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email address"
            className={`w-full pl-10 pr-4 py-2.5 bg-white/10 border ${
              error ? "border-red-400" : "border-white/20"
            } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-[#FF385C]/50 focus:border-transparent transition-colors`}
          />
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#FF385C] hover:bg-[#E62E50] text-white py-2.5 rounded-lg transition-colors shadow-lg shadow-[#FF385C]/20 mt-6"
      >
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  )
}
