"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Camera, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { DEMO_CONSUMERS } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/client";
import { profileUpdateSchema } from "@/lib/validations";

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "CB";
}

export default function ConsumerSettingsPage() {
  const router = useRouter();
  const fallback = DEMO_CONSUMERS[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(fallback.email);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("CB");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setEmail(user.email ?? fallback.email);
          const meta = user.user_metadata ?? {};
          const first = meta.first_name ?? "";
          const last = meta.last_name ?? "";
          setFirstName(first);
          setLastName(last);
          setInitials(getInitials(first, last, user.email));

          // Load avatar — prefer user_metadata URL, but if it's a huge base64,
          // strip it from metadata to prevent cookie bloat (HTTP 431)
          if (meta.avatar_url) {
            if (meta.avatar_url.startsWith("data:")) {
              // Base64 is in auth metadata — remove it to fix cookie size
              setAvatarUrl(meta.avatar_url); // show it locally
              await supabase.auth.updateUser({ data: { avatar_url: null } });
            } else {
              setAvatarUrl(meta.avatar_url);
            }
          }

          // Also check public.users metadata for avatar (fallback storage)
          const { data: publicUser } = await supabase
            .from("users")
            .select("metadata")
            .eq("id", user.id)
            .maybeSingle();

          if (publicUser?.metadata?.avatar_url) {
            setAvatarUrl(publicUser.metadata.avatar_url);
          }
        }
      } catch { /* fallback to demo */ }
    }
    loadUser();
  }, [fallback.email]);

  async function handleSaveProfile() {
    const parsed = profileUpdateSchema.safeParse({ first_name: firstName, last_name: lastName, email });
    if (!parsed.success) {
      setFieldErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message])));
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();

        const { error } = await supabase.auth.updateUser({
          email,
          data: { first_name: firstName, last_name: lastName },
        });
        if (error) throw new Error(error.message);

        // Also update public.users table
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("users").update({
            full_name: `${firstName} ${lastName}`.trim(),
            email,
          }).eq("id", user.id);
        }

        // Update local initials immediately
        setInitials(getInitials(firstName, lastName, email));
      }

      toast.success("Profile saved");
      window.dispatchEvent(new CustomEvent("creditbridge:profile-updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("Password must include an uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("Password must include a number.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();

        // Verify current password by re-authenticating
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) throw new Error("Not authenticated");

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (signInError) {
          setPasswordError("Current password is incorrect.");
          setIsChangingPassword(false);
          return;
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) throw new Error(updateError.message);
      }

      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB.");
      return;
    }

    setIsUploading(true);
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setAvatarUrl(URL.createObjectURL(file));
        toast.success("Avatar updated (demo mode)");
        window.dispatchEvent(new CustomEvent("creditbridge:profile-updated"));
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() ?? "jpg";
      const filePath = `avatars/${user.id}.${ext}`;

      // Try Supabase Storage first
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      let finalUrl: string;

      if (uploadError) {
        console.warn("[CreditBridge] Storage upload failed:", uploadError.message);
        // Fall back: store avatar URL in public.users table only (NOT in user_metadata,
        // which bloats the JWT/cookie and causes HTTP 431 errors)
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Store in public.users metadata column (not auth metadata)
        await supabase
          .from("users")
          .update({ metadata: { avatar_url: dataUrl } })
          .eq("id", user.id);

        finalUrl = dataUrl;
      } else {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        finalUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        // Save small URL string (not base64) in user_metadata — this is safe
        await supabase.auth.updateUser({ data: { avatar_url: finalUrl } });
      }

      setAvatarUrl(finalUrl);
      toast.success("Avatar updated");
      window.dispatchEvent(new CustomEvent("creditbridge:profile-updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload avatar.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        toast.success("Account deleted (demo mode)");
        setDeleteModalOpen(false);
        router.push("/");
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Call the delete API which uses service role to hard delete
      const response = await fetch("/api/v1/me/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }

      // Sign out locally
      await supabase.auth.signOut();
      toast.success("Account permanently deleted");
      setDeleteModalOpen(false);
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete account.");
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
            <h2 className="portal-subtitle">Profile & account</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
        </div>
      </section>

      {/* ── Avatar ── */}
      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>Upload a photo to personalize your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-5">
            <button
              type="button"
              className="group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {avatarUrl ? (
                <Avatar className="size-full">
                  <AvatarImage src={avatarUrl} alt="Profile" />
                  <AvatarFallback className="bg-indigo-50 text-lg font-semibold text-indigo-700">{initials}</AvatarFallback>
                </Avatar>
              ) : (
                <span className="text-2xl font-bold text-indigo-300">{initials}</span>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-5 text-white" />
              </div>
            </button>
            <div className="space-y-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload photo"}
              </Button>
              <p className="text-xs text-slate-400">JPG, PNG under 2 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
                e.target.value = "";
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Profile details ── */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and email address.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="portal-field">
            <Label htmlFor="first-name">First name</Label>
            <Input id="first-name" placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            {fieldErrors.first_name ? <p className="portal-inline-error">{fieldErrors.first_name}</p> : null}
          </div>
          <div className="portal-field">
            <Label htmlFor="last-name">Last name</Label>
            <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            {fieldErrors.last_name ? <p className="portal-inline-error">{fieldErrors.last_name}</p> : null}
          </div>
          <div className="portal-field sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            {fieldErrors.email ? <p className="portal-inline-error">{fieldErrors.email}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Change password ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-slate-400" />
            Change password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="portal-field">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="portal-field">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="portal-field">
              <Label htmlFor="confirm-new-password">Confirm new password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>
          {passwordError ? <p className="portal-inline-error">{passwordError}</p> : null}
          <div>
            <Button onClick={handleChangePassword} disabled={isChangingPassword || !currentPassword || !newPassword}>
              {isChangingPassword ? "Updating..." : "Update password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Danger zone ── */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-700">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setDeleteModalOpen(true)} disabled={isDeleting}>
            <Trash2 className="mr-2 size-4" />
            Delete my account
          </Button>
        </CardContent>
      </Card>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, credit profiles, documents, and all
              related data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Yes, delete everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
