import { supabase } from "@/integrations/supabase/client";
import { getQuery, invalidateQueries } from "@/lib/queryCache";

export interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  address?: string;
  notes?: string;
  workshop_id: string;
  created_at: string;
  updated_at: string;
}

async function getUserWorkshopId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("workshops")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // Create a default workshop if none exists
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

export async function getCustomers(search?: string) {
  const workshopId = await getUserWorkshopId();
  const cacheKey = `customers:list:${workshopId}:${search || ""}`;
  return getQuery(cacheKey, async () => {
    let query = supabase
      .from("customers")
      .select("*")
      .eq("workshop_id", workshopId)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,phone_number.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Customer[];
  });
}

export async function getCustomer(id: string) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at" | "workshop_id">) {
  const workshopId = await getUserWorkshopId();

  const { data, error } = await supabase
    .from("customers")
    .insert({ ...customer, workshop_id: workshopId })
    .select()
    .single();

  if (error) throw error;
  invalidateQueries("customers:");
  return data as Customer;
}

export async function updateCustomer(id: string, customer: Partial<Omit<Customer, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase
    .from("customers")
    .update(customer)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  invalidateQueries("customers:");
  return data as Customer;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) throw error;
  invalidateQueries("customers:");
}

export function invalidateCustomersCache(): void {
  invalidateQueries("customers:");
}

export async function getCustomerCount(): Promise<number> {
  const workshopId = await getUserWorkshopId();
  const cacheKey = `customers:count:${workshopId}`;
  return getQuery(cacheKey, async () => {
    const { count, error } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("workshop_id", workshopId);

    if (error) throw error;
    return count || 0;
  });
}