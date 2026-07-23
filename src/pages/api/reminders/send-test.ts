import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { getSupabaseAdmin } from "@/integrations/supabase/admin";
import { getWorkshopConfig, formatDateLocal } from "./send";

interface VehicleWithCustomer {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  next_service_date: string | null;
  next_service_mileage: number | null;
  customer: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

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
        customer:customers!customer_id (id, full_name, email)
      `)
      .eq("id", vehicle_id)
      .returns<VehicleWithCustomer>()
      .single();

    if (joinError) throw joinError;
    if (!row) return res.status(404).json({ error: "Vehicle not found" });
    if (!row.customer?.email) return res.status(400).json({ error: "Customer has no registered email" });

    const customerEmail = row.customer.email;
    const fullName = row.customer.full_name;

    const nextDateText = row.next_service_date ? formatDateLocal(row.next_service_date) : "Not scheduled";
    const mileageText = row.next_service_mileage
      ? `Next service mileage: ${row.next_service_mileage.toLocaleString()} km`
      : "";

    const text = config.template
      .replace(/{{make}}/g, row.make)
      .replace(/{{model}}/g, row.model)
      .replace(/{{registration_number}}/g, row.registration_number)
      .replace(/{{next_service_date}}/g, nextDateText)
      .replace(/{{next_service_mileage}}/g, mileageText)
      .replace(/{{lead_time}}/g, "TEST — this is a manual test")
      .replace(/{{workshop_name}}/g, config.name)
      .replace(/{{customer_name}}/g, fullName || "there");

    const subject = `[TEST] Service reminder for ${row.make} ${row.model} (${row.registration_number})`;

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
      vehicle_id: row.id,
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