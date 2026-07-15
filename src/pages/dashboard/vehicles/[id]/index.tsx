import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getVehicle, deleteVehicle, type VehicleWithCustomer } from "@/services/vehicleService";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatMileage, getServiceStatus } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Car,
  ArrowLeft,
  Edit,
  QrCode,
  Trash2,
  Calendar,
  Gauge,
  User,
  Phone,
  Mail,
  MapPin,
  Fuel,
  Cog,
  Paintbrush,
  Wrench,
} from "lucide-react";
import { ServiceRecordSection } from "@/components/dashboard/ServiceRecordSection";

export default function VehicleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState<VehicleWithCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const data = await getVehicle(id as string);
        setVehicle(data);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, toast]);

  async function handleDelete() {
    if (!vehicle) return;
    try {
      await deleteVehicle(vehicle.id);
      toast({ title: "Vehicle deleted" });
      router.push("/dashboard/vehicles");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Vehicle Details">
        <div className="h-96 animate-pulse bg-muted rounded-2xl" />
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout title="Vehicle Details">
        <Card className="card-premium p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Vehicle not found</h2>
          <Button asChild>
            <Link href="/dashboard/vehicles">Back to Vehicles</Link>
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  const status = getServiceStatus(vehicle.next_service_date, vehicle.next_service_mileage, vehicle.current_mileage);

  return (
    <DashboardLayout title={`${vehicle.make} ${vehicle.model}`}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/vehicles">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/vehicles/${vehicle.id}/qr`}>
              <Button variant="outline">
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
            </Link>
            <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="h-64 md:h-80 rounded-2xl overflow-hidden bg-muted relative">
          {vehicle.header_image_url ? (
            <img
              src={vehicle.header_image_url}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-20 h-20 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 flex-wrap">
            <Badge className="text-base px-3 py-1 font-mono tracking-wider bg-background/90 text-foreground">
              {vehicle.year || "—"}
            </Badge>
            <Badge className="text-base px-3 py-1 font-mono tracking-wider bg-primary text-primary-foreground">
              {vehicle.registration_number}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Vehicle Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Spec label="Make" value={vehicle.make} icon={Car} />
                <Spec label="Model" value={vehicle.model} icon={Car} />
                <Spec label="Year" value={vehicle.year?.toString() || "—"} icon={Calendar} />
                <Spec label="Color" value={vehicle.color || "—"} icon={Paintbrush} />
                <Spec label="VIN" value={vehicle.vin || "—"} icon={Wrench} />
                <Spec label="Engine Size" value={vehicle.engine_size || "—"} icon={Cog} />
                <Spec label="Fuel Type" value={vehicle.fuel_type || "—"} icon={Fuel} />
                <Spec label="Transmission" value={vehicle.transmission || "—"} icon={Cog} />
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
                  <div>
                    <p className="font-medium">{vehicle.customer.full_name}</p>
                    <p className="text-sm text-muted-foreground">Registered owner</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                  <p>{vehicle.customer.phone_number}</p>
                </div>
                {vehicle.customer.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                    <p>{vehicle.customer.email}</p>
                  </div>
                )}
                {(vehicle.customer as any).address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <p>{(vehicle.customer as any).address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={`card-premium border-l-4 ${status.status === "overdue" ? "border-l-danger" : status.status === "due" ? "border-l-warning" : "border-l-success"}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  Service Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Mileage</span>
                  <span className="font-mono font-medium tabular-nums">
                    {vehicle.current_mileage ? `${formatMileage(vehicle.current_mileage)} km` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Next Service Mileage</span>
                  <span className="font-mono font-medium tabular-nums">
                    {vehicle.next_service_mileage ? `${formatMileage(vehicle.next_service_mileage)} km` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Next Service Date</span>
                  <span className="font-medium">
                    {vehicle.next_service_date ? formatDate(vehicle.next_service_date) : "—"}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <p className={`text-sm font-medium ${status.status === "overdue" ? "text-danger" : status.status === "due" ? "text-warning" : "text-success"}`}>
                    {status.message}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="text-lg">QR Code</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code to open the public service record page.
                </p>
                <Link href={`/dashboard/vehicles/${vehicle.id}/qr`}>
                  <Button variant="outline" className="w-full">
                    <QrCode className="w-4 h-4 mr-2" />
                    View & Print QR
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <ServiceRecordSection vehicleId={vehicle.id} />
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vehicle?</DialogTitle>
            <DialogDescription>
              This will permanently delete the vehicle, service history, and QR code.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
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