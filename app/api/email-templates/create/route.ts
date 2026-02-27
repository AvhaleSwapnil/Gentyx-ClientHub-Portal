import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { name, subject, body, is_default = false } = await req.json();

    const supabase = createServerClient();

    const { error } = await supabase
      .from('email_templates')
      .insert({
        name,
        subject,
        body,
        is_default,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Email template created successfully" });
  } catch (error: any) {
    console.error("Email template creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
