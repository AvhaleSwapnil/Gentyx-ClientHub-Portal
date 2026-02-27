import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: stages, error } = await supabase
      .from('onboarding_stages')
      .select('stage_id, stage_name, order_number, is_required')
      .order('order_number', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: stages
    });
  } catch (err: any) {
    console.error("GET /api/stages/default error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
