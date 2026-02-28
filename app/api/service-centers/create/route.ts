import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendServiceCenterWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, users } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Center name is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Check for duplicate center name
    const { data: existingCenter } = await supabase
      .from('service_centers')
      .select('service_center_id, center_name')
      .ilike('center_name', name.trim())
      .limit(1)
      .single();

    if (existingCenter) {
      return NextResponse.json({
        success: false,
        error: `A service center named "${existingCenter.center_name}" already exists`
      }, { status: 409 });
    }

    // 2. Check for duplicate email across entities
    if (email && email.trim()) {
      const lowerEmail = email.trim().toLowerCase();
      const { data: existingUser } = await supabase
        .from('Users')
        .select('id, role')
        .eq('email', lowerEmail)
        .single();

      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: `This email is already used by an existing ${existingUser.role}`
        }, { status: 409 });
      }
    }

    // 3. Generate Service Center Code
    const { data: maxResult } = await supabase
      .from('service_centers')
      .select('service_center_id')
      .order('service_center_id', { ascending: false })
      .limit(1)
      .single();

    const nextId = (maxResult?.service_center_id || 0) + 1;
    const centerCode = `SC${String(nextId).padStart(3, "0")}`;

    // 4. Insert into service_centers
    const { data: newCenter, error: insertError } = await supabase
      .from('service_centers')
      .insert({
        center_name: name,
        email: email,
        center_code: centerCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('service_center_id')
      .single();

    if (insertError) throw insertError;

    const centerId = newCenter.service_center_id;

    // 5. Create User entry for Service Center login
    if (email && email.trim()) {
      const lowerEmail = email.trim().toLowerCase();
      const { error: userError } = await supabase
        .from('Users')
        .insert({
          email: lowerEmail,
          password: "ServiceCenter@2025",
          role: "SERVICE_CENTER",
        });

      if (userError) {
        console.error("Failed to insert service center user into Users table:", userError);
        throw new Error(`User creation failed: ${userError.message}`);
      }

      try {
        await sendServiceCenterWelcomeEmail(lowerEmail, name, centerCode);
      } catch (emailErr) {
        console.error("Welcome email failed for Service Center (non-blocking):", emailErr);
      }
    }

    // 6. Insert Associated Users
    if (Array.isArray(users) && users.length > 0) {
      const usersToInsert = users
        .filter(u => u.name && u.email)
        .map(u => ({
          service_center_id: centerId,
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
      center_id: centerId,
      center_code: centerCode,
      message: "Service Center created successfully",
    });

  } catch (err: any) {
    console.error("CREATE SERVICE CENTER ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
