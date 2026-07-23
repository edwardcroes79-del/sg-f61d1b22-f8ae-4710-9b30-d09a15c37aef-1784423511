import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/integrations/supabase/admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = getSupabaseAdmin();

    const { data: workshop, error } = await admin
      .from("workshops")
      .select("name, logo_url, primary_color, secondary_color, background_color")
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const name = workshop?.name || "Torque Log";
    const logoUrl = workshop?.logo_url || null;
    const primary = workshop?.primary_color || "#D97706";
    const background = workshop?.background_color || "#F8F7F4";

    const manifest = {
      name,
      short_name: name,
      description: "Digital Vehicle Service Record",
      start_url: "/dashboard",
      display: "standalone",
      background_color: background,
      theme_color: primary,
      orientation: "portrait-primary",
      icons: [
        {
          src: logoUrl || "/favicon.ico",
          sizes: "192x192",
          type: logoUrl ? "image/png" : "image/x-icon",
          purpose: "any maskable",
        },
        {
          src: logoUrl || "/favicon.ico",
          sizes: "512x512",
          type: logoUrl ? "image/png" : "image/x-icon",
          purpose: "any maskable",
        },
      ],
    };

    res.setHeader("Content-Type", "application/manifest+json");
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    return res.status(200).json(manifest);
  } catch (err: any) {
    res.setHeader("Content-Type", "application/manifest+json");
    return res.status(200).json({
      name: "Torque Log",
      short_name: "Torque Log",
      description: "Digital Vehicle Service Record",
      start_url: "/dashboard",
      display: "standalone",
      background_color: "#F8F7F4",
      theme_color: "#D97706",
      orientation: "portrait-primary",
      icons: [
        { src: "/favicon.ico", sizes: "192x192", type: "image/x-icon", purpose: "any maskable" },
        { src: "/favicon.ico", sizes: "512x512", type: "image/x-icon", purpose: "any maskable" },
      ],
    });
  }
}