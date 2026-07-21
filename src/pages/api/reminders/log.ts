import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/integrations/supabase/admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("reminder_deliveries")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return res.status(200).json({ deliveries: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}