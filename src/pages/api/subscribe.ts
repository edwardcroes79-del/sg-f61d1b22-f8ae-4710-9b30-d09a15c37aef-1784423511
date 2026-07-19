import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { vehicle_slug, endpoint, p256dh, auth } = req.body;

  if (!vehicle_slug || !endpoint || !p256dh || !auth) {
    return res.status(400).json({ error: "Missing subscription fields" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const serverClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { error } = await serverClient
    .from("push_subscriptions")
    .upsert(
      { vehicle_slug, endpoint, p256dh, auth },
      { onConflict: "endpoint" }
    );

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ success: true });
}