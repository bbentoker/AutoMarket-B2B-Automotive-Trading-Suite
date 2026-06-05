import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
