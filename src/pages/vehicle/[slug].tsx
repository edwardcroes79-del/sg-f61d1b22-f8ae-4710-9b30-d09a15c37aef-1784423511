import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

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
    address?: string;
    website?: string;
    footer_text?: string;
  };
}

export default function PublicVehiclePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [vehicle, setVehicle] = useState<PublicVehicleData | null>(null);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const status = getServiceStatus(vehicle.next_service_date, vehicle.next_service_mileage, vehicle.current_mileage);
  const daysTotal = 365;
  const daysRemaining = status.daysRemaining ?? 0;
  const progress = Math.max(0, Math.min(100, ((daysTotal - daysRemaining) / daysTotal) * 100));

  const primaryStyle = vehicle.workshop.primary_color
    ? ({ ["--brand-primary" as string]: vehicle.workshop.primary_color } as React.CSSProperties)
    : {};

  return (
    <div className="min-h-screen bg-background" style={primaryStyle}>
      <header className="bg-card border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {vehicle.workshop.logo_url ? (
              <img src={vehicle.workshop.logo_url} alt={vehicle.workshop.name} className="h-10 w-auto object-contain" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <h1 className="font-heading font-semibold leading-tight">{vehicle.workshop.name}</h1>
              <p className="text-xs text-muted-foreground">Digital Service Record</p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono">
            {vehicle.registration_number}
          </Badge>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <section className="relative h-64 md:h-80 rounded-3xl overflow-hidden bg-muted">
          {vehicle.header_image_url ? (
            <img src={vehicle.header_image_url} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-24 h-24 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-sm opacity-90 mb-1">{vehicle.workshop.name}</p>
            <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-2">
              {vehicle.make} {vehicle.model}
            </h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {vehicle.customer.full_name}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {vehicle.year || "—"}</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
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
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-muted-foreground mt-1" />
                  <p className="font-medium">{vehicle.customer.full_name}</p>
                </div>
                {vehicle.customer.phone_number && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                    <p>{vehicle.customer.phone_number}</p>
                  </div>
                )}
                {vehicle.customer.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                    <p>{vehicle.customer.email}</p>
                  </div>
                )}
                {vehicle.customer.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <p>{vehicle.customer.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Service History
              </h2>
              {records.length === 0 ? (
                <Card className="card-premium">
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No service records yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="relative space-y-6 pl-4 md:pl-8 border-l-2 border-muted">
                  {records.map((record) => (
                    <Card key={record.id} className="card-premium relative">
                      <div className="absolute -left-[25px] md:-left-[41px] top-6 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-primary" />
                          {record.service_type}
                        </CardTitle>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {formatDate(record.service_date)}</span>
                          {record.mileage !== undefined && (
                            <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {formatMileage(record.mileage)} km</span>
                          )}
                          {record.technician && (
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {record.technician}</span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {record.work_performed && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Work Performed</p>
                            <p className="text-sm whitespace-pre-line">{record.work_performed}</p>
                          </div>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2">
                          {record.parts_replaced && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Parts Replaced</p>
                              <p className="text-sm whitespace-pre-line">{record.parts_replaced}</p>
                            </div>
                          )}
                          {record.fluids_changed && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fluids Changed</p>
                              <p className="text-sm whitespace-pre-line">{record.fluids_changed}</p>
                            </div>
                          )}
                        </div>
                        {record.attachments && record.attachments.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-3">
                            {record.attachments.map((url, idx) => (
                              <img key={idx} src={url} alt="Service" className="rounded-lg aspect-square object-cover border" />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className={cn("card-premium border-l-4", status.status === "overdue" ? "border-l-danger" : status.status === "due" ? "border-l-warning" : "border-l-success")}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  Service Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={status.color}>
                    {status.status === "overdue" ? <AlertTriangle className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {status.label}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service due progress</span>
                    <span className="font-mono">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Service</span>
                  <span className="font-medium">
                    {records[0] ? formatDate(records[0].service_date) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Next Service Date</span>
                  <span className="font-medium">
                    {vehicle.next_service_date ? formatDate(vehicle.next_service_date) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Next Service Mileage</span>
                  <span className="font-mono font-medium tabular-nums">
                    {vehicle.next_service_mileage ? `${formatMileage(vehicle.next_service_mileage)} km` : "—"}
                  </span>
                </div>
                <div className={cn("p-4 rounded-xl text-center", status.color)}>
                  <p className="font-semibold">{status.message}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="text-lg">Workshop Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {vehicle.workshop.contact_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p>{vehicle.workshop.contact_phone}</p>
                  </div>
                )}
                {vehicle.workshop.contact_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p>{vehicle.workshop.contact_email}</p>
                  </div>
                )}
                {vehicle.workshop.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p>{vehicle.workshop.address}</p>
                  </div>
                )}
                {vehicle.workshop.website && (
                  <a href={vehicle.workshop.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Visit Website
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {vehicle.workshop.name}</p>
          {vehicle.workshop.footer_text && <p className="mt-1">{vehicle.workshop.footer_text}</p>}
          <p className="mt-1 text-xs">Powered by Torque Log</p>
        </div>
      </footer>
    </div>
  );
}

function Spec({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}