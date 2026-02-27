import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";

    // Example path corresponding to the old Azure one
    const filePath = "client-14/PDF/AI_WebApp_Costing_Strategy_Report.pdf";

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;

    return NextResponse.json({
      test: "ok (Supabase)",
      sasUrl: data.signedUrl,
      filePath: filePath
    });
  } catch (error: any) {
    console.error("TEST SAS ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
