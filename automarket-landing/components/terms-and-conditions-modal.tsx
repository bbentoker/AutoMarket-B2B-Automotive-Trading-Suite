"use client"

{/* SECURITY-SANITIZED: Real company legal details were redacted for public showcase. */}
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TermsAndConditionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsAndConditionsModal({ isOpen, onClose }: TermsAndConditionsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="prose prose-sm max-w-none">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-600 mb-4">Effective Date: 2025-06-24</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                These Terms & Conditions ("Terms") govern your use of the AutoMarket platform operated by AutoMarket BV, 
                located at Avenue Kersbeek, 308 1180 Bruxelles, registered in Belgium under company number [Insert Company Number]. 
                By accessing or using our services via buy.automarket.example.com (the "Platform"), you agree to be bound by these Terms.
              </p>
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="font-semibold text-gray-900 mb-3">1. Definitions</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><strong>"AutoMarket", "we", "us", or "our":</strong> AutoMarket BV, the operator of the Platform.</li>
                  <li><strong>"User", "you", or "client":</strong> A registered car dealership or authorized buyer using the Platform.</li>
                  <li><strong>"Vehicle":</strong> Any motor vehicle listed for sale on the Platform.</li>
                  <li><strong>"Reservation":</strong> A confirmed intent to purchase a vehicle made via the Platform.</li>
                  <li><strong>"Offer":</strong> A bid submitted by a user to purchase a vehicle, which becomes binding once accepted.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">2. Eligibility & Registration</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>Only legally registered businesses (e.g., dealerships or resellers) may register for and use the Platform.</li>
                  <li>You must provide accurate, complete, and up-to-date business and contact information.</li>
                  <li>AutoMarket BV reserves the right to approve, deny, or revoke access to the Platform at its sole discretion.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">3. Vehicle Reservations & Offers</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>All reservations and accepted offers are binding. By reserving a vehicle or submitting an offer that is accepted, you commit to completing the purchase.</li>
                  <li>Payment must be made in full within 48 hours of AutoMarket BV accepting your reservation or offer.</li>
                  <li>Failure to pay within the 48-hour window can result in a one-time late fee of 1% of the purchase value, applicable if payment is made after 48 hours and up to 6 days after acceptance.</li>
                  <li>If full payment is not received within 7 working days, AutoMarket BV reserves the right to cancel the transaction and issue a penalty invoice of 15% of the total vehicle value.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">4. Pricing & Payment Terms</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>All prices listed are exclusive of VAT unless otherwise stated.</li>
                  <li>Invoices will be issued by AutoMarket BV and must be paid to the bank account indicated.</li>
                  <li>Payments must be made in Euros (€), and any transfer fees are the responsibility of the buyer.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">5. Vehicle Information & Inspections</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>All vehicles listed are subject to prior sale and availability.</li>
                  <li>AutoMarket BV strives to provide accurate vehicle data, including inspection reports where available, but does not guarantee the completeness or accuracy of this information.</li>
                  <li>It is the buyer's responsibility to perform due diligence prior to reservation or offer.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">6. Delivery & Logistics</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>Delivery timelines are estimates and not guaranteed.</li>
                  <li>AutoMarket BV may assist with logistics but is not liable for delays caused by third parties, customs, or force majeure.</li>
                  <li>Ownership transfers once full payment is received.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">7. User Responsibilities</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>You are responsible for ensuring your authorized users comply with these Terms.</li>
                  <li>Misuse of the platform, fraudulent activity, or failure to pay may result in suspension or permanent termination of your account.</li>
                  <li>You must not use the Platform in any way that could damage, disable, or impair its functionality or interfere with other users.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">8. Intellectual Property</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>All content on the Platform (logos, text, graphics, data, software) is the property of AutoMarket BV or its licensors and is protected by intellectual property laws.</li>
                  <li>You may not reproduce, distribute, or modify any part of the Platform without prior written consent.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">9. Limitation of Liability</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>AutoMarket BV shall not be liable for indirect, incidental, or consequential damages arising from your use of the Platform or any transactions made.</li>
                  <li>Our total liability is limited to the amount paid by you to AutoMarket BV for the vehicle in question.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">10. Governing Law & Jurisdiction</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>These Terms are governed by the laws of Belgium.</li>
                  <li>Any disputes shall be subject to the exclusive jurisdiction of the courts of Brussels.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">11. Changes to the Terms</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>AutoMarket BV reserves the right to update or modify these Terms at any time.</li>
                  <li>Continued use of the Platform after changes are published constitutes your acceptance of the revised Terms.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-3">12. VAT Compliance & Responsibility</h4>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>Vehicles listed on the Platform may be offered excluding VAT. To purchase such vehicles without VAT, the buyer must provide a valid and active EU VAT number at the time of each vehicle purchase.</li>
                  <li>By accepting these Terms, you confirm that your VAT number is valid and corresponds to your registered business entity for every individual purchase.</li>
                  <li>If it is later determined that your VAT number was invalid, expired, or incorrectly provided at the time of any purchase, AutoMarket BV reserves the right to issue a supplemental invoice for the applicable VAT amount, which must be paid within 24 hours of notification.</li>
                  <li>By accepting these Terms, you expressly agree to this VAT liability and payment obligation should your VAT number be found invalid at any purchase.</li>
                  <li>Failure to pay the VAT invoice within 24 hours grants AutoMarket BV the right to pursue legal action, including but not limited to debt recovery procedures, interest charges, and legal fees.</li>
                </ul>
              </section>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}