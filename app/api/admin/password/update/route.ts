import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. Get current admin email from settings
        const { data: adminSettings, error: adminError } = await supabase
            .from('AdminSettings')
            .select('email')
            .limit(1)
            .single();

        const adminEmail = adminSettings?.email;

        if (adminError || !adminEmail) {
            return NextResponse.json({ success: false, error: "Admin profile not found" }, { status: 404 });
        }

        // 2. Verify current password in Users table
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('password')
            .eq('email', adminEmail)
            .eq('role', 'ADMIN')
            .single();

        if (userError || !user || user.password !== currentPassword) {
            return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 401 });
        }

        // 3. Update password
        const { error: updateError } = await supabase
            .from('Users')
            .update({ password: newPassword })
            .eq('email', adminEmail)
            .eq('role', 'ADMIN');

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch (err: any) {
        console.error("Update Password Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
