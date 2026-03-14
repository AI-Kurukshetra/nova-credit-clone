"use client";

import { useRef, useState } from "react";

import { CheckCircle2, FileUp, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { uploadFileMetadataSchema } from "@/lib/validations";

interface UploadSlot {
  key: string;
  label: string;
  helpText: string;
  required?: boolean;
}

interface DocumentUploadZoneProps {
  slots: UploadSlot[];
  onComplete?: (files: Record<string, File>) => void;
  showSkipBankLink?: boolean;
}

export function DocumentUploadZone({
  slots,
  onComplete,
  showSkipBankLink = false,
}: DocumentUploadZoneProps) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(slotKey: string, file?: File): void {
    if (!file) {
      return;
    }

    const validation = uploadFileMetadataSchema.safeParse({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid file selected.");
      return;
    }

    setError(null);
    setFiles((previous) => {
      const next = {
        ...previous,
        [slotKey]: file,
      };
      onComplete?.(next);
      return next;
    });
  }

  return (
    <div className="portal-upload-grid">
      {slots.map((slot) => (
        <div
          key={slot.key}
          className="portal-upload-slot"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFileSelect(slot.key, event.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={(element) => {
              inputRefs.current[slot.key] = element;
            }}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) => handleFileSelect(slot.key, event.target.files?.[0])}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                {slot.label}
                {slot.required ? " *" : ""}
              </p>
              <p className="text-xs text-slate-200/80">{slot.helpText}</p>
              {files[slot.key] ? (
                <p className="portal-success-note">
                  <CheckCircle2 />
                  {files[slot.key].name}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRefs.current[slot.key]?.click()}
            >
              <Upload data-icon="inline-start" />
              Upload
            </Button>
          </div>
        </div>
      ))}
      {showSkipBankLink ? (
        <Button type="button" variant="link" className="w-fit p-0">
          <FileUp data-icon="inline-start" />
          Skip bank statements for now
        </Button>
      ) : null}
      {error ? <p className="portal-inline-error">{error}</p> : null}
    </div>
  );
}
