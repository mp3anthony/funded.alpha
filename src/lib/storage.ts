import { supabase } from "./supabase";

/**
 * Uploads a user avatar to Supabase Storage and returns the public CDN URL.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const fileName = `avatars/${userId}/${timestamp}-${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

/**
 * Deletes a user avatar from Supabase Storage.
 */
export async function deleteAvatar(userId: string, imageUrl: string): Promise<void> {
  const bucketName = "avatars";
  const marker = `/${bucketName}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const filePath = imageUrl.substring(index + marker.length);

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    throw error;
  }
}

/**
 * Retrieves the latest avatar image url.
 */
export async function getAvatarUrl(userId: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("avatars")
    .list(`avatars/${userId}`, {
      limit: 1,
      sortBy: { column: "name", order: "desc" },
    });

  if (error || !data || data.length === 0) {
    return null;
  }

  const filePath = `avatars/${userId}/${data[0].name}`;
  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
