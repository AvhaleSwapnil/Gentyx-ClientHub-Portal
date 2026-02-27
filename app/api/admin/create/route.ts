import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { currentPassword, newEmail, newPassword } = await req.json();

        if (!currentPassword || !newEmail || !newPassword) {
            return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. Get current master admin email (from admin_settings)
        const { data: adminSettings, error: adminError } = await supabase
            .from('admin_settings')
            .select('email')
            .limit(1)
            .single();

        const adminEmail = adminSettings?.email;

        if (adminError || !adminEmail) {
            return NextResponse.json({ success: false, error: "Master admin profile not found" }, { status: 404 });
        }

        // 2. Verify current password against the Master Admin
        const { data: currentUser, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', adminEmail)
            .eq('role', 'ADMIN')
            .single();

        if (userError || !currentUser || currentUser.password !== currentPassword) {
            return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 401 });
        }

        // 3. Check if new email already exists in users
        const { count: userCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('email', newEmail);

        if ((userCount || 0) > 0) {
            return NextResponse.json({ success: false, error: "Email already exists in Users" }, { status: 400 });
        }

        // Check if email already exists in admin_settings
        const { count: adminCount } = await supabase
            .from('admin_settings')
            .select('*', { count: 'exact', head: true })
            .eq('email', newEmail);

        if ((adminCount || 0) > 0) {
            return NextResponse.json({ success: false, error: "Email already exists in Admin settings" }, { status: 400 });
        }

        // 4. Create new Admin user
        const { error: insertUserError } = await supabase
            .from('users')
            .insert({
                email: newEmail,
                password: newPassword,
                role: 'ADMIN',
                created_at: new Date().toISOString()
            });

        if (insertUserError) throw insertUserError;

        // 5. Add to admin_settings with notifications enabled by default
        const { error: insertSettingsError } = await supabase
            .from('admin_settings')
            .insert({
                full_name: 'New Admin',
                email: newEmail,
                phone: '',
                role: 'Administrator',
                notifications_enabled: true,
                created_at: new Date().toISOString()
            });

        if (insertSettingsError) throw insertSettingsError;

        return NextResponse.json({ success: true, message: "Admin created successfully" });

    } catch (err: any) {
        console.error("Create Admin Error:", err);
        return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
    }
}
