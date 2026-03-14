"use client";

import { useState } from "react";

import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_SUBTEXT } from "@/lib/constants";
import { DEMO_CONSUMERS, DEMO_IDS } from "@/lib/demo-data";
import { profileUpdateSchema } from "@/lib/validations";

export default function ConsumerSettingsPage() {
  const consumer = DEMO_CONSUMERS[0];
  const [fullName, setFullName] = useState(consumer.fullName);
  const [email, setEmail] = useState(consumer.email);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const demoApiKey = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "cb_live_demo";

  async function handleSaveProfile() {
    const parsed = profileUpdateSchema.safeParse({
      full_name: fullName,
      email,
    });

    if (!parsed.success) {
      const errors = Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      );
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    toast.success("Profile saved");
    setIsSaving(false);
  }

  async function handleDownloadData() {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/v1/me/export?user_id=${DEMO_IDS.consumers.priya}`, {
        headers: {
          Authorization: `Bearer ${demoApiKey}`,
        },
      });
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const result = await response.json();
      const blob = new Blob([JSON.stringify(result.data ?? {}, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "creditbridge-data-export.json";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to download data.");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/v1/me/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${demoApiKey}`,
        },
        body: JSON.stringify({ user_id: DEMO_IDS.consumers.priya }),
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      toast.success("Account deletion request submitted");
      setDeleteModalOpen(false);
    } catch {
      toast.error("Unable to process delete request.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="portal-page-intro">
        <div className="portal-page-intro-row">
          <div className="space-y-3">
            <p className="portal-kicker">Settings</p>
            <h2 className="portal-subtitle">Identity, privacy, and consent controls</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your core identity details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="portal-field">
            <Label htmlFor="full-name">Full name</Label>
            <Input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            {fieldErrors.full_name ? (
              <p className="portal-inline-error">{fieldErrors.full_name}</p>
            ) : null}
          </div>
          <div className="portal-field">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            {fieldErrors.email ? (
              <p className="portal-inline-error">{fieldErrors.email}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Privacy</CardTitle>
          <CardDescription>
            Manage exports and data retention settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleDownloadData} disabled={isDownloading}>
            <Download data-icon="inline-start" />
            {isDownloading ? "Downloading..." : "Download My Data"}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteModalOpen(true)} disabled={isDeleting}>
            <Trash2 data-icon="inline-start" />
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consent</CardTitle>
          <CardDescription>Consent timestamps captured during onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="portal-pill-note">Data processing consent: 2026-03-01T09:20:00Z</p>
          <p className="portal-pill-note">Terms acceptance: 2026-03-01T09:20:00Z</p>
        </CardContent>
      </Card>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              Your data will be retained for 30 days per regulatory requirements,
              then permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Confirm delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
