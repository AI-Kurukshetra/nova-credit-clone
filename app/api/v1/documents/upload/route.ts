import { NextRequest } from "next/server";

import { authenticateApiKey } from "@/lib/api-auth";
import { fail, getRequestMeta, ok, optionsResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { uploadFileMetadataSchema } from "@/lib/validations";

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
          route: "/api/v1/documents/upload",
          request_id: meta.request_id,
        },
      });
      return fail("Invalid or missing API key", meta, 401);
    }
    lenderUserId = auth.lenderUserId;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.documents.upload.validation_failed",
        entityType: "document",
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Missing file upload", meta, 400);
    }

    const validation = uploadFileMetadataSchema.safeParse({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.success) {
      await createAuditLog({
        userId: lenderUserId,
        action: "api.documents.upload.validation_failed",
        entityType: "document",
        metadata: {
          request_id: meta.request_id,
        },
      });
      return fail("Unsupported file type or size", meta, 400);
    }

    await createAuditLog({
      userId: lenderUserId,
      action: "api.documents.upload",
      entityType: "document",
      metadata: {
        request_id: meta.request_id,
        size: file.size,
        mime_type: file.type,
      },
    });

    return ok(
      {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      meta,
      201,
    );
  } catch {
    await createAuditLog({
      userId: lenderUserId,
      action: "api.documents.upload.error",
      entityType: "document",
      metadata: {
        request_id: meta.request_id,
      },
    });
    return fail("Something went wrong. Please try again.", meta, 500);
  }
}
