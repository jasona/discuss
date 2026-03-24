import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";

/**
 * Upload an image to Supabase Storage and return the public URL.
 * Files are stored under documents/{org_id}/{random_id}.{ext}
 */
export async function uploadImage(
  file: File,
  orgId: string
): Promise<string | null> {
  const supabase = createClient();

  const ext = file.name.split(".").pop() || "png";
  const fileName = `${nanoid(12)}.${ext}`;
  const filePath = `${orgId}/${fileName}`;

  const { error } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("documents").getPublicUrl(filePath);

  return publicUrl;
}
