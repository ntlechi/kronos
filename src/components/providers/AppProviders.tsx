"use client";

import { SessionProvider } from "next-auth/react";
import { PlanProvider } from "@/lib/billing/PlanProvider";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LocaleProvider>
          <PlanProvider>{children}</PlanProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
