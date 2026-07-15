import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getWorkshop, saveWorkshop, type Workshop } from "@/services/workshopService";

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
      const data = await getWorkshop();
      setWorkshop(data);
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