import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { getSupabaseAdmin } from "@/integrations/supabase/admin";

interface ReminderPreference {
  id: string;
  vehicle_id: string;
  email: string;
  one_day: boolean;
  one_week: boolean;
  subscribed_at: string;
}

interface VehicleWithService {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  next_service_date: string | null;
  next_service_mileage: number | null;
  current_mileage: number | null;
  owner_name: string | null;
}

interface WorkshopSmtp {
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  smtp_from: string | null;
}

async function getSmtpConfig(admin: ReturnType<typeof getSupabaseAdmin>): Promise<{ host: string; port: number; user: string; pass: string; from: string } | null> {
  const envConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  };

  const { data: workshop, error } = await admin
    .from("workshops")
    .select("smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from")
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  const db = workshop as WorkshopSmtp | null;
  const host = db?.smtp_host || envConfig.host;
  const port = db?.smtp_port || envConfig.port;
  const user = db?.smtp_user || envConfig.user;
  const pass = db?.smtp_pass || envConfig.pass;
  const from = db?.smtp_from || envConfig.from;

  if (!host || !user || !pass || !from) return null;

  return { host, port, user, pass, from };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (
      req.headers.authorization &&
      process.env.CRON_SECRET &&
      req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const admin = getSupabaseAdmin();

    const smtp = await getSmtpConfig(admin);
    if (!smtp) {
      return res.status(500).json({ error: "SMTP is not configured" });
    }

    const { data: preferences, error: prefError } = await admin
      .from("reminder_preferences")
      .select("*")
      .returns<ReminderPreference[]>();

    if (prefError) throw prefError;

    const { data: vehicles, error: vehicleError } = await admin
      .from("vehicles")
      .select("id, registration_number, make, model, next_service_date, next_service_mileage, current_mileage, owner_name")
      .returns<VehicleWithService[]>();

    if (vehicleError) throw vehicleError;

    const vehicleMap = new Map(vehicles?.map((v) => [v.id, v]) || []);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due: Array<{ preference: ReminderPreference; vehicle: VehicleWithService; leadTime: number; label: string }> = [];

    for (const pref of preferences || []) {
      const vehicle = vehicleMap.get(pref.vehicle_id);
      if (!vehicle || !vehicle.next_service_date) continue;

      const nextDate = new Date(vehicle.next_service_date);
      nextDate.setHours(0, 0, 0, 0);
      const diffMs = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (pref.one_week && diffDays === 7) {
        due.push({ preference: pref, vehicle, leadTime: 7, label: "1 week" });
      } else if (pref.one_day && diffDays === 1) {
        due.push({ preference: pref, vehicle, leadTime: 1, label: "1 day" });
      }
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });

    const results: Array<{ id: string; status: "sent" | "failed"; error?: string }> = [];

    for (const item of due) {
      const subject = `Service reminder for ${item.vehicle.make} ${item.vehicle.model} (${item.vehicle.registration_number})`;
      const text = `Hi ${item.vehicle.owner_name || "there"},\n\nThis is a friendly reminder that your ${item.vehicle.make} ${item.vehicle.model} (${item.vehicle.registration_number}) is due for service in ${item.label}.\n\nNext service date: ${item.vehicle.next_service_date}\n${item.vehicle.next_service_mileage ? `Next service mileage: ${item.vehicle.next_service_mileage.toLocaleString()} km` : ""}\n\nPlease contact us to book your service.\n\nRegards,\n${process.env.NEXT_PUBLIC_APP_NAME || "Torque Log"}`;

      try {
        await transporter.sendMail({
          from: smtp.from,
          to: item.preference.email,
          subject,
          text,
        });

        const { error: logError } = await admin.from("reminder_deliveries").insert({
          preference_id: item.preference.id,
          vehicle_id: item.vehicle.id,
          email: item.preference.email,
          lead_time: item.label,
          status: "sent",
          sent_at: new Date().toISOString(),
        });

        if (logError) throw logError;

        results.push({ id: item.preference.id, status: "sent" });
      } catch (err: any) {
        await admin.from("reminder_deliveries").insert({
          preference_id: item.preference.id,
          vehicle_id: item.vehicle.id,
          email: item.preference.email,
          lead_time: item.label,
          status: "failed",
          error_message: err.message || "Unknown error",
          sent_at: new Date().toISOString(),
        });

        results.push({ id: item.preference.id, status: "failed", error: err.message });
      }
    }

    return res.status(200).json({
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}