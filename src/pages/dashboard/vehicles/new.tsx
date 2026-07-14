import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function NewVehiclePage() {
  return (
    <DashboardLayout title="Register Vehicle">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Register Vehicle</h1>
          <p className="text-muted-foreground">Add a new vehicle and generate a QR code</p>
        </div>
        
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6">
          <p className="text-muted-foreground">Vehicle registration form coming in the next update.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}