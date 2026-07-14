import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getCustomers, type Customer } from "@/services/customerService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  User,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteCustomer } from "@/services/customerService";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, [search]);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await getCustomers(search);
      setCustomers(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteCustomer(deleteId);
      toast({ title: "Customer deleted" });
      setCustomers((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-semibold tracking-tight">Customers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your workshop customers
            </p>
          </div>
          <Link href="/dashboard/customers/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Customer
            </Button>
          </Link>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : customers.length === 0 ? (
          <Card className="p-12 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">No customers yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? "No results match your search." : "Add your first customer to get started."}
            </p>
            {!search && (
              <Link href="/dashboard/customers/new">
                <Button>Add Customer</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {customers.map((customer) => (
              <Card key={customer.id} className="p-5 card-premium">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-base truncate">
                        {customer.full_name}
                      </h3>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {customer.phone_number}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {customer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {customer.email}
                        </span>
                      )}
                      {customer.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {customer.address}
                        </span>
                      )}
                    </div>
                    {customer.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {customer.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/dashboard/customers/${customer.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(customer.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the customer record.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}