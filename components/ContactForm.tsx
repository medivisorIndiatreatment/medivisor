"use client"

import type React from "react"
import { useMemo, useState, useEffect } from "react"
// Assuming these are standard UI components (like from ShadCN)
// Note: These imports are typically mocked or handled by the environment in this context.
// We are keeping them here for structural clarity, but the code relies on pure HTML/Tailwind for rendering.
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { cn } from "@/lib/utils"

// --- Helper Functions and Mocks (Crucial for running in a single-file environment) ---

// Utility function to join class names (simplified version of cn from lib/utils)
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

// Define the primary accent color class for consistency
const ACCENT_CLASS = "text-gray-700 focus-visible:ring-gray-700 focus:ring-gray-700 focus:border-gray-700";
const BUTTON_BG_CLASS = "bg-gray-700 hover:bg-gray-800 focus:ring-gray-700";
const TAB_ACTIVE_CLASS = "border-gray-700 text-gray-700"; // For the active tab line

// 1. Mock Country Data and Calling Code Logic (Replaces country-list and libphonenumber-js)
const MOCK_COUNTRY_DATA: { name: string, code: string, dial: string }[] = [
  { name: "United States", code: "US", dial: "+1" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "India", code: "IN", dial: "+91" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "Brazil", code: "BR", dial: "+55" },
  { name: "Japan", code: "JP", dial: "+81" },
  { name: "Mexico", code: "MX", dial: "+52" },
  { name: "South Africa", code: "ZA", dial: "+27" },
];

// 2. Mock submitContact function (Replaces "@/app/api/submit-form/route")
type SubmissionPayload = {
  connectionType: string;
  name: string;
  email: string;
  countryName: string;
  countryCode: string;
  whatsapp: string;
  message: string;
};

// Mock API call to simulate form submission
const submitContact = async (payload: SubmissionPayload) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log("Mock Submission Payload:", payload);

  // Simple success simulation.
  if (payload.name && payload.email && payload.message) {
    return { ok: true };
  } else {
    // Return a structured error if a key field is missing (for better mock testing)
    return { ok: false, error: "Validation failed (Missing Name, Email, or Message)." };
  }
};

// --- Types ---
type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; message: string }
  | { state: "error"; message: string }

type CountryRow = { name: string; iso: string; dial: string }
type ConnectionType = 'hospital' | 'medivisor';

// --- Icon SVGs for Tabs (Lucide icons approximation) ---
const BuildingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M12 10V6"/>
    <path d="M15 10V6"/>
    <path d="M9 10V6"/>
  </svg>
);

const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" x2="19" y1="8" y2="14"/>
    <line x1="22" x2="16" y1="11" y2="11"/>
  </svg>
);

// --- Component Replacements (Simplified Input/Button/Textarea for standalone functionality) ---
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    // Cleaned up Input: standardized height (h-10), subtle gray border, red focus ring
    <input className={cn("flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all h-10", ACCENT_CLASS, className)} {...props} />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
    // Cleaned up Textarea: subtle gray border, red focus ring
    <textarea className={cn("flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all", ACCENT_CLASS, className)} {...props} />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...props }) => (
    // Cleaned up Button: standard height (h-10), consistent look
    <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 h-10 px-4 py-2", ACCENT_CLASS, className)} {...props}>
        {children}
    </button>
);


