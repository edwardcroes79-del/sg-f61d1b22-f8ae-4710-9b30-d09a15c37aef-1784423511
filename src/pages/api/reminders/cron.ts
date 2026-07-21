import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth = req.headers.authorization || "";
      if (auth !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;
    const response = await fetch(`${baseUrl}/api/reminders/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Cron send failed");

    return res.status(200).json({ ok: true, ...json });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Cron failed" });
  }
}