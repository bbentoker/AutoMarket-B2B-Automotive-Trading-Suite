"use client"

{/* SECURITY-SANITIZED: Real company legal details were redacted for public showcase. */}
import { X } from "lucide-react"
import { Button } from "./ui/button"

export function CookiePolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="text-2xl font-bold text-gray-900">Cookie Policy</div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="prose prose-gray max-w-none">
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Effective Date:</strong> 2025-06-24<br />
                <strong>Company:</strong> AutoMarket BV<br />
                <strong>Website:</strong> <a href="https://www.automarket.example.com" className="text-blue-600 hover:underline">https://www.automarket.example.com</a>
              </p>
              <p className="text-gray-700">
                This Cookie Policy explains how AutoMarket BV uses cookies and similar technologies on our website and platform. By continuing to use our website, you agree to the placement and use of cookies in accordance with this policy.
              </p>
            </div>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">1. What Are Cookies?</div>
              <p className="text-gray-700">
                Cookies are small text files stored on your device (computer, tablet, smartphone) when you visit a website. They allow the site to recognize your device, remember your preferences, and enhance your browsing experience.
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">2. Why We Use Cookies</div>
              <p className="text-gray-700 mb-3">We use cookies to:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li>Enable essential platform functionality (e.g., login, account session)</li>
                <li>Improve user experience and site performance</li>
                <li>Analyze website traffic and usage</li>
                <li>Remember language and region preferences</li>
                <li>Prevent fraud and enhance platform security</li>
              </ul>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">3. Types of Cookies We Use</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left font-semibold text-gray-900">Cookie Type</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold text-gray-900">Purpose</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold text-gray-900">Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium text-gray-900">Strictly Necessary</td>
                      <td className="border border-gray-300 p-3 text-gray-700">Required for the platform to function (e.g. login, security)</td>
                      <td className="border border-gray-300 p-3 text-gray-700">Session-based or short-term</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 p-3 font-medium text-gray-900">Performance & Analytics</td>
                      <td className="border border-gray-300 p-3 text-gray-700">Help us analyze how users interact with the site (e.g. Google Analytics)</td>
                      <td className="border border-gray-300 p-3 text-gray-700">Up to 13 months</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium text-gray-900">Functionality</td>
                      <td className="border border-gray-300 p-3 text-gray-700">Remembers user preferences and settings</td>
                      <td className="border border-gray-300 p-3 text-gray-700">Up to 6 months</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 p-3 font-medium text-gray-900">Third-Party Cookies</td>
                      <td className="border border-gray-300 p-3 text-gray-700">Set by external services (e.g. embedded tools, support chat)</td>
                      <td className="border border-gray-300 p-3 text-gray-700">Varies by provider</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">4. Third-Party Services</div>
              <p className="text-gray-700 mb-3">We may use the following third-party services that set cookies:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li><strong>Google Analytics</strong> – website usage statistics</li>
                <li><strong>CRM systems or Hotjar</strong> – behavioral analytics and customer interaction tracking</li>
                <li><strong>Payment processors</strong> – for secure and verified payment handling</li>
                <li><strong>Live chat or support plugins</strong> – to facilitate customer support and inquiries</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Each third party may have its own privacy and cookie policies.
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">5. Cookie Consent</div>
              <p className="text-gray-700 mb-3">
                When you first visit our website, you will be shown a cookie banner requesting your consent for non-essential cookies.
              </p>
              <p className="text-gray-700 mb-3">You can:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies</li>
                <li>Customize preferences</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Essential cookies cannot be disabled, as they are necessary for basic functionality.
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">6. How to Control or Delete Cookies</div>
              <p className="text-gray-700 mb-3">You can manage your cookie preferences in the following ways:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li>Through the cookie settings link or banner on our site</li>
                <li>By adjusting your browser settings (e.g., blocking or deleting cookies)</li>
                <li>Opting out of Google Analytics via <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline">tools.google.com/dlpage/gaoptout</a></li>
              </ul>
              <p className="text-gray-700 mt-3">
                Please note that disabling some cookies may affect the performance or functionality of our website.
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">7. Updates to This Policy</div>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time. When we make changes, we will update the "Effective Date" above and notify you if required.
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">8. Contact Us</div>
              <p className="text-gray-700">
                If you have any questions about this Cookie Policy, please contact us at:<br />
                <a href="mailto:info@automarket.example.com" className="text-blue-600 hover:underline">info@automarket.example.com</a>
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  )
} 