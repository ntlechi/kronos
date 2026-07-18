"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SkillMatrix } from "@/components/dashboard/SkillMatrix";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { SkillProgress } from "@/lib/types";

const STORAGE_KEY = "kronos-skills-open";

export function FoldableSkills({ skills }: { skills: SkillProgress[] }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setOpen(true);
  }, []);

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  if (skills.length === 0) return null;

  return (
    <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)]">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
            {t("dashboard.skillsTitle")}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {open ? t("dashboard.skillsHint") : t("dashboard.skillsFolded")}
          </p>
        </div>
        <ChevronDown
          size={20}
          className={cn(
            "shrink-0 text-[var(--muted)] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-[var(--line)] px-4 pb-4 pt-3">
          <SkillMatrix skills={skills} />
        </div>
      )}
    </section>
  );
}
