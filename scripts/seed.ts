// @ts-nocheck
import { randomUUID } from "crypto";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

import { createClient } from "@supabase/supabase-js";

import { COUNTRY_CONFIG } from "../lib/constants";
import { translateCreditScore } from "../lib/credit-engine";
import { generateApiKey, hashApiKey } from "../lib/security";

type CountryCode = keyof typeof COUNTRY_CONFIG;

interface SeedConsumer {
  fullName: string;
  email: string;
  countryCode: CountryCode;
  bureauName: string;
  foreignScore: number;
  foreignScoreMax: number;
}

interface SeedLender {
  companyName: string;
  email: string;
  licenseNumber: string;
}

const DEMO_PASSWORD = "Demo@1234";

function loadEnvFile(fileName: string): void {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const normalizedLine = line.startsWith("export ")
      ? line.slice(7).trim()
      : line;
    const separatorIndex = normalizedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) {
      continue;
    }

    let value = normalizedLine.slice(separatorIndex + 1).trim();
    const isDoubleQuoted = value.startsWith('"') && value.endsWith('"');
    const isSingleQuoted = value.startsWith("'") && value.endsWith("'");

    if (isDoubleQuoted || isSingleQuoted) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function loadSeedEnv(): void {
  loadEnvFile(".env.local");
  loadEnvFile(".env");
}

const countriesSeed = [
  { code: "GB", name: "United Kingdom", bureau_name: "Experian UK", score_min: 0, score_max: 999 },
  { code: "CA", name: "Canada", bureau_name: "Equifax Canada", score_min: 300, score_max: 900 },
  { code: "AU", name: "Australia", bureau_name: "Equifax Australia", score_min: 0, score_max: 1200 },
  { code: "IN", name: "India", bureau_name: "CIBIL", score_min: 300, score_max: 900 },
  { code: "MX", name: "Mexico", bureau_name: "Buro de Credito", score_min: 400, score_max: 850 },
] as const;

const consumers: SeedConsumer[] = [
  {
    fullName: "Priya Sharma",
    email: "priya@demo.com",
    countryCode: "IN",
    bureauName: "CIBIL",
    foreignScore: 780,
    foreignScoreMax: 900,
  },
  {
    fullName: "James Mitchell",
    email: "james@demo.com",
    countryCode: "GB",
    bureauName: "Experian UK",
    foreignScore: 887,
    foreignScoreMax: 999,
  },
  {
    fullName: "Carlos Mendoza",
    email: "carlos@demo.com",
    countryCode: "MX",
    bureauName: "Buro de Credito",
    foreignScore: 660,
    foreignScoreMax: 850,
  },
  {
    fullName: "Emma Wilson",
    email: "emma@demo.com",
    countryCode: "AU",
    bureauName: "Equifax Australia",
    foreignScore: 750,
    foreignScoreMax: 1200,
  },
  {
    fullName: "Aisha Nkrumah",
    email: "aisha@demo.com",
    countryCode: "CA",
    bureauName: "Equifax Canada",
    foreignScore: 745,
    foreignScoreMax: 900,
  },
];

const lenders: SeedLender[] = [
  {
    companyName: "Community First Credit Union",
    email: "community@demo.com",
    licenseNumber: "CF-2026-100",
  },
  {
    companyName: "Apex Mortgage Group",
    email: "apex@demo.com",
    licenseNumber: "AP-2026-220",
  },
];

const applicationSeed = [
  { lender: "community@demo.com", consumer: "priya@demo.com", status: "approved", notes: null },
  {
    lender: "community@demo.com",
    consumer: "carlos@demo.com",
    status: "under_review",
    notes: null,
  },
  {
    lender: "community@demo.com",
    consumer: "aisha@demo.com",
    status: "submitted",
    notes: null,
  },
  { lender: "apex@demo.com", consumer: "james@demo.com", status: "approved", notes: null },
  {
    lender: "apex@demo.com",
    consumer: "emma@demo.com",
    status: "denied",
    notes: "Score below minimum threshold of 660",
  },
] as const;

