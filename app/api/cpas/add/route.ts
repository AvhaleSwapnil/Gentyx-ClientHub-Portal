import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendCpaWelcomeEmail } from "@/lib/email";

const DEFAULT_PASSWORD = "Cpa@12345";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, message: "CPA name is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Check for duplicate CPA name
    const { data: existingCpa } = await supabase
      .from('cpa_centers')
      .select('id, name')
      .ilike('name', name.trim())
      .limit(1)
      .single();

    if (existingCpa) {
      return NextResponse.json({
        success: false,
        message: `A CPA named "${existingCpa.name}" already exists`
      }, { status: 409 });
    }

    // 2. Check for duplicate email across entities
    if (email && email.trim()) {
      const lowerEmail = email.trim().toLowerCase();
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', lowerEmail)
        .single();

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: `This email is already used by an existing ${existingUser.role}`
        }, { status: 409 });
      }
    }

    // 3. Generate Next CPA Code
    const { data: lastCpa } = await supabase
      .from('cpa_centers')
      .select('code')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    let nextCode = "CPA001";
    if (lastCpa && lastCpa.code) {
      const numMatch = lastCpa.code.match(/\d+/);
      const num = numMatch ? parseInt(numMatch[0]) + 1 : 1;
      nextCode = "CPA" + num.toString().padStart(3, "0");
    }

    // 4. Insert CPA Center
    const { data: newCpa, error: insertError } = await supabase
      .from('cpa_centers')
      .insert({
        code: nextCode,
        name: name,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    // 5. Create User for CPA login
    if (email) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          email: email,
          password: DEFAULT_PASSWORD,
          role: "CPA",
          created_at: new Date().toISOString()
        });

      if (!userError) {
        try {
          await sendCpaWelcomeEmail(email, name, nextCode);
        } catch (emailErr) {
          console.error("Welcome email failed for CPA:", emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      id: newCpa.id,
      code: nextCode,
      message: `CPA created successfully. Login: ${email} / ${DEFAULT_PASSWORD}`,
    });

  } catch (err: any) {
    console.error("CREATE CPA ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
