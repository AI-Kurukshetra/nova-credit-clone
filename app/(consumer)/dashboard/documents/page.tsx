"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { Eye, FileText, FileUp } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";

const DocumentUploadZone = dynamic(() => import("@/components/shared/document-upload-zone").then((m) => m.DocumentUploadZone), {
  loading: () => (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded bg-slate-100" />
            <Skeleton className="h-3 w-48 rounded bg-slate-100" />
          </div>
          <Skeleton className="h-9 w-20 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  ),
  ssr: false,
});
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_SUBTEXT } from "@/lib/constants";
import { DEMO_DOCUMENTS, DEMO_IDS } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";
import type { DocumentStatus } from "@/lib/types";

const UPLOAD_SLOTS = [
  {
    key: "credit_report",
    label: "Foreign Credit Report",
    helpText: "PDF from your home country bureau",
    required: true,
  },
  {
    key: "passport",
    label: "Passport or National ID",
    helpText: "For identity verification",
    required: true,
  },
  {
    key: "bank_statement",
    label: "Bank Statements",
    helpText: "Last 3 months from any bank",
  },
];

export default function ConsumerDocumentsPage() {
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [documents, setDocuments] = useState(
    DEMO_DOCUMENTS.filter((item) => item.user_id === DEMO_IDS.consumers.priya),
  );

  function handleUploadComplete(files: Record<string, File>) {
    const entries = Object.entries(files);
    if (!entries.length) {
      return;
    }

    const now = new Date().toISOString();
    const created = entries.map(([key, file], index) => ({
      id: `local-${key}-${index}`,
      user_id: DEMO_IDS.consumers.priya,
      profile_id: DEMO_IDS.profiles.priya,
      name: file.name,
      doc_type: key,
      status: "uploaded",
      uploaded_at: now,
    }));

    setDocuments((previous) => [...created, ...previous]);
    toast.success("Document uploaded successfully");
    setOpen(false);
    setDrawerOpen(false);
  }

  if (!documents.length) {
    return (
      <EmptyState
        title="Upload your first document"
        description="Upload your first document to get started"
        icon={FileUp}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="portal-page-intro">
        <div className="portal-page-intro-row">
          <div className="space-y-3">
            <p className="portal-kicker">Document Vault</p>
            <h2 className="portal-subtitle">Manage every intake file in one place</h2>
            <p className="portal-copy max-w-3xl text-sm">{APP_SUBTEXT}</p>
          </div>
          <div className="portal-page-actions">
            <div className="portal-pill-note">
              <FileUp className="size-4 text-indigo-500" />
              Accepted: PDF, JPG, PNG
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button className="hidden sm:inline-flex" onClick={() => setOpen(true)}>
          <FileUp data-icon="inline-start" />
          Upload New Document
        </Button>
        <Button className="sm:hidden" onClick={() => setDrawerOpen(true)}>
          <FileUp data-icon="inline-start" />
          Upload
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload documents</DialogTitle>
            </DialogHeader>
            <DocumentUploadZone
              slots={UPLOAD_SLOTS}
              showSkipBankLink
              onComplete={handleUploadComplete}
            />
          </DialogContent>
        </Dialog>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Upload documents</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <DocumentUploadZone
                slots={UPLOAD_SLOTS}
                showSkipBankLink
                onComplete={handleUploadComplete}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="portal-table-shell">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document, index) => (
              <TableRow key={document.id} className={index % 2 === 0 ? "bg-slate-50" : ""}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50">
                      <FileText className="size-4 text-indigo-500" />
                    </div>
                    <span className="font-medium">{document.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs capitalize">{String(document.doc_type).replaceAll("_", " ")}</span>
                </TableCell>
                <TableCell>
                  <DocumentStatusBadge status={document.status as DocumentStatus} />
                </TableCell>
                <TableCell className="text-slate-600">{formatDate(document.uploaded_at)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">
                    <Eye className="size-3.5" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
