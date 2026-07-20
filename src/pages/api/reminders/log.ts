import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("reminder_deliveries")
      .select("*, vehicle:vehicles(registration_number, make, model)")
      .order("sent_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return res.status(200).json({ data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}