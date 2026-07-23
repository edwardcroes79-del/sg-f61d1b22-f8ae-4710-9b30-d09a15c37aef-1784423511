import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { getSupabaseAdmin } from "@/integrations/supabase/admin";

interface CustomerWithVehicle {
  vehicle_id: string;
  email: string | null;
  full_name: string | null;
  vehicle: {
    id: string;
    registration_number: string;
    make: string;
    model: string;
    next_service_date: string | null;
    next_service_mileage: number | null;
  };
}

interface WorkshopWithTemplate {
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  smtp_from: string | null;
  name: string | null;
  reminder_email_template: string | null;
}

async function getWorkshopConfig(admin: ReturnType<typeof getSupabaseAdmin>): Promise<{ smtp: { host: string; port: number; user: string; pass: string; from: string } | null; name: string; template: string }> {
  const envConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  };

  const { data: workshop, error } = await admin
    .from("workshops")
    .select("name, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, reminder_email_template")
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  const db = workshop as WorkshopWithTemplate | null;
  const host = db?.smtp_host || envConfig.host;
  const port = db?.smtp_port || envConfig.port;
  const user = db?.smtp_user || envConfig.user;
  const pass = db?.smtp_pass || envConfig.pass;
  const from = db?.smtp_from || envConfig.from;

  const smtp = host && user && pass && from ? { host, port, user, pass, from } : null;
  const name = db?.name || process.env.NEXT_PUBLIC_APP_NAME || "Torque Log";
  const defaultTemplate = "Hi there,\n\nThis is a friendly reminder that your {{make}} {{model}} ({{registration_number}}) is due for service in {{lead_time}}.\n\nNext service date: {{next_service_date}}\n{{next_service_mileage}}\n\nPlease contact us to book your service.\n\nRegards,\n{{workshop_name}}";

  return {
    smtp,
    name,
    template: db?.reminder_email_template || defaultTemplate,
  };
}

function formatDateLocal(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
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
    const config = await getWorkshopConfig(admin);
    if (!config.smtp) {
      return res.status(500).json({ error: "SMTP is not configured" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeek = new Date(today);
    oneWeek.setDate(oneWeek.getDate() + 7);
    const oneDay = new Date(today);
    oneDay.setDate(oneDay.getDate() + 1);

    const oneWeekIso = oneWeek.toISOString().slice(0, 10);
    const oneDayIso = oneDay.toISOString().slice(0, 10);

    // Find vehicles due in 1 week or 1 day whose owner has an email
    const { data: customersWithVehicles, error: joinError } = await admin
      .from("vehicles")
      .select(`
        id,
        registration_number,
        make,
        model,
        next_service_date,
        next_service_mileage,
        customer:customers (id, full_name, email)
      `)
      .not("next_service_date", "is", null)
      .or(`next_service_date.eq.${oneWeekIso},next_service_date.eq.${oneDayIso}`)
      .not("customer.email", "is", null);

    if (joinError) throw joinError;

    const candidates = (customersWithVehicles || []).map((row: any) => ({
      vehicle_id: row.id,
      email: row.customer?.email,
      full_name: row.customer?.full_name,
      vehicle: {
        id: row.id,
        registration_number: row.registration_number,
        make: row.make,
        model: row.model,
        next_service_date: row.next_service_date,
        next_service_mileage: row.next_service_mileage,
      },
    })).filter((c): c is CustomerWithVehicle => !!c.email) as CustomerWithVehicle[];

    // Check already-sent deliveries for today
    const { data: deliveries, error: deliveryError } = await admin
      .from("reminder_deliveries")
      .select("vehicle_id, lead_time")
      .gte("sent_at", today.toISOString())
      .lte("sent_at", new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (deliveryError) throw deliveryError;

    const sentToday = new Set((deliveries || []).map((d) => `${d.vehicle_id}:${d.lead_time}`));

    const due: Array<{ candidate: CustomerWithVehicle; leadTime: number; label: string; nextDate: Date }> = [];

    for (const candidate of candidates) {
      const nextDate = new Date(candidate.vehicle.next_service_date as string);
      nextDate.setHours(0, 0, 0, 0);
      const diffMs = nextDate.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const windows: Array<{ days: number; label: string }> = [
        { days: 7, label: "1 week" },
        { days: 1, label: "1 day" },
      ];

      for (const win of windows) {
        if (diffDays === win.days && !sentToday.has(`${candidate.vehicle_id}:${win.label}`)) {
          due.push({ candidate, leadTime: win.days, label: win.label, nextDate });
        }
      }
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });

    const results: Array<{ vehicleId: string; email: string; status: "sent" | "failed"; error?: string }> = [];

    for (const item of due) {
      const subject = `Service reminder for ${item.candidate.vehicle.make} ${item.candidate.vehicle.model} (${item.candidate.vehicle.registration_number})`;
      const mileageText = item.candidate.vehicle.next_service_mileage
        ? `Next service mileage: ${item.candidate.vehicle.next_service_mileage.toLocaleString()} km`
        : "";

      const text = config.template
        .replace(/{{make}}/g, item.candidate.vehicle.make)
        .replace(/{{model}}/g, item.candidate.vehicle.model)
        .replace(/{{registration_number}}/g, item.candidate.vehicle.registration_number)
        .replace(/{{next_service_date}}/g, formatDateLocal(item.candidate.vehicle.next_service_date as string))
        .replace(/{{next_service_mileage}}/g, mileageText)
        .replace(/{{lead_time}}/g, item.label)
        .replace(/{{workshop_name}}/g, config.name)
        .replace(/{{customer_name}}/g, item.candidate.full_name || "there");

      try {
        await transporter.sendMail({
          from: config.smtp.from,
          to: item.candidate.email,
          subject,
          text,
        });

        const { error: logError } = await admin.from("reminder_deliveries").insert({
          vehicle_id: item.candidate.vehicle_id,
          email: item.candidate.email,
          lead_time: item.label,
          status: "sent",
          sent_at: new Date().toISOString(),
        });

        if (logError) throw logError;

        results.push({ vehicleId: item.candidate.vehicle_id, email: item.candidate.email, status: "sent" });
      } catch (err: any) {
        await admin.from("reminder_deliveries").insert({
          vehicle_id: item.candidate.vehicle_id,
          email: item.candidate.email,
          lead_time: item.label,
          status: "failed",
          error_message: err.message || "Unknown error",
          sent_at: new Date().toISOString(),
        });

        results.push({ vehicleId: item.candidate.vehicle_id, email: item.candidate.email, status: "failed", error: err.message });
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