function timelineEntries(seed: number) {
  return [
    {
      account_type: "Credit Card",
      institution: "GlobalBank Platinum",
      opened_date: "2019-05-01",
      closed_date: null,
      credit_limit: 8000 + seed * 100,
      balance: 2300 + seed * 50,
      status: "Active",
      payment_history: ["on_time", "on_time", "on_time", "late", "on_time"],
    },
    {
      account_type: "Credit Card",
      institution: "Cityline Rewards",
      opened_date: "2020-11-01",
      closed_date: null,
      credit_limit: 5000 + seed * 120,
      balance: 800 + seed * 40,
      status: "Active",
      payment_history: ["on_time", "on_time", "on_time", "on_time", "on_time"],
    },
    {
      account_type: "Personal Loan",
      institution: "Trust Lending",
      opened_date: "2018-03-01",
      closed_date: "2021-03-01",
      credit_limit: 12000,
      balance: 0,
      status: "Closed",
      payment_history: ["on_time", "on_time", "on_time", "on_time", "on_time"],
    },
    {
      account_type: "Personal Loan",
      institution: "Metro Loan Co.",
      opened_date: "2022-08-01",
      closed_date: null,
      credit_limit: 7000,
      balance: 1400,
      status: "Active",
      payment_history: ["on_time", "late", "on_time", "on_time", "on_time"],
    },
    {
      account_type: "Auto Loan",
      institution: "Velocity Auto Finance",
      opened_date: "2021-01-01",
      closed_date: null,
      credit_limit: 18000,
      balance: 7200,
      status: "Active",
      payment_history: ["on_time", "on_time", "on_time", "on_time", "on_time"],
    },
    {
      account_type: "Mortgage",
      institution: "Homestead Mortgage",
      opened_date: "2017-06-01",
      closed_date: null,
      credit_limit: 220000,
      balance: 187000,
      status: seed % 2 === 0 ? "Active" : "Delinquent",
      payment_history:
        seed % 2 === 0
          ? ["on_time", "on_time", "on_time", "on_time", "on_time"]
          : ["on_time", "late", "missed", "on_time", "late"],
    },
    {
      account_type: "Utility",
      institution: "National Power",
      opened_date: "2016-02-01",
      closed_date: null,
      credit_limit: 2000,
      balance: 120,
      status: "Active",
      payment_history: ["on_time", "on_time", "on_time", "on_time", "on_time"],
    },
    {
      account_type: "Utility",
      institution: "Urban Water",
      opened_date: "2016-02-01",
      closed_date: null,
      credit_limit: 1200,
      balance: 85,
      status: "Active",
      payment_history: ["on_time", "on_time", "on_time", "on_time", "on_time"],
    },
  ];
}

async function ensureAuthUser(
  supabase: ReturnType<typeof createClient>,
  email: string,
  password: string,
  role: "consumer" | "lender",
  fullName: string,
) {
  const existingUser = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUser.data?.id) {
    return existingUser.data.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
      consent_given: role === "consumer",
      consent_at: new Date().toISOString(),
    },
  });

  if (error || !data.user) {
    throw new Error(`Unable to create auth user for ${email}: ${error?.message}`);
  }

  return data.user.id;
}

async function upsertCountryData(supabase: ReturnType<typeof createClient>) {
  await supabase.from("countries").upsert(countriesSeed, { onConflict: "code" });

  const { data: countries } = await supabase
    .from("countries")
    .select("id,code,bureau_name")
    .in(
      "code",
      countriesSeed.map((country) => country.code),
    );

  const countryMap = new Map<string, { id: string; bureau_name: string }>();
  for (const country of countries ?? []) {
    countryMap.set(country.code, { id: country.id, bureau_name: country.bureau_name });
  }

  for (const country of countriesSeed) {
    const countryId = countryMap.get(country.code)?.id;
    if (!countryId) {
      continue;
    }

    await supabase.from("credit_bureaus").upsert(
      {
        country_id: countryId,
        name: country.bureau_name,
        api_endpoint: `https://api.${country.code.toLowerCase()}.creditbridge.example/bureau`,
      },
      { onConflict: "country_id,name" },
    );
  }

  return countryMap;
}

