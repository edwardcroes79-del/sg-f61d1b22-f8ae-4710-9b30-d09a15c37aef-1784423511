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
import { Search, Printer, QrCode, Check, ExternalLink } from "lucide-react";

function getPublicUrl(slug: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/vehicle/${slug}`;
}

interface QrItemProps {
  vehicle: VehicleWithCustomer;
  url: string;
  size: number;
}

function VehicleQrCard({ vehicle, url, size }: QrItemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = size;
    canvas.height = size;

    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(
        canvas,
        url,
        { width: size, margin: 1, color: { dark: "#0F172A", light: "#ffffff" } },
        (err) => {
          if (err) console.error("QR render error", err);
        }
      );
    });
  }, [url, size]);

  return (
    <div className="qr-tile">
      <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} />
      <p className="qr-plate">{vehicle.registration_number}</p>
      <p className="qr-meta">{vehicle.make} {vehicle.model}</p>
      {vehicle.customer?.full_name && <p className="qr-meta">{vehicle.customer.full_name}</p>}
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
  const [showPrint, setShowPrint] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrint(false), 500);
    }, 500);
  }

  return (
    <>
      <DashboardLayout title="QR Codes">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-muted-foreground">Generate and print vehicle QR codes</p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/vehicles">
                <ExternalLink className="w-4 h-4 mr-2" />
                Vehicles
              </Link>
            </Button>
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
      </DashboardLayout>

      {mounted && (
        <div id="qr-print-portal" className={showPrint ? "print-open" : "print-closed"} aria-hidden={!showPrint}>
          <div className="print-sheet">
            <div className="print-sheet-header">
              <div>
                <h1>{workshop?.name || "Torque Log"}</h1>
                <p>Vehicle QR Codes — {selectedItems.length} total</p>
              </div>
              {workshop?.logo_url && <img src={workshop.logo_url} alt="" />}
            </div>
            <div className="print-sheet-grid">
              {selectedItems.map(({ vehicle, url }) => (
                <VehicleQrCard key={vehicle.id} vehicle={vehicle} url={url} size={120} />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .print-closed {
          display: none;
        }
        .print-open {
          display: block;
        }
        .print-sheet {
          background: white;
          padding: 8mm;
        }
        .print-sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6mm;
          padding-bottom: 3mm;
          border-bottom: 1px solid #ddd;
        }
        .print-sheet-header h1 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }
        .print-sheet-header p {
          font-size: 11px;
          color: #555;
          margin: 0;
        }
        .print-sheet-header img {
          height: 28px;
          object-fit: contain;
        }
        .print-sheet-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6mm;
        }
        .qr-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          page-break-inside: avoid;
        }
        .qr-plate {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 600;
          font-size: 10px;
          margin-top: 6px;
          margin-bottom: 2px;
          line-height: 1.2;
        }
        .qr-meta {
          font-size: 8px;
          color: #444;
          line-height: 1.2;
          margin: 0;
        }
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm;
          }
          html, body {
            background: white !important;
          }
          body * {
            visibility: hidden;
          }
          #qr-print-portal,
          #qr-print-portal * {
            visibility: visible;
          }
          #qr-print-portal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-closed {
            display: none !important;
          }
          .print-open {
            display: block !important;
          }
          .print-sheet-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
      `}</style>
    </>
  );
}