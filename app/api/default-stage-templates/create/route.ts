import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body?.template_name ?? "").trim();
    const description = (body?.description ?? null) as string | null;

    if (!name) {
      return NextResponse.json({ success: false, error: "template_name is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Prevent duplicates
    const { data: existingTemplate } = await supabase
      .from('default_stage_templates')
      .select('id')
      .eq('name', name)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (existingTemplate) {
      return NextResponse.json({ success: false, error: "Template name already exists" }, { status: 409 });
    }

    // 2. Insert and return the created row
    const { data, error } = await supabase
      .from('default_stage_templates')
      .insert({
        name: name,
        description,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select('id, name, description, is_active')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data });
  } catch (err: any) {
    console.error("CREATE TEMPLATE ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
