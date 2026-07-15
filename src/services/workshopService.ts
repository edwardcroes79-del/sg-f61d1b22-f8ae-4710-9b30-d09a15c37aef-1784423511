import { supabase } from "@/integrations/supabase/client";

export interface Workshop {
  id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  background_image_url?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  website?: string;
  social_links?: Record<string, string>;
  footer_text?: string;
  created_at: string;
  updated_at: string;
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function getWorkshop(): Promise<Workshop | null> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("workshops")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Workshop | null;
}

export async function saveWorkshop(workshop: Partial<Workshop>): Promise<Workshop> {
  const userId = await getUserId();
  const existing = await getWorkshop();

  if (existing) {
    const { data, error } = await supabase
      .from("workshops")
      .update({ ...workshop, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as Workshop;
  }

  const { data, error } = await supabase
    .from("workshops")
    .insert({ ...workshop, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Workshop;
}

export async function uploadWorkshopLogo(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `workshop-logos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("workshop-assets")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("workshop-assets")
    .getPublicUrl(filePath);

  return publicUrl;
}