import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { logAudit, AuditActions } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { clientId, fullPath } = await req.json();

    if (!clientId || !fullPath) {
      return NextResponse.json({ success: false, error: "Missing clientId or fullPath" }, { status: 400 });
    }

    const supabase = createServerClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";

    // Attempt delete
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([fullPath]);

    if (error) {
      throw error;
    }

    const deletedCount = data?.length || 0;
    if (deletedCount === 0) {
      return NextResponse.json({ success: false, error: "File not found or already deleted" }, { status: 404 });
    }

    // Audit log
    const fileName = fullPath.split('/').pop() || fullPath;
    logAudit({
      clientId: Number(clientId),
      action: AuditActions.DOCUMENT_DELETED,
      actorRole: "ADMIN",
      details: fileName,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete File Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
