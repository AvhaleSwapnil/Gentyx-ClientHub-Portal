import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing template id" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('template_id', Number(id));

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Email template deleted successfully"
    });

  } catch (error: any) {
    console.error("Delete email template error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
