"use client"
import { useMemo, useState } from "react"
import type React from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type CountryKey = "PNG" | "SI" | "VU" | "FJ_L" | "FJ_S"

type FormState = {
  name: string
  email: string
  phone: string
  country: CountryKey
  date: string
  notes: string
}

type FormErrors = {
  name?: string
  email?: string
  phone?: string
  country?: string
  date?: string
}

const scheduleData = {
  PNG: {
    label: "Papua New Guinea (Port Moresby)",
    flag: "🇵🇬",
    dates: ["2025-11-18", "2025-11-19"],
    contact: "Shirley Waira: 74376546",
  },
  SI: {
    label: "Solomon Islands (Honiara)",
    flag: "🇸🇧",
    dates: ["2025-11-20", "2025-11-21"],
    contact: "Freda Sofu: 7618955",
  },
  VU: {
    label: "Vanuatu (Port Vila)",
    flag: "🇻🇺",
    dates: ["2025-11-23", "2025-11-24"],
    contact: "Mary Semeno: 7627430 / 5213197",
  },
  FJ_L: {
    label: "Fiji (Lautoka)",
    flag: "🇫🇯",
    dates: ["2025-11-25"],
    contact: "Ashlin Chandra (Lautoka): 9470527",
  },
  FJ_S: {
    label: "Fiji (Suva)",
    flag: "🇫🇯",
    dates: ["2025-11-26"],
    contact: "Reshmi Kumar (Suva): 9470588",
  },
}

const MEETING_FEE = "25 USD / 100 PGK / 200 SBD / 2500 Vatu / 50 FJD"

export default function ModernRegistrationForm({ className }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState<null | { ok: boolean; msg: string }>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    country: "PNG",
    date: "",
    notes: "",
  })

  const currentCountry = useMemo(() => scheduleData[form.country], [form.country])
  const availableDates = useMemo(() => currentCountry.dates, [currentCountry])

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.name.trim()) {
      newErrors.name = "Full name is required"
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (form.phone.trim().length < 6) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!form.date) {
      newErrors.date = "Please select a date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onChange = (key: keyof FormState, value: string) => {
    setForm((f) => {
      const next = { ...f, [key]: value }
      if (key === "country") next.date = ""
      return next
    })

    // Clear error when user starts typing
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setSubmitted(null)

    try {
      const formData = {
        name: form.name.trim(),
        email: form.email.trim(),
        countryName: scheduleData[form.country].label,
        countryCode: "+61", // You might want to make this dynamic based on country
        whatsapp: form.phone.replace(/\D/g, ""), // Remove non-digits for WhatsApp
        message: `Appointment Request - ${scheduleData[form.country].label} on ${form.date}. ${form.notes ? `Notes: ${form.notes}` : ""}`,
      }

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formData),
      })

      const contentType = res.headers.get("content-type") || ""
      let result: any = null

      if (contentType.includes("application/json")) {
        // Safe to parse JSON
        result = await res.json()
      } else {
        // Fallback to text; Next might return generic "Internal Server Error" text/html on framework errors
        const text = await res.text()
        if (res.ok) {
          // Some environments may not return a JSON body on 200
          // Treat 2xx without JSON as success
          router.push("/thank-you")
          return
        }
        throw new Error(text || `Request failed (${res.status})`)
      }

      if (res.ok && (!result || result.ok)) {
        router.push("/thank-you")
        return
      }

      setSubmitted({
        ok: false,
        msg: (result && result.error) || "Submission failed. Please try again.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error. Please try again."
      setSubmitted({
        ok: false,
        msg: message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "max-w-3xl mx-auto grid gap-8 rounded-xs border border-gray-100 bg-white shadow-xs p-4 md:p-5",
        className,
      )}
      aria-labelledby="registration-title"
      noValidate
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 id="registration-title" className="text-2xl font-semibold text-gray-800">
          Secure Your Appointment
        </h2>
        <p className="text-gray-500 text-sm">Fill out the form below to book your consultation slot.</p>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-6">
        {/* Full Name */}
        <div className="grid gap-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={cn(
              "h-11 rounded-lg border text-sm bg-white px-3 outline-none focus:ring-2 focus:ring-gray-500 transition-colors",
              errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-500",
            )}
            placeholder="Enter your full name"
            autoComplete="name"
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-red-500 text-xs mt-1">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="grid gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={cn(
              "h-11 rounded-lg border text-sm bg-white px-3 outline-none focus:ring-2 focus:ring-gray-500 transition-colors",
              errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-500",
            )}
            placeholder="you@example.com"
            autoComplete="email"
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-red-500 text-xs mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="grid gap-1">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone *
          </label>
          <input
            id="phone"
            required
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className={cn(
              "h-11 rounded-lg border text-sm bg-white px-3 outline-none focus:ring-2 focus:ring-gray-500 transition-colors",
              errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-500",
            )}
            placeholder="+61 400 000 000"
            autoComplete="tel"
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="text-red-500 text-xs mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Country */}
        <div className="grid gap-1">
          <label htmlFor="country" className="text-sm font-medium text-gray-700">
            Country *
          </label>
          <select
            id="country"
            value={form.country}
            onChange={(e) => onChange("country", e.target.value as CountryKey)}
            className="h-11 rounded-lg border border-gray-300 text-sm bg-white px-3 outline-none focus:ring-2 focus:ring-gray-500"
          >
            {Object.entries(scheduleData).map(([key, c]) => (
              <option key={key} value={key}>
                {c.flag} {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="grid gap-1">
          <label htmlFor="date" className="text-sm font-medium text-gray-700">
            Preferred Date *
          </label>
          <select
            id="date"
            required
            disabled={!availableDates.length}
            value={form.date}
            onChange={(e) => onChange("date", e.target.value)}
            className={cn(
              "h-11 rounded-lg border text-sm bg-white px-3 outline-none focus:ring-2 focus:ring-gray-500",
              errors.date ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-500",
              !availableDates.length ? "opacity-50 cursor-not-allowed" : "",
            )}
            aria-describedby={errors.date ? "date-error" : undefined}
          >
            <option value="" disabled>
              {availableDates.length ? "Select a date" : "No dates available"}
            </option>
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {formatDisplayDate(d)}
              </option>
            ))}
          </select>
          {errors.date && (
            <p id="date-error" className="text-red-500 text-xs mt-1">
              {errors.date}
            </p>
          )}
        </div>

        {/* Country Contact Info */}
        <div className="md:col-span-2 grid gap-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 text-sm mb-2">
              {currentCountry.flag} {currentCountry.label} - Contact Information
            </h3>
            <p className="text-gray-700 text-sm">
              <strong>Contact:</strong> {currentCountry.contact}
            </p>
            <p className="text-gray-700 text-sm mt-1">
              <strong>Meeting Fee:</strong> {MEETING_FEE}
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="md:col-span-2 grid gap-1">
          <label htmlFor="notes" className="text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            className="min-h-[100px] rounded-lg border border-gray-300 text-sm bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            placeholder="Briefly describe your concern or any additional information"
          />
        </div>
      </div>

      {/* Status Message */}
      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "rounded-md px-4 py-3 text-sm font-medium",
            submitted.ok
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200",
          )}
        >
          {submitted.msg}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "h-12 w-full rounded-lg font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
          loading
            ? "bg-gray-400 text-gray-700"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Book Appointment"
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        By submitting, you agree to our terms and consent to be contacted regarding your appointment.
      </p>
    </form>
  )
}
