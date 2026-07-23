import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getWorkshop, uploadWorkshopLogo, type Workshop } from "@/services/workshopService";
import { useWorkshop } from "@/contexts/WorkshopContext";
import { updateEmail, updatePassword, getMfaFactors, enrollMfaFactor, verifyMfaEnrollment, unenrollMfaFactor } from "@/services/authService";
import { Palette, Building2, Phone, Mail, Globe, ImagePlus, Facebook, Instagram, Twitter, Linkedin, Loader2, Lock, UserCog, Bell, Send, AlertTriangle, CheckCircle2, XCircle, Shield, ShieldCheck, Copy, Download, QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface SmtpStatus {
  host: string;
  port: number;
  from: string;
  configured: boolean;
}

const emptyForm: Partial<Workshop> = {
  name: "",
  logo_url: "",
  primary_color: "#D97706",
  secondary_color: "#64748B",
  background_color: "#F8F7F4",
  contact_phone: "",
  contact_email: "",
  contact_address: "",
  footer_info: "",
  powered_by: "",
  social_facebook: "",
  social_instagram: "",
  social_twitter: "",
  social_linkedin: "",
  smtp_host: "",
  smtp_port: 587,
  smtp_user: "",
  smtp_pass: "",
  smtp_from: "",
  reminder_email_template: "Hi there,\n\nThis is a friendly reminder that your {{make}} {{model}} ({{registration_number}}) is due for service in {{lead_time}}.\n\nNext service date: {{next_service_date}}\n{{next_service_mileage}}\n\nPlease contact us to book your service.\n\nRegards,\n{{workshop_name}}",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { save, refresh, workshop } = useWorkshop();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Partial<Workshop>>(emptyForm);
  const [account, setAccount] = useState({ email: "", newPassword: "", confirmPassword: "" });
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [clearingLog, setClearingLog] = useState(false);
  const [showClearLogDialog, setShowClearLogDialog] = useState(false);

  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaEnrollment, setMfaEnrollment] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [mfaVerifyCode, setMfaVerifyCode] = useState("");
  const [mfaRecoveryCodes, setMfaRecoveryCodes] = useState<string[]>([]);
  const [showDisableMfaDialog, setShowDisableMfaDialog] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const smtpStatus: SmtpStatus = {
    host: form.smtp_host || "",
    port: typeof form.smtp_port === "number" ? form.smtp_port : parseInt(form.smtp_port as any) || 587,
    from: form.smtp_from || "",
    configured: !!(form.smtp_host && form.smtp_user && form.smtp_pass && form.smtp_from),
  };

  useEffect(() => {
    if (workshop) {
      setForm(workshop);
      setLoading(false);
    } else {
      refresh().then(() => setLoading(false));
    }
  }, [workshop, refresh]);

  useEffect(() => {
    fetchDeliveries();
    loadMfaFactors();
  }, []);

  async function loadMfaFactors() {
    try {
      const data = await getMfaFactors();
      setMfaFactors([...(data.totp || [])]);
    } catch (err: any) {
      console.error("MFA load error:", err);
    }
  }

  async function fetchDeliveries() {
    setLoadingDeliveries(true);
    try {
      const res = await fetch("/api/reminders/log");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load delivery log");
      setDeliveries(json.deliveries || []);
    } catch (err: any) {
      toast({ title: "Could not load delivery log", description: err.message, variant: "destructive" });
    } finally {
      setLoadingDeliveries(false);
    }
  }

  async function handleSendReminders() {
    setSendingReminders(true);
    try {
      const res = await fetch("/api/reminders/send", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Send failed");
      toast({
        title: "Reminders sent",
        description: `${json.sent || 0} sent, ${json.failed || 0} failed.`,
      });
      await fetchDeliveries();
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    } finally {
      setSendingReminders(false);
    }
  }

  function handleChange(field: keyof Workshop, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadWorkshopLogo(file);
      setForm((prev) => ({ ...prev, logo_url: url }));
      toast({ title: "Logo uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast({ title: "Workshop name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await save({ ...form, name: form.name.trim() });
      toast({ title: "Settings saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateEmail() {
    if (!account.email.trim()) {
      toast({ title: "Enter a new email address", variant: "destructive" });
      return;
    }
    setUpdatingEmail(true);
    try {
      await updateEmail(account.email.trim());
      toast({ title: "Verification email sent", description: "Confirm the new address via email before it takes effect." });
      setAccount((prev) => ({ ...prev, email: "" }));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingEmail(false);
    }
  }

  async function handleUpdatePassword() {
    if (account.newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (account.newPassword !== account.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setUpdatingPassword(true);
    try {
      await updatePassword(account.newPassword);
      toast({ title: "Password updated successfully" });
      setAccount((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingPassword(false);
    }
  }

  async function handleClearLog() {
    setClearingLog(true);
    try {
      const res = await fetch("/api/reminders/log", { method: "DELETE", headers: { "Content-Type": "application/json" } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not clear log");
      toast({ title: "Log cleared", description: `${json.deleted || 0} old entries removed.` });
      await fetchDeliveries();
      setShowClearLogDialog(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setClearingLog(false);
    }
  }

  async function handleStartMfaEnrollment() {
    setMfaLoading(true);
    setMfaEnrollment(null);
    setMfaRecoveryCodes([]);
    setMfaVerifyCode("");
    try {
      const data = await enrollMfaFactor();
      setMfaEnrollment({
        factorId: data.id,
        qr: data.totp.qr_code,
        secret: data.totp.secret,
      });
    } catch (err: any) {
      toast({ title: "MFA enrollment failed", description: err.message, variant: "destructive" });
    } finally {
      setMfaLoading(false);
    }
  }

  async function handleVerifyMfaEnrollment() {
    if (!mfaEnrollment || mfaVerifyCode.length !== 6) return;
    setMfaLoading(true);
    try {
      const data = await verifyMfaEnrollment(mfaEnrollment.factorId, mfaVerifyCode);
      const codes = (data as any).recovery_codes || [];
      setMfaRecoveryCodes(Array.isArray(codes) ? codes : []);
      toast({ title: "MFA enabled", description: "Authenticator app linked successfully." });
      await loadMfaFactors();
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    } finally {
      setMfaLoading(false);
    }
  }

  async function handleDisableMfa() {
    const factor = mfaFactors[0];
    if (!factor) return;
    setMfaLoading(true);
    try {
      await unenrollMfaFactor(factor.id);
      toast({ title: "MFA disabled" });
      setShowDisableMfaDialog(false);
      await loadMfaFactors();
    } catch (err: any) {
      toast({ title: "Could not disable MFA", description: err.message, variant: "destructive" });
    } finally {
      setMfaLoading(false);
    }
  }

  function copyRecoveryCodes() {
    if (!mfaRecoveryCodes.length) return;
    navigator.clipboard.writeText(mfaRecoveryCodes.join("\n"));
    toast({ title: "Recovery codes copied" });
  }

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Workshop Settings</h1>
          <p className="text-muted-foreground">Customize branding and contact details for customer-facing pages.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="w-4 h-4 text-primary" />
                Company Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workshop Name</Label>
                <Input id="name" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} placeholder="Torque Auto Workshop" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_address">Address</Label>
                <Textarea id="contact_address" value={form.contact_address || ""} onChange={(e) => handleChange("contact_address", e.target.value)} placeholder="123 Service Lane, Motor City" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_info">Footer Text</Label>
                <Input id="footer_info" value={form.footer_info || ""} onChange={(e) => handleChange("footer_info", e.target.value)} placeholder="Premium vehicle care since 2024" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="powered_by">Powered By</Label>
                <Input id="powered_by" value={form.powered_by || ""} onChange={(e) => handleChange("powered_by", e.target.value)} placeholder="Powered by Torque Log" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="w-4 h-4 text-primary" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input id="contact_phone" value={form.contact_phone || ""} onChange={(e) => handleChange("contact_phone", e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input id="contact_email" type="email" value={form.contact_email || ""} onChange={(e) => handleChange("contact_email", e.target.value)} placeholder="service@workshop.com" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="w-4 h-4 text-primary" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Workshop Logo</Label>
                <div className="flex items-center gap-4">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo preview" className="w-20 h-20 object-contain rounded-lg border bg-white" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground">
                      <ImagePlus className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-2" />}
                      {uploading ? "Uploading..." : "Upload Logo"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-3">
                    <Input id="primary_color" type="color" value={form.primary_color || "#D97706"} onChange={(e) => handleChange("primary_color", e.target.value)} className="w-16 h-10 p-1" />
                    <Input value={form.primary_color || "#D97706"} onChange={(e) => handleChange("primary_color", e.target.value)} className="flex-1 font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-3">
                    <Input id="secondary_color" type="color" value={form.secondary_color || "#64748B"} onChange={(e) => handleChange("secondary_color", e.target.value)} className="w-16 h-10 p-1" />
                    <Input value={form.secondary_color || "#64748B"} onChange={(e) => handleChange("secondary_color", e.target.value)} className="flex-1 font-mono" />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="background_color">Background Color</Label>
                  <div className="flex gap-3">
                    <Input id="background_color" type="color" value={form.background_color || "#F8F7F4"} onChange={(e) => handleChange("background_color", e.target.value)} className="w-16 h-10 p-1" />
                    <Input value={form.background_color || "#F8F7F4"} onChange={(e) => handleChange("background_color", e.target.value)} className="flex-1 font-mono" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="w-4 h-4 text-primary" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="social_facebook" className="flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook</Label>
                  <Input id="social_facebook" value={form.social_facebook || ""} onChange={(e) => handleChange("social_facebook", e.target.value)} placeholder="https://facebook.com/workshop" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_instagram" className="flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</Label>
                  <Input id="social_instagram" value={form.social_instagram || ""} onChange={(e) => handleChange("social_instagram", e.target.value)} placeholder="https://instagram.com/workshop" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_twitter" className="flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter / X</Label>
                  <Input id="social_twitter" value={form.social_twitter || ""} onChange={(e) => handleChange("social_twitter", e.target.value)} placeholder="https://x.com/workshop" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_linkedin" className="flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</Label>
                  <Input id="social_linkedin" value={form.social_linkedin || ""} onChange={(e) => handleChange("social_linkedin", e.target.value)} placeholder="https://linkedin.com/company/workshop" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div>
          <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Service Reminders
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="card-premium md:col-span-2">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Send className="w-4 h-4 text-primary" />
                  Delivery Log
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearLogDialog(true)}
                  disabled={loadingDeliveries || deliveries.length === 0}
                >
                  Clear Old Log
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Customers subscribe on their vehicle page. Use the button to send all due reminders now, or schedule a daily cron job to call <code>/api/reminders/cron</code>.
                </p>

                <div className="rounded-xl border overflow-hidden">
                  <div className="max-h-80 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left font-medium px-4 py-3">Sent</th>
                          <th className="text-left font-medium px-4 py-3">Email</th>
                          <th className="text-left font-medium px-4 py-3">Lead Time</th>
                          <th className="text-left font-medium px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {loadingDeliveries ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                              Loading...
                            </td>
                          </tr>
                        ) : deliveries.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                              No reminders sent yet.
                            </td>
                          </tr>
                        ) : (
                          deliveries.map((d) => (
                            <tr key={d.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                {new Date(d.sent_at).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">{d.email}</td>
                              <td className="px-4 py-3">{d.lead_time}</td>
                              <td className="px-4 py-3">
                                {d.status === "sent" ? (
                                  <span className="inline-flex items-center gap-1 text-success">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Sent
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-destructive">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Failed
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="w-4 h-4 text-primary" />
                  SMTP Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_host">Host</Label>
                    <Input id="smtp_host" value={form.smtp_host || ""} onChange={(e) => handleChange("smtp_host", e.target.value)} placeholder="smtp.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">Port</Label>
                    <Input id="smtp_port" type="number" value={form.smtp_port || 587} onChange={(e) => handleChange("smtp_port", parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_user">Username</Label>
                    <Input id="smtp_user" value={form.smtp_user || ""} onChange={(e) => handleChange("smtp_user", e.target.value)} placeholder="user@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_pass">Password</Label>
                    <Input id="smtp_pass" type="password" value={form.smtp_pass || ""} onChange={(e) => handleChange("smtp_pass", e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="smtp_from">From Address</Label>
                    <Input id="smtp_from" type="email" value={form.smtp_from || ""} onChange={(e) => handleChange("smtp_from", e.target.value)} placeholder="noreply@workshop.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder_email_template">Reminder Email Template</Label>
                  <Textarea
                    id="reminder_email_template"
                    value={form.reminder_email_template || ""}
                    onChange={(e) => handleChange("reminder_email_template", e.target.value)}
                    rows={8}
                    placeholder="Hi there,&#10;&#10;This is a reminder that your {{make}} {{model}} ({{registration_number}}) is due for service in {{lead_time}}.&#10;&#10;Next service date: {{next_service_date}}&#10;{{next_service_mileage}}&#10;&#10;Regards,&#10;{{workshop_name}}"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: <code>{"{{make}}"}</code>, <code>{"{{model}}"}</code>, <code>{"{{registration_number}}"}</code>, <code>{"{{next_service_date}}"}</code>, <code>{"{{next_service_mileage}}"}</code>, <code>{"{{lead_time}}"}</code>, <code>{"{{workshop_name}}"}</code>.
                  </p>
                </div>
                {!smtpStatus.configured && (
                  <div className="rounded-lg bg-destructive/10 p-3 flex gap-2 text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    Enter SMTP host, username, password, and from address to enable reminders.
                  </div>
                )}
                <Button type="button" onClick={handleSendReminders} disabled={sendingReminders || !smtpStatus.configured} className="w-full">
                  {sendingReminders && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {sendingReminders ? "Sending..." : "Send Due Reminders Now"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  These values are stored encrypted in your workshop settings and used by the reminder API.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Account Security
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="w-4 h-4 text-primary" />
                  Change Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">New Email Address</Label>
                  <Input id="new-email" type="email" value={account.email} onChange={(e) => setAccount((prev) => ({ ...prev, email: e.target.value }))} placeholder="admin@workshop.com" />
                </div>
                <Button type="button" onClick={handleUpdateEmail} disabled={updatingEmail} className="w-full">
                  {updatingEmail && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {updatingEmail ? "Sending..." : "Update Email"}
                </Button>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="w-4 h-4 text-primary" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={account.newPassword} onChange={(e) => setAccount((prev) => ({ ...prev, newPassword: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={account.confirmPassword} onChange={(e) => setAccount((prev) => ({ ...prev, confirmPassword: e.target.value }))} placeholder="••••••••" />
                </div>
                <Button type="button" onClick={handleUpdatePassword} disabled={updatingPassword} className="w-full">
                  {updatingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {updatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="w-4 h-4 text-primary" />
                  Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mfaFactors.length > 0 ? (
                  <div className="rounded-lg bg-success/10 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-success">
                      <ShieldCheck className="w-4 h-4" />
                      MFA is enabled
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowDisableMfaDialog(true)} disabled={mfaLoading}>
                      Disable
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security by requiring a code from an authenticator app when signing in.
                    </p>
                    {!mfaEnrollment ? (
                      <Button type="button" onClick={handleStartMfaEnrollment} disabled={mfaLoading} className="w-full">
                        {mfaLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <QrCode className="w-4 h-4 mr-2" />
                        Set Up Authenticator
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted">
                          <img src={mfaEnrollment.qr} alt="MFA QR code" className="w-48 h-48" />
                          <p className="text-xs text-muted-foreground text-center">
                            Scan this QR code with your authenticator app, or enter the secret manually.
                          </p>
                          <div className="flex items-center gap-2 w-full">
                            <code className="flex-1 text-xs font-mono bg-background p-2 rounded border break-all">
                              {mfaEnrollment.secret}
                            </code>
                            <Button type="button" variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(mfaEnrollment.secret); toast({ title: "Secret copied" }); }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mfa-code">Verification Code</Label>
                          <Input
                            id="mfa-code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            value={mfaVerifyCode}
                            onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="h-12 text-center text-2xl tracking-[0.5em] font-mono"
                          />
                        </div>
                        <Button type="button" onClick={handleVerifyMfaEnrollment} disabled={mfaLoading || mfaVerifyCode.length !== 6} className="w-full">
                          {mfaLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Verify & Enable MFA
                        </Button>
                      </div>
                    )}

                    {mfaRecoveryCodes.length > 0 && (
                      <div className="rounded-lg border p-4 space-y-3">
                        <h4 className="font-medium text-sm">Recovery Codes</h4>
                        <p className="text-xs text-muted-foreground">
                          Save these codes in a safe place. They can be used to access your account if you lose your authenticator device.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {mfaRecoveryCodes.map((code) => (
                            <code key={code} className="text-xs font-mono bg-muted p-2 rounded text-center">
                              {code}
                            </code>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={copyRecoveryCodes}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Codes
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => {
                            const blob = new Blob([mfaRecoveryCodes.join("\n")], { type: "text/plain" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "torque-log-recovery-codes.txt";
                            a.click();
                            URL.revokeObjectURL(url);
                          }}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>

      <Dialog open={showClearLogDialog} onOpenChange={setShowClearLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Reminder Delivery Log?</DialogTitle>
            <DialogDescription>
              This will permanently delete all reminder delivery log entries. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearLogDialog(false)} disabled={clearingLog}>Cancel</Button>
            <Button variant="destructive" onClick={handleClearLog} disabled={clearingLog}>
              {clearingLog && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {clearingLog ? "Clearing..." : "Clear Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisableMfaDialog} onOpenChange={setShowDisableMfaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable two-factor authentication?</DialogTitle>
            <DialogDescription>
              This removes the extra security layer from your account. You will only need your password to sign in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableMfaDialog(false)} disabled={mfaLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDisableMfa} disabled={mfaLoading}>
              {mfaLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Disable MFA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}