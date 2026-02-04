"use client"
import { Phone, Send } from "lucide-react"
import ContactModal from "@/components/ContactModal"
import { useState } from 'react'

const ModernHelpSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
    
      <section className="md:px-0 px-2 md:my-10">
        <div className="container mx-auto my-4 ">
        <div className="relative bg-[#e32128] px-4 md:px-10 rounded-xs shadow-xs relative z-10">
          <div className="max-w-4xl py-6 md:py-10 mx-auto text-center">
            {/* Main CTA Content */}
            <div className="mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-snug mb-4">
                Ready to Transform Your Healthcare Experience?
              </h2>
              <p className="text-[19px] md:text-xl text-gray-100 leading-relaxed max-w-2xl mx-auto">
                Join thousands of patients who trust us with their health. Get started today and experience
                world-class medical care at your fingertips.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center mb-10">
              <button
                className="group w-full sm:w-auto cursor-pointer bg-white text-[#E22026] px-5 py-2 rounded-md font-medium text-sm md:text-base hover:bg-red-50 transition-all duration-300 transform border border-white shadow-md flex items-center justify-center gap-2"
                onClick={openModal}
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
                Send Message
              </button>
              <a href="tel:+918368247758">
                <button
                  className="group w-full sm:w-auto cursor-pointer border border-white text-white px-5 py-2 rounded-md font-medium text-sm md:text-base hover:bg-white hover:text-[#E22026] transition-all duration-300 transform flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  Call Us
                </button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-white/30">
              <p className="text-red-100 text-lg sm:text-base md:text-lg">
                Trusted by <span className="font-semibold">2,500+</span> patients worldwide 🌍
              </p>
            </div>
          </div>
        </div>
      </div>
      </section>

      <ContactModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  )
}

export default ModernHelpSection
