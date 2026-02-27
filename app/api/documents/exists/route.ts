import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const clientId = searchParams.get("clientId");
        const fullPath = searchParams.get("fullPath");

        if (!clientId || !fullPath) {
            return NextResponse.json({ success: false, error: "clientId and fullPath are required" }, { status: 400 });
        }

        const supabase = createServerClient();
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";

        // Standardize path: remove leading slashes and ensure it starts with client-ID/
        const normalized = fullPath.replace(/^\/+/, "");
        const storagePath = normalized.startsWith(`client-${clientId}/`)
            ? normalized
            : `client-${clientId}/${normalized}`;

        const pathParts = storagePath.split('/');
        const fileName = pathParts.pop();
        const folderPath = pathParts.join('/');

        const { data: files, error } = await supabase.storage
            .from(bucket)
            .list(folderPath, { search: fileName });

        if (error) throw error;

        const exists = files?.some(f => f.name === fileName);

        return NextResponse.json({ success: true, exists, storagePath });
    } catch (err: any) {
        console.error("EXISTS ERROR:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
