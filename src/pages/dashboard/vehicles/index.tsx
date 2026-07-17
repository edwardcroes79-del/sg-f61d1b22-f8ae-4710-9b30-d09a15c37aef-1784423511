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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm sm:text-base text-muted-foreground">Manage registered vehicles and QR codes</p>
          </div>
          <Link href="/dashboard/vehicles/new">
            <Button className="min-h-[48px] w-full sm:w-auto text-base">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </Link>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search plate, make, model, VIN..."
            className="pl-10 h-12 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-48 sm:h-56 animate-pulse bg-muted" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Car className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-medium">No vehicles yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                Register your first vehicle to generate a QR code and start tracking service history.
              </p>
              <Link href="/dashboard/vehicles/new" className="w-full sm:w-auto">
                <Button className="min-h-[48px] w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Register Vehicle
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => {
              const status = getServiceStatus(vehicle.next_service_date, vehicle.next_service_mileage, vehicle.current_mileage);
              return (
                <Card key={vehicle.id} className="card-premium overflow-hidden group">
                  <div className="h-40 sm:h-48 bg-muted relative overflow-hidden">
                    {vehicle.header_image_url ? (
                      <img
                        src={vehicle.header_image_url}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Car className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary min-h-[44px]">
                            <Link href={`/dashboard/vehicles/${vehicle.id}`} className="w-full">View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary min-h-[44px]">
                            <Link href={`/dashboard/vehicles/${vehicle.id}/edit`} className="w-full">Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary min-h-[44px]">
                            <Link href={`/vehicle/${vehicle.slug}`} target="_blank" className="w-full">Open Public Page</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(vehicle.id)} className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger min-h-[44px]">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg break-words">{vehicle.make} {vehicle.model}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{vehicle.registration_number}</p>
                      </div>
                      <Link href={`/dashboard/vehicles/${vehicle.id}/qr`}>
                        <Button variant="outline" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 shrink-0">
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Owner</span>
                        <span className="font-medium truncate">{vehicle.customer?.full_name || "—"}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Mileage</span>
                        <span className="font-mono tabular-nums">{vehicle.current_mileage?.toLocaleString() || "—"} km</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3 shrink-0" /> Next service</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color} shrink-0`}>
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
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Vehicle?</DialogTitle>
            <DialogDescription className="text-sm">
              This will permanently delete the vehicle, service history, and QR code. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="min-h-[48px] w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="min-h-[48px] w-full sm:w-auto">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}