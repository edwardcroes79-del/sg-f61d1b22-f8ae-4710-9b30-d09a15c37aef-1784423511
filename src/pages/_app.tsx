import { Toaster } from "@/components/ui/toaster";
import { WorkshopProvider } from "@/contexts/WorkshopContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WorkshopProvider>
      <Component {...pageProps} />
      <Toaster />
    </WorkshopProvider>
  );
}
