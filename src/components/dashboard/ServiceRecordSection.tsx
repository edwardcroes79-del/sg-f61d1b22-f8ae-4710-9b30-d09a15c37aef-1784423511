import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getServiceRecords,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
  uploadServiceImage,
  addServiceImage,
} from "@/services/serviceRecordService";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatMileage } from "@/lib/utils";
import { Plus, Wrench, Calendar, Gauge, User, FileText, Trash2, Edit, X, ImagePlus } from "lucide-react";

interface ServiceRecordSectionProps {
  vehicleId: string;
}

interface ServiceRecordWithImages {
  id: string;
  vehicle_id: string;
  service_date: string;
  odometer_mileage?: number;
  service_type: string;
  technician?: string;
  work_performed?: string;
  parts_replaced?: string;
  fluids_changed?: string;
  labour_notes?: string;
  recommendations?: string;
  invoice_number?: string;
  total_cost?: number;
  service_images: { id: string; image_url: string }[];
}

const emptyForm = {
  id: "",
  service_date: new Date().toISOString().slice(0, 10),
  odometer_mileage: "",
  service_type: "",
  technician: "",
  work_performed: "",
  parts_replaced: "",
  fluids_changed: "",
  labour_notes: "",
  recommendations: "",
  invoice_number: "",
  total_cost: "",
};

