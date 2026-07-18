"use client";

import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Activity = {
  id: string;
  name: string;
  color: string;
  kind: string;
};

type Skill = {
  id: string;
  name: string;
  xp: number;
  level: number;
  activityIds: string[];
  activities: Activity[];
};

export function SkillsManager() {
  const { t } = useLocale();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const [skillsRes, activitiesRes] = await Promise.all([
      fetch("/api/skills").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]);
    setSkills(skillsRes.skills);
    setActivities(activitiesRes.activities ?? activitiesRes.projects);
  }

  useEffect(() => {
    void refresh();
  }, []);

  function createSkill() {
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        setMessage(t("skills.createError"));
        return;
      }
      setName("");
      setMessage(t("skills.added"));
      await refresh();
    });
  }

  function saveRename(id: string) {
    startTransition(async () => {
      const res = await fetch("/api/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName.trim() }),
      });
      if (!res.ok) {
        setMessage(t("skills.renameError"));
        return;
      }
      setEditingId(null);
      setMessage(t("skills.renamed"));
      await refresh();
    });
  }

  function toggleActivity(skill: Skill, activityId: string) {
    const next = skill.activityIds.includes(activityId)
      ? skill.activityIds.filter((id) => id !== activityId)
      : [...skill.activityIds, activityId];

    startTransition(async () => {
      const res = await fetch("/api/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: skill.id, activityIds: next }),
      });
      if (!res.ok) {
        setMessage(t("skills.renameError"));
        return;
      }
      await refresh();
    });
  }

  function removeSkill(id: string) {
    if (!window.confirm(t("skills.deleteConfirm"))) return;
    startTransition(async () => {
      const res = await fetch(`/api/skills?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setMessage(t("skills.deleteError"));
        return;
      }
      setMessage(t("skills.deleted"));
      await refresh();
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("skills.new")}
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("skills.namePlaceholder")}
            className="min-h-12 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            disabled={pending}
            onClick={createSkill}
            className="accent-fill min-h-12 rounded-full px-5 font-semibold disabled:opacity-50"
          >
            {t("skills.add")}
          </button>
        </div>
      </section>

      {skills.length === 0 ? (
        <p className="rounded-[var(--radius)] border border-dashed border-[var(--line)] px-4 py-8 text-center text-sm text-[var(--muted)]">
          {t("skills.empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {skills.map((skill) => {
            const expanded = expandedId === skill.id;
            return (
              <li
                key={skill.id}
                className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {editingId === skill.id ? (
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="min-h-10 min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => saveRename(skill.id)}
                        className="text-sm text-[var(--accent)]"
                      >
                        {t("skills.save")}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{skill.name}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {t("skills.xp", {
                            xp: skill.xp,
                            level: skill.level,
                          })}{" "}
                          ·{" "}
                          {t("skills.linkedCount", {
                            count: skill.activityIds.length,
                          })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : skill.id)
                        }
                        className="text-sm text-[var(--accent)]"
                      >
                        {t("skills.linkTitle")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(skill.id);
                          setEditName(skill.name);
                        }}
                        className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
                      >
                        {t("skills.rename")}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        className="text-sm text-[var(--danger)]"
                      >
                        {t("skills.delete")}
                      </button>
                    </>
                  )}
                </div>

                {expanded && (
                  <div className="mt-4 border-t border-[var(--line)] pt-3">
                    <p className="text-xs text-[var(--muted)]">
                      {t("skills.linkHint")}
                    </p>
                    {activities.length === 0 ? (
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {t("skills.noActivities")}
                      </p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activities.map((activity) => {
                          const on = skill.activityIds.includes(activity.id);
                          return (
                            <button
                              key={activity.id}
                              type="button"
                              disabled={pending}
                              onClick={() =>
                                toggleActivity(skill, activity.id)
                              }
                              className={cn(
                                "min-h-10 rounded-full border px-3 text-sm transition-colors",
                                on
                                  ? "border-transparent text-[var(--accent-ink)]"
                                  : "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]",
                              )}
                              style={
                                on ? { background: activity.color } : undefined
                              }
                            >
                              {activity.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {message && (
        <p className="text-center text-sm text-[var(--muted)]">{message}</p>
      )}
    </div>
  );
}
