"use client"

import Link from "next/link"
import { useState } from "react"
import { RegisterForm } from "@/components/register-form"
import { TermsAndConditionsModal } from "@/components/terms-and-conditions-modal"
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal"

export default function RegisterPage() {
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  return (
    <>
      {/* Terms and Conditions Modal - Rendered at top level */}
      <TermsAndConditionsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
      
      {/* Privacy Policy Modal - Rendered at top level */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <RegisterForm 
              onShowTerms={() => setShowTermsModal(true)} 
              onShowPrivacy={() => setShowPrivacyModal(true)} 
            />

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
