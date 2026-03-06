import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { logAudit, AuditActions } from "@/lib/audit";
import { verifySession } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const { session, response: authResponse } = await verifySession(req as any);
    if (authResponse) return authResponse;

    const { clientId, fullPath } = await req.json();

    if (!clientId || !fullPath) {
      return NextResponse.json({ success: false, error: "Missing clientId or fullPath" }, { status: 400 });
    }

    const supabase = createServerClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "Documents";

    // 1. Delete from Database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('file_path', fullPath);

    if (dbError) {
      console.warn("Database deletion failed (may already be gone):", dbError.message);
    }

    // 2. Delete from Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(bucket)
      .remove([fullPath]);

    if (storageError) {
      throw storageError;
    }

    const deletedCount = storageData?.length || 0;
    if (deletedCount === 0) {
      return NextResponse.json({ success: false, error: "File not found in storage" }, { status: 404 });
    }

    // 3. Audit log
    const fileName = fullPath.split('/').pop() || fullPath;
    logAudit({
      clientId: Number(clientId),
      action: AuditActions.DOCUMENT_DELETED,
      actorRole: (session?.role || "ADMIN") as any,
      details: fileName,
    });

    return NextResponse.json({ success: true, message: "Document deleted successfully" });
  } catch (err: any) {
    console.error("Delete File Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
