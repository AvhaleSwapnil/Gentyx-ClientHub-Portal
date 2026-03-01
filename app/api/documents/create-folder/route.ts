import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { logAudit, AuditActions, AuditActorRole } from "@/lib/audit";
import { queueFolderCreatedNotification } from "@/lib/notification-batcher";
import { getClientRootFolder } from "@/lib/storage-utils";
import { verifySession } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const { session, response: authResponse } = await verifySession(req);
    if (authResponse) return authResponse;

    const body = await req.json();
    const { clientId, folderName, parentFolder, role: bodyRole = "ADMIN" } = body;

    const role = (session?.role || "ADMIN");

    // RBAC: Non-admins can only create folders for their own clientId
    if (session?.role === 'CLIENT') {
      const secureClientId = req.cookies.get("clienthub_clientId")?.value;
      if (clientId && secureClientId !== String(clientId)) {
        return NextResponse.json({ success: false, error: "Forbidden: You cannot create a folder for another client" }, { status: 403 });
      }
    }

    if (!clientId || !folderName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";
    const rootFolder = await getClientRootFolder(clientId);

    const parentPath = parentFolder ? `${rootFolder}/${parentFolder}` : rootFolder;
    const finalFolderPath = `${parentPath}/${folderName}/`;

    // 1. Case-insensitive duplicate check
    const { data: existingItems, error: listError } = await supabase.storage
      .from(bucket)
      .list(parentPath, { limit: 1000 });

    if (listError) throw listError;

    const normalizedNewName = folderName.toLowerCase().trim();
    const duplicate = existingItems?.find(item =>
      !item.id && item.name.toLowerCase() === normalizedNewName
    );

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: `A folder named "${duplicate.name}" already exists (case-insensitive match)` },
        { status: 409 }
      );
    }

    // 2. Create the folder using a .keep file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(`${finalFolderPath}.keep`, new Uint8Array(0), {
        upsert: true,
        contentType: 'text/plain'
      });

    if (uploadError) throw uploadError;

    // 3. Audit log
    logAudit({
      clientId: Number(clientId),
      action: AuditActions.FOLDER_CREATED,
      actorRole: role as AuditActorRole,
      details: folderName,
    });

    // 4. Notifications
    const isAdminOnlySection =
      parentFolder === "Admin Only" ||
      parentFolder === "Admin Restricted" ||
      (parentFolder && (parentFolder.startsWith("Admin Only/") || parentFolder.startsWith("Admin Restricted/"))) ||
      folderName === "Admin Only" ||
      folderName === "Admin Restricted";

    if (!isAdminOnlySection) {
      (async () => {
        try {
          const { data: clientData } = await supabase
            .from('Clients')
            .select('client_name')
            .eq('client_id', clientId)
            .single();

          const clientName = clientData?.client_name || `Client ${clientId}`;

          queueFolderCreatedNotification({
            clientId: Number(clientId),
            clientName: clientName,
            creatorName: role === 'ADMIN' ? 'Admin' : clientName,
            creatorRole: role as any,
            folderName: folderName,
            parentPath: parentFolder || undefined,
          });
        } catch (emailErr) {
          console.error("Failed to queue admin notification:", emailErr);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: "Folder created successfully",
      path: finalFolderPath,
    });
  } catch (err: any) {
    console.error("CREATE FOLDER ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
