// /app/api/messages/upload-attachment/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const clientId = formData.get("clientId") as string;
        const file = formData.get("file") as File;

        if (!clientId || !file) {
            return NextResponse.json(
                { success: false, error: "Client ID and file are required" },
                { status: 400 }
            );
        }

        // Safety checks
        if (file.name === ".keep") {
            return NextResponse.json(
                { success: false, error: "Invalid file name" },
                { status: 400 }
            );
        }

        const supabase = createServerClient();
        const buffer = await file.arrayBuffer();
        const fileName = `${Date.now()}-${file.name}`; // Unique filename
        const blobPath = `client-${clientId}/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('messages')
            .upload(blobPath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('messages')
            .getPublicUrl(blobPath);

        return NextResponse.json({
            success: true,
            attachmentUrl: publicUrl,
            attachmentName: file.name,
        });
    } catch (err: any) {
        console.error("MESSAGE ATTACHMENT UPLOAD ERROR:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
