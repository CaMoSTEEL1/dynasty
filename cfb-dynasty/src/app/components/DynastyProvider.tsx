"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Dynasty } from "../lib/types";

interface DynastyContextType {
  dynasties: Dynasty[];
  activeDynasty: Dynasty | null;
  setActiveDynastyId: (id: string) => void;
  refreshDynasties: () => Promise<void>;
  loading: boolean;
}

const DynastyContext = createContext<DynastyContextType>({
  dynasties: [],
  activeDynasty: null,
  setActiveDynastyId: () => {},
  refreshDynasties: async () => {},
  loading: true,
});

export function useDynasty() {
  return useContext(DynastyContext);
}

export default function DynastyProvider({ children }: { children: ReactNode }) {
  const [dynasties, setDynasties] = useState<Dynasty[]>([]);
  const [activeDynastyId, setActiveDynastyId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const refreshDynasties = useCallback(async () => {
    try {
      const res = await fetch("/api/dynasties");
      const data = await res.json();
      setDynasties(data);
      if (data.length > 0 && !activeDynastyId) {
        setActiveDynastyId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch dynasties:", err);
    } finally {
      setLoading(false);
    }
  }, [activeDynastyId]);

  useEffect(() => {
    refreshDynasties();
  }, [refreshDynasties]);

  const activeDynasty = dynasties.find((d) => d.id === activeDynastyId) ?? null;

  return (
    <DynastyContext.Provider
      value={{ dynasties, activeDynasty, setActiveDynastyId, refreshDynasties, loading }}
    >
      {children}
    </DynastyContext.Provider>
  );
}
