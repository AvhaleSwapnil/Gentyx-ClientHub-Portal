import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendUpdateNotification } from "@/lib/email";
import { verifySession } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  return handleUpdate(req);
}

export async function PUT(req: NextRequest) {
  return handleUpdate(req);
}

async function handleUpdate(req: NextRequest) {
  try {
    const { session, response: authResponse } = await verifySession(req);
    if (authResponse) return authResponse;

    const body = await req.json();
    const { cpa_id, cpa_name, cpa_code, name, email } = body;

    // RBAC: Only ADMIN or the specific CPA can update
    if (session?.role === 'CPA') {
      const secureCpaId = req.cookies.get("clienthub_cpaId")?.value;
      if (cpa_id && secureCpaId !== String(cpa_id)) {
        return NextResponse.json({ success: false, message: "Forbidden: You cannot update another CPA's profile" }, { status: 403 });
      }
    } else if (session?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    if (!cpa_id) {
      return NextResponse.json({ success: false, message: "CPA ID is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const actualName = cpa_name || name;

    // 1. Check for duplicate CPA name
    if (actualName) {
      const { data: existingCpa } = await supabase
        .from('cpa_centers')
        .select('cpa_id, cpa_name')
        .ilike('cpa_name', actualName.trim())
        .neq('cpa_id', Number(cpa_id))
        .limit(1)
        .single();

      if (existingCpa) {
        return NextResponse.json({
          success: false,
          message: `A CPA named "${existingCpa.cpa_name}" already exists`
        }, { status: 409 });
      }
    }

    // 2. Check for duplicate email
    if (email && email.trim()) {
      const lowerEmail = email.trim().toLowerCase();
      const { data: existingInCpas } = await supabase
        .from('cpa_centers')
        .select('cpa_name')
        .eq('email', lowerEmail)
        .neq('cpa_id', Number(cpa_id))
        .limit(1)
        .single();

      if (existingInCpas) {
        return NextResponse.json({
          success: false,
          message: `This email is already used by CPA: "${existingInCpas.cpa_name}"`
        }, { status: 409 });
      }
    }

    // 3. Get old email for sync
    const { data: oldCpaData } = await supabase
      .from('cpa_centers')
      .select('email')
      .eq('cpa_id', Number(cpa_id))
      .single();

    const oldEmail = oldCpaData?.email;

    // 4. Update CPA center
    const { error: updateError } = await supabase
      .from('cpa_centers')
      .update({
        cpa_name: actualName || undefined,
        cpa_code: cpa_code || undefined,
        email: email || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('cpa_id', Number(cpa_id));

    if (updateError) throw updateError;

    // 5. Sync User Email
    if (email && email.trim() && oldEmail && email.toLowerCase() !== oldEmail.toLowerCase()) {
      await supabase
        .from('Users')
        .update({ email: email })
        .eq('email', oldEmail)
        .eq('role', 'CPA');
      console.log(`✅ CPA login email updated from ${oldEmail} to ${email}`);
    }

    // 6. Email Notification
    if (email) {
      try {
        await sendUpdateNotification({
          recipientEmail: email,
          recipientName: actualName,
          updateType: 'profile_updated',
          details: {
            title: 'Your CPA Profile Has Been Updated',
            description: `Your CPA profile "${actualName}" has been updated by the administrator.`,
            actionUrl: 'https://legacy.hubonesystems.net/login',
            actionLabel: 'View Your Profile',
          },
        });
      } catch (emailErr) {
        console.error("CPA profile update email failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true, message: "CPA updated successfully" });
  } catch (err: any) {
    console.error("CPA update error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
