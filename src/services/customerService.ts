import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getCustomers(search?: string) {
  let query = supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone_number.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Customer[];
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

export async function createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
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
  return data as Customer;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}