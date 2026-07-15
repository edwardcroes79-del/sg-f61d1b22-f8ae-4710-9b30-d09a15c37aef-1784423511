import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getWorkshop, saveWorkshop, uploadWorkshopLogo, type Workshop } from "@/services/workshopService";
import { Palette, Building2, Phone, Mail, Globe, ImagePlus, Facebook, Instagram, Twitter, Linkedin, Loader2 } from "lucide-react";

const emptyForm: Partial<Workshop> = {
  name: "",
  logo_url: "",
  primary_color: "#D97706",
  secondary_color: "#64748B",
  contact_phone: "",
  contact_email: "",
  address: "",
  website: "",
  footer_text: "",
  social_links: {},
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Partial<Workshop>>(emptyForm);
  const [social, setSocial] = useState({ facebook: "", instagram: "", twitter: "", linkedin: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWorkshop();
  }, []);

  async function loadWorkshop() {
    try {
      const data = await getWorkshop();
      if (data) {
        setForm(data);
        setSocial({
          facebook: data.social_links?.facebook || "",
          instagram: data.social_links?.instagram || "",
          twitter: data.social_links?.twitter || "",
          linkedin: data.social_links?.linkedin || "",
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof Workshop, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSocialChange(platform: string, value: string) {
    setSocial((prev) => ({ ...prev, [platform]: value }));
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
    setSaving(true);
    try {
      await saveWorkshop({
        ...form,
        social_links: {
          facebook: social.facebook || undefined,
          instagram: social.instagram || undefined,
          twitter: social.twitter || undefined,
          linkedin: social.linkedin || undefined,
        },
      });
      toast({ title: "Settings saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
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
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} placeholder="123 Service Lane, Motor City" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_text">Footer Text</Label>
                <Input id="footer_text" value={form.footer_text || ""} onChange={(e) => handleChange("footer_text", e.target.value)} placeholder="Premium vehicle care since 2024" />
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
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={form.website || ""} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://workshop.com" />
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
                  <Label htmlFor="facebook" className="flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook</Label>
                  <Input id="facebook" value={social.facebook} onChange={(e) => handleSocialChange("facebook", e.target.value)} placeholder="https://facebook.com/workshop" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</Label>
                  <Input id="instagram" value={social.instagram} onChange={(e) => handleSocialChange("instagram", e.target.value)} placeholder="https://instagram.com/workshop" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter / X</Label>
                  <Input id="twitter" value={social.twitter} onChange={(e) => handleSocialChange("twitter", e.target.value)} placeholder="https://x.com/workshop" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</Label>
                  <Input id="linkedin" value={social.linkedin} onChange={(e) => handleSocialChange("linkedin", e.target.value)} placeholder="https://linkedin.com/company/workshop" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}