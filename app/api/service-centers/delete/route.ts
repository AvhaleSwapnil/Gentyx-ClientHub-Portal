import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Get service center info before deletion
    const { data: center, error: fetchError } = await supabase
      .from('service_centers')
      .select('email, center_name')
      .eq('service_center_id', Number(id))
      .single();

    if (fetchError || !center) {
      return NextResponse.json({ success: false, error: "Service center not found" }, { status: 404 });
    }

    console.log(`🗑️ Starting deletion of Service Center: ${center.center_name} (ID: ${id})`);

    // 2. Delete user credentials
    if (center.email) {
      const { error: userError } = await supabase
        .from('Users')
        .delete()
        .eq('email', center.email)
        .eq('role', 'SERVICE_CENTER');
      
      if (userError) {
          console.error("  ⚠ Failed to delete user credentials:", userError.message);
      } else {
          console.log("  ✓ Deleted user credentials");
      }
    }

    // 3. Delete service center record
    const { error: deleteError } = await supabase
      .from('service_centers')
      .delete()
      .eq('service_center_id', Number(id));

    if (deleteError) throw deleteError;

    console.log(`✅ Successfully deleted Service Center: ${center.center_name} (ID: ${id})`);

    return NextResponse.json({
      success: true,
      message: `Service Center "${center.center_name}" and credentials deleted successfully`,
    });

  } catch (err: any) {
    console.error("DELETE SERVICE CENTER ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
