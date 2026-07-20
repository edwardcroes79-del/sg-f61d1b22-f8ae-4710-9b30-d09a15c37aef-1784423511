import { supabase } from "@/integrations/supabase/client";

export interface ReminderPreference {
  id: string;
  vehicle_id: string;
  email: string;
  one_day: boolean;
  one_week: boolean;
  created_at: string;
  updated_at: string;
}

export async function getReminderPreferences(vehicleId: string, email: string): Promise<ReminderPreference | null> {
  const { data, error } = await supabase
    .from("reminder_preferences")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data as ReminderPreference | null;
}

export async function saveReminderPreference(input: {
  vehicle_id: string;
  email: string;
  one_day: boolean;
  one_week: boolean;
}): Promise<ReminderPreference> {
  const { data, error } = await supabase
    .from("reminder_preferences")
    .upsert(
      {
        vehicle_id: input.vehicle_id,
        email: input.email,
        one_day: input.one_day,
        one_week: input.one_week,
      },
      { onConflict: "vehicle_id,email" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as ReminderPreference;
}

export async function deleteReminderPreference(vehicleId: string, email: string): Promise<void> {
  const { error } = await supabase
    .from("reminder_preferences")
    .delete()
    .eq("vehicle_id", vehicleId)
    .eq("email", email);

  if (error) throw error;
}