export const COUNTRY_CONFIG = {
  GB: {
    name: "United Kingdom",
    bureau: "Experian UK",
    min: 0,
    max: 999,
  },
  CA: {
    name: "Canada",
    bureau: "Equifax Canada",
    min: 300,
    max: 900,
  },
  AU: {
    name: "Australia",
    bureau: "Equifax Australia",
    min: 0,
    max: 1200,
  },
  IN: {
    name: "India",
    bureau: "CIBIL",
    min: 300,
    max: 900,
  },
  MX: {
    name: "Mexico",
    bureau: "Buro de Credito",
    min: 400,
    max: 850,
  },
} as const;

export const SUPPORTED_COUNTRIES = [
  {
    code: "GB",
    flag: "\uD83C\uDDEC\uD83C\uDDE7",
    name: "United Kingdom",
    bureau: "Experian",
  },
  {
    code: "CA",
    flag: "\uD83C\uDDE8\uD83C\uDDE6",
    name: "Canada",
    bureau: "Equifax CA",
  },
  {
    code: "AU",
    flag: "\uD83C\uDDE6\uD83C\uDDFA",
    name: "Australia",
    bureau: "Equifax AU",
  },
  {
    code: "IN",
    flag: "\uD83C\uDDEE\uD83C\uDDF3",
    name: "India",
    bureau: "CIBIL",
  },
  {
    code: "MX",
    flag: "\uD83C\uDDF2\uD83C\uDDFD",
    name: "Mexico",
    bureau: "Buro de Credito",
  },
] as const;

export const IMMIGRATION_STATUSES = [
  "Work Visa (H-1B)",
  "Student Visa (F-1)",
  "Green Card Holder",
  "Permanent Resident",
  "Spouse Visa (H-4)",
  "Other",
] as const;

export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

export const CORS_ORIGIN =
  process.env.CREDITBRIDGE_ALLOWED_ORIGIN ?? "https://yourdomain.vercel.app";

export const APP_SUBTEXT =
  "Don't start from scratch. CreditBridge translates your foreign credit history so US lenders can see who you really are, financially.";
