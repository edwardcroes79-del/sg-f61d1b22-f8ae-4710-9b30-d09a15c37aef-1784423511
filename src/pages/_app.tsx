import { useEffect } from "react";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import { WorkshopProvider } from "@/contexts/WorkshopContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const pathname = window.location.pathname;
    if (pathname.startsWith("/vehicle/")) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("Service worker registration failed:", err));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const isPublicPage = router.pathname.startsWith("/vehicle/");
    if (isPublicPage) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("Service worker registration failed:", err));
  }, [router.pathname]);

  return (
    <WorkshopProvider>
      <Component {...pageProps} />
      <Toaster />
    </WorkshopProvider>
  );
}
