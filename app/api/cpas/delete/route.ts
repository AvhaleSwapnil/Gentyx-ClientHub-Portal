import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { cpa_id } = await req.json();

    if (!cpa_id) {
      return NextResponse.json({ success: false, error: "CPA ID is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Get CPA info before deletion
    const { data: cpa, error: fetchError } = await supabase
      .from('cpa_centers')
      .select('email, cpa_name')
      .eq('cpa_id', Number(cpa_id))
      .single();

    if (fetchError || !cpa) {
      return NextResponse.json({ success: false, error: "CPA not found" }, { status: 404 });
    }

    console.log(`🗑️ Starting deletion of CPA: ${cpa.cpa_name} (ID: ${cpa_id})`);

    // 2. Delete user credentials
    if (cpa.email) {
      const { error: userError } = await supabase
        .from('Users')
        .delete()
        .eq('email', cpa.email)
        .eq('role', 'CPA');
      
      if (userError) {
          console.error("  ⚠ Failed to delete user credentials:", userError.message);
      } else {
          console.log("  ✓ Deleted user credentials");
      }
    }

    // 3. Delete CPA center
    const { error: deleteError } = await supabase
      .from('cpa_centers')
      .delete()
      .eq('cpa_id', Number(cpa_id));

    if (deleteError) throw deleteError;

    console.log(`✅ Successfully deleted CPA: ${cpa.cpa_name} (ID: ${cpa_id})`);

    return NextResponse.json({
      success: true,
      message: `CPA "${cpa.cpa_name}" and credentials deleted successfully`
    });
  } catch (err: any) {
    console.error("DELETE CPA ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
