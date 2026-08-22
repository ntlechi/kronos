"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePlan } from "@/lib/billing/PlanProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import Link from "next/link";
import type { ActivityCategory } from "@/lib/types";

type Skill = { id: string; name: string };
type Activity = {
  id: string;
  name: string;
  color: string;
  kind: string;
  skills?: Skill[];
};

const categoryKeys: { id: ActivityCategory; labelKey: string }[] = [
  { id: "DEEP_WORK", labelKey: "log.mode.deep" },
  { id: "SHALLOW_WORK", labelKey: "log.mode.shallow" },
  { id: "RECHARGE", labelKey: "log.mode.recharge" },
];

const quickMinutes = [15, 25, 45, 60, 90];
const PULSE_KEY = "kronos-log-pulse";

export function QuickLog({
  onLogged,
}: {
  onLogged?: () => void;
}) {
  const { t } = useLocale();
  const { snapshot } = usePlan();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityId, setActivityId] = useState<string>("");
  const [previousActivityId, setPreviousActivityId] = useState<string | null>(
    null,
  );
  const [category, setCategory] = useState<ActivityCategory>("DEEP_WORK");
  const [minutes, setMinutes] = useState(25);
  const [cash, setCash] = useState("");
  const [note, setNote] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/projects")
      .then((r) => r.json())
      .then((data: { activities?: Activity[]; projects: Activity[] }) => {
        if (cancelled) return;
        const list = data.activities ?? data.projects;
        setActivities(list);
        if (list[0]) setActivityId(list[0].id);
      })
      .catch(() => {
        if (!cancelled) setMessage(t("log.loadError"));
      });
    return () => {
      cancelled = true;
    };
    // intentionally once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const selected = useMemo(
    () => activities.find((p) => p.id === activityId),
    [activities, activityId],
  );

  function selectActivity(id: string) {
    if (activityId && activityId !== id) {
      setPreviousActivityId(activityId);
    }
    setActivityId(id);
    const activity = activities.find((p) => p.id === id);
    if (activity?.kind === "lifestyle") setCategory("RECHARGE");
    else if (category === "RECHARGE") setCategory("DEEP_WORK");
  }

  function logSession(opts?: {
    durationMinutes?: number;
    source?: "manual" | "stopwatch" | "pomodoro";
  }) {
    if (!activityId) return;
    const durationMinutes = opts?.durationMinutes ?? minutes;
    const amount = Number(cash);

    startTransition(async () => {
      try {
        const res = await fetch("/api/time-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: activityId,
            category,
            durationMinutes,
            note: note || undefined,
            source: opts?.source ?? "manual",
            previousProjectId: previousActivityId,
          }),
        });
        if (!res.ok) throw new Error("Time log failed");

        const data = (await res.json()) as {
          xpGains?: { name: string; xp: number }[];
        };

        if (amount > 0 && snapshot.features.capital) {
          const expenseRes = await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: activityId,
              amount,
              description: note || "Quick expense",
            }),
          });
          if (!expenseRes.ok) throw new Error("Expense failed");
        }

        try {
          sessionStorage.setItem(
            PULSE_KEY,
            JSON.stringify({
              minutes: durationMinutes,
              xpGains: data.xpGains ?? [],
              at: Date.now(),
            }),
          );
        } catch {
          /* ignore */
        }

        onLogged?.();
        router.push("/");
        router.refresh();
      } catch {
        setMessage(t("log.error"));
      }
    });
  }

  function toggleStopwatch() {
    if (running) {
      const mins = Math.max(1, Math.round(elapsed / 60));
      logSession({ durationMinutes: mins, source: "stopwatch" });
      return;
    }
    setElapsed(0);
    setRunning(true);
  }

  return (
    <div className="space-y-5">
      <section>
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("log.activity")}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {activities.map((activity) => {
            const active = activity.id === activityId;
            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => selectActivity(activity.id)}
                className={cn(
                  "min-h-14 rounded-2xl border px-3 py-3 text-left transition-all",
                  active ? "chip-selected" : "chip-idle text-[var(--ink)]",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: activity.color }}
                    aria-hidden
                  />
                  <span className="block text-sm font-semibold leading-tight">
                    {activity.name}
                  </span>
                </span>
                <span className="mt-1 block pl-5 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  {t(`kind.${activity.kind}`)}
                </span>
              </button>
            );
          })}
        </div>
        {selected && (
          <p className="mt-3 text-xs text-[var(--muted)]">
            {selected.skills && selected.skills.length > 0
              ? `${t("log.skillsHint")}: ${selected.skills.map((s) => s.name).join(" · ")}`
              : t("log.skillsNone")}
          </p>
        )}
      </section>

      <section>
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("log.mode")}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {categoryKeys.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                "min-h-12 rounded-2xl border text-sm transition-colors",
                category === c.id ? "chip-selected" : "chip-idle",
              )}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {t("log.time")}
          </p>
          <button
            type="button"
            onClick={toggleStopwatch}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] px-3 text-sm text-[var(--ink)]"
          >
            {running ? <Pause size={14} /> : <Play size={14} />}
            <span className="metric">
              {running
                ? `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`
                : t("log.stopwatch")}
            </span>
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickMinutes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              className={cn(
                "metric min-h-10 rounded-full border px-3 text-sm",
                minutes === m ? "chip-selected" : "chip-idle",
              )}
            >
              {m} min
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="sr-only">{t("log.customMinutes")}</span>
          <input
            type="number"
            min={1}
            max={1440}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value) || 1)}
            className="metric min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
        </label>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {snapshot.features.capital ? (
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {t("log.cash")}
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              className="metric min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />
          </label>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {t("log.cash")}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t("plan.limit.capital")}{" "}
              <Link href="/pricing" className="underline underline-offset-4">
                {t("plan.upgrade")}
              </Link>
            </p>
          </div>
        )}
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {t("log.note")}
          </span>
          <input
            type="text"
            placeholder={t("log.notePlaceholder")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
        </label>
      </section>

      <button
        type="button"
        disabled={pending || !activityId || running}
        onClick={() => logSession()}
        className="accent-fill flex min-h-14 w-full items-center justify-center gap-2 rounded-full text-base font-semibold disabled:opacity-50"
      >
        <Plus size={18} />
        {pending ? t("log.saving") : t("log.submit")}
      </button>

      {message && (
        <p className="text-center text-sm text-[var(--danger)]">{message}</p>
      )}
    </div>
  );
}
