import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getClientRootFolder } from "@/lib/storage-utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const clientId = searchParams.get("clientId");
        const fullPathRaw = searchParams.get("fullPath");

        if (!clientId || !fullPathRaw) {
            return NextResponse.json({ success: false, error: "Missing clientId or fullPath" }, { status: 400 });
        }

        const fullPath = decodeURIComponent(fullPathRaw).replace(/^\/+/, "");
        const rootFolder = await getClientRootFolder(clientId);

        let storagePath = fullPath;
        const hasAnyPrefix =
            storagePath.startsWith(`${rootFolder}/`) ||
            storagePath.startsWith(`client-${clientId}/`);

        if (!hasAnyPrefix) {
            storagePath = `${rootFolder}/${storagePath}`;
        }

        const supabase = createServerClient();
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";

        // Provide a signed URL (Supabase's equivalent to Azure SAS with permissions)
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(storagePath, 1800); // 30 minutes

        if (error) throw error;

        return NextResponse.json({ success: true, url: data.signedUrl });
    } catch (e: any) {
        console.error("PUBLIC URL ERROR:", e);
        return NextResponse.json({ success: false, error: e?.message || "Failed to generate URL" }, { status: 500 });
    }
}
