import { NextRequest } from "next/server";

import { authenticateApiKey } from "@/lib/api-auth";
import { fail, getRequestMeta, ok, optionsResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { deliverWebhook } from "@/lib/webhooks";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
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
          route: "/api/v1/webhooks/test",
          request_id: meta.request_id,
        },
      });
      return fail("Invalid or missing API key", meta, 401);
    }
    lenderUserId = auth.lenderUserId;

    const payload = {
      event: "test.ping",
      timestamp: new Date().toISOString(),
    };

    await deliverWebhook(auth.lenderId, "test.ping", payload);

    await createAuditLog({
      userId: lenderUserId,
      action: "api.webhooks.test",
      entityType: "webhook_events",
      metadata: {
        request_id: meta.request_id,
      },
    });

    return ok(payload, meta);
  } catch {
    await createAuditLog({
      userId: lenderUserId,
      action: "api.webhooks.test.error",
      entityType: "webhook_events",
      metadata: {
        request_id: meta.request_id,
      },
    });
    return fail("Something went wrong. Please try again.", meta, 500);
  }
}
