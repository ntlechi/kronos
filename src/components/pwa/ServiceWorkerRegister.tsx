"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void (async () => {
      // Drop any old shell-caching workers that caused reload loops.
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs.map(async (reg) => {
          const script = reg.active?.scriptURL || reg.installing?.scriptURL || "";
          // Always refresh to latest sw.js in production
          await reg.unregister();
          return script;
        }),
      );

      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.includes("kronos") || key.includes("shell"))
          .map((key) => caches.delete(key)),
      );

      if (process.env.NODE_ENV === "production") {
        await navigator.serviceWorker.register("/sw.js");
      }
    })();
  }, []);

  return null;
}
