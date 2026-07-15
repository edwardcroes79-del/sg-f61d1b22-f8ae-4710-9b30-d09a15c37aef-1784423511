import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getWorkshop, saveWorkshop, type Workshop } from "@/services/workshopService";
import { supabase } from "@/integrations/supabase/client";

interface WorkshopContextValue {
  workshop: Workshop | null;
  loading: boolean;
  refresh: () => Promise<void>;
  save: (workshop: Partial<Workshop> & { name: string }) => Promise<void>;
}

const WorkshopContext = createContext<WorkshopContextValue | undefined>(undefined);

export function WorkshopProvider({ children }: { children: React.ReactNode }) {
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWorkshop(null);
        return;
      }
      const data = await getWorkshop();
      setWorkshop(data);
    } catch (err) {
      setWorkshop(null);
    } finally {
      setLoading(false);
    }
  }, []);

  async function save(data: Partial<Workshop> & { name: string }) {
    const updated = await saveWorkshop(data);
    setWorkshop(updated);
  }

  useEffect(() => {
    refresh();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        refresh();
      } else if (event === "SIGNED_OUT") {
        setWorkshop(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [refresh]);

  return (
    <WorkshopContext.Provider value={{ workshop, loading, refresh, save }}>
      {children}
    </WorkshopContext.Provider>
  );
}

export function useWorkshop() {
  const ctx = useContext(WorkshopContext);
  if (!ctx) throw new Error("useWorkshop must be used within WorkshopProvider");
  return ctx;
}