import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();

    // 1. Fetch service centers
    // Note: OUTER APPLY logic for last message is best handled via a View or RPC.
    // Simplifying here to use basic select for now.
    
    const { data: centers, error } = await supabase
      .from('service_centers')
      .select('service_center_id, center_name, email')
      .order('center_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: centers,
    });
  } catch (err: any) {
    console.error("GET /api/service-centers/get error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
