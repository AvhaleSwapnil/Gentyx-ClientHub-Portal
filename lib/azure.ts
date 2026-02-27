import { createClient } from "@supabase/supabase-js";
import { v4 as uuid } from "uuid";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || process.env.NEXT_PUBLIC_AZURE_STORAGE_CONTAINER_NAME || "clienthub";

// Lazy initialization — only create the client when env vars are present
function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Supabase credentials are not set. Storage is disabled.");
    return null;
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

/**
 * Upload a file buffer to Storage (Migrated from Azure to Supabase)
 */
export async function uploadToAzure(buffer: Buffer, originalName: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Storage is not configured.");

  const extension = originalName.split(".").pop();
  const blobName = `${uuid()}.${extension}`;

  const { error } = await supabase.storage
    .from(containerName)
    .upload(blobName, buffer, {
      upsert: true,
      contentType: extension // Can be improved with proper mime type based on extension
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(containerName)
    .getPublicUrl(blobName);

  return {
    blobName,
    url: publicUrlData.publicUrl,
  };
}

/**
 * Delete a file from Storage (Migrated from Azure to Supabase)
 * Given a path like: client-26/IMG/image.png
 */
export async function deleteBlob(blobPath: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Storage is not configured.");

  const { error } = await supabase.storage
    .from(containerName)
    .remove([blobPath]);

  if (error) {
    console.error(`Failed to delete blob from Supabase: ${error.message}`);
  }
}

// Null stubs for backward compatibility if any files still try to import these older instances
export const blobService = null as any;
export const containerClient = null as any;
