import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET: Fetch all admins with their notification settings
export async function GET() {
    try {
        const supabase = createServerClient();
        
        // In the new schema, admin settings might be in 'admin_settings' or 'AdminSettings'
        // Based on previous edits, we added 'admin_settings'.
        const { data: admins, error } = await supabase
            .from('admin_settings')
            .select('id, full_name, email, notifications_enabled')
            .order('id', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            admins: (admins || []).map((admin: any) => ({
                id: admin.id,
                fullName: admin.full_name || 'Admin',
                email: admin.email,
                notificationsEnabled: admin.notifications_enabled === true,
            })),
        });
    } catch (error: any) {
        console.error("GET /api/admin/notifications error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch admin notifications" },
            { status: 500 }
        );
    }
}

// PUT: Update notification preference for a specific admin
export async function PUT(req: Request) {
    try {
        const { adminId, notificationsEnabled } = await req.json();

        if (!adminId) {
            return NextResponse.json(
                { success: false, error: "Admin ID is required" },
                { status: 400 }
            );
        }

        if (typeof notificationsEnabled !== 'boolean') {
            return NextResponse.json(
                { success: false, error: "notificationsEnabled must be a boolean" },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        const { error } = await supabase
            .from('admin_settings')
            .update({ 
                notifications_enabled: notificationsEnabled,
                updated_at: new Date().toISOString()
            })
            .eq('id', adminId);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Notifications ${notificationsEnabled ? 'enabled' : 'disabled'} for admin`,
        });
    } catch (error: any) {
        console.error("PUT /api/admin/notifications error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update notification preference" },
            { status: 500 }
        );
    }
}
