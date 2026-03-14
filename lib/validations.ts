import { z } from "zod";

const uuidSchema = z.string().uuid();

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

const cleanTextSchema = z.string().trim().max(500);

export const signUpSchema = z
  .object({
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string(),
    consentDataProcessing: z.boolean().refine((value) => value, {
      message: "Data processing consent is required.",
    }),
    consentTerms: z.boolean().refine((value) => value, {
      message: "Terms acceptance is required.",
    }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  usState: z.string().trim().min(2).max(100),
  immigrationStatus: z.string().trim().min(2).max(100),
});

export const homeCountrySchema = z.object({
  countryCode: z.enum(["GB", "CA", "AU", "IN", "MX"]),
});

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

export const uploadFileMetadataSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z
    .string()
    .trim()
    .refine((value) => allowedMimeTypes.includes(value), {
      message: "Unsupported file type. Allowed: PDF, JPG, PNG.",
    }),
  size: z
    .number()
    .positive()
    .max(10 * 1024 * 1024, "File size must be 10MB or less."),
});

export const lenderOnboardingSchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  licenseNumber: z.string().trim().max(100),
  stateOfOperation: z.string().trim().min(2).max(100),
  companyType: z.enum([
    "Community Bank",
    "Credit Union",
    "Mortgage Lender",
    "Auto Lender",
    "Other",
  ]),
  useCases: z
    .array(
      z.enum([
        "Mortgage loans",
        "Auto loans",
        "Personal loans",
        "Credit cards",
        "Rental screening",
      ]),
    )
    .min(1),
  webhookUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const createApplicationSchema = z.object({
  profile_id: uuidSchema,
  lender_notes: cleanTextSchema.optional(),
});

export const updateApplicationSchema = z.object({
  status: z.enum([
    "submitted",
    "under_review",
    "approved",
    "denied",
    "more_info_requested",
  ]),
  lender_notes: cleanTextSchema.optional(),
});

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const searchConsumerSchema = z.object({
  query: z.string().trim().min(1).max(255),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().email(),
});

export const apiKeyLabelSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(100),
});

export const lenderSettingsSchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  licenseNumber: z.string().trim().min(2).max(100),
});

export const webhookUrlSchema = z.object({
  webhookUrl: z.string().trim().url("Enter a valid webhook URL."),
});

export const landingQuickCheckSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(100),
  email: z.string().trim().email("Enter a valid email address."),
  countryCode: z.enum(["GB", "CA", "AU", "IN", "MX"], {
    error: "Please select your home country.",
  }),
  intent: z.enum(["mortgage", "auto-loan", "credit-card", "rental"], {
    error: "Please select your primary goal.",
  }),
  consent: z.boolean().refine((value) => value, {
    message: "Consent is required to run your readiness pulse.",
  }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type LenderOnboardingInput = z.infer<typeof lenderOnboardingSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type LandingQuickCheckInput = z.infer<typeof landingQuickCheckSchema>;
