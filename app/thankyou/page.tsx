import { CheckCircle2Icon, CircleChevronRight } from 'lucide-react';
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle w-12 h-12 text-emerald-600">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.5" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-4 h-4 mr-2">
    <path d="M7.9 20A9.3 9.3 0 0 1 4 16.1L2 22l6.1-2c.4.1.8.2 1.2.3" />
    <path d="M12 21a9 9 0 1 0-8.5-7.5c-1.7 2.1-1.3 5.4.3 7.3a9.4 9.4 0 0 0 6.6.7Z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-4 h-4 mr-2">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-4 h-4 text-gray-400">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const steps = [
  {
    title: 'Registration Received',
    description: 'Your registration has been successfully submitted to our system.',
    time: 'Instant Confirmation',
  },
  {
    title: 'Verification',
    description: 'Our team will verify your details and confirm your appointment slot.',
    time: 'Within 2 hours',
  },
  {
    title: 'Schedule Confirmation',
    description: 'You’ll receive an email and WhatsApp message with your meeting details.',
    time: 'Within 12 hours',
  },
  {
    title: 'Consultation Day',
    description: 'Attend your scheduled appointment and meet our medical experts.',
    time: 'On your selected date',
  },
];

export default function ThankYou() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-3xl p-8 md:p-12 bg-white rounded-2xl shadow-xl space-y-12 text-center">
        {/* Success Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 ">
           <CheckCircle2Icon className='w-16 h-16 text-[#74c044]'/>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
              Registration Confirmed!
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              Thank you for registering with <span className="font-semibold text-gray-800">Medivisor India Treatment</span>.  
              Your information has been successfully submitted. Our team will reach out to you shortly to confirm your appointment.
            </p>
          </div>
        </div>

        {/* Next Steps Timeline */}
     

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://wa.me/918340780250"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3 rounded-full border-2 border-gray-300 text-[#241d1f] hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center"
          >
            {/* <FaWhatsapp  className='h-5 w-5'/> */}
            Chat on WhatsApp
          </a>
          <a
            href="/"
            className="w-full sm:w-auto px-8 py-3 rounded-full border-2 border-gray-300 text-[#241d1f] hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center"
          >
        Visit Our Website
          
          </a>
        </div>
      </div>
    </div>
  );
}
