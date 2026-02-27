import { sendEmail } from "@/lib/email";
import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = createServerClient();
        
        // 1. Fetch current admin email from Supabase
        const { data: adminSettings, error: dbError } = await supabase
            .from('admin_settings')
            .select('email')
            .limit(1)
            .single();

        if (dbError || !adminSettings) {
            return NextResponse.json({ error: "No admin found in admin_settings table", details: dbError }, { status: 404 });
        }

        const dbEmail = adminSettings.email;

        // 2. Send email to the address found in the DB
        const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>Supabase Verification: Admin Email</h1>
        <p>This email was sent to the address currently stored in your <strong>admin_settings</strong> database table.</p>
        <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin:0; font-weight:bold; color: #2563eb;">Stored Email: ${dbEmail}</p>
        </div>
        <p>✅ If you are reading this, your Supabase migration is functioning correctly and the system is using your verified email.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">Supabase ClientHub Verification</p>
      </div>
    `;

        const result = await sendEmail({
            to: dbEmail,
            subject: "Verification: Supabase Email Integration Successful",
            html,
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Email sent to database address: ${dbEmail}`,
                messageId: result.messageId
            });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
