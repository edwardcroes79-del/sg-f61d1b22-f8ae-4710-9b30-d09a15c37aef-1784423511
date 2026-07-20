import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

type DeliveryResult = {
  preference_id: string | null;
  vehicle_id: string;
  email: string;
  lead_time: "1d" | "7d";
  status: "sent" | "failed";
  error_message?: string;
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
    return res.status(503).json({ error: "SMTP is not configured" });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    const today = new Date();
    const oneDay = new Date(today);
    oneDay.setDate(oneDay.getDate() + 1);
    const sevenDays = new Date(today);
    sevenDays.setDate(sevenDays.getDate() + 7);

    const oneDayStr = oneDay.toISOString().slice(0, 10);
    const sevenDaysStr = sevenDays.toISOString().slice(0, 10);

    const { data: preferences, error: prefError } = await supabaseAdmin
      .from("reminder_preferences")
      .select("*, vehicle:vehicles(*, customer:customers(full_name), workshop:workshops(name, contact_email, website))");

    if (prefError) throw prefError;

    const results: DeliveryResult[] = [];

    for (const pref of (preferences || [])) {
      const vehicle = pref.vehicle;
      if (!vehicle || !vehicle.next_service_date) continue;

      const leadTimes: ("1d" | "7d")[] = [];
      if (pref.one_day && vehicle.next_service_date === oneDayStr) leadTimes.push("1d");
      if (pref.one_week && vehicle.next_service_date === sevenDaysStr) leadTimes.push("7d");

      if (leadTimes.length === 0) continue;

      for (const leadTime of leadTimes) {
        const { data: existing } = await supabaseAdmin
          .from("reminder_deliveries")
          .select("id")
          .eq("preference_id", pref.id)
          .eq("lead_time", leadTime)
          .eq("vehicle_id", vehicle.id)
          .gte("sent_at", new Date(Date.now() - 86400000).toISOString())
          .maybeSingle();

        if (existing) continue;

        const customerName = vehicle.customer?.full_name || "there";
        const workshopName = vehicle.workshop?.name || "your workshop";
        const vehicleLabel = `${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`;
        const nextServiceDate = new Date(vehicle.next_service_date).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const subject =
          leadTime === "1d"
            ? `Service due tomorrow — ${vehicleLabel}`
            : `Service due in one week — ${vehicleLabel}`;

        const html = `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #D97706;">${workshopName}</h2>
            <p>Hi ${customerName},</p>
            <p>This is a friendly reminder that your vehicle service is coming up:</p>
            <ul>
              <li><strong>Vehicle:</strong> ${vehicleLabel}</li>
              <li><strong>Next service date:</strong> ${nextServiceDate}</li>
              ${vehicle.next_service_mileage ? `<li><strong>Next service mileage:</strong> ${vehicle.next_service_mileage.toLocaleString()} km</li>` : ""}
            </ul>
            <p>Contact us to book your appointment:</p>
            ${vehicle.workshop?.contact_email ? `<p>Email: <a href="mailto:${vehicle.workshop.contact_email}">${vehicle.workshop.contact_email}</a></p>` : ""}
            ${vehicle.workshop?.website ? `<p>Website: <a href="${vehicle.workshop.website}">${vehicle.workshop.website}</a></p>` : ""}
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748B;">
              You received this because you subscribed to service reminders. Reply STOP to unsubscribe.
            </p>
          </div>
        `;

        let result: DeliveryResult = {
          preference_id: pref.id,
          vehicle_id: vehicle.id,
          email: pref.email,
          lead_time: leadTime,
          status: "sent",
        };

        try {
          await transporter.sendMail({
            from: smtpFrom,
            to: pref.email,
            subject,
            html,
          });
        } catch (err: any) {
          result.status = "failed";
          result.error_message = err.message || "SMTP error";
        }

        await supabaseAdmin.from("reminder_deliveries").insert({
          preference_id: pref.id,
          vehicle_id: vehicle.id,
          email: pref.email,
          lead_time: leadTime,
          status: result.status,
          error_message: result.error_message || null,
        });

        results.push(result);
      }
    }

    return res.status(200).json({ sent: results.filter((r) => r.status === "sent").length, results });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}