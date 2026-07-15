import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getVehicle, updateVehicle, uploadVehicleImage, fuelTypes, transmissions } from "@/services/vehicleService";
import { getCustomers, type Customer } from "@/services/customerService";
import { useToast } from "@/hooks/use-toast";
import { Car, Upload, ArrowLeft, Loader2 } from "lucide-react";

export default function EditVehiclePage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (err: any) {
        toast({ title: "Error loading customers", description: err.message, variant: "destructive" });
      }
    }
    loadCustomers();
  }, [toast]);

  useEffect(() => {
    if (!id) return;
    async function loadVehicle() {
      try {
        const data = await getVehicle(id as string);
        setForm({
          customer_id: data.customer_id,
          registration_number: data.registration_number,
          vin: data.vin || "",
          make: data.make,
          model: data.model,
          year: data.year?.toString() || "",
          engine_size: data.engine_size || "",
          fuel_type: data.fuel_type || "",
          transmission: data.transmission || "",
          current_mileage: data.current_mileage?.toString() || "",
          color: data.color || "",
          header_image_url: data.header_image_url || "",
          next_service_date: data.next_service_date?.slice(0, 10) || "",
          next_service_mileage: data.next_service_mileage?.toString() || "",
        });
        if (data.header_image_url) setImagePreview(data.header_image_url);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [id, toast]);

  function handleChange(field: string, value: string) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !id) return;

    setSubmitting(true);
    try {
      let headerImageUrl = form.header_image_url;
      if (imageFile) {
        try {
          headerImageUrl = await uploadVehicleImage(imageFile);
        } catch (uploadErr: any) {
          toast({ title: "Image upload failed", description: uploadErr.message, variant: "destructive" });
          setSubmitting(false);
          return;
        }
      }

      await updateVehicle(id as string, {
        customer_id: form.customer_id,
        registration_number: form.registration_number,
        vin: form.vin || undefined,
        make: form.make,
        model: form.model,
        year: form.year ? parseInt(form.year) : undefined,
        engine_size: form.engine_size || undefined,
        fuel_type: form.fuel_type || undefined,
        transmission: form.transmission || undefined,
        current_mileage: form.current_mileage ? parseInt(form.current_mileage) : undefined,
        color: form.color || undefined,
        header_image_url: headerImageUrl || undefined,
        next_service_date: form.next_service_date || undefined,
        next_service_mileage: form.next_service_mileage ? parseInt(form.next_service_mileage) : undefined,
      });

      toast({ title: "Vehicle updated" });
      router.push(`/dashboard/vehicles/${id}`);
    } catch (err: any) {
      toast({ title: "Failed to save vehicle", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !form) {
    return (
      <DashboardLayout title="Edit Vehicle">
        <div className="h-96 animate-pulse bg-muted rounded-2xl" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Vehicle">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/vehicles/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Edit Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customer">Owner (Customer)</Label>
                  <Select value={form.customer_id} onValueChange={(value) => handleChange("customer_id", value)}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.full_name} — {customer.phone_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">License Plate</Label>
                  <Input id="registration_number" value={form.registration_number} onChange={(e) => handleChange("registration_number", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN</Label>
                  <Input id="vin" value={form.vin} onChange={(e) => handleChange("vin", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" value={form.make} onChange={(e) => handleChange("make", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" value={form.model} onChange={(e) => handleChange("model", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" value={form.year} onChange={(e) => handleChange("year", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" value={form.color} onChange={(e) => handleChange("color", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engine_size">Engine Size</Label>
                  <Input id="engine_size" value={form.engine_size} onChange={(e) => handleChange("engine_size", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <Select value={form.fuel_type} onValueChange={(value) => handleChange("fuel_type", value)}>
                    <SelectTrigger id="fuel_type"><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select value={form.transmission} onValueChange={(value) => handleChange("transmission", value)}>
                    <SelectTrigger id="transmission"><SelectValue placeholder="Select transmission" /></SelectTrigger>
                    <SelectContent>
                      {transmissions.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_mileage">Current Mileage (km)</Label>
                  <Input id="current_mileage" type="number" value={form.current_mileage} onChange={(e) => handleChange("current_mileage", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_service_date">Next Service Date</Label>
                  <Input id="next_service_date" type="date" value={form.next_service_date} onChange={(e) => handleChange("next_service_date", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_service_mileage">Next Service Mileage (km)</Label>
                  <Input id="next_service_mileage" type="number" value={form.next_service_mileage} onChange={(e) => handleChange("next_service_mileage", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vehicle Header Image</Label>
                <div className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-40 object-contain rounded-lg" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click or drag to upload image</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/dashboard/vehicles/${id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}