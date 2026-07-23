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

function getPublicUrl(slug: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/vehicle/${slug}`;
}

interface QrItemProps {
  vehicle: VehicleWithCustomer;
  url: string;
  size?: number;
}

function VehicleQrCard({ vehicle, url, size = 160 }: QrItemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    let cancelled = false;

    const canvas = canvasRef.current;
    canvas.width = size;
    canvas.height = size;

    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(
        canvas,
        url,
        { width: size, margin: 2, color: { dark: "#0F172A", light: "#ffffff" } },
        (err) => {
          if (cancelled) return;
          if (err) {
            console.error("QR render error", err);
            return;
          }
          setReady(true);
        }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [url, size]);

  return (
    <div className="flex flex-col items-center text-center page-break-inside-avoid relative">
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
          <QrCode className="w-8 h-8 text-muted-foreground animate-pulse" />
        </div>
      )}
      <p className="font-mono font-semibold text-sm mt-3">{vehicle.registration_number}</p>
      <p className="text-xs text-gray-600">{vehicle.make} {vehicle.model}</p>
      {vehicle.customer?.full_name && <p className="text-xs text-gray-600">{vehicle.customer.full_name}</p>}
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

  const selectedItems = useMemo(() => {
    return vehicles.filter((v) => selected.has(v.id)).map((v) => ({ vehicle: v, url: getPublicUrl(v.slug) }));
  }, [vehicles, selected]);

  function handlePrint() {
    if (selectedItems.length === 0) {
      toast({ title: "No vehicles selected", description: "Select at least one vehicle to print QR codes." });
      return;
    }
    window.print();
  }

  return (
    <DashboardLayout title="QR Codes">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 12mm;
          }
          html, body {
            background: white !important;
          }
          /* Hide dashboard chrome */
          aside, header, footer, .dashboard-title, .selection-section, .print\\:hidden {
            display: none !important;
          }
          /* Show and expand print area */
          .qr-print-area {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .qr-print-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            margin-bottom: 16px !important;
            padding-bottom: 10px !important;
            border-bottom: 1px solid #ddd !important;
          }
          .qr-print-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 16px !important;
            width: 100% !important;
          }
          .qr-print-card canvas {
            width: 120px !important;
            height: 120px !important;
          }
          .qr-print-card p {
            margin: 0 !important;
            line-height: 1.2 !important;
          }
          .qr-print-card .reg {
            font-family: monospace !important;
            font-weight: 600 !important;
            font-size: 11px !important;
            margin-top: 6px !important;
          }
          .qr-print-card .vehicle-info {
            font-size: 9px !important;
            color: #444 !important;
          }
        }
      `}</style>

      <div className="space-y-6 selection-section">
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

        <Card className="card-premium">
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
              <Button onClick={handlePrint} disabled={selectedItems.length === 0}>
                <Printer className="w-4 h-4 mr-2" />
                Print {selectedItems.length > 0 && `(${selectedItems.length})`}
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
                          <span className="font-medium">
                            {vehicle.make} {vehicle.model}
                          </span>
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
      </div>

      {selectedItems.length > 0 && (
        <Card className="card-premium qr-print-area mt-6">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 qr-print-header">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Print Preview
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{selectedItems.length} QR code(s) selected</p>
            </div>
            <Button onClick={handlePrint} className="print:hidden">
              <Printer className="w-4 h-4 mr-2" />
              Print Now
            </Button>
          </CardHeader>
          <CardContent>
            <div className="qr-print-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {selectedItems.map(({ vehicle, url }) => (
                <div key={vehicle.id} className="qr-print-card">
                  <VehicleQrCard vehicle={vehicle} url={url} size={120} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}