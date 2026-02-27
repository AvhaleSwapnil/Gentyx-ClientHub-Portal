import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getClientRootFolder } from "@/lib/storage-utils";

export const dynamic = "force-dynamic";

function cleanFolderPath(folderPath: string | null) {
  if (!folderPath) return "";
  let p = folderPath.trim();
  p = p.replace(/^\/+/, "").replace(/\/+$/, "");
  return p;
}

export async function GET(req: Request) {
  try {
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
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";

    // ✅ Supabase storage.list() returns items directly under the prefix
    const { data: entries, error } = await supabase.storage
      .from(bucketName)
      .list(prefix, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) throw error;

    const items = entries
      .filter(entry => entry.name !== ".keep")
      .map(entry => {
        const isFolder = !entry.id; // In Supabase .list(), folders don't have an ID
        const fileName = entry.name;
        const fullPath = prefix ? `${prefix}/${fileName}` : fileName;

        return {
          clientId,
          name: fileName,
          type: isFolder ? "folder" : "file",
          path: isFolder ? `${fullPath}/` : fullPath,
          size: entry.metadata?.size ?? 0,
          contentType: entry.metadata?.mimetype ?? null,
          lastModified: entry.created_at,
          visibility: entry.metadata?.visibility || "shared",
          uploadedBy: entry.metadata?.uploadedby || "unknown",
        };
      });

    // Filtering visibility for non-admins
    const role = (searchParams.get("role") || "ADMIN").toUpperCase();
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
