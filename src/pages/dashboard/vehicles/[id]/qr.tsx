import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getVehicle } from "@/services/vehicleService";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Printer } from "lucide-react";
import QRCode from "qrcode";

export default function VehicleQRPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const data = await getVehicle(id as string);
        const url = `${window.location.origin}/vehicle/${data.slug}`;
        setPublicUrl(url);
        const code = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: "#0F172A", light: "#F8F7F4" } });
        setQrUrl(code);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, toast]);

  function handlePrint() {
    window.print();
  }

  return (
    <DashboardLayout title="QR Code">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/vehicles/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            {qrUrl && (
              <Button asChild>
                <a href={qrUrl} download={`vehicle-qr-${id}.png`}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>

        <Card className="card-premium text-center p-8 print:shadow-none print:border-none">
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-2xl font-heading font-semibold">Vehicle Service Record</h2>
              <p className="text-muted-foreground">Scan to view full service history</p>
            </div>

            {loading ? (
              <div className="h-64 animate-pulse bg-muted rounded-xl mx-auto w-64" />
            ) : qrUrl ? (
              <div className="bg-white p-4 rounded-2xl inline-block shadow-sm">
                <img src={qrUrl} alt="Vehicle QR Code" className="w-64 h-64" />
              </div>
            ) : (
              <p className="text-muted-foreground">Could not generate QR code.</p>
            )}

            {publicUrl && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Public URL</p>
                <p className="font-mono text-sm break-all bg-muted px-3 py-2 rounded-lg">{publicUrl}</p>
              </div>
            )}

            <div className="print:block hidden text-sm text-muted-foreground pt-8 border-t">
              <p>Keep this QR code with the vehicle for quick access to service records.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}