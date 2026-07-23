import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getVehicleBySlug } from "@/services/vehicleService";
import { getServiceRecords } from "@/services/serviceRecordService";
import type { ServiceRecord } from "@/services/serviceRecordService";
import { formatDate, formatMileage, getServiceStatus, cn } from "@/lib/utils";
import {
  Car,
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Paintbrush,
  Wrench,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Bell,
  Loader2,
} from "lucide-react";

function hexToHsl(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface PublicVehicleData {
  id: string;
  slug: string;
  registration_number: string;
  vin?: string;
  make: string;
  model: string;
  year?: number;
  engine_size?: string;
  fuel_type?: string;
  transmission?: string;
  current_mileage?: number;
  color?: string;
  header_image_url?: string;
  next_service_date?: string;
  next_service_mileage?: number;
  customer: {
    full_name: string;
    phone_number?: string;
    email?: string;
    address?: string;
  };
  workshop: {
    name: string;
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    contact_phone?: string;
    contact_email?: string;
    contact_address?: string;
    website?: string;
    footer_info?: string;
    powered_by?: string;
    social_facebook?: string;
    social_instagram?: string;
    social_twitter?: string;
    social_linkedin?: string;
  };
}

export default function PublicVehiclePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [vehicle, setVehicle] = useState<PublicVehicleData | null>(null);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderOneDay, setReminderOneDay] = useState(true);
  const [reminderOneWeek, setReminderOneWeek] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderSaved, setReminderSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true);

    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window.navigator as any).standalone) {
      setShowIosHint(true);
    }
  }, []);

  async function handleReminderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicle) return;
    if (!reminderEmail.trim() || (!reminderOneDay && !reminderOneWeek)) return;

    setReminderLoading(true);
    try {
      const res = await fetch("/api/reminders/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          email: reminderEmail.trim(),
          one_day: reminderOneDay,
          one_week: reminderOneWeek,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save preferences");

      setReminderSaved(true);
      setTimeout(() => setReminderSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Could not save reminder preferences.");
    } finally {
      setReminderLoading(false);
    }
  }

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        const data = await getVehicleBySlug(slug as string);
        setVehicle(data as PublicVehicleData);
        const serviceData = await getServiceRecords(data.id);
        setRecords(serviceData);
      } catch (err: any) {
        setError(err.message || "Vehicle not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-mono text-sm">Loading service record...</div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <AlertTriangle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h1 className="text-xl font-heading font-semibold mb-2">Record not found</h1>
            <p className="text-sm text-muted-foreground">The QR code may be invalid or the vehicle has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const defaultWorkshop = vehicle.workshop || {
    name: "Torque Log",
    logo_url: "",
    primary_color: "#D97706",
    secondary_color: "#64748B",
    contact_phone: "",
    contact_email: "",
    contact_address: "",
    website: "",
    footer_info: "",
    powered_by: "Powered by Torque Log",
    social_facebook: "",
    social_instagram: "",
    social_twitter: "",
    social_linkedin: "",
  };

  const defaultCustomer = vehicle.customer || {
    full_name: "Owner",
    phone_number: "",
    email: "",
    address: "",
  };

  const status = getServiceStatus(vehicle.next_service_date, vehicle.next_service_mileage, vehicle.current_mileage);
  const daysTotal = 365;
  const daysRemaining = status.daysRemaining ?? 0;
  const progress = Math.max(0, Math.min(100, ((daysTotal - daysRemaining) / daysTotal) * 100));

  const primaryStyle = defaultWorkshop.primary_color
    ? ({ ["--primary" as string]: hexToHsl(defaultWorkshop.primary_color), ["--accent" as string]: hexToHsl(defaultWorkshop.primary_color), ["--ring" as string]: hexToHsl(defaultWorkshop.primary_color) } as React.CSSProperties)
    : {};

  return (
    <>
      <Head>
        <title>{defaultWorkshop.name} - {vehicle.make} {vehicle.model}</title>
        <meta name="theme-color" content={defaultWorkshop.primary_color || "#D97706"} />
        {defaultWorkshop.logo_url && (
          <>
            <link rel="apple-touch-icon" href={defaultWorkshop.logo_url} />
            <link rel="apple-touch-icon" sizes="180x180" href={defaultWorkshop.logo_url} />
            <link rel="icon" href={defaultWorkshop.logo_url} />
          </>
        )}
      </Head>

      <div className="min-h-screen bg-background" style={primaryStyle}>
        <header className="bg-card border-b">
          <div className="container py-3 md:py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {defaultWorkshop.logo_url ? (
                <img src={defaultWorkshop.logo_url} alt={defaultWorkshop.name} className="h-8 md:h-10 w-auto object-contain shrink-0" />
              ) : (
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="font-heading font-semibold text-sm md:text-base leading-tight truncate">{defaultWorkshop.name}</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground">Digital Service Record</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono shrink-0 text-xs md:text-sm px-2 py-1">
              {vehicle.registration_number}
            </Badge>
          </div>
        </header>

        <main className="container py-4 md:py-8 space-y-6 md:space-y-8">
          <section className="relative h-56 sm:h-64 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden bg-muted">
            {vehicle.header_image_url ? (
              <img src={vehicle.header_image_url} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-16 h-16 md:w-24 md:h-24 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
              <p className="text-xs md:text-sm opacity-90 mb-1">{defaultWorkshop.name}</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-semibold mb-2 md:mb-3">
                {vehicle.make} {vehicle.model}
              </h2>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
                <Badge className="bg-white/20 text-white border-white/30 font-mono text-sm px-2.5 py-1">
                  {vehicle.registration_number}
                </Badge>
                <span className="flex items-center gap-1"><User className="w-3 h-3 md:w-3.5 md:h-3.5" /> {defaultCustomer.full_name}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" /> {vehicle.year || "—"}</span>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card className="card-premium">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Car className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:gap-4 sm:grid-cols-2 p-4 sm:p-6 pt-0">
                  <Spec label="Make" value={vehicle.make} icon={Car} />
                  <Spec label="Model" value={vehicle.model} icon={Car} />
                  <Spec label="Year" value={vehicle.year?.toString() || "—"} icon={Calendar} />
                  <Spec label="VIN" value={vehicle.vin || "—"} icon={Wrench} />
                  <Spec label="Fuel Type" value={vehicle.fuel_type || "—"} icon={Fuel} />
                  <Spec label="Transmission" value={vehicle.transmission || "—"} icon={Cog} />
                  <Spec label="Color" value={vehicle.color || "—"} icon={Paintbrush} />
                  <Spec label="Current Mileage" value={vehicle.current_mileage !== undefined ? `${formatMileage(vehicle.current_mileage)} km` : "—"} icon={Gauge} />
                </CardContent>
              </Card>

              <Card className="card-premium">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Driver Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                    <p className="font-medium break-words">{defaultCustomer.full_name}</p>
                  </div>
                  {defaultCustomer.phone_number && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                      <p className="break-words">{defaultCustomer.phone_number}</p>
                    </div>
                  )}
                  {defaultCustomer.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                      <p className="break-words">{defaultCustomer.email}</p>
                    </div>
                  )}
                  {defaultCustomer.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                      <p className="break-words">{defaultCustomer.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <h2 className="text-lg sm:text-xl font-heading font-semibold mb-3 sm:mb-4 flex items-center gap-2 px-1">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Service History
                </h2>
                {records.length === 0 ? (
                  <Card className="card-premium">
                    <CardContent className="py-10 sm:py-12 text-center text-muted-foreground text-sm">
                      No service records yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="relative space-y-4 sm:space-y-6">
                    {records.map((record, idx) => (
                      <div key={record.id} className="relative pl-6 sm:pl-8 md:pl-10">
                        <div className="absolute left-2 sm:left-3 md:left-4 top-0 bottom-0 w-0.5 bg-muted" aria-hidden="true" />
                        <div className="absolute left-0 sm:left-1 md:left-2 top-5 sm:top-6 w-4 h-4 rounded-full bg-primary border-4 border-background z-10" />
                        <Card className="card-premium">
                          <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-primary shrink-0" />
                              <span className="break-words">{record.service_type}</span>
                            </CardTitle>
                            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 shrink-0" /> {formatDate(record.service_date)}</span>
                              {record.mileage !== undefined && (
                                <span className="flex items-center gap-1"><Gauge className="w-3 h-3 shrink-0" /> {formatMileage(record.mileage)} km</span>
                              )}
                              {record.technician && (
                                <span className="flex items-center gap-1"><User className="w-3 h-3 shrink-0" /> {record.technician}</span>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                            {record.work_performed && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Work Performed</p>
                                <p className="text-sm whitespace-pre-line break-words">{record.work_performed}</p>
                              </div>
                            )}
                            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                              {record.parts_replaced && (
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Parts Replaced</p>
                                  <p className="text-sm whitespace-pre-line break-words">{record.parts_replaced}</p>
                                </div>
                              )}
                              {record.fluids_changed && (
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fluids Changed</p>
                                  <p className="text-sm whitespace-pre-line break-words">{record.fluids_changed}</p>
                                </div>
                              )}
                            </div>
                            {record.attachments && record.attachments.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 pt-2 sm:pt-3">
                                {record.attachments.map((url, idx) => (
                                  <img key={idx} src={url} alt="Service" className="rounded-lg aspect-square object-cover border" />
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Card className="card-premium">
                <CardHeader className="p-4 sm:p-6 pb-2">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Service Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Get an email before your next service is due. Pick one or both.
                  </p>
                  <form onSubmit={handleReminderSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminder-email" className="text-sm">Email address</Label>
                      <Input
                        id="reminder-email"
                        type="email"
                        required
                        value={reminderEmail}
                        onChange={(e) => setReminderEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-12"
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={reminderOneDay}
                          onCheckedChange={(v) => setReminderOneDay(v === true)}
                        />
                        1 day before
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={reminderOneWeek}
                          onCheckedChange={(v) => setReminderOneWeek(v === true)}
                        />
                        1 week before
                      </label>
                    </div>
                    <Button
                      type="submit"
                      disabled={reminderLoading || (!reminderOneDay && !reminderOneWeek)}
                      className="w-full h-12 text-base"
                    >
                      {reminderLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {reminderSaved ? "Saved!" : "Remind Me"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <footer className="border-t bg-card mt-8 sm:mt-12">
          <div className="container py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground px-4">
            <p>© {new Date().getFullYear()} {defaultWorkshop.name}</p>
            {defaultWorkshop.footer_info && <p className="mt-1 break-words">{defaultWorkshop.footer_info}</p>}
            <p className="mt-1 text-xs">{defaultWorkshop.powered_by || "Powered by Torque Log"}</p>
          </div>
        </footer>
      </div>
    </>
  );
}

function Spec({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
    </div>
  );
}