"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import {
  buildPlanSnapshot,
  type PlanSnapshot,
} from "@/lib/billing/plan";

const fallbackPlan = buildPlanSnapshot({
  plan: "free",
  activities: 0,
  skills: 0,
  workspaces: 0,
});

type PlanContextValue = {
  snapshot: PlanSnapshot;
  loading: boolean;
  refresh: () => Promise<void>;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [snapshot, setSnapshot] = useState<PlanSnapshot>(fallbackPlan);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setSnapshot(fallbackPlan);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/plan");
      if (!res.ok) return;
      const data = (await res.json()) as { plan: PlanSnapshot };
      setSnapshot(data.plan);
    } catch {
      /* keep last snapshot */
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ snapshot, loading, refresh }),
    [snapshot, loading, refresh],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used within PlanProvider");
  }
  return ctx;
}
