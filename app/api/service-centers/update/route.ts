import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendUpdateNotification } from "@/lib/email";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { center_id, center_name, center_code, email, users } = body;

    if (!center_id) {
      return NextResponse.json({ success: false, error: "center_id is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Check for duplicate Service Center name
    if (center_name) {
      const { data: existingCenter } = await supabase
        .from('service_centers')
        .select('service_center_id, center_name')
        .ilike('center_name', center_name.trim())
        .neq('service_center_id', Number(center_id))
        .limit(1)
        .single();

      if (existingCenter) {
        return NextResponse.json({
          success: false,
          error: `A service center named "${existingCenter.center_name}" already exists`
        }, { status: 409 });
      }
    }

    // 2. Check for duplicate email
    if (email && email.trim()) {
      const lowerEmail = email.trim().toLowerCase();
      const { data: existingInCenters } = await supabase
        .from('service_centers')
        .select('center_name')
        .eq('email', lowerEmail)
        .neq('service_center_id', Number(center_id))
        .limit(1)
        .single();
      
      if (existingInCenters) {
        return NextResponse.json({
          success: false,
          error: `This email is already used by service center: "${existingInCenters.center_name}"`
        }, { status: 409 });
      }
    }

    // 3. Get old email for sync
    const { data: oldCenterData } = await supabase
      .from('service_centers')
      .select('email')
      .eq('service_center_id', Number(center_id))
      .single();
    
    const oldEmail = oldCenterData?.email;

    // 4. Update Service Center
    const { error: updateError } = await supabase
      .from('service_centers')
      .update({
        center_name: center_name || undefined,
        center_code: center_code || undefined,
        email: email || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('service_center_id', Number(center_id));

    if (updateError) throw updateError;

    // 5. Sync User Email
    if (email && email.trim() && oldEmail && email.toLowerCase() !== oldEmail.toLowerCase()) {
      await supabase
        .from('Users')
        .update({ email: email })
        .eq('email', oldEmail)
        .eq('role', 'SERVICE_CENTER');
      console.log(`✅ Service Center login email updated from ${oldEmail} to ${email}`);
    }

    // 6. Email Notification
    if (email) {
      try {
        await sendUpdateNotification({
          recipientEmail: email,
          recipientName: center_name,
          updateType: 'profile_updated',
          details: {
            title: 'Your Service Center Profile Has Been Updated',
            description: `Your Service Center profile "${center_name}" has been updated by the administrator.`,
            actionUrl: 'https://legacy.hubonesystems.net/login',
            actionLabel: 'View Your Profile',
          },
        });
      } catch (emailErr) {
        console.error("Service Center profile update email failed:", emailErr);
      }
    }

    // 7. Associated Users
    if (Array.isArray(users)) {
      await supabase.from('service_center_users').delete().eq('service_center_id', Number(center_id));
      
      const usersToInsert = users
        .filter(u => u.name && u.email)
        .map(u => ({
          service_center_id: Number(center_id),
          user_name: u.name,
          email: u.email,
          role: u.role || "User",
          phone: u.phone || null,
          created_at: new Date().toISOString()
        }));

      if (usersToInsert.length > 0) {
        await supabase.from('service_center_users').insert(usersToInsert);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Service Center updated successfully",
    });

  } catch (err: any) {
    console.error("UPDATE SERVICE CENTER ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