export function ServiceRecordSection({ vehicleId }: ServiceRecordSectionProps) {
  const { toast } = useToast();
  const [records, setRecords] = useState<ServiceRecordWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, [vehicleId]);

  async function loadRecords() {
    setLoading(true);
    try {
      const data = await getServiceRecords(vehicleId);
      setRecords(data as ServiceRecordWithImages[]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm(emptyForm);
    setImages([]);
    setImagePreviews([]);
    setDialogOpen(true);
  }

  function openEdit(record: ServiceRecordWithImages) {
    setForm({
      id: record.id,
      service_date: record.service_date.slice(0, 10),
      odometer_mileage: record.odometer_mileage?.toString() || "",
      service_type: record.service_type,
      technician: record.technician || "",
      work_performed: record.work_performed || "",
      parts_replaced: record.parts_replaced || "",
      fluids_changed: record.fluids_changed || "",
      labour_notes: record.labour_notes || "",
      recommendations: record.recommendations || "",
      invoice_number: record.invoice_number || "",
      total_cost: record.total_cost?.toString() || "",
    });
    setImages([]);
    setImagePreviews(record.service_images?.map((img) => img.image_url) || []);
    setDialogOpen(true);
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.service_type) {
      toast({ title: "Service type required", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const recordData = {
        vehicle_id: vehicleId,
        service_date: form.service_date,
        odometer_mileage: form.odometer_mileage ? parseInt(form.odometer_mileage) : undefined,
        service_type: form.service_type,
        technician: form.technician || undefined,
        work_performed: form.work_performed || undefined,
        parts_replaced: form.parts_replaced || undefined,
        fluids_changed: form.fluids_changed || undefined,
        labour_notes: form.labour_notes || undefined,
        recommendations: form.recommendations || undefined,
        invoice_number: form.invoice_number || undefined,
        total_cost: form.total_cost ? parseFloat(form.total_cost) : undefined,
      };

      let recordId = form.id;
      if (form.id) {
        await updateServiceRecord(form.id, recordData);
      } else {
        const created = await createServiceRecord(recordData);
        recordId = created.id;
      }

      for (const file of images) {
        const url = await uploadServiceImage(file);
        await addServiceImage(recordId, url);
      }

      toast({ title: form.id ? "Service record updated" : "Service record added" });
      setDialogOpen(false);
      loadRecords();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteServiceRecord(deleteId);
      toast({ title: "Service record deleted" });
      setDeleteId(null);
      loadRecords();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-semibold">Service History</h2>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service Record
        </Button>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse bg-muted rounded-2xl" />
      ) : records.length === 0 ? (
        <Card className="card-premium">
          <CardContent className="py-12 text-center">
            <Wrench className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-medium">No service records yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add the first service record to start the timeline.</p>
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-6 pl-4 md:pl-8 border-l-2 border-muted">
          {records.map((record) => (
            <Card key={record.id} className="card-premium relative">
              <div className="absolute -left-[25px] md:-left-[41px] top-6 w-4 h-4 rounded-full bg-primary border-4 border-background" />
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    {record.service_type}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(record)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => setDeleteId(record.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(record.service_date)}</span>
                  {record.odometer_mileage !== undefined && (
                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {formatMileage(record.odometer_mileage)} km</span>
                  )}
                  {record.technician && (
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {record.technician}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {record.work_performed && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Work Performed</p>
                    <p className="text-sm whitespace-pre-line">{record.work_performed}</p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {record.parts_replaced && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Parts Replaced</p>
                      <p className="text-sm whitespace-pre-line">{record.parts_replaced}</p>
                    </div>
                  )}
                  {record.fluids_changed && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fluids Changed</p>
                      <p className="text-sm whitespace-pre-line">{record.fluids_changed}</p>
                    </div>
                  )}
                </div>
                {(record.labour_notes || record.recommendations) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {record.labour_notes && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Labour Notes</p>
                        <p className="text-sm whitespace-pre-line">{record.labour_notes}</p>
                      </div>
                    )}
                    {record.recommendations && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recommendations</p>
                        <p className="text-sm whitespace-pre-line">{record.recommendations}</p>
                      </div>
                    )}
                  </div>
                )}
                {(record.invoice_number || record.total_cost) && (
                  <div className="flex flex-wrap gap-4 pt-3 border-t text-sm">
                    {record.invoice_number && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <FileText className="w-3 h-3" /> Invoice: {record.invoice_number}
                      </span>
                    )}
                    {record.total_cost && (
                      <span className="font-mono font-medium">Total: ${record.total_cost.toFixed(2)}</span>
                    )}
                  </div>
                )}
                {record.service_images && record.service_images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-3">
                    {record.service_images.map((img) => (
                      <img key={img.id} src={img.image_url} alt="Service" className="rounded-lg aspect-square object-cover border" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Service Record" : "Add Service Record"}</DialogTitle>
            <DialogDescription>Record service details, parts, and upload images.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="service_date">Service Date *</Label>
                <Input id="service_date" type="date" value={form.service_date} onChange={(e) => handleChange("service_date", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type *</Label>
                <Input id="service_type" value={form.service_type} onChange={(e) => handleChange("service_type", e.target.value)} placeholder="e.g. Full Service" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odometer_mileage">Odometer (km)</Label>
                <Input id="odometer_mileage" type="number" value={form.odometer_mileage} onChange={(e) => handleChange("odometer_mileage", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technician">Technician</Label>
                <Input id="technician" value={form.technician} onChange={(e) => handleChange("technician", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input id="invoice_number" value={form.invoice_number} onChange={(e) => handleChange("invoice_number", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_cost">Total Cost</Label>
                <Input id="total_cost" type="number" step="0.01" value={form.total_cost} onChange={(e) => handleChange("total_cost", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="work_performed">Work Performed</Label>
              <Textarea id="work_performed" value={form.work_performed} onChange={(e) => handleChange("work_performed", e.target.value)} rows={3} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="parts_replaced">Parts Replaced</Label>
                <Textarea id="parts_replaced" value={form.parts_replaced} onChange={(e) => handleChange("parts_replaced", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fluids_changed">Fluids Changed</Label>
                <Textarea id="fluids_changed" value={form.fluids_changed} onChange={(e) => handleChange("fluids_changed", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labour_notes">Labour Notes</Label>
                <Textarea id="labour_notes" value={form.labour_notes} onChange={(e) => handleChange("labour_notes", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea id="recommendations" value={form.recommendations} onChange={(e) => handleChange("recommendations", e.target.value)} rows={3} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Service Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add image</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : form.id ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service Record?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}