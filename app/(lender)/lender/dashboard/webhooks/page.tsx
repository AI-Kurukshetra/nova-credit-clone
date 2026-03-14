"use client";

import { useState } from "react";

import { Send } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_SUBTEXT } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { webhookUrlSchema } from "@/lib/validations";

const initialEvents = [
  {
    id: "event-1",
    eventType: "application.submitted",
    payloadPreview: "{ profile_id: \"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1\" }",
    delivered: true,
    timestamp: "2026-03-10T14:00:00Z",
  },
  {
    id: "event-2",
    eventType: "application.decision_made",
    payloadPreview: "{ status: \"approved\" }",
    delivered: false,
    timestamp: "2026-03-12T09:30:00Z",
  },
];

export default function LenderWebhooksPage() {
  const [webhookUrl, setWebhookUrl] = useState("https://example.com/community-first/webhook");
  const [events, setEvents] = useState(initialEvents);
  const [webhookUrlError, setWebhookUrlError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const demoApiKey = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "cb_live_demo";

  function handleSaveWebhookUrl(): void {
    const parsed = webhookUrlSchema.safeParse({ webhookUrl });
    if (!parsed.success) {
      setWebhookUrlError(parsed.error.issues[0]?.message ?? "Invalid webhook URL.");
      return;
    }

    setWebhookUrlError(null);
    setSaving(true);
    toast.success("Webhook URL updated");
    setSaving(false);
  }

  async function sendTestEvent() {
    setSending(true);
    try {
      const timestamp = new Date().toISOString();
      const response = await fetch("/api/v1/webhooks/test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${demoApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event: "test.ping", timestamp }),
      });
      if (!response.ok) {
        throw new Error("Webhook request failed");
      }

      setEvents((previous) => [
        {
          id: `event-${Date.now()}`,
          eventType: "test.ping",
          payloadPreview: `{ timestamp: \"${timestamp}\" }`,
          delivered: true,
          timestamp,
        },
        ...previous,
      ]);

      toast.success("Test webhook delivered");
    } catch {
      toast.error("Failed to send test webhook");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="portal-page-intro">
        <div className="portal-page-intro-row">
          <div className="space-y-3">
            <p className="portal-kicker">Webhook Delivery</p>
            <h2 className="portal-subtitle">Wire event flows back into your decision stack</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="portal-field">
            <Label htmlFor="webhook-url">Current webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(event) => setWebhookUrl(event.target.value)}
            />
            {webhookUrlError ? (
              <p className="portal-inline-error">{webhookUrlError}</p>
            ) : null}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveWebhookUrl} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button onClick={sendTestEvent} disabled={sending}>
              <Send data-icon="inline-start" />
              {sending ? "Sending..." : "Send Test Event"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="portal-table-shell">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Payload Preview</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, index) => (
                <TableRow key={event.id} className={index % 2 === 0 ? "bg-white/3" : undefined}>
                  <TableCell>{event.eventType}</TableCell>
                  <TableCell className="font-mono text-xs">{event.payloadPreview}</TableCell>
                  <TableCell>
                    <Badge className={event.delivered ? "portal-status-positive" : "portal-status-danger"}>
                      {event.delivered ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(event.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