export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" })
  const [activeTab, setActiveTab] = useState<ConnectionType>('medivisor');

  // Build country dataset and helpers (client-side) using MOCK_COUNTRY_DATA
  const countries = useMemo<CountryRow[]>(() => {
    // Mapping MOCK_COUNTRY_DATA to the expected CountryRow type
    const base = MOCK_COUNTRY_DATA.map(c => ({
        name: c.name,
        iso: c.code,
        dial: c.dial,
    })).sort((a, b) => a.name.localeCompare(b.name));
    return base
  }, [])

  const uniqueDialCodes = useMemo(() => {
    const set = new Set<string>()
    for (const c of countries) set.add(c.dial)
    // Numeric sort by dial code
    return Array.from(set).sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")))
  }, [countries])

  const defaultCountry = useMemo<CountryRow>(() => {
    return countries.find((c) => c.iso === "IN") || countries[0] || { name: "India", iso: "IN", dial: "+91" }
  }, [countries])

  const [form, setForm] = useState({
    name: "",
    email: "",
    countryIso: defaultCountry?.iso || "IN",
    countryName: defaultCountry?.name || "India",
    countryCode: defaultCountry?.dial || "+91",
    whatsapp: "",
    message: "",
  })

  // Detect user's country on load using IP geolocation
  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        // Mock IP API call
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const iso = data.country_code;
        // Match against mock data
        const match = countries.find((c) => c.iso === iso);
        if (match) {
          setForm((prev) => ({
            ...prev,
            countryIso: match.iso,
            countryName: match.name,
            countryCode: match.dial,
          }));
        }
      } catch (error) {
        // Fallback to default (IN)
      }
    };

    if (countries.length > 0) {
        fetchUserCountry();
    }
  }, [countries]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso = e.target.value
    const match = countries.find((c) => c.iso === iso)
    if (!match) return
    setForm((f) => ({
      ...f,
      countryIso: match.iso,
      countryName: match.name,
      countryCode: match.dial, // sync dial code with selected country
    }))
  }

  const onDialCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dial = e.target.value
    setForm((f) => ({ ...f, countryCode: dial }))
  }

  const validate = () => {
    if (!form.name.trim()) return "Please enter your full name."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address."
    if (!/^\+\d{1,4}$/.test(form.countryCode)) return "Enter a valid country code (e.g., +1, +44, +91)."
    if (!/^[0-9]{6,15}$/.test(form.whatsapp)) return "Enter a valid WhatsApp number (6-15 digits)."
    if (!form.message.trim()) return "Please enter a message explaining your request."
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setStatus({ state: "error", message: error });
      return;
    }
    setStatus({ state: "submitting" });
    try {
      const countryCodeNormalized = form.countryCode.startsWith("+") ? form.countryCode : `+${form.countryCode}`;
      const whatsappNormalized = form.whatsapp.replace(/\D/g, "");
      
      const res = await submitContact({
        // Include the connection type in the submission
        connectionType: activeTab === 'hospital' ? 'Connect to Hospital' : 'Connect to Medivisor', 
        name: form.name.trim(),
        email: form.email.trim(),
        countryName: form.countryName,
        countryCode: countryCodeNormalized,
        whatsapp: whatsappNormalized,
        message: form.message.trim(),
      });
      
      if (res?.ok) {
        // Success message and reset form
        setStatus({ state: "success", message: "Request successfully sent! We'll contact you shortly." });
        setForm(prev => ({
            ...prev,
            name: "",
            email: "",
            whatsapp: "",
            message: "",
        })); 
      } else {
        setStatus({ state: "error", message: res?.error || "Submission failed. Please try again." });
      }
    } catch (err: any) {
      setStatus({ state: "error", message: err?.message || "Unexpected network error. Please try again." });
    }
  };

  const TabButton = ({ type, icon: Icon, label }: { type: ConnectionType, icon: React.FC<React.SVGProps<SVGSVGElement>>, label: string }) => {
    const isActive = activeTab === type;
    
    // Updated tab classes for a cleaner look
    const activeClasses = TAB_ACTIVE_CLASS + " border-b-2"; // Red line under active tab
    const inactiveClasses = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200";

    return (
      <button
        type="button"
        onClick={() => {
          setActiveTab(type);
          setStatus({ state: "idle" }); // Reset status when switching tabs
        }}
        className={cn(
          "flex-1 flex items-center justify-center p-3 text-base font-medium transition-colors border-b-2 -mb-[1px] hover:bg-gray-50", // -mb-[1px] corrects for border overlap
          isActive
            ? activeClasses
            : inactiveClasses,
        )}
      >
        {/* <Icon className="w-4 h-4 mr-2" /> */}
        {label}
      </button>
    );
  };

  return (
    // Enhanced container styling: slightly stronger shadow and rounded corners
    <div className="w-full h-fit rounded-lg shadow-lg sticky top-4 lg:top-16">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        
        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 bg-gray-50">
         
          <TabButton 
            type="medivisor" 
            icon={UserPlusIcon} 
            label=" Medivisor" 
          />
           <TabButton 
            type="hospital" 
            icon={BuildingIcon} 
            label=" Hospital" 
          />
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {activeTab === "hospital" ? "Hospital/Clinic Partnership" : "Personal Medical Consultation"}
          </h2> */}
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            
            <div className="grid gap-4">
              
              {/* Full Name Input */}
              <Input 
                id="name" 
                name="name" 
                value={form.name} 
                onChange={onChange} 
                placeholder="Enter Your Full Name " 
                required 
              />

              {/* Email Input */}
              <Input 
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder=" Enter Your Email Address "
                required
              />

              {/* Contact Details Header and Country/WhatsApp Group */}
              <div className="grid gap-2 pt-2">
                <p className="text-sm font-medium text-gray-700">Contact Details (WhatsApp is preferred)</p>
                
                {/* Country Select */}
                <div className="relative">
                  <select
                    aria-label="Country"
                    value={form.countryIso}
                    onChange={onCountryChange}
                    // Standardized select styling (h-10) with red focus ring
                    className={cn("appearance-none block w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-1 transition-all cursor-pointer", ACCENT_CLASS)}
                  >
                    <option value="" disabled>Select Country</option>
                    {countries.map((c) => (
                      <option key={c.iso} value={c.iso}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </div>

                <div className="flex gap-x-3">
                  {/* Country Code Select */}
                  <div className="relative w-20 flex-shrink-0">
                    <select
                      aria-label="Dial Code"
                      value={form.countryCode}
                      onChange={onDialCodeChange}
                      // Standardized select styling (h-10) with gray background for distinction
                      className={cn("appearance-none block w-full h-10 rounded-md border border-gray-300 bg-gray-50 py-1.5 px-2 text-sm text-gray-700 focus:outline-none focus:ring-1 transition-all cursor-pointer", ACCENT_CLASS)}
                    >
                      {uniqueDialCodes.map((dial) => (
                        <option key={dial} value={dial}>
                          {dial}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </div>
                  
                  {/* WhatsApp Number Input */}
                  <Input 
                    id="whatsapp"
                    name="whatsapp"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.whatsapp}
                    onChange={onChange}
                    placeholder="WhatsApp Number"
                    aria-label="WhatsApp number"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter digits only. We'll combine this with your country code.</p>
              </div>


              {/* Message Textarea */}
              <Textarea
                id="message"
                name="message"
                value={form.message}
                onChange={onChange}
                placeholder={
                  activeTab === 'hospital' 
                    ? "E.g., We are a 500-bed hospital in [City, Country] looking to integrate your medical AI services."
                    : "E.g., I need advice on my recent diagnosis of [Condition] and want to understand my treatment options."
                }
                rows={4} 
                required
                className="min-h-[120px]" // Slightly taller for more professional feel
              />
            </div>

            <div className="flex flex-col space-y-3 pt-2">
              <Button 
                type="submit" 
                disabled={status.state === "submitting"} 
                // Primary button with red accent, white text, and shadow
                className={cn("w-full font-medium text-white py-2 shadow-md", BUTTON_BG_CLASS)}
              >
                {status.state === "submitting" ? "Sending Request..." : 
               (activeTab === "hospital"? "Submit Hospital Request": "Submit Consultation Request")}

              </Button>
              <p
                className={cn(
                  "text-sm text-center", // Slightly larger text for status
                  status.state === "success"
                    ? "text-green-600 font-semibold"
                    : status.state === "error"
                      ? "text-red-600 font-semibold"
                      : "text-gray-500",
                )}
                role="status"
                aria-live="polite"
              >
                {status.state === "success" || status.state === "error" ? status.message : "We typically respond within one business day."}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}