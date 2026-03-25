import { nanoid } from "nanoid";

/**
 * Upload an image via the API route and return the public URL.
 */
export async function uploadImage(
  file: File,
  orgId: string
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("orgId", orgId);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}