async function seedConsumers(
  supabase: ReturnType<typeof createClient>,
  countryMap: Map<string, { id: string; bureau_name: string }>,
) {
  const profileIdByEmail = new Map<string, string>();

  const { data: bureaus } = await supabase
    .from("credit_bureaus")
    .select("id,country_id,name");
  const bureauMap = new Map<string, string>();
  for (const bureau of bureaus ?? []) {
    bureauMap.set(bureau.name, bureau.id);
  }

  for (const [index, consumer] of consumers.entries()) {
    const userId = await ensureAuthUser(
      supabase,
      consumer.email,
      DEMO_PASSWORD,
      "consumer",
      consumer.fullName,
    );

    await supabase.from("users").upsert(
      {
        id: userId,
        email: consumer.email,
        role: "consumer",
        full_name: consumer.fullName,
        metadata: {
          consent_given: true,
          consent_at: new Date().toISOString(),
        },
      },
      { onConflict: "email" },
    );

    const countryId = countryMap.get(consumer.countryCode)?.id;
    if (!countryId) {
      continue;
    }

    const translated = translateCreditScore(
      consumer.foreignScore,
      consumer.countryCode,
      consumer.foreignScoreMax,
    );

    const existingProfile = await supabase
      .from("credit_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const profileId = existingProfile.data?.id ?? randomUUID();

    await supabase.from("credit_profiles").upsert(
      {
        id: profileId,
        user_id: userId,
        home_country_id: countryId,
        foreign_score: consumer.foreignScore,
        foreign_score_max: consumer.foreignScoreMax,
        translated_score: translated.translatedScore,
        risk_tier: translated.riskTier,
        status: "complete",
        score_breakdown: translated.scoreBreakdown,
      },
      { onConflict: "id" },
    );

    profileIdByEmail.set(consumer.email, profileId);

    await supabase.from("risk_assessments").delete().eq("profile_id", profileId);
    await supabase.from("risk_assessments").insert({
      profile_id: profileId,
      score_breakdown: translated.scoreBreakdown,
      flags: translated.flags,
      recommendation: translated.recommendation,
    });

    const bureauId = bureauMap.get(consumer.bureauName);
    if (bureauId) {
      await supabase
        .from("international_credit_reports")
        .delete()
        .eq("profile_id", profileId);

      const entries = timelineEntries(index + 1);
      await supabase.from("international_credit_reports").insert(
        entries.map((entry) => ({
          profile_id: profileId,
          bureau_id: bureauId,
          raw_data: {
            imported_at: new Date().toISOString(),
            source: "seed",
          },
          processed_data: [entry],
        })),
      );
    }

    await supabase.from("documents").delete().eq("profile_id", profileId);
    await supabase.from("documents").insert([
      {
        user_id: userId,
        profile_id: profileId,
        doc_type: "credit_report",
        file_url: `https://assets.creditbridge.dev/${consumer.email}/credit-report.pdf`,
        status: "verified",
      },
      {
        user_id: userId,
        profile_id: profileId,
        doc_type: "passport",
        file_url: `https://assets.creditbridge.dev/${consumer.email}/passport.jpg`,
        status: "verified",
      },
    ]);
  }

  return profileIdByEmail;
}

async function seedLenders(supabase: ReturnType<typeof createClient>) {
  const lenderIdByEmail = new Map<string, string>();
  
  for (const lender of lenders) {
    const userId = await ensureAuthUser(
      supabase,
      lender.email,
      DEMO_PASSWORD,
      "lender",
      lender.companyName,
    );

    await supabase.from("users").upsert(
      {
        id: userId,
        email: lender.email,
        role: "lender",
        full_name: lender.companyName,
      },
      { onConflict: "email" },
    );

    const existingLender = await supabase
      .from("lenders")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const lenderId = existingLender.data?.id ?? randomUUID();

    await supabase.from("lenders").upsert(
      {
        id: lenderId,
        user_id: userId,
        company_name: lender.companyName,
        license_number: lender.licenseNumber,
        webhook_url: `https://example.com/webhooks/${lender.companyName.toLowerCase().replaceAll(" ", "-")}`,
        active: true,
      },
      { onConflict: "id" },
    );

    lenderIdByEmail.set(lender.email, lenderId);

    await supabase.from("api_keys").delete().eq("lender_id", lenderId);

    const generated = generateApiKey();
    const keyHash = hashApiKey(generated.key);
    await supabase.from("api_keys").insert({
      lender_id: lenderId,
      key_hash: keyHash,
      key_prefix: generated.keyPrefix,
      label: "Default seeded key",
      active: true,
    });
  }

  return { lenderIdByEmail };
}

async function seedApplications(
  supabase: ReturnType<typeof createClient>,
  profileIdByEmail: Map<string, string>,
  lenderIdByEmail: Map<string, string>,
) {
  for (const record of applicationSeed) {
    const profileId = profileIdByEmail.get(record.consumer);
    const lenderId = lenderIdByEmail.get(record.lender);

    if (!profileId || !lenderId) {
      continue;
    }

    const existing = await supabase
      .from("credit_applications")
      .select("id")
      .eq("profile_id", profileId)
      .eq("lender_id", lenderId)
      .maybeSingle();

    const id = existing.data?.id ?? randomUUID();
    await supabase.from("credit_applications").upsert(
      {
        id,
        profile_id: profileId,
        lender_id: lenderId,
        status: record.status,
        lender_notes: record.notes,
        recommendation: record.status === "approved" ? "Approve" : "Manual review required",
        decision_at:
          record.status === "approved" || record.status === "denied"
            ? new Date().toISOString()
            : null,
      },
      { onConflict: "id" },
    );
  }
}

async function main() {
  loadSeedEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.CREDITBRIDGE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.",
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const countryMap = await upsertCountryData(supabase);
  const profileIdByEmail = await seedConsumers(supabase, countryMap);
  const { lenderIdByEmail } = await seedLenders(supabase);
  await seedApplications(supabase, profileIdByEmail, lenderIdByEmail);

  console.info("Seed complete", {
    consumersSeeded: consumers.length,
    lendersSeeded: lenders.length,
    applicationsSeeded: applicationSeed.length,
  });
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});








