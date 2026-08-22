"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const DISMISS_KEY = "kronos-quest-dismissed";

type OnboardingStatus = {
  steps: {
    activities: boolean;
    firstLog: boolean;
    season: boolean;
    review: boolean;
  };
  complete: boolean;
  activityCount: number;
  logsTotal: number;
  priorityCount: number;
};

const STEPS = [
  {
    id: "activities" as const,
    href: "/activities",
    titleKey: "quest.step.activities",
    ctaKey: "quest.cta.activities",
  },
  {
    id: "firstLog" as const,
    href: "/log",
    titleKey: "quest.step.log",
    ctaKey: "quest.cta.log",
  },
  {
    id: "season" as const,
    href: "/season",
    titleKey: "quest.step.season",
    ctaKey: "quest.cta.season",
  },
  {
    id: "review" as const,
    href: "/review",
    titleKey: "quest.step.review",
    ctaKey: "quest.cta.review",
  },
];

export function OnboardingQuest() {
  const { t } = useLocale();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      /* ignore */
    }

    const controller = new AbortController();
    void fetch("/api/onboarding", { signal: controller.signal })
      .then((r) => r.json())
      .then((data: OnboardingStatus) => setStatus(data))
      .catch(() => {
        /* ignore */
      });
    return () => controller.abort();
  }, []);

  if (dismissed || !status || status.complete) return null;

  const doneCount = Object.values(status.steps).filter(Boolean).length;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {t("quest.badge")}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-syne)] text-lg font-semibold">
            {t("quest.title")}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {t("quest.progress", { done: doneCount, total: STEPS.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-xs text-[var(--muted)]"
        >
          {t("quest.dismiss")}
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {STEPS.map((step) => {
          const done = status.steps[step.id];
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors",
                  done
                    ? "border-[var(--line)] bg-[var(--bg)] opacity-70"
                    : "border-[var(--line)] bg-[var(--bg)] hover:border-[var(--ink)]/25",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full",
                    done
                      ? "bg-[var(--ok)]/20 text-[var(--ok)]"
                      : "bg-[var(--bg-soft)] text-[var(--muted)]",
                  )}
                >
                  {done ? <Check size={14} /> : <Circle size={14} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {t(step.titleKey)}
                  </p>
                  {!done && (
                    <p className="text-xs text-[var(--muted)]">
                      {t(step.ctaKey)}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
