import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, count, error } = await supabase
      .from('client_stage_subtasks')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: count,
      data: data,
    });
  } catch (err: any) {
    console.error("DEBUG SUBTASKS ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
