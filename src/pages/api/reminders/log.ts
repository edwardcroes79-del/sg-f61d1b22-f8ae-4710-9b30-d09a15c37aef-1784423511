import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/integrations/supabase/admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = getSupabaseAdmin();

  if (req.method === "GET") {
    try {
      const { data, error } = await admin
        .from("reminder_deliveries")
        .select("id, vehicle_id, email, lead_time, status, sent_at, error_message")
        .order("sent_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      return res.status(200).json({ deliveries: data || [] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Could not load delivery log" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { older_than_days } = req.body || {};
      const cutoff = older_than_days
        ? new Date(Date.now() - Number(older_than_days) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      let query = admin.from("reminder_deliveries").delete();

      if (cutoff) {
        query = query.lt("sent_at", cutoff);
      } else {
        query = query.not("id", "is", null);
      }

      const { error, count } = await query;
      if (error) throw error;

      return res.status(200).json({ ok: true, deleted: count ?? 0 });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Could not clear log" });
    }
  }

  res.setHeader("Allow", ["GET", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
}