import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

/**
 * API route to generate a secure signed URL for document download.
 */
export async function GET(req: NextRequest) {
    try {
        const { session, response: authResponse } = await verifySession(req);
        if (authResponse) return authResponse;

        const { searchParams } = new URL(req.url);
        const filePath = searchParams.get("path");
        const expiresIn = parseInt(searchParams.get("expiresIn") || "3600");

        if (!filePath) {
            return NextResponse.json({ success: false, error: "Missing filePath parameter" }, { status: 400 });
        }

        const supabase = createServerClient();
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || "Documents";

        // Generate a signed URL for secure download
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, expiresIn, {
                download: true, // This adds content-disposition header for download
            });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            url: data.signedUrl,
        });
    } catch (err: any) {
        console.error("DOWNLOAD ERROR:", err);
        return NextResponse.json({ success: false, error: err.message || "Failed to generate download URL" }, { status: 500 });
    }
}
