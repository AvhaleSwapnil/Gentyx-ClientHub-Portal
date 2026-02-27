import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/users/suggestions
 * Returns unique users from client_users and service_center_users tables
 * for autocomplete suggestions
 */
export async function GET() {
    try {
        const supabase = createServerClient();

        // 1. Fetch from both tables
        const [clientUsersRes, scUsersRes] = await Promise.all([
            supabase.from('client_users').select('user_name, email, role, phone').not('user_name', 'is', null).neq('user_name', ''),
            supabase.from('service_center_users').select('user_name, email, role, phone').not('user_name', 'is', null).neq('user_name', '')
        ]);

        if (clientUsersRes.error) throw clientUsersRes.error;
        if (scUsersRes.error) throw scUsersRes.error;

        // 2. Combine and Deduplicate in JS
        const combined = [
            ...(clientUsersRes.data || []),
            ...(scUsersRes.data || [])
        ];

        // Deduplicate by email and name
        const uniqueMap = new Map();
        for (const user of combined) {
            const key = `${user.email}-${user.user_name}`;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, {
                    name: user.user_name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                });
            }
        }

        const data = Array.from(uniqueMap.values());
        data.sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json({
            success: true,
            data: data,
        });

    } catch (err: any) {
        console.error("USERS SUGGESTIONS ERROR:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
