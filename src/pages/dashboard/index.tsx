import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Car, Users, Wrench, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your workshop operations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Vehicles"
            value="0"
            subtitle="Registered vehicles"
            icon={Car}
          />
          <StatCard
            title="Customers"
            value="0"
            subtitle="Active customers"
            icon={Users}
          />
          <StatCard
            title="Services"
            value="0"
            subtitle="Total service records"
            icon={Wrench}
          />
          <StatCard
            title="Due Soon"
            value="0"
            subtitle="Services due within 7 days"
            icon={AlertTriangle}
            trend="up"
            trendValue="0"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-premium p-6">
            <h2 className="font-heading font-semibold text-lg mb-4">Recent Activity</h2>
            <div className="text-center py-12 text-muted-foreground">
              <p>No recent activity</p>
              <p className="text-sm mt-1">Add your first vehicle to get started</p>
            </div>
          </div>

          <div className="card-premium p-6">
            <h2 className="font-heading font-semibold text-lg mb-4">Upcoming Services</h2>
            <div className="text-center py-12 text-muted-foreground">
              <p>No upcoming services</p>
              <p className="text-sm mt-1">Service reminders appear here</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}