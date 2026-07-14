import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getCustomer, type Customer } from "@/services/customerService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Phone, Mail, MapPin, User, Loader2, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadCustomer();
  }, [id]);

  async function loadCustomer() {
    try {
      const data = await getCustomer(id as string);
      setCustomer(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load customer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Customer not found</p>
          <Link href="/dashboard/customers">
            <Button variant="outline" className="mt-4">Back to Customers</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/customers">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-semibold tracking-tight">{customer.full_name}</h1>
              <p className="text-sm text-muted-foreground">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <Link href={`/dashboard/customers/${customer.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-medium">{customer.full_name}</h2>
              <Badge variant="secondary" className="font-mono text-xs mt-1">
                {customer.phone_number}
              </Badge>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{customer.phone_number}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{customer.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Additional</h3>
              {customer.notes ? (
                <p className="text-sm text-muted-foreground">{customer.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Car className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">Vehicles</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Vehicles for this customer will appear here once vehicle management is implemented.
          </p>
          <Link href="/dashboard/vehicles">
            <Button variant="outline" className="mt-4 gap-2">
              <Car className="w-4 h-4" />
              Manage Vehicles
            </Button>
          </Link>
        </Card>
      </div>
    </DashboardLayout>
  );
}