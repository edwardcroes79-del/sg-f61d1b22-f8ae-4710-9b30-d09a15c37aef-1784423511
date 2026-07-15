import { supabase } from "@/integrations/supabase/client";

export interface ServiceRecord {
  id: string;
  vehicle_id: string;
  service_date: string;
  mileage: number;
  service_type: string;
  technician?: string;
  work_performed?: string;
  parts_replaced?: string;
  fluids_changed?: string;
  labour_notes?: string;
  recommendations?: string;
  invoice_number?: string;
  total_cost?: number;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

async function verifyVehicleOwnership(vehicleId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("vehicles")
    .select("id, workshop_id, workshops!inner(user_id)")
    .eq("id", vehicleId)
    .single();

  if (error || !data) throw new Error("Vehicle not found or access denied");
  if ((data.workshops as any).user_id !== user.id) {
    throw new Error("You do not own the workshop for this vehicle");
  }
}

export async function getServiceRecords(vehicleId: string) {
  const { data, error } = await supabase
    .from("service_records")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("service_date", { ascending: false });

  if (error) throw error;
  return (data || []) as ServiceRecord[];
}

export async function createServiceRecord(record: Omit<ServiceRecord, "id" | "created_at" | "updated_at">) {
  await verifyVehicleOwnership(record.vehicle_id);

  const { data, error } = await supabase
    .from("service_records")
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data as ServiceRecord;
}

export async function updateServiceRecord(id: string, record: Partial<ServiceRecord>) {
  if (record.vehicle_id) await verifyVehicleOwnership(record.vehicle_id);

  const { data: existing, error: fetchError } = await supabase
    .from("service_records")
    .select("vehicle_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) throw new Error("Service record not found");
  await verifyVehicleOwnership(existing.vehicle_id);

  const { data, error } = await supabase
    .from("service_records")
    .update(record)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ServiceRecord;
}

export async function deleteServiceRecord(id: string) {
  const { data: existing, error: fetchError } = await supabase
    .from("service_records")
    .select("vehicle_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) throw new Error("Service record not found");
  await verifyVehicleOwnership(existing.vehicle_id);

  const { error } = await supabase.from("service_records").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadServiceImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `service-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("service-images")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("service-images")
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function addServiceImage(serviceRecordId: string, imageUrl: string) {
  const { data, error } = await supabase
    .from("service_images")
    .insert({ service_record_id: serviceRecordId, image_url: imageUrl })
    .select()
    .single();

  if (error) throw error;
  return data;
}