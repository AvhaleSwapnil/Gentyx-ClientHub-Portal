import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { full_name, email, phone } = body;

        const supabase = createServerClient();

        // 1. Get current admin email before update
        const { data: currentAdmin } = await supabase
            .from('admin_settings')
            .select('email')
            .limit(1)
            .single();
        
        const oldEmail = currentAdmin?.email;

        // 2. Update AdminSettings
        const { error: updateError } = await supabase
            .from('admin_settings')
            .update({
                full_name,
                email,
                phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1); // Assuming ID 1 or the only record. 
            // Better to find by current email if ID is unknown, but AdminSettings usually has one row.

        if (updateError) throw updateError;

        // 3. Sync email in Users table if changed
        if (oldEmail && oldEmail !== email) {
            await supabase
                .from('Users')
                .update({ email: email })
                .eq('email', oldEmail)
                .eq('role', 'ADMIN');
            console.log(`✅ Admin email synced from ${oldEmail} to ${email}`);
        }

        return NextResponse.json({ success: true, message: "Profile updated successfully" });
    } catch (error: any) {
        console.error("Update Admin Profile Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
