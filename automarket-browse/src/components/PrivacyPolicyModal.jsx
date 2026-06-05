"use client"

{/* SECURITY-SANITIZED: Real company legal details were redacted for public showcase. */}
import { X } from "lucide-react"
import { Button } from "./ui/button"

export function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="text-2xl font-bold text-gray-900">Privacy Policy</div>
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
                At AutoMarket BV, we are committed to protecting your privacy and ensuring that your personal data is handled transparently, securely, and in compliance with applicable data protection laws, including the General Data Protection Regulation (GDPR).
              </p>
            </div>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">1. Who We Are</div>
              <p className="text-gray-700 mb-3">
                AutoMarket BV is a B2B automotive trading platform based in Belgium. We facilitate the sourcing and purchase of vehicles between verified dealers across Europe.
              </p>
              <div className="text-gray-700">
                <strong>Contact:</strong>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Email: <a href="mailto:info@automarket.example.com" className="text-blue-600 hover:underline">info@automarket.example.com</a></li>
                  <li>Registered Address: Avenue Kersbeek, 308 1180 Bruxelles</li>
                  <li>Company Number: [Insert Company Number]</li>
                </ul>
              </div>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">2. What Data We Collect</div>
              <p className="text-gray-700 mb-3">
                We may collect and process the following categories of personal and business data:
              </p>
              
              <div className="mb-4">
                <div className="font-medium text-gray-900 mb-2">2.1 Account & Identity Information</div>
                <ul className="list-disc list-inside ml-4 text-gray-700">
                  <li>Company name, VAT number, and registration details</li>
                  <li>Contact names, job titles</li>
                  <li>Email addresses, phone numbers</li>
                </ul>
              </div>

              <div className="mb-4">
                <div className="font-medium text-gray-900 mb-2">2.2 Platform Usage</div>
                <ul className="list-disc list-inside ml-4 text-gray-700">
                  <li>Login credentials (encrypted)</li>
                  <li>IP address and device/browser information</li>
                  <li>Pages visited and activity on the platform</li>
                </ul>
              </div>

              <div className="mb-4">
                <div className="font-medium text-gray-900 mb-2">2.3 Financial Information</div>
                <ul className="list-disc list-inside ml-4 text-gray-700">
                  <li>Bank account details (for payments)</li>
                  <li>Invoicing and transaction records</li>
                </ul>
              </div>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Data</div>
              <p className="text-gray-700 mb-3">We use your data for the following purposes:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li>To create and manage your user account</li>
                <li>To verify your business identity and VAT validity</li>
                <li>To facilitate reservations, purchases, and payments</li>
                <li>To send transactional or operational emails (confirmations, invoices, etc.)</li>
                <li>To improve our services, ensure platform security, and detect fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
              <p className="text-gray-700 mt-3">
                We do not use your data for unsolicited marketing unless you have opted in.
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">4. Legal Basis for Processing</div>
              <p className="text-gray-700 mb-3">We process your personal data based on the following legal grounds:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li><strong>Contractual necessity</strong> – to fulfill our agreements with you</li>
                <li><strong>Legal obligation</strong> – to meet tax, invoicing, and anti-fraud laws</li>
                <li><strong>Legitimate interest</strong> – to operate and secure the platform</li>
                <li><strong>Consent</strong> – when you opt in to marketing or newsletter communications</li>
              </ul>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">5. Data Sharing</div>
              <p className="text-gray-700 mb-3">We only share your data when necessary, and only with:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li>Payment service providers (for processing transactions)</li>
                <li>Logistics and vehicle inspection partners (to complete orders)</li>
                <li>Government authorities when legally required</li>
                <li>VAT and business verification tools (e.g., VIES database)</li>
              </ul>
              <p className="text-gray-700 mt-3 font-medium">
                We never sell your personal data.
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">6. International Transfers</div>
              <p className="text-gray-700">
                Your data is primarily stored and processed within the European Economic Area (EEA). If we use third-party services outside the EEA, we ensure appropriate safeguards are in place (such as standard contractual clauses).
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">7. Data Retention</div>
              <p className="text-gray-700 mb-3">We retain your data only as long as necessary:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li><strong>Account and transactional data:</strong> minimum 7 years (for tax and legal reasons)</li>
                <li><strong>Inactive accounts:</strong> deleted or anonymized after 24 months of inactivity</li>
                <li><strong>Cookies and analytics data:</strong> retained as per cookie policy</li>
              </ul>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">8. Your Rights Under GDPR</div>
              <p className="text-gray-700 mb-3">You have the right to:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li>Access the data we hold about you</li>
                <li>Correct inaccurate or outdated information</li>
                <li>Request deletion of your data (unless legally restricted)</li>
                <li>Object to or restrict certain processing</li>
                <li>Data portability – receive your data in a structured format</li>
                <li>Withdraw consent for marketing at any time</li>
              </ul>
              <p className="text-gray-700 mt-3">
                To exercise these rights, contact us at: <a href="mailto:privacy@automarket.example.com" className="text-blue-600 hover:underline">privacy@automarket.example.com</a>
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">9. Cookies and Tracking Technologies</div>
              <p className="text-gray-700 mb-3">We use cookies to:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li>Maintain your session and login</li>
                <li>Analyze platform performance</li>
                <li>Improve user experience</li>
              </ul>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">10. Data Security</div>
              <p className="text-gray-700 mb-3">We implement appropriate technical and organizational measures to:</p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li>Encrypt data in transit and at rest</li>
                <li>Limit access to authorized personnel only</li>
                <li>Monitor for security breaches or misuse</li>
              </ul>
              <p className="text-gray-700 mt-3">
                In case of a personal data breach, we will notify affected users and relevant authorities where required.
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">11. Changes to This Privacy Policy</div>
              <p className="text-gray-700">
                We may update this policy from time to time. You will be notified of any material changes, and the latest version will always be available on our website.
              </p>
            </section>

            <section className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-3">12. Complaints</div>
              <p className="text-gray-700 mb-3">
                If you believe your rights have been violated, you have the right to lodge a complaint with the Belgian Data Protection Authority:
              </p>
              <div className="text-gray-700">
                <strong>Gegevensbeschermingsautoriteit (GBA)</strong><br />
                Rue de la Presse 35, 1000 Brussels<br />
                <a href="https://www.gegevensbeschermingsautoriteit.be" className="text-blue-600 hover:underline">https://www.gegevensbeschermingsautoriteit.be</a>
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  )
} 