import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getClientRootFolder } from "@/lib/storage-utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const folder = searchParams.get("folder");
    const fileName = searchParams.get("fileName");

    if (!clientId || !folder || !fileName) {
      return NextResponse.json({ url: null });
    }

    const supabase = createServerClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";
    const rootFolder = await getClientRootFolder(clientId);

    const storagePath = `${rootFolder}/${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 900); // 15 minutes

    if (error) throw error;

    return NextResponse.json({ url: data.signedUrl });

  } catch (err: any) {
    console.error("GET URL ERROR:", err);
    return NextResponse.json({ url: null, error: err.message });
  }
}
