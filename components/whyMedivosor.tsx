"use client"

import { FC } from "react"
import { FaHandHoldingMedical } from "react-icons/fa"

const OverviewSection: FC = () => {
  return (
    <section id="overview" className="bg-white md:py-20 md:px-0 px-2 py-10">
      <div className="container mx-auto ">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Content */}
          <div data-aos="fade-left" data-aos-duration="1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-[#E22026] rounded-full text-sm font-semibold mb-4">
            <FaHandHoldingMedical/>
              <span>Medical Travel Support</span>
            </div>

            <div className="text-left w-full mx-auto">
              <h2 className="heading-lg mb-6">
                Why Medivisor Matters
              </h2>

              <p className="mt-4 description">
                Walk into any major hospital in India, and you'll likely find it teeming with patients.
                This is expected — given <strong>India’s vast population</strong>, the <strong>increasing burden of diseases</strong>,
                and the <strong>rapid growth of international medical tourism</strong>. Amid such overwhelming demand, securing
                <strong> quick, personalized care</strong> — especially for international patients — can be extremely difficult.
              </p>

              <p className="mt-4 description">
                While many hospitals do operate <strong>international patient departments</strong>, these are often
                <strong> understaffed</strong> and <strong>overstretched</strong>. The result? Overseas patients face
                <strong> long queues</strong>, <strong>procedural delays</strong>, and <strong>minimal emotional or logistical support</strong>.
              </p>

              <p className="mt-4 description">
                Additionally, due to the lack of a <strong>personalized advocate</strong>, no one in the hospital is actively
                monitoring your bills, negotiating discounts, or questioning the necessity of every test or procedure.
                This can lead to <strong>higher costs</strong> and confusion.
              </p>

              <p className="mt-4 description">
                The challenges don’t end here — they extend well beyond the hospital walls.
              </p>

              <p className="mt-4 description">
                Once outside, international patients are largely on their own — finding a hotel, arranging local transport,
                buying medicines, exchanging currency, getting SIM cards, and even exploring local attractions.
                These activities may enrich their stay but also bring risks like <strong>scams</strong>, <strong>inflated pricing</strong>,
                <strong> language issues</strong>, and <strong>cultural miscommunication</strong>.
              </p>

              <p className="mt-4 description">
                <strong>This is where Medivisor makes a difference.</strong>
              </p>

              <p className="mt-4 description">
                Medivisor ensures <strong>seamless support from start to finish</strong> — from arrival in India
                to departure. It facilitates:
              </p>

              <ul className="list-disc list-inside mt-2 description space-y-2">
                <li><strong>Fast-tracked hospital appointments</strong> and <strong>priority diagnostics</strong></li>
                <li><strong>Monitoring and verification of medical bills</strong></li>
                <li><strong>Coordination for second and third medical opinions</strong></li>
                <li><strong>Full support outside the hospital</strong> — logistics, accommodation, local services, and more</li>
              </ul>

              <p className="mt-4 description">
                Importantly, <strong>Medivisor protects the patient’s right to choose</strong>. By arranging consultations with
                <strong> multiple hospitals and doctors</strong>, patients can compare opinions before committing to treatment.
                This ensures <strong>well-informed, confident decisions</strong> about their health.
              </p>

              <p className="mt-4 description">
                In short, Medivisor stands by you — <strong>inside and outside the hospital</strong> —
                as your <strong>trusted advocate, advisor, and companion</strong> throughout your medical journey in India.
              </p>
            </div>
          </div>

          {/* Right Content - Video */}
          <div className="relative" data-aos="fade-right" data-aos-duration="1000">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-md overflow-hidden border border-gray-200 shadow-xl">
                <iframe
                  className="w-full min-h-[200px] md:min-h-[400px] rounded-md"
                  src="https://www.youtube.com/embed/94RNiXZj8_8?autoplay=1&rel=0&modestbranding=1&showinfo=0"
                  title="Medivisor Overview"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OverviewSection
