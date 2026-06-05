"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User, Building, Phone, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { registerDealer } from "@/lib/api"

interface RegisterFormProps {
  onShowTerms: () => void
  onShowPrivacy: () => void
}

export function RegisterForm({ onShowTerms, onShowPrivacy }: RegisterFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    phone: "",
    vatNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    companyName: "",
    phone: "",
    vatNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: "",
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

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
      valid = false
    } else {
      newErrors.fullName = ""
    }

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

    // Company Name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
      valid = false
    } else {
      newErrors.companyName = ""
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
      valid = false
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = "Phone number is invalid"
      valid = false
    } else {
      newErrors.phone = ""
    }

    // VAT Number validation
    if (!formData.vatNumber.trim()) {
      newErrors.vatNumber = "VAT number is required"
      valid = false
    } else if (formData.vatNumber.length < 8) {
      newErrors.vatNumber = "VAT number is too short"
      valid = false
    } else {
      newErrors.vatNumber = ""
    }

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

    // Terms agreement validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions"
      valid = false
    } else {
      newErrors.agreeTerms = ""
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await registerDealer({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        company_name: formData.companyName,
        phone_number: formData.phone,
        vat_number: formData.vatNumber
      });

      setShowSuccessModal(true)
    } catch (error) {
      console.error('Registration error:', error);
      
             // Check if the error is about existing dealer
       if (error instanceof Error && error.message === "A dealer with this email already exists") {
         toast.error("Account already exists", {
           description: "An account with this email already exists. Please sign in instead.",
         })
         
         // Redirect to login page after a short delay
         setTimeout(() => {
           router.push("/login")
         }, 2000)
       } else {
         toast.error("Registration failed", {
           description: error instanceof Error ? error.message : "There was an error creating your account. Please try again.",
         })
       }
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalContinue = () => {
    setShowSuccessModal(false)
    router.push("/login")
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full name"
            className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
              errors.fullName ? "border-red-400" : "border-gray-300"
            } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          />
        </div>
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

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

      {/* Company Name Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Building className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="companyName"
            id="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Company name"
            className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
              errors.companyName ? "border-red-400" : "border-gray-300"
            } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          />
        </div>
        {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
      </div>

      {/* Phone Field - New */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone number"
            className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
              errors.phone ? "border-red-400" : "border-gray-300"
            } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          />
        </div>
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      {/* VAT Number Field - New */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Hash className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="vatNumber"
            id="vatNumber"
            value={formData.vatNumber}
            onChange={handleChange}
            placeholder="VAT number"
            className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
              errors.vatNumber ? "border-red-400" : "border-gray-300"
            } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          />
        </div>
        {errors.vatNumber && <p className="text-red-500 text-xs mt-1">{errors.vatNumber}</p>}
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

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            className={`w-full pl-10 pr-10 py-2.5 bg-white border ${
              errors.confirmPassword ? "border-red-400" : "border-gray-300"
            } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-2">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              name="agreeTerms"
              id="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeTerms" className="text-gray-700">
              I agree to the{" "}
              <button
                type="button"
                onClick={onShowTerms}
                className="text-blue-600 hover:text-blue-800 transition-colors underline"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={onShowPrivacy}
                className="text-blue-600 hover:text-blue-800 transition-colors underline"
              >
                Privacy Policy
              </button>
            </label>
          </div>
        </div>
        {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors mt-6"
      >
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>

    {/* Success Modal */}
    {showSuccessModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-gray-200 rounded-lg max-w-md w-full p-6 text-center shadow-xl">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You for Your Registration!</h3>
            <p className="text-gray-600 leading-relaxed">
              We are reviewing your account and you will get an update on email once your account has been approved.
            </p>
          </div>
          <Button
            onClick={handleModalContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors"
          >
            Continue to Login
          </Button>
        </div>
      </div>
    )}
    </>
  )
}
