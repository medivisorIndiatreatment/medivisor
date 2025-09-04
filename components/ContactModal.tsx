'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Mail, Check, AlertCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitContact } from "@/app/api/submit-form/route";
import { getData } from "country-list";
import { getCountryCallingCode } from "libphonenumber-js";

// Define the validation schema for the form
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\d{6,15}$/, 'Please enter a valid WhatsApp number (6-15 digits)'),
  countryCode: z.string().regex(/^\+\d{1,4}$/, 'Please select a valid country code'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message must be less than 500 characters'),
});

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CountryRow {
  name: string;
  iso: string;
  dial: string;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const countries = useMemo<CountryRow[]>(() => {
    const base = getData()
      .map((c: any) => {
        let dial = "";
        try {
          dial = `+${getCountryCallingCode(c.code)}`;
        } catch {
          dial = "";
        }
        return { name: c.name, iso: c.code, dial };
      })
      .filter((c: any) => c.dial)
    .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
    return base;
  }, []);

  const uniqueDialCodes = useMemo(() => {
    const set = new Set<string>();
    for (const c of countries) set.add(c.dial);
    return Array.from(set).sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")));
  }, [countries]);

  const defaultCountry = useMemo<CountryRow>(() => {
    return countries.find((c) => c.iso === "US") || countries[0] || { name: "United States", iso: "US", dial: "+1" };
  }, [countries]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      countryCode: defaultCountry.dial,
      message: ''
    }
  });

  const { reset, setValue, watch } = form;

  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => {
        onClose();
        window.location.href = '/thank-you';
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus, onClose]);

  const handleClose = () => {
    reset();
    setSubmitStatus(null);
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    const selectedCountry = countries.find(c => c.dial === values.countryCode);
    const countryName = selectedCountry ? selectedCountry.name : '';

    try {
      const res = await submitContact({
        name: values.name,
        email: values.email,
        countryName,
        countryCode: values.countryCode,
        whatsapp: values.phone,
        message: values.message,
      });

      if (res?.ok) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-2xl transform transition-all overflow-x-auto overflow-y-auto max-h-[90vh]">
         <DialogTitle className="text-xl md:px-8 text-center border-b border-gray-200 pb-3 md:text-3xl font-extrabold text-[#1a1a1a] mb-2">
            Explore Advanced Medical Care in India
          </DialogTitle>

        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 shadow-sm animate-fade-in">
            <div className="flex items-center">
              <Check className="w-5 h-5 mr-2" />
              <span className="text-sm">Thank you! Your message has been sent successfully. Redirecting...</span>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 shadow-sm animate-fade-in">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">Sorry, there was an error sending your message. Please try again.</span>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <Label htmlFor="name">Full name</Label>
                    <FormControl>
                      <Input className='border-gray-300' id="name" placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <FormControl>
                      <Input className='border-gray-300' id="email" type="email" placeholder="jane@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-2">
                <Label htmlFor="country-select">Country</Label>
                <select
                  id="country-select"
                  aria-label="Country"
                  value={countries.find(c => c.dial === watch('countryCode'))?.iso || defaultCountry.iso}
                  onChange={(e) => {
                    const selectedCountry = countries.find(c => c.iso === e.target.value);
                    if (selectedCountry) {
                      setValue('countryCode', selectedCountry.dial, { shouldValidate: true });
                    }
                  }}
                  className="h-10 w-full mt-1 rounded-md border border-gray-300 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {countries.map((c) => (
                    <option key={c.iso} value={c.iso}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="whatsapp">WhatsApp/ Viber</Label>
                <div className="flex gap-x-3">
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="h-10 w-20 rounded-md border border-gray-300 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {uniqueDialCodes.map((dial) => (
                          <option key={dial} value={dial}>
                            {dial}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input className='border-gray-300' id="whatsapp" placeholder="5551234567" inputMode="numeric" pattern="[0-9]*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter digits only. We’ll combine it with the selected code.</p>
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <Label htmlFor="message">Message</Label>
                    <FormControl>
                      <Textarea id="message" className='border-gray-300' placeholder="How can we help you?" rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="bg-[#E22026] cursor-pointer hover:bg-[#74BF44] w-full text-white font-medium px-5 py-2 rounded-md shadow-md transition-all">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {isSubmitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}