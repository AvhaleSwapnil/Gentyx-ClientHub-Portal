import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: stages, error } = await supabase
      .from('onboarding_stages')
      .select('stage_id, stage_name, order_number')
      .order('order_number', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: stages,
    });

  } catch (err: any) {
    console.error("GET /api/stages/list error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch stage list" }, { status: 500 });
  }
}
