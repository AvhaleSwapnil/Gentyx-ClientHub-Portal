import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getClientRootFolder } from "@/lib/storage-utils";

export const dynamic = "force-dynamic";

// The 3 physical section folders that live under each client root.
const SECTION_FOLDERS = ["Admin Restricted", "Legacy Uploaded", "Client Uploaded"] as const;

export async function POST(req: Request) {
    try {
        const { clientId } = await req.json();

        if (!clientId) {
            return NextResponse.json({ success: false, error: "clientId is required" }, { status: 400 });
        }

        const supabase = createServerClient();
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || "Documents";
        const rootFolder = await getClientRootFolder(Number(clientId));
        const created: string[] = [];

        for (const section of SECTION_FOLDERS) {
            const sectionFolderPath = `${rootFolder}/${section}`;
            const keepPath = `${sectionFolderPath}/.keep`;

            // Check if exists
            const { data: existsData } = await supabase.storage.from(bucket).list(sectionFolderPath, {
                search: '.keep'
            });

            const exists = existsData && existsData.length > 0;

            if (!exists) {
                // Upload empty .keep file
                await supabase.storage.from(bucket).upload(keepPath, new Uint8Array(0), {
                    contentType: "text/plain",
                    upsert: true
                });
                created.push(section);
            }
        }

        console.log(`[ENSURE-SECTIONS] Client ${clientId}: Root="${rootFolder}", Created=[${created.join(", ")}]`);

        return NextResponse.json({
            success: true,
            rootFolder,
            sections: SECTION_FOLDERS,
            created,
        });
    } catch (error: any) {
        console.error("ENSURE SECTIONS ERROR:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
