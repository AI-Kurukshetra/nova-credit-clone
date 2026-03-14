import { NextRequest } from "next/server";

import { authenticateApiKey } from "@/lib/api-auth";
import { fail, getRequestMeta, ok, optionsResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { maskConsumerName } from "@/lib/format";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { idParamSchema } from "@/lib/validations";

export async function OPTIONS() {
  return optionsResponse();
}

function printHtml(payload: {
  consumerName: string;
  countryName: string;
  bureauName: string;
  translatedScore: number;
  riskTier: string;
  recommendation: string;
}) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>CreditBridge Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
      .header { border-bottom: 2px solid #1e40af; padding-bottom: 12px; margin-bottom: 16px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
      h1 { margin: 0; font-size: 24px; }
      p { margin: 4px 0; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>CreditBridge International Credit Report</h1>
      <p>Consumer: ${payload.consumerName}</p>
      <p>Country: ${payload.countryName} (${payload.bureauName})</p>
    </div>
    <div class="grid">
      <div class="card">
        <p><strong>Translated Score:</strong> ${payload.translatedScore}</p>
        <p><strong>Risk Tier:</strong> ${payload.riskTier}</p>
      </div>
      <div class="card">
        <p><strong>Recommendation:</strong> ${payload.recommendation}</p>
        <p><strong>Generated At:</strong> ${new Date().toISOString()}</p>
      </div>
    </div>
  </body>
</html>`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const meta = getRequestMeta();
  let lenderUserId: string | null = null;

  try {
    const auth = await authenticateApiKey(request.headers.get("Authorization"));
    if (!auth) {
      await createAuditLog({
        userId: null,
        action: "api.auth.failed",
        entityType: "api_route",
        metadata: {
          route: "/api/v1/credit-profiles/[id]/report",
          request_id: meta.request_id,
        },
      });
      return fail("Invalid or missing API key", meta, 401);
    }
    lenderUserId = auth.lenderUserId;

    const params = await context.params;
    const validatedParams = idParamSchema.safeParse(params);
    if (!validatedParams.success) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.credit_profiles.report.validation_failed",
        entityType: "credit_profile",
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Invalid profile ID", meta, 400);
    }

    const supabase = createServiceRoleClient();

    const { data: linkedApplication } = await supabase
      .from("credit_applications")
      .select("id")
      .eq("profile_id", validatedParams.data.id)
      .eq("lender_id", auth.lenderId)
      .maybeSingle();

    if (!linkedApplication) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.credit_profiles.report.not_found",
        entityType: "credit_profile",
        entityId: validatedParams.data.id,
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Profile not found", meta, 404);
    }

    const { data: profile } = await supabase
      .from("credit_profiles")
      .select(
        `
        id,
        translated_score,
        risk_tier,
        countries!inner(name,bureau_name),
        users!inner(full_name),
        risk_assessments(recommendation)
      `,
      )
      .eq("id", validatedParams.data.id)
      .single();

    const { data: reports } = await supabase
      .from("international_credit_reports")
      .select("id,pulled_at,processed_data")
      .eq("profile_id", validatedParams.data.id)
      .order("pulled_at", { ascending: false });

    if (!profile) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.credit_profiles.report.not_found",
        entityType: "credit_profile",
        entityId: validatedParams.data.id,
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Profile not found", meta, 404);
    }

    const user = Array.isArray(profile.users) ? profile.users[0] : profile.users;
    const country = Array.isArray(profile.countries)
      ? profile.countries[0]
      : profile.countries;
    const riskAssessment = Array.isArray(profile.risk_assessments)
      ? profile.risk_assessments[0]
      : profile.risk_assessments;

    await createAuditLog({
      userId: lenderUserId,
      action: "api.credit_profiles.report.get",
      entityType: "credit_profile",
      entityId: validatedParams.data.id,
      metadata: {
        request_id: meta.request_id,
      },
    });

    const reportPayload = {
      profile_id: validatedParams.data.id,
      consumer: {
        name: maskConsumerName(user?.full_name),
      },
      score: {
        translated: profile.translated_score,
        risk_tier: profile.risk_tier,
        recommendation: riskAssessment?.recommendation ?? null,
      },
      country,
      timeline_entries: reports?.flatMap((item) => item.processed_data ?? []) ?? [],
      reports,
    };

    const format = request.nextUrl.searchParams.get("format");
    return ok(
      {
        ...reportPayload,
        print_html:
          format === "print"
            ? printHtml({
                consumerName: maskConsumerName(user?.full_name),
                countryName: country?.name ?? "Unknown",
                bureauName: country?.bureau_name ?? "Unknown",
                translatedScore: profile.translated_score,
                riskTier: profile.risk_tier,
                recommendation: riskAssessment?.recommendation ?? "N/A",
              })
            : null,
      },
      meta,
    );
  } catch {
    await createAuditLog({
      userId: lenderUserId,
      action: "api.credit_profiles.report.error",
      entityType: "credit_profile",
      metadata: {
        request_id: meta.request_id,
      },
    });
    return fail("Something went wrong. Please try again.", meta, 500);
  }
}
