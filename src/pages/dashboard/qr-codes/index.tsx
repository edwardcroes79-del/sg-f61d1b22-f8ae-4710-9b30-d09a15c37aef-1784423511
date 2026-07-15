import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode } from "lucide-react";

export default function QrCodesPage() {
  return (
    <DashboardLayout title="QR Codes">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">Generate and print vehicle QR codes</p>
        </div>

        <Card className="card-premium">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">QR Codes</h3>
            <p className="text-muted-foreground max-w-sm mt-1">
              QR code management and batch printing tools will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}