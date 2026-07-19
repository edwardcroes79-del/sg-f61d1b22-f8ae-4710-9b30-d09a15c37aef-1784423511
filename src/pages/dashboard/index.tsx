import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, Wrench, AlertTriangle, Calendar, Gauge, ArrowRight } from "lucide-react";
import { getVehicleCount, getDueSoonVehicles, type VehicleWithCustomer } from "@/services/vehicleService";
import { getCustomerCount } from "@/services/customerService";
import { getServiceRecordCount } from "@/services/serviceRecordService";
import { useToast } from "@/hooks/use-toast";
import { getServiceStatus, formatDate } from "@/lib/utils";
import { getQuery, setQuery } from "@/lib/queryCache";

export default function DashboardPage() {
  const { toast } = useToast();
  const [counts, setCounts] = useState({
    vehicles: 0,
    customers: 0,
    services: 0,
    dueSoon: 0,
  });
  const [dueSoon, setDueSoon] = useState<VehicleWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [vehicles, customers, services, dueSoonVehicles] = await Promise.all([
          getQuery("vehicles:count", getVehicleCount),
          getQuery("customers:count", getCustomerCount),
          getQuery("services:count", getServiceRecordCount),
          getQuery("vehicles:due", getDueSoonVehicles),
        ]);
        setCounts({ vehicles, customers, services, dueSoon: dueSoonVehicles.length });
        setDueSoon(dueSoonVehicles);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [toast]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <p className="text-muted-foreground">Overview of your workshop operations</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Vehicles"
            value={loading ? "—" : counts.vehicles}
            subtitle="Registered vehicles"
            icon={Car}
          />
          <StatCard
            title="Customers"
            value={loading ? "—" : counts.customers}
            subtitle="Active customers"
            icon={Users}
          />
          <StatCard
            title="Services"
            value={loading ? "—" : counts.services}
            subtitle="Total service records"
            icon={Wrench}
          />
          <StatCard
            title="Due Soon"
            value={loading ? "—" : counts.dueSoon}
            subtitle="Services due within 7 days"
            icon={AlertTriangle}
            trend={counts.dueSoon > 0 ? "up" : "neutral"}
            trendValue={counts.dueSoon > 0 ? "Attention needed" : "All good"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Upcoming Services</h2>
                <Link href="/dashboard/vehicles">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              {dueSoon.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No upcoming services</p>
                  <p className="text-sm mt-1">Service reminders appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dueSoon.map((vehicle) => {
                    const status = getServiceStatus(vehicle.next_service_date, vehicle.next_service_mileage, vehicle.current_mileage);
                    return (
                      <Link key={vehicle.id} href={`/dashboard/vehicles/${vehicle.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{vehicle.make} {vehicle.model}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.registration_number} • {vehicle.customer?.full_name || "No owner"}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-2">
                              {vehicle.next_service_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(vehicle.next_service_date)}</span>}
                              {vehicle.next_service_mileage && <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {vehicle.next_service_mileage.toLocaleString()} km</span>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/dashboard/vehicles/new">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <Car className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Register Vehicle</p>
                      <p className="text-xs text-muted-foreground">Add a new vehicle</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/dashboard/customers/new">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <Users className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Add Customer</p>
                      <p className="text-xs text-muted-foreground">Create customer record</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/dashboard/qr-codes">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <AlertTriangle className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <p className="text-sm font-medium">QR Codes</p>
                      <p className="text-xs text-muted-foreground">Print vehicle QR codes</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <Wrench className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Settings</p>
                      <p className="text-xs text-muted-foreground">Customize branding</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}