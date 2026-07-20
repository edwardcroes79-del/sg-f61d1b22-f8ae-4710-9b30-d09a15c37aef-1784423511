import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/integrations/supabase/admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { vehicle_id, email, one_day, one_week } = req.body;

    if (!vehicle_id || !email || typeof one_day !== "boolean" || typeof one_week !== "boolean") {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (!one_day && !one_week) {
      return res.status(400).json({ error: "Select at least one reminder option" });
    }

    const { data, error } = await supabaseAdmin
      .from("reminder_preferences")
      .upsert(
        {
          vehicle_id,
          email,
          one_day,
          one_week,
        },
        { onConflict: "vehicle_id,email" }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}