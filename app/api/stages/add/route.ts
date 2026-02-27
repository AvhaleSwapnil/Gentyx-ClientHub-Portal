import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, stageName, isRequired, orderNumber } = body;

    if (!clientId || !stageName) {
      return NextResponse.json({ success: false, error: "clientId and stageName are required" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('client_stages')
      .insert({
        client_id: clientId,
        stage_name: stageName,
        is_required: isRequired ?? true,
        order_number: orderNumber ?? 1,
        status: 'Not Started',
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("POST /api/stages/add error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to add stage" }, { status: 500 });
  }
}
