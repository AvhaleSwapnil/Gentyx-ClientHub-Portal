import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();

    // 1. Fetch Service Centers with client count (via join)
    // Supabase can't do aggregate COUNT in a single simple select yet without a view or RPC for complex cases, 
    // but for simple relations we can use .select('*, Clients(count)'), or just fetch and count in JS if dataset is small.
    // For industry standard, we'll fetch with related users and clients and process.

    const { data: centers, error } = await supabase
      .from('service_centers')
      .select(`
        service_center_id,
        center_name,
        center_code,
        email,
        clients:Clients(client_id),
        users:service_center_users(*)
      `)
      .order('center_name', { ascending: true });

    if (error) throw error;

    // 2. Format response
    const formattedData = (centers || []).map(center => ({
      center_id: center.service_center_id,
      center_name: center.center_name,
      center_code: center.center_code,
      email: center.email,
      clients_assigned: center.clients?.length || 0,
      users: (center.users || []).map((u: any) => ({
        id: u.id,
        name: u.user_name,
        email: u.email,
        role: u.role,
        phone: u.phone
      }))
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
    });

  } catch (err: any) {
    console.error("SERVICE CENTER LIST ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
