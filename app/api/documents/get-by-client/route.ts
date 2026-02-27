import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getClientRootFolder } from "@/lib/storage-utils";

export const dynamic = "force-dynamic";

// These are the admin-managed section folders — clients should never see them directly
const SECTION_FOLDERS = [
  "Admin Only", "Client Only", "Shared",
  "Admin Restricted", "Client Uploaded", "Legacy Uploaded"
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const clientId = url.searchParams.get("id");
    const folder = url.searchParams.get("folder"); // optional
    const role = (url.searchParams.get("role") || "ADMIN").toUpperCase();

    if (!clientId) {
      return NextResponse.json({ success: false, error: "Missing clientId" });
    }

    const supabase = createServerClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";
    const rootFolder = await getClientRootFolder(clientId);

    // ─── CLIENT ROLE: TRANSPARENT SECTION HANDLING ───
    if (role === "CLIENT") {
      return await handleClientView(supabase, bucket, rootFolder, folder);
    }

    // ─── ADMIN ROLE: Normal listing ───
    const prefix = folder ? `${rootFolder}/${folder}` : rootFolder;
    
    const { data: entries, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit: 1000 });

    if (error) throw error;

    const items = await Promise.all((entries || []).map(async entry => {
        const isFolder = !entry.id;
        const name = entry.name;
        if (name === ".keep") return null;

        const fullPath = `${prefix}/${name}`;

        if (isFolder) {
            return { type: "folder", name };
        }

        const visibility = entry.metadata?.visibility || "shared";
        const uploadedBy = entry.metadata?.uploadedby || "unknown";

        // Generate a signed URL for 1 hour
        const { data: signedData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(fullPath, 3600);

        return {
            type: "file",
            name,
            url: signedData?.signedUrl,
            size: entry.metadata?.size ?? 0,
            fullPath,
            visibility,
            uploadedBy,
        };
    }));

    return NextResponse.json({ success: true, data: items.filter(Boolean) });
  } catch (err: any) {
    console.error("LIST ERROR:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}

async function handleClientView(supabase: any, bucket: string, rootFolder: string, folder: string | null) {
  const items: any[] = [];
  const clientVisibleSections = ["Legacy Uploaded", "Client Uploaded", "Shared", "Client Only"];

  if (!folder) {
    // ROOT VIEW: Merge Shared + Client Only + Legacy (at root)
    for (const section of clientVisibleSections) {
      const sectionPrefix = `${rootFolder}/${section}`;
      const { data: entries } = await supabase.storage.from(bucket).list(sectionPrefix, { limit: 1000 });

      for (const entry of entries || []) {
        if (entry.name === ".keep") continue;
        const isFolder = !entry.id;

        if (isFolder) {
          if (!items.find(i => i.type === "folder" && i.name === entry.name)) {
            items.push({ type: "folder", name: entry.name, _section: section });
          }
        } else {
          if (entry.metadata?.visibility === "private") continue;
          const fullPath = `${sectionPrefix}/${entry.name}`;
          const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(fullPath, 3600);

          if (!items.find(i => i.type === "file" && i.name === entry.name)) {
            items.push({
              type: "file",
              name: entry.name,
              url: signedData?.signedUrl,
              size: entry.metadata?.size ?? 0,
              fullPath,
              visibility: "shared",
              uploadedBy: entry.metadata?.uploadedby || "unknown",
              _section: section
            });
          }
        }
      }
    }

    // Legacy fallback at root (not in section folders)
    const { data: rootEntries } = await supabase.storage.from(bucket).list(rootFolder, { limit: 1000 });
    for (const entry of rootEntries || []) {
        if (entry.name === ".keep" || SECTION_FOLDERS.includes(entry.name)) continue;
        const isFolder = !entry.id;

        if (isFolder) {
            if (!items.find(i => i.type === "folder" && i.name === entry.name)) {
                items.push({ type: "folder", name: entry.name, _section: "legacy" });
            }
        } else {
            if (entry.metadata?.visibility === "private") continue;
            const fullPath = `${rootFolder}/${entry.name}`;
            const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(fullPath, 3600);
            if (!items.find(i => i.type === "file" && i.name === entry.name)) {
                items.push({
                    type: "file",
                    name: entry.name,
                    url: signedData?.signedUrl,
                    size: entry.metadata?.size ?? 0,
                    fullPath,
                    visibility: "shared",
                    uploadedBy: entry.metadata?.uploadedby || "unknown",
                    _section: "legacy"
                });
            }
        }
    }
  } else {
    // SUBFOLDER VIEW: Search across possible prefixes
    const searchPrefixes = [
      `${rootFolder}/Client Uploaded/${folder}`,
      `${rootFolder}/Legacy Uploaded/${folder}`,
      `${rootFolder}/Client Only/${folder}`,
      `${rootFolder}/Shared/${folder}`,
      `${rootFolder}/${folder}`
    ];

    for (const tryPrefix of searchPrefixes) {
      const { data: entries } = await supabase.storage.from(bucket).list(tryPrefix, { limit: 1000 });
      if (!entries || entries.length === 0) continue;

      for (const entry of entries) {
        if (entry.name === ".keep") continue;
        const isFolder = !entry.id;

        if (isFolder) {
          if (!items.find(i => i.type === "folder" && i.name === entry.name)) {
            items.push({ type: "folder", name: entry.name });
          }
        } else {
          if (entry.metadata?.visibility === "private") continue;
          const fullPath = `${tryPrefix}/${entry.name}`;
          const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(fullPath, 3600);
          if (!items.find(i => i.type === "file" && i.name === entry.name)) {
            items.push({
              type: "file",
              name: entry.name,
              url: signedData?.signedUrl,
              size: entry.metadata?.size ?? 0,
              fullPath,
              visibility: "shared",
              uploadedBy: entry.metadata?.uploadedby || "unknown"
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true, data: items });
}
