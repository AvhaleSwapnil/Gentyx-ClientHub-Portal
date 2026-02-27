import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request, { params }: any) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    
    const supabase = createServerClient();

    const { data: center, error } = await supabase
      .from('service_centers')
      .select('*')
      .eq('service_center_id', numericId)
      .single();

    if (error || !center) {
        return NextResponse.json({ success: false, message: "Service Center not found" }, { status: 404 });
    }

    // Mapping to legacy response format if needed
    const formatted = {
        id: center.service_center_id,
        name: center.center_name,
        code: center.center_code,
        email: center.email,
        created_at: center.created_at,
        updated_at: center.updated_at
    };

    return NextResponse.json({
      success: true,
      data: formatted
    });

  } catch (err: any) {
    console.error("GET /api/service-centers/[id]/get error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
