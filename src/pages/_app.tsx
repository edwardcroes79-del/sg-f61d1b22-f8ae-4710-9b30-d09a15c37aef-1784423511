import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { WorkshopProvider } from "@/contexts/WorkshopContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("Service worker registration failed:", err));
  }, []);

  return (
    <WorkshopProvider>
      <Component {...pageProps} />
      <Toaster />
    </WorkshopProvider>
  );
}
