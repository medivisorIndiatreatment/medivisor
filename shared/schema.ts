import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const hospitals = pgTable("hospitals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  yearEstablished: integer("year_established").notNull(),
  numberOfBranches: integer("number_of_branches").default(1),
  accreditations: json("accreditations").$type<string[]>().default([]),
  facilities: json("facilities").$type<string[]>().default([]),
  specialties: json("specialties").$type<string[]>().default([]),
  description: text("description").notNull(),
  partnerStatus: text("partner_status").notNull().default("regular"), // "preferred" | "regular"
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  totalBeds: integer("total_beds").default(0),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  images: json("images").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  profilePicture: text("profile_picture"),
  specializations: json("specializations").$type<string[]>().default([]),
  yearsOfExperience: integer("years_of_experience").notNull(),
  qualifications: json("qualifications").$type<string[]>().default([]),
  languagesSpoken: json("languages_spoken").$type<string[]>().default([]),
  description: text("description"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  totalPatients: integer("total_patients").default(0),
  consultationFee: integer("consultation_fee").default(0),
  availableHours: json("available_hours").$type<{day: string, start: string, end: string, hospitalId: string}[]>().default([]),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const treatments = pgTable("treatments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  overview: text("overview").notNull(),
  description: text("description").notNull(),
  bedsAllocated: integer("beds_allocated").default(0),
  yearIntroduced: integer("year_introduced"),
  mode: text("mode").notNull(), // "single-specialty" | "multi-specialty"
  costRangeMin: integer("cost_range_min").default(0),
  costRangeMax: integer("cost_range_max").default(0),
  duration: text("duration"), // e.g., "1-2 hours", "3-5 days"
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // percentage
  images: json("images").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").references(() => hospitals.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  contactNumbers: json("contact_numbers").$type<string[]>().default([]),
  email: text("email"),
  facilities: json("facilities").$type<string[]>().default([]),
  operatingHours: json("operating_hours").$type<{day: string, open: string, close: string, is24x7: boolean}[]>().default([]),
  coordinates: json("coordinates").$type<{lat: number, lng: number}>(),
  totalBeds: integer("total_beds").default(0),
  emergencyServices: boolean("emergency_services").default(false),
  parkingAvailable: boolean("parking_available").default(false),
  images: json("images").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Junction tables for many-to-many relationships
export const hospitalDoctors = pgTable("hospital_doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").references(() => hospitals.id).notNull(),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  designation: text("designation"), // e.g., "Chief Cardiologist", "Visiting Consultant"
  isActive: boolean("is_active").default(true)
});

export const hospitalTreatments = pgTable("hospital_treatments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").references(() => hospitals.id).notNull(),
  treatmentId: varchar("treatment_id").references(() => treatments.id).notNull(),
  isActive: boolean("is_active").default(true)
});

export const doctorTreatments = pgTable("doctor_treatments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  treatmentId: varchar("treatment_id").references(() => treatments.id).notNull(),
  isActive: boolean("is_active").default(true)
});

// Insert schemas
export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTreatmentSchema = createInsertSchema(treatments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type Hospital = typeof hospitals.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Treatment = typeof treatments.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type HospitalDoctor = typeof hospitalDoctors.$inferSelect;
export type HospitalTreatment = typeof hospitalTreatments.$inferSelect;
export type DoctorTreatment = typeof doctorTreatments.$inferSelect;

export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

// Extended types for API responses
export type HospitalWithDetails = Hospital & {
  branches: Branch[];
  doctors: (Doctor & { designation?: string })[];
  treatments: Treatment[];
};

export type DoctorWithDetails = Doctor & {
  hospitals: (Hospital & { designation?: string })[];
  treatments: Treatment[];
};

export type TreatmentWithDetails = Treatment & {
  hospitals: Hospital[];
  doctors: Doctor[];
};

export type BranchWithDetails = Branch & {
  hospital: Hospital;
  doctors: Doctor[];
  treatments: Treatment[];
};
