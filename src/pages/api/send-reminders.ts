import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface VehicleWithWorkshop {
  slug: string;
  make: string;
  model: string;
  registration_number: string;
  next_service_date: string;
  workshop: { name: string };
  push_subscriptions: { endpoint: string; p256dh: string; auth: string }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY || "";
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:reminders@torquelog.app";

  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: "VAPID keys not configured" });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serverClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toISOString().split("T")[0];

  const { data, error } = await serverClient
    .from("vehicles")
    .select("slug, make, model, registration_number, next_service_date, workshop:workshops(name), push_subscriptions(endpoint, p256dh, auth)")
    .eq("next_service_date", dateString);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const vehicles = (data || []) as unknown as VehicleWithWorkshop[];
  let sent = 0;
  let failed = 0;

  for (const vehicle of vehicles) {
    const subscriptions = vehicle.push_subscriptions || [];
    if (subscriptions.length === 0) continue;

    const payload = JSON.stringify({
      title: `${vehicle.workshop?.name || "Torque Log"} Reminder`,
      body: `${vehicle.make} ${vehicle.model} (${vehicle.registration_number}) is due for service tomorrow.`,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: `/vehicle/${vehicle.slug}` },
    });

    for (const sub of subscriptions) {
      const pushSub: PushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };

      try {
        await webpush.sendNotification(pushSub, payload);
        sent += 1;
      } catch (err: any) {
        failed += 1;
        if (err.statusCode === 404 || err.statusCode === 410) {
          await serverClient
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    }
  }

  res.status(200).json({ sent, failed, vehiclesChecked: vehicles.length });
}