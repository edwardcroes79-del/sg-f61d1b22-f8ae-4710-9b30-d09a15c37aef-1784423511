import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car } from "lucide-react";
import Link from "next/link";

export default function VehiclesPage() {
  return (
    <DashboardLayout title="Vehicles">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold">Vehicles</h1>
            <p className="text-muted-foreground">Manage registered vehicles and QR codes</p>
          </div>
          <Link href="/dashboard/vehicles/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </Link>
        </div>

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
      </div>
    </DashboardLayout>
  );
}