import { createServerClient } from "./supabase";
import { v4 as uuid } from "uuid";

const containerName = process.env.SUPABASE_STORAGE_BUCKET || "clienthub";

/**
 * Upload a file buffer to Storage
 * Returns the public URL and the relative path (blobName)
 */
export async function uploadFile(buffer: Buffer, originalName: string, folderPath?: string) {
  const supabase = createServerClient();
  const extension = originalName.split(".").pop();
  const fileName = `${uuid()}.${extension}`;
  const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

  const { error } = await supabase.storage
    .from(containerName)
    .upload(filePath, buffer, {
      upsert: true,
      contentType: getMimeType(extension || ""),
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(containerName)
    .getPublicUrl(filePath);

  return {
    blobName: filePath,
    url: publicUrlData.publicUrl,
  };
}

/**
 * Delete a file from Storage
 */
export async function deleteFile(filePath: string) {
  const supabase = createServerClient();
  const { error } = await supabase.storage
    .from(containerName)
    .remove([filePath]);

  if (error) {
    console.error(`Failed to delete file from Supabase: ${error.message}`);
  }
}

/**
 * List files and folders in a directory
 */
export async function listDirectory(prefix: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase.storage
    .from(containerName)
    .list(prefix, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (error) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }

  return data;
}

/**
 * Get MIME type based on extension
 */
function getMimeType(extension: string): string {
  const mimes: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    zip: "application/zip",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
  };
  return mimes[extension.toLowerCase()] || "application/octet-stream";
}
