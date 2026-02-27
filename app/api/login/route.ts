import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, password: rawPassword } = await req.json();
    const email = rawEmail?.trim();
    const password = rawPassword?.trim();

    console.log("🔍 LOGIN ATTEMPT - Email:", email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // 1. Fetch User
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('id, email, password, role')
      .ilike('email', email)
      .limit(1)
      .single();

    if (userError || !user) {
      console.log("❌ LOGIN FAILED - User not found for email:", email);
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Basic password check (legacy systems usually store in plain text or simple hashes)
    // In a real migration we'd use Supabase Auth, but we're keeping the legacy Users table sync for now.
    if (user.password !== password) {
      console.log("❌ LOGIN FAILED - Password mismatch for user:", email);
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    console.log("✅ LOGIN SUCCESS - User found:", user.email, "Role:", user.role);

    // --- CREATE COOKIES ---
    let clientId: number | null = null;
    let serviceCenterId: number | null = null;
    let cpaId: number | null = null;

    const normalizedRole = user.role?.toUpperCase() || "";

    // Handle role specific lookups
    if (normalizedRole === "CLIENT") {
      const { data: client } = await supabase
        .from('Clients')
        .select('client_id')
        .eq('primary_contact_email', user.email)
        .limit(1)
        .single();
      clientId = client?.client_id || null;
    } else if (normalizedRole === "SERVICE_CENTER") {
      const { data: sc } = await supabase
        .from('service_centers')
        .select('service_center_id')
        .eq('email', user.email)
        .limit(1)
        .single();
      serviceCenterId = sc?.service_center_id || null;
    } else if (normalizedRole === "CPA") {
      const { data: cpa } = await supabase
        .from('cpa_centers')
        .select('cpa_id')
        .eq('email', user.email)
        .limit(1)
        .single();
      cpaId = cpa?.cpa_id || null;
    }

    // Role check for non-admins
    if (normalizedRole !== 'ADMIN' && !clientId && !serviceCenterId && !cpaId) {
      return NextResponse.json(
        { success: false, message: `${user.role} record not linked to this user.` },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId,
        serviceCenterId,
        cpaId,
      },
    });

    // Cookie settings
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/'
    };

    response.cookies.set("clienthub_token", user.id.toString(), cookieOptions);
    response.cookies.set("clienthub_role", user.role, cookieOptions);
    response.cookies.set("clienthub_issuedAt", Date.now().toString(), cookieOptions);

    if (clientId) response.cookies.set("clienthub_clientId", clientId.toString(), { ...cookieOptions, httpOnly: false });
    if (serviceCenterId) response.cookies.set("clienthub_serviceCenterId", serviceCenterId.toString(), { ...cookieOptions, httpOnly: false });
    if (cpaId) response.cookies.set("clienthub_cpaId", cpaId.toString(), { ...cookieOptions, httpOnly: false });

    return response;

  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
