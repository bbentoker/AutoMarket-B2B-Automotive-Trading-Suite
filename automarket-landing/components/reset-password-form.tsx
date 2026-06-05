"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ResetPasswordFormProps {
  resetCode: string
}

export function ResetPasswordForm({ resetCode }: ResetPasswordFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      valid = false
    } else {
      newErrors.password = ""
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      valid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    } else {
      newErrors.confirmPassword = ""
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Make API call to reset-password endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: resetCode,
          newPassword: formData.password 
        }),
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
      toast.success("Password reset successful", {
        description: "Your password has been reset successfully. You can now sign in with your new password.",
      })
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login")
      }, 2000)
      
    } catch (error) {
      console.error('Reset password error:', error)
      
      // Show specific error message if available
      if (error instanceof Error) {
        toast.error("Failed to reset password", {
          description: error.message,
        })
      } else {
        toast.error("Failed to reset password", {
          description: "Please try again later.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Password Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-white/50" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New password"
            className={`w-full pl-10 pr-10 py-2.5 bg-white/10 border ${
              errors.password ? "border-red-400" : "border-white/20"
            } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-[#FF385C]/50 focus:border-transparent transition-colors`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 hover:text-white/80 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-white/50" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            className={`w-full pl-10 pr-10 py-2.5 bg-white/10 border ${
              errors.confirmPassword ? "border-red-400" : "border-white/20"
            } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-[#FF385C]/50 focus:border-transparent transition-colors`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 hover:text-white/80 transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#FF385C] hover:bg-[#E62E50] text-white py-2.5 rounded-lg transition-colors shadow-lg shadow-[#FF385C]/20 mt-6"
      >
        {isLoading ? "Resetting password..." : "Reset password"}
      </Button>
    </form>
  )
} 