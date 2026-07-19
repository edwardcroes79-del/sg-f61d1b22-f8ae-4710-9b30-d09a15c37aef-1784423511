import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  let name = "Torque Log";
  let shortName = "Torque Log";
  let themeColor = "#D97706";
  let backgroundColor = "#F8F7F4";
  let iconUrl: string | undefined;

  if (supabaseUrl && supabaseAnonKey) {
    const serverClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data } = await serverClient
      .from("workshops")
      .select("name, logo_url, primary_color, background_color")
      .limit(1)
      .maybeSingle();

    if (data) {
      name = data.name || name;
      shortName = data.name ? data.name.slice(0, 12) : shortName;
      themeColor = data.primary_color || themeColor;
      backgroundColor = data.background_color || backgroundColor;
      iconUrl = data.logo_url || undefined;
    }
  }

  const icons = iconUrl
    ? [
        { src: iconUrl, sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: iconUrl, sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ]
    : [
        { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
        { src: "/og-image.png", sizes: "1200x630", type: "image/png" },
      ];

  const manifest = {
    name,
    short_name: shortName,
    description: "Digital Vehicle Service Record",
    start_url: "/",
    display: "standalone",
    background_color: backgroundColor,
    theme_color: themeColor,
    orientation: "portrait",
    scope: "/",
    icons,
  };

  res.setHeader("Content-Type", "application/manifest+json");
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  res.status(200).json(manifest);
}