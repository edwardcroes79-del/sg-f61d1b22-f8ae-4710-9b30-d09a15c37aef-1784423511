import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Car, Search, MoreHorizontal, QrCode, Trash2, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getVehicles, deleteVehicle, type VehicleWithCustomer } from "@/services/vehicleService";
import { useToast } from "@/hooks/use-toast";
import { formatDate, getServiceStatus } from "@/lib/utils";
import { useWorkshop } from "@/contexts/WorkshopContext";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleWithCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { workshop } = useWorkshop();

  async function loadVehicles() {
    setLoading(true);
    try {
      const data = await getVehicles(search);
      setVehicles(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, [search]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteVehicle(deleteId);
      toast({ title: "Vehicle deleted" });
      setDeleteId(null);
      loadVehicles();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  return (
    <DashboardLayout title="Vehicles">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">Manage registered vehicles and QR codes</p>
          </div>
          <Link href="/dashboard/vehicles/new">
            <Button className="min-h-[44px]">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </Link>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search plate, make, model, VIN..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-40 animate-pulse bg-muted" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Car className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No vehicles yet</h3>
              <p className="text-muted-foreground max-w-sm mt-1 mb-4">
                Register your first vehicle to generate a QR code and start tracking service history.
              </p>
              <Link href="/dashboard/vehicles/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Register Vehicle
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => {
              const status = getServiceStatus(vehicle.next_service_date, vehicle.next_service_mileage, vehicle.current_mileage);
              return (
                <Card key={vehicle.id} className="card-premium overflow-hidden group">
                  <div className="h-32 bg-muted relative overflow-hidden">
                    {vehicle.header_image_url ? (
                      <img
                        src={vehicle.header_image_url}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Car className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                            <Link href={`/dashboard/vehicles/${vehicle.id}`} className="w-full">View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                            <Link href={`/dashboard/vehicles/${vehicle.id}/edit`} className="w-full">Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                            <Link href={`/vehicle/${vehicle.slug}`} target="_blank" className="w-full">Open Public Page</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(vehicle.id)} className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{vehicle.make} {vehicle.model}</h3>
                        <p className="text-sm text-muted-foreground">{vehicle.registration_number}</p>
                      </div>
                      <Link href={`/dashboard/vehicles/${vehicle.id}/qr`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Owner</span>
                        <span className="font-medium">{vehicle.customer?.full_name || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mileage</span>
                        <span className="font-mono tabular-nums">{vehicle.current_mileage?.toLocaleString() || "—"} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Next service</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vehicle?</DialogTitle>
            <DialogDescription>
              This will permanently delete the vehicle, service history, and QR code. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}