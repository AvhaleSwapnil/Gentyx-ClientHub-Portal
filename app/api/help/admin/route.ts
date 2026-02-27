import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET - Fetch all help content for admin editing
export async function GET() {
  try {
    const supabase = createServerClient();

    const [rolesRes, respRes, flowRes, faqsRes] = await Promise.all([
      supabase.from('help_roles').select('*').order('display_order', { ascending: true }),
      supabase.from('help_responsibilities').select('*').order('display_order', { ascending: true }),
      supabase.from('help_flow_steps').select('*').order('display_order', { ascending: true }),
      supabase.from('help_faqs').select('*').order('display_order', { ascending: true })
    ]);

    if (rolesRes.error) throw rolesRes.error;
    if (respRes.error) throw respRes.error;
    if (flowRes.error) throw flowRes.error;
    if (faqsRes.error) throw faqsRes.error;

    return NextResponse.json({
      success: true,
      roles: rolesRes.data || [],
      responsibilities: respRes.data || [],
      flowSteps: flowRes.data || [],
      faqs: faqsRes.data || [],
    });
  } catch (err: any) {
    console.error("GET /api/help/admin error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch help content" }, { status: 500 });
  }
}

// PUT - Update role details
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { role_id, title, description, icon_name, color_class, is_active } = body;

    const supabase = createServerClient();

    const { error } = await supabase
      .from('help_roles')
      .update({
        title,
        description,
        icon_name, // COALESCE handled by incoming data or previous state
        color_class,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('role_id', role_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Role updated successfully" });
  } catch (err: any) {
    console.error("PUT /api/help/admin error:", err);
    return NextResponse.json({ success: false, error: "Failed to update role" }, { status: 500 });
  }
}
