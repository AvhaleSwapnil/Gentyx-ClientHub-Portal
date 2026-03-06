import { createServerClient } from "./supabase";
import { v4 as uuid } from "uuid";

const containerName = process.env.SUPABASE_STORAGE_BUCKET || "Documents";

/**
 * Upload a file to the Documents bucket
 */
export async function uploadDocument(
  file: File | Buffer,
  fileName: string,
  clientId: string | number,
  folderPath?: string,
  metadata?: Record<string, any>
) {
  const supabase = createServerClient();
  const filePath = folderPath ? `${clientId}/${folderPath}/${fileName}` : `${clientId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(containerName)
    .upload(filePath, file, {
      upsert: true,
      contentType: getMimeType(fileName.split(".").pop() || ""),
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(containerName)
    .getPublicUrl(filePath);

  return {
    filePath,
    url: publicUrlData.publicUrl,
  };
}

/**
 * Get a public URL for a document
 */
export function getDocumentUrl(filePath: string) {
  const supabase = createServerClient();
  const { data } = supabase.storage
    .from(containerName)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Generate a signed URL for secure download (expires in 1 hour)
 */
export async function getSignedDownloadUrl(filePath: string, expiresIn = 3600) {
  const supabase = createServerClient();
  const { data, error } = await supabase.storage
    .from(containerName)
    .createSignedUrl(filePath, expiresIn, {
      download: true,
    });

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a document from Storage
 */
export async function deleteDocument(filePath: string) {
  const supabase = createServerClient();
  const { error } = await supabase.storage
    .from(containerName)
    .remove([filePath]);

  if (error) {
    console.error(`Failed to delete document from Storage: ${error.message}`);
    throw error;
  }
}

/**
 * List documents in a client's folder or subfolder
 */
export async function listDocuments(clientId: string | number, folderPath?: string) {
  const supabase = createServerClient();
  const prefix = folderPath ? `${clientId}/${folderPath}` : `${clientId}`;

  const { data, error } = await supabase.storage
    .from(containerName)
    .list(prefix, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (error) {
    throw new Error(`Failed to list documents: ${error.message}`);
  }

  return data;
}

/**
 * Helper to get MIME type based on file extension
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
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    txt: "text/plain",
    csv: "text/csv",
  };
  return mimes[extension.toLowerCase()] || "application/octet-stream";
}
