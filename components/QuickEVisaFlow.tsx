import { CheckCircle } from "lucide-react"
import Image from "next/image"

export default function PatientFlowSection() {
  return (
    <section className="py-0 bg-gray-50">
      <div className="container mx-auto">
        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-start">
            {/* Left Side - Workflow Chart */}
            <div className="p-2 md:p-6 lg:p-8">
              <div className="md:min-h-[800px]">
                <Image
                  src="/patient-workflow.png"
                  alt="Patient Flow Chart - Complete medical treatment process from arrival to discharge"
                  width={800}
                  height={1000}
                  className="w-full h-auto rounded-lg"
                  priority
                />
              </div>
            </div>

            {/* Right Side - Workflow Information */}
            <div className="relative p-2 mt-5 md:mt-0 md:p-6 lg:p-8  md:min-h-[800px]">
              <div className="sticky top-20 max-h-screen overflow-y-auto">
                <div className="space-y-8">
                  <div className="text-left mb-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Patient Journey Process</h2>
                    <p className="md:text-lg text-gray-600 text-[19px] max-w-3xl mx-auto">
                      Our comprehensive patient flow system ensures seamless care from arrival to discharge, with
                      dedicated medical staff supporting you at every step of your treatment journey.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-[19px] leading-relaxed">
                      From the moment you arrive at Delhi Airport to your safe return, our structured workflow ensures
                      every aspect of your medical treatment is carefully coordinated and monitored.
                    </p>
                  </div>

                  {/* Key Workflow Steps */}
                  <div className="space-y-4">
                    <h4 className="md:text-lg text-2xl font-semibold text-gray-900">Key Process Highlights</h4>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-[19px] md:text-base  text-gray-900">Airport Reception & Assessment</p>
                          <p className="md:text-sm text-lg text-gray-600">Immediate medical condition evaluation upon arrival</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-[19px] md:text-base  text-gray-900">Express Consultation & Testing</p>
                          <p className="md:text-sm text-lg text-gray-600">
                            Rapid diagnostic services and specialist consultations
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-xl md:text-base text-gray-900">Treatment & Recovery</p>
                          <p className="md:text-sm text-lg text-gray-600">
                            Comprehensive care with admission or outpatient options
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-xl md:text-base text-gray-900">Safe Departure</p>
                          <p className="md:text-sm text-lg text-gray-600">Coordinated discharge and airport transfer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
