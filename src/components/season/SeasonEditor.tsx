"use client";

import { useEffect, useState, useTransition } from "react";
import { MAX_SEASON_PRIORITIES } from "@/lib/season";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

type Activity = { id: string; name: string; color: string };
type PriorityDraft = { title: string; projectId: string | null };
type Season = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  priorities: {
    id: string;
    title: string;
    sortOrder: number;
    projectId: string | null;
    project: { id: string; name: string; color: string } | null;
  }[];
};

export function SeasonEditor() {
  const { t } = useLocale();
  const [season, setSeason] = useState<Season | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [name, setName] = useState("");
  const [priorities, setPriorities] = useState<PriorityDraft[]>([
    { title: "", projectId: null },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch("/api/seasons").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([seasonData, projectData]) => {
      if (cancelled) return;
      const s = seasonData.season as Season;
      setSeason(s);
      setName(s.name);
      setPriorities(
        s.priorities.length > 0
          ? s.priorities.map((p) => ({
              title: p.title,
              projectId: p.projectId,
            }))
          : [{ title: "", projectId: null }],
      );
      const list = (projectData.activities ??
        projectData.projects) as Activity[];
      setActivities(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function updatePriority(index: number, patch: Partial<PriorityDraft>) {
    setPriorities((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
    setSaved(false);
  }

  function addPriority() {
    if (priorities.length >= MAX_SEASON_PRIORITIES) return;
    setPriorities((rows) => [...rows, { title: "", projectId: null }]);
    setSaved(false);
  }

  function removePriority(index: number) {
    setPriorities((rows) => rows.filter((_, i) => i !== index));
    setSaved(false);
  }

  function save() {
    setError(null);
    const cleaned = priorities
      .map((p) => ({
        title: p.title.trim(),
        projectId: p.projectId || null,
      }))
      .filter((p) => p.title.length > 0)
      .slice(0, MAX_SEASON_PRIORITIES);

    startTransition(async () => {
      try {
        const res = await fetch("/api/seasons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() || undefined, priorities: cleaned }),
        });
        if (!res.ok) throw new Error("fail");
        const data = (await res.json()) as { season: Season };
        setSeason(data.season);
        setPriorities(
          data.season.priorities.length > 0
            ? data.season.priorities.map((p) => ({
                title: p.title,
                projectId: p.projectId,
              }))
            : [{ title: "", projectId: null }],
        );
        setSaved(true);
      } catch {
        setError(t("season.error"));
      }
    });
  }

  if (!season) {
    return <p className="text-sm text-[var(--muted)]">{t("season.loading")}</p>;
  }

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("season.name")}
        </span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          className="min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 outline-none focus:border-[var(--ink)]"
        />
      </label>

      <p className="text-xs text-[var(--muted)]">{t("season.hint")}</p>

      <div className="space-y-3">
        {priorities.map((row, index) => (
          <div
            key={index}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {t("season.priorityN", { n: index + 1 })}
              </p>
              {priorities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePriority(index)}
                  className="text-xs text-[var(--muted)]"
                >
                  {t("season.remove")}
                </button>
              )}
            </div>
            <input
              value={row.title}
              onChange={(e) => updatePriority(index, { title: e.target.value })}
              placeholder={t("season.priorityPlaceholder")}
              className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 outline-none focus:border-[var(--ink)]"
            />
            <label className="mt-3 block">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                {t("season.linkActivity")}
              </span>
              <select
                value={row.projectId ?? ""}
                onChange={(e) =>
                  updatePriority(index, {
                    projectId: e.target.value || null,
                  })
                }
                className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-sm outline-none"
              >
                <option value="">{t("season.noLink")}</option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>

      {priorities.length < MAX_SEASON_PRIORITIES && (
        <button
          type="button"
          onClick={addPriority}
          className="text-sm font-medium text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4"
        >
          {t("season.addPriority")}
        </button>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={save}
        className={cn(
          "accent-fill flex min-h-12 w-full items-center justify-center rounded-full font-semibold disabled:opacity-50",
        )}
      >
        {pending ? t("season.saving") : t("season.save")}
      </button>

      {saved && (
        <p className="text-center text-sm text-[var(--ok)]">{t("season.saved")}</p>
      )}
      {error && (
        <p className="text-center text-sm text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}
