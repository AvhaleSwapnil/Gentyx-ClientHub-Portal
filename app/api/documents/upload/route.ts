import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { logAudit, AuditActions, AuditActorRole } from "@/lib/audit";
import { queueDocumentUploadNotification } from "@/lib/notification-batcher";
import { getClientRootFolder } from "@/lib/storage-utils";
import { verifySession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

type DuplicateAction = "ask" | "replace" | "skip";

function cleanSegment(input: string) {
  return input
    .replace(/\\/g, "/")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s !== "." && s !== "..")
    .join("/");
}

export async function POST(req: NextRequest) {
  try {
    const { session, response: authResponse } = await verifySession(req);
    if (authResponse) return authResponse;

    const formData = await req.formData();
    const clientId = (formData.get("clientId") as string)?.trim();
    const rawFolderName = (formData.get("folderName") as string | null) || null;
    const file = formData.get("file") as File | null;
    const duplicateActionRaw = (formData.get("duplicateAction") as string | null)?.trim() || "ask";
    const duplicateAction = (["ask", "replace", "skip"].includes(duplicateActionRaw)
      ? duplicateActionRaw
      : "ask") as DuplicateAction;

    const role = (session?.role || "ADMIN") as AuditActorRole;
    let visibility = ((formData.get("visibility") as string)?.trim() || "shared") as "shared" | "private";
    if (role !== "ADMIN") visibility = "shared";

    // RBAC: Non-admins can only upload to their own clientId
    if (session?.role === 'CLIENT') {
      const secureClientId = req.cookies.get("clienthub_clientId")?.value;
      if (clientId && secureClientId !== clientId) {
        return NextResponse.json({ success: false, error: "Forbidden: You cannot upload to another client's folder" }, { status: 403 });
      }
    }

    if (!clientId || !file) {
      return NextResponse.json({ success: false, error: "Client and file are required" }, { status: 400 });
    }

    if (file.name === ".keep") {
      return NextResponse.json({ success: false, error: "Invalid file name" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const safeFolder = rawFolderName ? cleanSegment(rawFolderName) : null;
    const rootFolder = await getClientRootFolder(clientId);
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";
    const supabase = createServerClient();

    const parentPath = safeFolder ? `${rootFolder}/${safeFolder}` : rootFolder;
    const fullPath = `${parentPath}/${fileName}`;

    // 1. Check if file exists
    const { data: existingFiles } = await supabase.storage
      .from(bucket)
      .list(parentPath, { search: fileName });

    const exists = existingFiles?.some(f => f.name === fileName);

    if (exists && duplicateAction === "ask") {
      return NextResponse.json({
        success: false,
        duplicate: true,
        message: "File already exists. Choose Replace or Skip.",
        existingPath: fullPath,
        fileName,
      }, { status: 409 });
    }

    if (exists && duplicateAction === "skip") {
      logAudit({
        clientId: Number(clientId),
        action: AuditActions.DOCUMENT_UPLOADED,
        actorRole: role,
        details: `Skipped (duplicate): ${fileName}`,
      });

      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Upload skipped (duplicate)",
        path: fullPath,
        fileName,
      });
    }

    // 2. Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fullPath, buffer, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // 3. Audit Log
    logAudit({
      clientId: Number(clientId),
      action: AuditActions.DOCUMENT_UPLOADED,
      actorRole: role,
      details: exists && duplicateAction === "replace" ? `Replaced: ${fileName}` : fileName,
    });

    // 4. Notifications
    const isAdminOnlyFolder =
      safeFolder === "Admin Only" || safeFolder === "Admin Restricted" ||
      (safeFolder && (safeFolder.startsWith("Admin Only/") || safeFolder.startsWith("Admin Restricted/")));

    if (visibility !== "private" && !isAdminOnlyFolder) {
      (async () => {
        try {
          const { data: clientData } = await supabase
            .from('Clients')
            .select('client_name')
            .eq('client_id', clientId)
            .single();

          const clientName = clientData?.client_name || `Client ${clientId}`;

          queueDocumentUploadNotification({
            clientId: Number(clientId),
            clientName: clientName,
            uploaderName: role === 'ADMIN' ? 'Admin' : clientName,
            uploaderRole: role as any,
            documentName: fileName,
            folderPath: safeFolder || undefined,
          });
        } catch (emailErr) {
          console.error("Failed to queue admin notification:", emailErr);
        }
      })();
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fullPath);

    return NextResponse.json({
      success: true,
      message: exists && duplicateAction === "replace" ? "File replaced successfully" : "File uploaded successfully",
      path: fullPath,
      url: publicUrlData.publicUrl,
      finalFileName: fileName,
      replaced: exists && duplicateAction === "replace"
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ success: false, error: err.message || "Upload failed" }, { status: 500 });
  }
}
