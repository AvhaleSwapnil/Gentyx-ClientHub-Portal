import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
    try {
        const supabase = createServerClient();

        // 1. Single admin settings row
        const { data: admin, error } = await supabase
            .from('AdminSettings')
            .select('*')
            .limit(1)
            .single();

        if (error || !admin) {
            // If missing, return a default profile instead of erroring
            // In a real system, the initial admin should be seeded.
            return NextResponse.json({
                success: true,
                data: {
                    full_name: 'Administrator',
                    email: 'admin@mail.com',
                    phone: '',
                    role: 'Administrator'
                }
            });
        }

        return NextResponse.json({ success: true, data: admin });
    } catch (error: any) {
        console.error("Fetch Admin Profile Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
