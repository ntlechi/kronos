"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  AMBIENT_SOUND_IDS,
  createAmbientSound,
  loadAmbientPreference,
  saveAmbientPreference,
  preloadAmbientSound,
  type AmbientHandle,
  type AmbientSoundId,
} from "@/lib/audio/ambientSound";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Activity = { id: string; name: string; color: string };

const DURATION_PRESETS = [15, 25, 45, 60, 90] as const;
const PULSE_KEY = "kronos-log-pulse";

const AMBIENT_LABEL_KEYS: Record<AmbientSoundId, "focus.ambient.brown" | "focus.ambient.cafe" | "focus.ambient.airport" | "focus.ambient.fan" | "focus.ambient.classical"> = {
  brown: "focus.ambient.brown",
  cafe: "focus.ambient.cafe",
  airport: "focus.ambient.airport",
  fan: "focus.ambient.fan",
  classical: "focus.ambient.classical",
};

export function FocusRunner() {
  const { t } = useLocale();
  const router = useRouter();
  const noiseRef = useRef<AmbientHandle | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityId, setActivityId] = useState("");
  const [durationMin, setDurationMin] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [ambientId, setAmbientId] = useState<AmbientSoundId>("brown");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activityIdRef = useRef(activityId);
  const durationRef = useRef(durationMin);
  const elapsedRef = useRef(0);
  const completingRef = useRef(false);

  useEffect(() => {
    activityIdRef.current = activityId;
    durationRef.current = durationMin;
  }, [activityId, durationMin]);

  const runningRef = useRef(running);
  const soundOnRef = useRef(soundOn);

  useEffect(() => {
    runningRef.current = running;
    soundOnRef.current = soundOn;
  }, [running, soundOn]);

  useEffect(() => {
    setAmbientId(loadAmbientPreference());
  }, []);

  useEffect(() => {
    preloadAmbientSound(ambientId);
  }, [ambientId]);

  useEffect(() => {
    noiseRef.current?.dispose();
    noiseRef.current = createAmbientSound(ambientId);
    if (runningRef.current && soundOnRef.current) noiseRef.current?.start();
    return () => {
      noiseRef.current?.dispose();
      noiseRef.current = null;
    };
  }, [ambientId]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch("/api/pomodoro").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([pomodoro, activityData]) => {
      if (cancelled) return;
      const focus = Number(pomodoro.prefs?.focusMinutes) || 25;
      setDurationMin(focus);
      setSecondsLeft(focus * 60);
      const list = (activityData.activities ??
        activityData.projects) as Activity[];
      setActivities(list);
      if (list[0]) setActivityId(list[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => activities.find((a) => a.id === activityId),
    [activities, activityId],
  );

  const logFocus = useCallback(
    (minutes: number) => {
      const targetId = activityIdRef.current;
      if (!targetId || minutes < 1) return;

      startTransition(async () => {
        try {
          const res = await fetch("/api/time-logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: targetId,
              category: "DEEP_WORK",
              durationMinutes: minutes,
              source: "pomodoro",
            }),
          });
          if (!res.ok) throw new Error("log failed");
          const data = (await res.json()) as {
            xpGains?: { name: string; xp: number }[];
          };
          try {
            sessionStorage.setItem(
              PULSE_KEY,
              JSON.stringify({
                minutes,
                xpGains: data.xpGains ?? [],
                at: Date.now(),
              }),
            );
          } catch {
            /* ignore */
          }
          setStatus(t("focus.logged", { minutes }));
          setImmersive(false);
          router.push("/");
          router.refresh();
        } catch {
          setStatus(t("log.error"));
        }
      });
    },
    [router, t],
  );

  const finishSession = useCallback(
    (mins: number) => {
      if (completingRef.current) return;
      completingRef.current = true;
      setRunning(false);
      noiseRef.current?.stop();
      logFocus(Math.max(1, mins));
      window.setTimeout(() => {
        completingRef.current = false;
      }, 400);
    },
    [logFocus],
  );

  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      setElapsedSec((e) => {
        const next = e + 1;
        elapsedRef.current = next;
        return next;
      });
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          window.setTimeout(
            () => finishSession(durationRef.current),
            0,
          );
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, finishSession]);

  function startFocus() {
    if (!activityId) return;
    setElapsedSec(0);
    elapsedRef.current = 0;
    setSecondsLeft(durationMin * 60);
    setRunning(true);
    setImmersive(true);
    setStatus(null);
    if (soundOn) noiseRef.current?.start();
  }

  function togglePause() {
    setRunning((r) => {
      const next = !r;
      if (next && soundOn) noiseRef.current?.start();
      else noiseRef.current?.stop();
      return next;
    });
  }

  function endEarly() {
    const mins = Math.max(1, Math.round(elapsedRef.current / 60));
    finishSession(mins);
  }

  function abortWithoutLog() {
    setRunning(false);
    noiseRef.current?.stop();
    setImmersive(false);
    setSecondsLeft(durationMin * 60);
    setElapsedSec(0);
    elapsedRef.current = 0;
  }

  function toggleSound() {
    setSoundOn((on) => {
      const next = !on;
      if (running) {
        if (next) noiseRef.current?.start();
        else noiseRef.current?.stop();
      }
      return next;
    });
  }

  function pickAmbient(id: AmbientSoundId) {
    if (id === ambientId) return;
    setAmbientId(id);
    saveAmbientPreference(id);
  }

  function pickDuration(m: number) {
    if (running) return;
    setDurationMin(m);
    setSecondsLeft(m * 60);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const total = Math.max(durationMin * 60, 1);
  const progress = 1 - secondsLeft / total;

  const runner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        immersive
          ? "fixed inset-0 z-50 bg-[var(--bg)] px-6"
          : "mx-auto max-w-md space-y-6",
      )}
    >
      {immersive && (
        <button
          type="button"
          onClick={() => setImmersive(false)}
          className="absolute right-4 top-4 inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)]"
          aria-label={t("focus.exitFullscreen")}
        >
          <Minimize2 size={18} />
        </button>
      )}

      <div className="relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center">
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 100 100"
        >
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
            stroke={selected?.color ?? "var(--accent)"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${progress * 264} 264`}
          />
        </svg>
        <div className="relative text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {t("focus.phase.focus")}
          </p>
          <p className="metric mt-2 text-6xl font-semibold tracking-tight">
            {mm}:{ss}
          </p>
          {selected && (
            <p className="mt-3 text-sm font-semibold text-[var(--ink)]">
              {selected.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {!running && !immersive ? (
          <button
            type="button"
            disabled={!activityId || pending}
            onClick={startFocus}
            className="accent-fill inline-flex min-h-14 min-w-40 items-center justify-center gap-2 rounded-full px-6 font-semibold disabled:opacity-50"
          >
            <Play size={18} />
            {t("focus.startRunner")}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={togglePause}
              className="accent-fill inline-flex min-h-14 min-w-36 items-center justify-center gap-2 rounded-full px-6 font-semibold"
            >
              {running ? <Pause size={18} /> : <Play size={18} />}
              {running ? t("focus.pause") : t("focus.resume")}
            </button>
            <button
              type="button"
              onClick={endEarly}
              disabled={pending || elapsedSec < 30}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-5 text-sm font-medium disabled:opacity-40"
            >
              <Square size={16} />
              {t("focus.endLog")}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={toggleSound}
          className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg-elevated)]"
          aria-label={soundOn ? t("focus.soundOff") : t("focus.soundOn")}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {immersive ? (
          <button
            type="button"
            onClick={abortWithoutLog}
            className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] text-[var(--muted)]"
            aria-label={t("focus.abort")}
          >
            <X size={18} />
          </button>
        ) : running ? (
          <button
            type="button"
            onClick={() => setImmersive(true)}
            className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg-elevated)]"
            aria-label={t("focus.enterFullscreen")}
          >
            <Maximize2 size={18} />
          </button>
        ) : null}
      </div>

      {(status || pending) && (
        <p className="text-center text-sm text-[var(--muted)]">
          {pending ? t("focus.syncing") : status}
        </p>
      )}

      <div className="w-full max-w-sm pt-2">
        <p className="mb-2 text-center text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("focus.ambient.label")}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {AMBIENT_SOUND_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => pickAmbient(id)}
              className={cn(
                "min-h-9 rounded-full border px-3 text-xs font-medium disabled:opacity-50",
                ambientId === id ? "chip-selected" : "chip-idle",
                !soundOn && ambientId === id && "opacity-60",
              )}
            >
              {t(AMBIENT_LABEL_KEYS[id])}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (immersive) return runner;

  return (
    <div className="mx-auto max-w-md space-y-6">
      {runner}

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("focus.logTo")}
        </span>
        <select
          value={activityId}
          disabled={running}
          onChange={(e) => setActivityId(e.target.value)}
          className="min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 text-[var(--ink)] outline-none disabled:opacity-50"
        >
          {activities.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("focus.duration")}
        </p>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              disabled={running}
              onClick={() => pickDuration(m)}
              className={cn(
                "metric min-h-10 rounded-full border px-3 text-sm disabled:opacity-50",
                durationMin === m ? "chip-selected" : "chip-idle",
              )}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-[var(--muted)]">
        {t("focus.runnerHint")}
      </p>
    </div>
  );
}
