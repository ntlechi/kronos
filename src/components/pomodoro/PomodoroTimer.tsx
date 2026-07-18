"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Activity = { id: string; name: string; color: string };
type Prefs = {
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLong: number;
};

type Phase = "focus" | "break";

export function PomodoroTimer() {
  const { t } = useLocale();
  const [prefs, setPrefs] = useState<Prefs>({
    focusMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLong: 4,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityId, setActivityId] = useState("");
  const [phase, setPhase] = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const phaseRef = useRef(phase);
  const prefsRef = useRef(prefs);
  const cycleRef = useRef(cycle);
  const activityIdRef = useRef(activityId);
  const completingRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
    prefsRef.current = prefs;
    cycleRef.current = cycle;
    activityIdRef.current = activityId;
  }, [phase, prefs, cycle, activityId]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch("/api/pomodoro").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([pomodoro, activityData]) => {
      if (cancelled) return;
      const next = pomodoro.prefs as Prefs;
      setPrefs(next);
      setSecondsLeft(next.focusMinutes * 60);
      const list = (activityData.activities ??
        activityData.projects) as Activity[];
      setActivities(list);
      if (list[0]) setActivityId(list[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function resetPhase(nextPhase: Phase, nextCycle = cycleRef.current) {
    setPhase(nextPhase);
    setRunning(false);
    const p = prefsRef.current;
    if (nextPhase === "focus") {
      setSecondsLeft(p.focusMinutes * 60);
      return;
    }
    const longBreak =
      nextCycle > 0 && nextCycle % p.cyclesBeforeLong === 0;
    setSecondsLeft(
      (longBreak ? p.longBreakMinutes : p.breakMinutes) * 60,
    );
  }

  function handlePhaseComplete() {
    if (completingRef.current) return;
    completingRef.current = true;
    setRunning(false);
    const p = prefsRef.current;

    if (phaseRef.current === "focus") {
      const nextCycle = cycleRef.current + 1;
      setCycle(nextCycle);
      const targetId = activityIdRef.current;
      if (targetId) {
        startTransition(async () => {
          await fetch("/api/time-logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: targetId,
              category: "DEEP_WORK",
              durationMinutes: p.focusMinutes,
              source: "pomodoro",
            }),
          });
          setStatus(t("focus.logged", { minutes: p.focusMinutes }));
        });
      }
      resetPhase("break", nextCycle);
    } else {
      resetPhase("focus");
    }

    window.setTimeout(() => {
      completingRef.current = false;
    }, 250);
  }

  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          window.setTimeout(() => handlePhaseComplete(), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const totalSeconds = useMemo(() => {
    if (phase === "focus") return prefs.focusMinutes * 60;
    const longBreak =
      cycle > 0 && cycle % prefs.cyclesBeforeLong === 0;
    return (longBreak ? prefs.longBreakMinutes : prefs.breakMinutes) * 60;
  }, [phase, prefs, cycle]);

  const progress = 1 - secondsLeft / Math.max(totalSeconds, 1);

  function updateLocalPref<K extends keyof Prefs>(key: K, value: number) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    if (!running && phase === "focus" && key === "focusMinutes") {
      setSecondsLeft(value * 60);
    }
  }

  function persistPrefs() {
    startTransition(async () => {
      await fetch("/api/pomodoro", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
    });
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--line)"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${progress * 264} 264`}
          />
        </svg>
        <div className="relative text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {phase === "focus" ? t("focus.phase.focus") : t("focus.phase.break")}{" "}
            · {t("focus.cycle", { cycle })}
          </p>
          <p className="mt-2 font-[family-name:var(--font-syne)] text-6xl font-semibold tracking-tight tabular-nums">
            {mm}:{ss}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="accent-fill inline-flex min-h-14 min-w-36 items-center justify-center gap-2 rounded-full px-6 font-semibold"
        >
          {running ? <Pause size={18} /> : <Play size={18} />}
          {running ? t("focus.pause") : t("focus.start")}
        </button>
        <button
          type="button"
          onClick={() => resetPhase("focus")}
          className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg-elevated)]"
          aria-label={t("focus.reset")}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("focus.logTo")}
        </span>
        <select
          value={activityId}
          onChange={(e) => setActivityId(e.target.value)}
          className="min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 text-[var(--ink)] outline-none"
        >
          {activities.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ["focusMinutes", "focus.focusMin"],
            ["breakMinutes", "focus.breakMin"],
            ["longBreakMinutes", "focus.longBreak"],
            ["cyclesBeforeLong", "focus.cyclesLong"],
          ] as const
        ).map(([key, labelKey]) => (
          <label key={key} className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              {t(labelKey)}
            </span>
            <input
              type="number"
              min={1}
              value={prefs[key]}
              onChange={(e) =>
                updateLocalPref(key, Math.max(1, Number(e.target.value) || 1))
              }
              onBlur={persistPrefs}
              className="min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 outline-none focus:border-[var(--accent)]"
            />
          </label>
        ))}
      </div>

      {(status || pending) && (
        <p className="text-center text-sm text-[var(--muted)]">
          {pending ? t("focus.syncing") : status}
        </p>
      )}
    </div>
  );
}
