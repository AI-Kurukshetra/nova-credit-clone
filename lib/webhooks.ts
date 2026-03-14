import { signWebhookPayload } from "@/lib/security";
import { createServiceRoleClient } from "@/lib/supabase/server";

const WEBHOOK_SECRET = process.env.CREDITBRIDGE_WEBHOOK_SECRET ?? "dev-secret";

export async function deliverWebhook(
  lenderId: string,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: lender } = await supabase
    .from("lenders")
    .select("webhook_url")
    .eq("id", lenderId)
    .single();

  const { data: event } = await supabase
    .from("webhook_events")
    .insert({
      lender_id: lenderId,
      event_type: eventType,
      payload,
      delivered: false,
    })
    .select("id")
    .single();

  if (!lender?.webhook_url) {
    return;
  }

  let delivered = false;
  try {
    const response = await fetch(lender.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CreditBridge-Event": eventType,
        "X-CreditBridge-Signature": signWebhookPayload(payload, WEBHOOK_SECRET),
      },
      body: JSON.stringify(payload),
    });
    delivered = response.ok;
  } catch {
    delivered = false;
  }

  if (event?.id) {
    await supabase
      .from("webhook_events")
      .update({
        delivered,
        delivered_at: delivered ? new Date().toISOString() : null,
      })
      .eq("id", event.id);
  }
}
