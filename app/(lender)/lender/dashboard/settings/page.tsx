"use client";

import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_SUBTEXT } from "@/lib/constants";
import { lenderSettingsSchema } from "@/lib/validations";

export default function LenderSettingsPage() {
  const [companyName, setCompanyName] = useState("Community First Credit Union");
  const [licenseNumber, setLicenseNumber] = useState("CF-2026-0019");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [updatingSecurity, setUpdatingSecurity] = useState(false);

  async function handleSaveProfile(): Promise<void> {
    const parsed = lenderSettingsSchema.safeParse({
      companyName,
      licenseNumber,
    });

    if (!parsed.success) {
      const errors = Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      );
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSaving(true);
    toast.success("Profile saved");
    setSaving(false);
  }

  async function handleSecurityUpdate(message: string): Promise<void> {
    setUpdatingSecurity(true);
    toast.success(message);
    setUpdatingSecurity(false);
  }

  return (
    <div className="space-y-6">
      <section className="portal-page-intro">
        <div className="portal-page-intro-row">
          <div className="space-y-3">
            <p className="portal-kicker">Organization Settings</p>
            <h2 className="portal-subtitle">Keep your institution profile and controls current</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Update lender organization details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="portal-field">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
            {fieldErrors.companyName ? (
              <p className="portal-inline-error">{fieldErrors.companyName}</p>
            ) : null}
          </div>
          <div className="portal-field">
            <Label htmlFor="license-number">License number</Label>
            <Input
              id="license-number"
              value={licenseNumber}
              onChange={(event) => setLicenseNumber(event.target.value)}
            />
            {fieldErrors.licenseNumber ? (
              <p className="portal-inline-error">{fieldErrors.licenseNumber}</p>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Rotate API keys and review webhook secrets regularly.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleSecurityUpdate("Security policy updated")}
            disabled={updatingSecurity}
          >
            Enforce IP allowlist
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSecurityUpdate("MFA reminder sent")}
            disabled={updatingSecurity}
          >
            Require team MFA
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
