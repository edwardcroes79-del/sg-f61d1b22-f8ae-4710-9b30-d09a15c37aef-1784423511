import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getVehicles, type VehicleWithCustomer } from "@/services/vehicleService";
import { useWorkshop } from "@/contexts/WorkshopContext";
import { Search, Printer, QrCode, Check, ExternalLink, Eye } from "lucide-react";

function usePublicUrl(slug: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/vehicle/${slug}`;
}

interface QrItemProps {
  vehicle: VehicleWithCustomer;
  url: string;
}

function VehicleQrCard({ vehicle, url }: QrItemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    let cancelled = false;

    const canvas = canvasRef.current;
    canvas.width = 200;
    canvas.height = 200;

    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvas, url, { width: 200, margin: 2, color: { dark: "#0F172A", light: "#ffffff" } }, (err) => {
        if (cancelled) return;
        if (err) {
          console.error("QR render error", err);
          return;
        }
        setReady(true);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center text-center break-inside-avoid">
      <div className="relative">
        <canvas ref={canvasRef} className="w-full max-w-[180px] h-auto" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <QrCode className="w-8 h-8 text-muted-foreground animate-pulse" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="font-mono font-semibold text-sm">{vehicle.registration_number}</p>
        <p className="text-xs text-muted-foreground">{vehicle.make} {vehicle.model}</p>
        {vehicle.customer?.full_name && <p className="text-xs text-muted-foreground mt-0.5">{vehicle.customer.full_name}</p>}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 truncate max-w-full">{url}</p>
    </div>
  );
}

export default function QrCodesPage() {
  const { toast } = useToast();
  const { workshop } = useWorkshop();
  const [vehicles, setVehicles] = useState<VehicleWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const data = await getVehicles();
        setVehicles(data);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vehicles;
    return vehicles.filter(
      (v) =>
        v.registration_number.toLowerCase().includes(term) ||
        v.make.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        v.customer?.full_name?.toLowerCase().includes(term)
    );
  }, [vehicles, search]);

  const allSelected = filtered.length > 0 && filtered.every((v) => selected.has(v.id));

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((v) => next.delete(v.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((v) => next.add(v.id));
        return next;
      });
    }
  }, [allSelected, filtered]);

  const selectedVehicles = useMemo(() => vehicles.filter((v) => selected.has(v.id)), [vehicles, selected]);

  function handlePrint() {
    if (selectedVehicles.length === 0) {
      toast({ title: "No vehicles selected", description: "Select at least one vehicle to print QR codes." });
      return;
    }
    window.print();
  }

  return (
    <DashboardLayout title="QR Codes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground">Generate and print vehicle QR codes</p>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/vehicles">
                <ExternalLink className="w-4 h-4 mr-2" />
                Vehicles
              </Link>
            </Button>
          </div>
        </div>

        <Card className="card-premium print:hidden">
          <CardHeader>
            <CardTitle className="text-base">Select Vehicles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by plate, make, model, or owner..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={toggleSelectAll}>
                {allSelected ? <Check className="w-4 h-4 mr-2" /> : null}
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              <Button onClick={handlePrint} disabled={selectedVehicles.length === 0}>
                <Printer className="w-4 h-4 mr-2" />
                Print {selectedVehicles.length > 0 && `(${selectedVehicles.length})`}
              </Button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-muted-foreground">Loading vehicles...</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No vehicles found</p>
                <Link href="/dashboard/vehicles/new" className="text-primary hover:underline text-sm mt-2 inline-block">
                  Register a vehicle
                </Link>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                      </TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <Checkbox checked={selected.has(vehicle.id)} onCheckedChange={() => toggleSelect(vehicle.id)} aria-label={`Select ${vehicle.registration_number}`} />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                          <p className="text-xs text-muted-foreground">{vehicle.year || "—"}</p>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{vehicle.registration_number}</TableCell>
                        <TableCell>{vehicle.customer?.full_name || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/vehicles/${vehicle.id}/qr`}>
                            <Button variant="ghost" size="sm">
                              <QrCode className="w-4 h-4 mr-2" />
                              Single
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedVehicles.length > 0 && (
          <Card className="card-premium qr-print-sheet">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Print Preview
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{selectedVehicles.length} QR code(s) selected</p>
              </div>
              <Button className="print:hidden" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print Now
              </Button>
            </CardHeader>
            <CardContent>
              <div className="print-header flex items-center justify-between mb-8 pb-4 border-b">
                <div>
                  <h1 className="text-2xl font-heading font-bold">{workshop?.name || "Torque Log"}</h1>
                  <p className="text-sm text-muted-foreground">Vehicle QR Codes</p>
                </div>
                {workshop?.logo_url && <img src={workshop.logo_url} alt="" className="h-12 object-contain" />}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {selectedVehicles.map((vehicle) => (
                  <VehicleQrCard key={vehicle.id} vehicle={vehicle} url={usePublicUrl(vehicle.slug)} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .qr-print-sheet {
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}