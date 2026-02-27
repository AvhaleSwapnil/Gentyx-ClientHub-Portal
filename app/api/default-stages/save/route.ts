import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { templateId, stages } = await req.json();

    if (!templateId || !Array.isArray(stages)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Mapping frontend structure to RPC expectations
    const processedStages = stages.map((s, idx) => ({
      ...s,
      order_number: idx + 1,
      subtasks: (s.subtasks || []).map((st: any, sIdx: number) => ({
        ...st,
        order_number: sIdx + 1
      }))
    }));

    const { error } = await supabase.rpc('save_default_onboarding_data', {
      p_template_id: templateId,
      p_stages: processedStages
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("SAVE DEFAULT STAGES ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

