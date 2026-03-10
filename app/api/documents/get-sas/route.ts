import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Missing file path" }, { status: 400 });
    }

    const supabase = createServerClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "Documents";

    // Standardize path: remove leading slashes
    const storagePath = path.replace(/^\/+/, "");

    // Create a signed URL for 15 minutes (Azure was 5, 15 is a bit safer)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 900);

    if (error) throw error;

    return NextResponse.json({ sasUrl: data.signedUrl });

  } catch (err: any) {
    console.error("GET SAS ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
