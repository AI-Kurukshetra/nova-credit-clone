"use client";

import { useMemo, useState } from "react";

import { Copy, KeyRound, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_SUBTEXT } from "@/lib/constants";
import { generateClientApiKey } from "@/lib/api-key-client";
import { formatDate } from "@/lib/format";
import { apiKeyLabelSchema } from "@/lib/validations";

interface ApiKeyRow {
  id: string;
  label: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  active: boolean;
}

const initialKeys: ApiKeyRow[] = [
  {
    id: "key-1",
    label: "Primary production key",
    keyPrefix: "cb_live_",
    createdAt: "2026-03-02T09:10:00Z",
    lastUsedAt: "2026-03-12T11:05:00Z",
    active: true,
  },
];

export default function LenderApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>(initialKeys);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [labelError, setLabelError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const examples = useMemo(
    () => ({
      curl: `curl -H "Authorization: Bearer cb_live_xxxxx" \\\n  https://creditbridge.app/api/v1/credit-profiles/{id}`,
      js: `fetch("https://creditbridge.app/api/v1/credit-profiles/{id}", {\n  headers: { Authorization: "Bearer cb_live_xxxxx" }\n})`,
    }),
    [],
  );

  function createNewKey() {
    const parsed = apiKeyLabelSchema.safeParse({ label });
    if (!parsed.success) {
      setLabelError(parsed.error.issues[0]?.message ?? "Label is required");
      return;
    }

    setLabelError(null);
    setIsCreating(true);

    const generated = generateClientApiKey();
    setKeys((previous) => [
      {
        id: `key-${Date.now()}`,
        label: parsed.data.label,
        keyPrefix: generated.keyPrefix,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        active: true,
      },
      ...previous,
    ]);
    setNewApiKey(generated.key);
    setLabel("");
    setIsCreating(false);
  }

  function revokeKey(id: string) {
    setKeys((previous) =>
      previous.map((key) => (key.id === id ? { ...key, active: false } : key)),
    );
    toast.success("API key revoked");
  }

  async function copyKey() {
    if (!newApiKey) {
      return;
    }
    await navigator.clipboard.writeText(newApiKey);
    toast.success("API key copied to clipboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.2fr_1fr]">
      <section className="portal-page-intro xl:col-span-2">
        <div className="portal-page-intro-row">
          <div className="space-y-3">
            <p className="portal-kicker">API Credentials</p>
            <h2 className="portal-subtitle">Secure key issuance in the same visual system</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Create and manage lender API keys.
            </CardDescription>
          </div>

          <Button onClick={() => setDialogOpen(true)}>
            <Plus data-icon="inline-start" />
            Create New Key
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="api-label">Label</Label>
                  <Input
                    id="api-label"
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                  />
                  {labelError ? <p className="portal-inline-error">{labelError}</p> : null}
                </div>

                {newApiKey ? (
                  <div className="rounded-lg border bg-slate-50 p-3 font-mono text-xs text-slate-800">
                    <p className="break-all">{newApiKey}</p>
                    <p className="mt-1 text-amber-600">Save this key. It is shown only once.</p>
                  </div>
                ) : null}
              </div>
              <DialogFooter>
                {newApiKey ? (
                  <Button variant="outline" onClick={copyKey}>
                    <Copy data-icon="inline-start" />
                    Copy key
                  </Button>
                ) : null}
                <Button onClick={createNewKey} disabled={isCreating}>
                  {isCreating ? "Generating..." : "Generate key"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <div className="portal-table-shell">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Key Prefix</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key, index) => (
                <TableRow key={key.id} className={index % 2 === 0 ? "bg-slate-50" : undefined}>
                  <TableCell>{key.label}</TableCell>
                  <TableCell className="font-mono">{key.keyPrefix}</TableCell>
                  <TableCell>{formatDate(key.createdAt)}</TableCell>
                  <TableCell>{key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never"}</TableCell>
                  <TableCell>
                    <Badge className={key.active ? "portal-status-positive" : "portal-status-danger"}>
                      {key.active ? "Active" : "Revoked"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {key.active ? (
                      <Button size="sm" variant="outline" onClick={() => revokeKey(key.id)}>
                        Revoke
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code examples</CardTitle>
          <CardDescription>Use your API key in these templates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">curl</p>
            <pre className="overflow-x-auto rounded-lg border bg-slate-50 p-3 text-xs text-slate-800">
{examples.curl}
            </pre>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">JavaScript</p>
            <pre className="overflow-x-auto rounded-lg border bg-slate-50 p-3 text-xs text-slate-800">
{examples.js}
            </pre>
          </div>
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <KeyRound className="text-primary" />
            Full keys are never shown again after creation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
