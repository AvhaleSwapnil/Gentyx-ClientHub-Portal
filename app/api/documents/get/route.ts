import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getClientRootFolder } from "@/lib/storage-utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const mode = searchParams.get("mode");        // "folders"
    const folder = searchParams.get("folder");    // e.g. "IMG"

    if (!clientId) {
      return NextResponse.json({ success: false, error: "clientId is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "Documents";
    const rootFolder = await getClientRootFolder(clientId);

    // ---------------------------------------------------------
    // MODE 1 → Return only folders
    // ---------------------------------------------------------
    if (mode === "folders") {
      const { data: entries, error } = await supabase.storage
        .from(bucket)
        .list(rootFolder, { limit: 1000 });

      if (error) throw error;

      const folders = entries
        ?.filter(entry => !entry.id && entry.name !== ".keep") // In Supabase list(), folders have no ID
        .map(entry => entry.name) || [];

      return NextResponse.json({ success: true, folders });
    }

    // ---------------------------------------------------------
    // MODE 2 → Return files inside a specific folder
    // ---------------------------------------------------------
    if (folder) {
      const folderPath = `${rootFolder}/${folder}`;

      const { data: entries, error } = await supabase.storage
        .from(bucket)
        .list(folderPath, { limit: 1000 });

      if (error) throw error;

      const files = entries
        ?.filter(entry => entry.id && entry.name !== ".keep")
        .map(entry => ({
          name: entry.name,
          url: supabase.storage.from(bucket).getPublicUrl(`${folderPath}/${entry.name}`).data.publicUrl,
          size: entry.metadata?.size ?? 0,
          type: entry.name.split(".").pop(),
          path: `${folderPath}/${entry.name}`,
        })) || [];

      return NextResponse.json({ success: true, files });
    }

    return NextResponse.json({ success: false, error: "Missing mode=folders or folder parameter." }, { status: 400 });
  } catch (err: any) {
    console.error("DOCUMENTS GET ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
