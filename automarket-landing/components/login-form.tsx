"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { loginDealer } from "@/lib/api"

export function LoginForm() {
  console.log('LoginForm component rendered');
  
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    } else {
      newErrors.email = ""
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      valid = false
    } else {
      newErrors.password = ""
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsLoading(true);
   

    try {
      const response = await loginDealer({
        email: formData.email,
        password: formData.password,
      });
      
      console.log('Login response:', response);
      
      // Check if the response contains an error
      if (response.token.error) {
        console.log('Login failed');
        toast.error("Login failed", {
          description: "Invalid credentials. Please check your email and password.",
        });
        return;
      }

      // Get the actual token and ensure it exists
      const token = response.token.token;
      if (!token) {
        toast.error("Login failed", {
          description: "Invalid server response. Please try again.",
        });
        return;
      }
      
      // Store the token
      const storage = formData.rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);

      toast.success("Login successful", {
        description: "Welcome back!",
      });

      
      // Redirect to browse app with token
      // Get the browse app URL from env and redirect with token
      if (!process.env.NEXT_PUBLIC_DASHBOARD_URL) {
        console.error('Dashboard app URL not configured');
        return;
      }
      console.log('Redirecting to:', process.env.NEXT_PUBLIC_DASHBOARD_URL);

      const dashboardUrl = new URL(process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.automarket.example.com');
                if (token) {
                  dashboardUrl.searchParams.set('token', token);
                }
                window.open(dashboardUrl.toString(), '_self');

    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
              errors.email ? "border-red-400" : "border-gray-300"
            } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className={`w-full pl-10 pr-10 py-2.5 bg-white border ${
              errors.password ? "border-red-400" : "border-gray-300"
            } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="rememberMe"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
            Remember me
          </label>
        </div>
        <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors mt-6"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </div>
  )
}
