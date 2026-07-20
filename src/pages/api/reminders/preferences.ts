import type { NextApiRequest, NextApiResponse } from "next";

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

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/reminder_preferences`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({
          vehicle_id,
          email,
          one_day,
          one_week,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Failed to save preference" });
    }

    const data = await response.json();
    return res.status(200).json({ data: data[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}