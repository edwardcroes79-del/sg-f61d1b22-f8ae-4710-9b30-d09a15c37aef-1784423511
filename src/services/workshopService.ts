import { supabase } from "@/integrations/supabase/client";

export interface Workshop {
  id: string;
  user_id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  background_image_url?: string;
  footer_info?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_linkedin?: string;
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

export async function saveWorkshop(workshop: Partial<Workshop> & { name: string }): Promise<Workshop> {
  const userId = await getUserId();
  const existing = await getWorkshop();

  const payload = {
    name: workshop.name,
    logo_url: workshop.logo_url,
    primary_color: workshop.primary_color,
    secondary_color: workshop.secondary_color,
    background_image_url: workshop.background_image_url,
    footer_info: workshop.footer_info,
    contact_phone: workshop.contact_phone,
    contact_email: workshop.contact_email,
    contact_address: workshop.contact_address,
    social_facebook: workshop.social_facebook,
    social_instagram: workshop.social_instagram,
    social_twitter: workshop.social_twitter,
    social_linkedin: workshop.social_linkedin,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("workshops")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as Workshop;
  }

  const { data, error } = await supabase
    .from("workshops")
    .insert({ ...payload, user_id: userId })
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