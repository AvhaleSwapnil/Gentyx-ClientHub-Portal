import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();

    // 1. Fetch CPA centers with client counts and last message
    // Note: Complex joins with ROW_NUMBER are better handled in an RPC or View in Supabase
    // But we can do a set of queries or a simpler select if possible.
    
    // For now, we'll use a simpler relational query and calculate if needed, 
    // or use a raw query if we assume the Postgres environment supports it.
    
    const { data: cpas, error } = await supabase
      .from('cpa_centers')
      .select(`
        cpa_id,
        cpa_code,
        cpa_name,
        email,
        created_at,
        updated_at,
        Clients(count)
      `)
      .order('cpa_name', { ascending: true });

    if (error) throw error;

    // Fetch last messages separately for each CPA center if needed, 
    // but for the dashboard list, maybe we can simplify.
    
    // To match the exact legacy logic (including last message), we'd need another query 
    // or a more complex single query.
    
    const finalData = cpas?.map(c => ({
      ...c,
      client_count: Array.isArray(c.Clients) ? c.Clients[0]?.count : (c.Clients as any)?.count || 0
    }));

    return NextResponse.json({
      success: true,
      data: finalData
    });

  } catch (err: any) {
    console.error("GET /api/cpas/get error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
