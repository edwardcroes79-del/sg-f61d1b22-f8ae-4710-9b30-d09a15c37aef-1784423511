import { supabase } from "@/integrations/supabase/client";

export interface Vehicle {
  id: string;
  workshop_id: string;
  customer_id: string;
  slug: string;
  registration_number: string;
  vin?: string;
  make: string;
  model: string;
  year?: number;
  engine_size?: string;
  fuel_type?: string;
  transmission?: string;
  current_mileage?: number;
  color?: string;
  header_image_url?: string;
  next_service_date?: string;
  next_service_mileage?: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleWithCustomer extends Vehicle {
  customer: {
    id: string;
    full_name: string;
    phone_number: string;
  };
}

export const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid", "Other"] as const;
export const transmissions = ["Manual", "Automatic", "CVT", "DCT", "Other"] as const;

async function getUserWorkshopId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("workshops")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (error) {
    const { data: newWorkshop, error: createError } = await supabase
      .from("workshops")
      .insert({ name: "My Workshop", user_id: user.id })
      .select("id")
      .single();
    if (createError) throw createError;
    return newWorkshop.id;
  }
  return data.id;
}

function generateSlug(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function getVehicles(search?: string) {
  let query = supabase
    .from("vehicles")
    .select("*, customer:customers(id, full_name, phone_number)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `registration_number.ilike.%${search}%,make.ilike.%${search}%,model.ilike.%${search}%,vin.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as unknown as VehicleWithCustomer[];
}

export async function getVehicleBySlug(slug: string) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, customer:customers(*), workshop:workshops(*)")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data as unknown as VehicleWithCustomer & { workshop: { name: string; logo_url?: string; primary_color?: string; secondary_color?: string; contact_phone?: string; contact_email?: string; address?: string; website?: string; social_links?: Record<string, string>; footer_text?: string } };
}

export async function getVehicle(id: string) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, customer:customers(id, full_name, phone_number, email, address, notes)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as VehicleWithCustomer & { customer: { email?: string; address?: string; notes?: string } };
}

export async function createVehicle(vehicle: Omit<Vehicle, "id" | "slug" | "created_at" | "updated_at" | "workshop_id">) {
  const workshopId = await getUserWorkshopId();
  let slug = generateSlug();

  // Ensure uniqueness
  while (true) {
    const { data } = await supabase.from("vehicles").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = generateSlug();
  }

  const { data, error } = await supabase
    .from("vehicles")
    .insert({ ...vehicle, workshop_id: workshopId, slug })
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

export async function updateVehicle(id: string, vehicle: Partial<Vehicle>) {
  const { data, error } = await supabase
    .from("vehicles")
    .update(vehicle)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadVehicleImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `vehicle-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("vehicle-images")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("vehicle-images")
    .getPublicUrl(filePath);

  return publicUrl;
}