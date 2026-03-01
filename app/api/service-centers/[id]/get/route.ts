import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request, { params }: any) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('service_centers')
      .select(`
        service_center_id, 
        center_name, 
        center_code,
        email,
        created_at,
        updated_at
      `)
      .eq('service_center_id', numericId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (err: any) {
    console.error("GET SERVICE CENTER ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}