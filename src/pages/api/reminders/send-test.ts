import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { getSupabaseAdmin } from "@/integrations/supabase/admin";
import { getWorkshopConfig, formatDateLocal } from "./send";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { vehicle_id } = req.body;
    if (!vehicle_id) {
      return res.status(400).json({ error: "Vehicle ID is required" });
    }

    const admin = getSupabaseAdmin();
    const config = await getWorkshopConfig(admin);
    if (!config.smtp) {
      return res.status(500).json({ error: "SMTP is not configured" });
    }

    const { data: row, error: joinError } = await admin
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
      .eq("id", vehicle_id)
      .single();

    if (joinError) throw joinError;
    if (!row) return res.status(404).json({ error: "Vehicle not found" });
    if (!row.customer?.email) return res.status(400).json({ error: "Customer has no registered email" });

    const customerEmail: string = row.customer.email;
    const fullName: string | null = row.customer.full_name || null;

    const vehicle = {
      id: row.id,
      registration_number: row.registration_number,
      make: row.make,
      model: row.model,
      next_service_date: row.next_service_date,
      next_service_mileage: row.next_service_mileage,
    };

    const nextDateText = vehicle.next_service_date ? formatDateLocal(vehicle.next_service_date) : "Not scheduled";
    const mileageText = vehicle.next_service_mileage
      ? `Next service mileage: ${vehicle.next_service_mileage.toLocaleString()} km`
      : "";

    const text = config.template
      .replace(/{{make}}/g, vehicle.make)
      .replace(/{{model}}/g, vehicle.model)
      .replace(/{{registration_number}}/g, vehicle.registration_number)
      .replace(/{{next_service_date}}/g, nextDateText)
      .replace(/{{next_service_mileage}}/g, mileageText)
      .replace(/{{lead_time}}/g, "TEST — this is a manual test")
      .replace(/{{workshop_name}}/g, config.name)
      .replace(/{{customer_name}}/g, fullName || "there");

    const subject = `[TEST] Service reminder for ${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`;

    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });

    await transporter.sendMail({
      from: config.smtp.from,
      to: customerEmail,
      subject,
      text,
    });

    await admin.from("reminder_deliveries").insert({
      vehicle_id: vehicle.id,
      email: customerEmail,
      lead_time: "test",
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    return res.status(200).json({
      ok: true,
      message: `Test reminder sent to ${customerEmail}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}