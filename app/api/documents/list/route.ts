import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getClientRootFolder } from "@/lib/storage-utils";
import { verifySession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

function cleanFolderPath(folderPath: string | null) {
  if (!folderPath) return "";
  let p = folderPath.trim();
  p = p.replace(/^\/+/, "").replace(/\/+$/, "");
  return p;
}

export async function GET(req: NextRequest) {
  try {
    const { session, response: authResponse } = await verifySession(req);
    if (authResponse) return authResponse;

    const { searchParams } = new URL(req.url);
    const clientIdParam = searchParams.get("clientId") || searchParams.get("id");
    const folderParam = searchParams.get("folderPath") || searchParams.get("folder") || searchParams.get("path");

    if (!clientIdParam) {
      return NextResponse.json({ success: true, prefix: "", data: [], items: [] });
    }

    const clientId = Number(clientIdParam);
    const folderPath = cleanFolderPath(folderParam);
    const rootFolder = await getClientRootFolder(clientId);
    const prefix = folderPath ? `${rootFolder}/${folderPath}` : rootFolder;

    console.log(`[DOCS LIST] Client: ${clientId}, Root: "${rootFolder}", Prefix: "${prefix}"`);

    const supabase = createServerClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "Documents";

    // 1. Fetch from database (metadata source of truth)
    const { data: dbFiles, error: dbError } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .like('file_path', `${prefix}/%`);

    if (dbError) {
      console.warn("DB Metadata fetch failed, falling back to storage list:", dbError.message);
    }

    // 2. Fetch from storage (for folder structure and any files not in DB)
    const { data: entries, error: storageError } = await supabase.storage
      .from(bucketName)
      .list(prefix, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (storageError) throw storageError;

    const items = entries
      .filter(entry => entry.name !== ".keep")
      .map(entry => {
        const isFolder = !entry.id;
        const fileName = entry.name;
        const fullPath = prefix ? `${prefix}/${fileName}` : fileName;

        // Try to find matching DB record
        const dbRecord = dbFiles?.find(f => f.file_path === fullPath);

        return {
          id: dbRecord?.id || entry.id,
          clientId,
          name: fileName,
          type: isFolder ? "folder" : "file",
          path: isFolder ? `${fullPath}/` : fullPath,
          size: (dbRecord?.size || entry.metadata?.size) ?? 0,
          url: dbRecord?.file_url || null,
          contentType: entry.metadata?.mimetype ?? null,
          lastModified: dbRecord?.created_at || entry.created_at,
          visibility: entry.metadata?.visibility || "shared",
          uploadedBy: dbRecord?.uploaded_by || entry.metadata?.uploadedby || "unknown",
        };
      });

    // Filtering visibility for non-admins
    const role = (session?.role || "CLIENT").toUpperCase();
    const filteredItems = role === "ADMIN"
      ? items
      : items.filter(item => item.visibility !== "private");

    return NextResponse.json({
      success: true,
      prefix: prefix + "/",
      data: filteredItems,
      items: filteredItems,
    });
  } catch (error: any) {
    console.error("DOCUMENT LIST ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
