import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();
    
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('template_id', { ascending: false });

    if (error) throw error;

    // Convert DB fields => frontend expected fields
    const formatted = (templates || []).map((row) => ({
      id: row.template_id,   
      name: row.name,
      subject: row.subject,
      body: row.body,
      isDefault: row.is_default,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, data: formatted });

  } catch (error: any) {
    console.error("GET /api/email-templates/get error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
