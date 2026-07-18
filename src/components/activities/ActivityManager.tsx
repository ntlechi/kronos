"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Skill = { id: string; name: string };
type Activity = {
  id: string;
  name: string;
  color: string;
  kind: string;
  hourlyRateCents: number | null;
  skillIds: string[];
  skills: Skill[];
};

export function ActivityManager() {
  const { t } = useLocale();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"brand" | "personal" | "lifestyle">(
    "brand",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRate, setEditRate] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const a = await fetch("/api/projects").then((r) => r.json());
    setActivities(a.activities ?? a.projects);
  }

  useEffect(() => {
    void refresh();
  }, []);

  function createActivity() {
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), kind }),
      });
      if (!res.ok) {
        setMessage(t("activities.createError"));
        return;
      }
      setName("");
      setMessage(t("activities.added"));
      await refresh();
    });
  }

  function startEdit(activity: Activity) {
    setEditingId(activity.id);
    setEditName(activity.name);
    setEditRate(
      activity.hourlyRateCents != null
        ? String(activity.hourlyRateCents / 100)
        : "",
    );
  }

  function saveEdit(id: string) {
    const rateNumber = editRate.trim() === "" ? null : Number(editRate);
    if (rateNumber !== null && (Number.isNaN(rateNumber) || rateNumber < 0)) {
      setMessage(t("activities.rateInvalid"));
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editName.trim(),
          hourlyRateCents:
            rateNumber === null ? null : Math.round(rateNumber * 100),
        }),
      });
      if (!res.ok) {
        setMessage(t("activities.renameError"));
        return;
      }
      setEditingId(null);
      setMessage(t("activities.saved"));
      await refresh();
    });
  }

  function kindLabel(k: string) {
    if (k === "brand") return t("activities.kind.brand");
    if (k === "personal") return t("activities.kind.personal");
    return t("activities.kind.lifestyle");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("activities.financeTitle")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {t("activities.financeHelp")}
        </p>
      </section>

      <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("activities.new")}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("activities.namePlaceholder")}
            className="min-h-12 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 outline-none focus:border-[var(--accent)]"
          />
          <select
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as "brand" | "personal" | "lifestyle")
            }
            className="min-h-12 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-3 outline-none"
          >
            <option value="brand">{t("activities.kind.brand")}</option>
            <option value="personal">{t("activities.kind.personal")}</option>
            <option value="lifestyle">{t("activities.kind.lifestyle")}</option>
          </select>
          <button
            type="button"
            disabled={pending}
            onClick={createActivity}
            className="accent-fill min-h-12 rounded-full px-5 font-semibold disabled:opacity-50"
          >
            {t("activities.add")}
          </button>
        </div>
      </section>

      <ul className="space-y-2">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                style={{ background: activity.color }}
              />
              {editingId === activity.id ? (
                <div className="min-w-0 flex-1 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-[var(--muted)]">
                      {t("activities.rename")}
                    </span>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="min-h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-[var(--muted)]">
                      {t("activities.rateLabel")}
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      placeholder={t("activities.ratePlaceholder")}
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      className="min-h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 outline-none"
                    />
                    <span className="mt-1 block text-xs text-[var(--muted)]">
                      {t("activities.rateHelp")}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => saveEdit(activity.id)}
                    className="text-sm font-medium text-[var(--accent)]"
                  >
                    {t("activities.save")}
                  </button>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{activity.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {kindLabel(activity.kind)}
                      {activity.hourlyRateCents != null
                        ? t("activities.hourly", {
                            rate: (activity.hourlyRateCents / 100).toFixed(0),
                          })
                        : ` · ${t("activities.rateNone")}`}
                    </p>
                    {activity.skills?.length > 0 && (
                      <p className="mt-1 truncate text-xs text-[var(--accent)]">
                        {activity.skills.map((s) => s.name).join(" · ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(activity)}
                    className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    {t("activities.edit")}
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {message && (
        <p className="text-center text-sm text-[var(--muted)]">{message}</p>
      )}
    </div>
  );
}
