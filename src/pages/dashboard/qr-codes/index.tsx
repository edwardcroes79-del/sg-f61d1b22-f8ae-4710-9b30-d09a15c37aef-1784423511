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
    <div className="flex flex-col items-center text-center page-break-inside-avoid">
      <canvas ref={canvasRef} className="w-40 h-40" />
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
    return vehicles
      .filter((v) => selected.has(v.id))
      .map((v) => ({ vehicle: v, url: getPublicUrl(v.slug) }));
  }, [vehicles, selected]);

  function handlePrint() {
    if (selectedItems.length === 0) {
      toast({ title: "No vehicles selected", description: "Select at least one vehicle to print QR codes." });
      return;
    }
    setTimeout(() => window.print(), 300);
  }

  return (
    <DashboardLayout title="QR Codes">
      <div className="space-y-6 print:hidden">
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

        {selectedItems.length > 0 && (
          <Card className="card-premium">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Print Preview
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{selectedItems.length} QR code(s) selected</p>
              </div>
              <Button onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print Now
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {selectedItems.map(({ vehicle, url }) => (
                  <VehicleQrCard key={vehicle.id} vehicle={vehicle} url={url} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div id="print-content" className="hidden print:block">
        <style>{`
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          @media print {
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background: white;
            }
            #print-content {
              display: block !important;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            .print-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid #ddd;
            }
            .print-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 30px;
              width: 100%;
            }
            .page-break-inside-avoid {
              page-break-inside: avoid;
            }
            .print-qr-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            .print-qr-card canvas {
              width: 140px;
              height: 140px;
              margin-bottom: 8px;
            }
            .print-qr-card p {
              margin: 0;
              padding: 0;
            }
            .print-qr-card .reg {
              font-family: monospace;
              font-weight: 600;
              font-size: 12px;
              margin-bottom: 4px;
            }
            .print-qr-card .vehicle-info {
              font-size: 10px;
              color: #666;
              line-height: 1.3;
            }
          }
        `}</style>
        <div className="print-header">
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 4px 0" }}>{workshop?.name || "Torque Log"}</h1>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>Vehicle QR Codes</p>
          </div>
          {workshop?.logo_url && <img src={workshop.logo_url} alt="" style={{ height: "40px", objectFit: "contain" }} />}
        </div>
        <div className="print-grid">
          {selectedItems.map(({ vehicle, url }) => (
            <div key={vehicle.id} className="page-break-inside-avoid print-qr-card">
              <canvas
                ref={(canvas) => {
                  if (canvas && url) {
                    canvas.width = 140;
                    canvas.height = 140;
                    import("qrcode").then((QRCode) => {
                      QRCode.toCanvas(canvas, url, { width: 140, margin: 2, color: { dark: "#0F172A", light: "#ffffff" } });
                    });
                  }
                }}
              />
              <p className="reg">{vehicle.registration_number}</p>
              <p className="vehicle-info">{vehicle.make} {vehicle.model}</p>
              {vehicle.customer?.full_name && <p className="vehicle-info">{vehicle.customer.full_name}</p>}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}