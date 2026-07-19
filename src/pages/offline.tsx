import { Card, CardContent } from "@/components/ui/card";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardContent className="py-12">
          <WifiOff className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <h1 className="text-xl font-heading font-semibold mb-2">You are offline</h1>
          <p className="text-sm text-muted-foreground">
            Please reconnect to the internet to view this vehicle service record.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}