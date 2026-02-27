import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { serviceCenterId, newPassword } = body;

        if (!serviceCenterId) {
            return NextResponse.json({ success: false, error: "Missing serviceCenterId" }, { status: 400 });
        }

        if (!newPassword || newPassword.length < 8) {
            return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. Get the service center's email
        const { data: sc, error: scError } = await supabase
            .from('service_centers')
            .select('email')
            .eq('service_center_id', serviceCenterId)
            .single();

        if (scError || !sc) {
            return NextResponse.json({ success: false, error: "Service Center not found" }, { status: 404 });
        }

        const email = sc.email;

        if (!email) {
            return NextResponse.json({ success: false, error: "Service Center email not found" }, { status: 400 });
        }

        // 2. Update the password in Users table
        const { error: updateError } = await supabase
            .from('Users')
            .update({ password: newPassword })
            .eq('email', email);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err: any) {
        console.error("POST /api/service-centers/update-password error:", err);
        return NextResponse.json({ success: false, error: err.message || "Failed to update password" }, { status: 500 });
    }
}
