import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getClientRootFolder } from "@/lib/storage-utils";

export async function POST(req: Request) {
  try {
    const { clientId, folderPath } = await req.json();

    if (!clientId || !folderPath) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const supabase = createServerClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";
    const rootFolder = await getClientRootFolder(clientId);
    const prefix = `${rootFolder}/${folderPath}`;

    // Note: Supabase Storage list is shallow. For true folder deletion,
    // we would need a recursive helper OR just delete what we find.
    // Usually folder deletion in this UI is for flat folders.
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit: 1000 });

    if (listError) throw listError;

    if (files && files.length > 0) {
      const pathsToDelete = files.map(f => `${prefix}/${f.name}`);
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove(pathsToDelete);

      if (removeError) throw removeError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE FOLDER ERROR:", err);
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}

