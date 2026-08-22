"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function UpgradeCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const { t } = useLocale();

  return (
    <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {t("plan.pro")}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-syne)] text-xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
      <Link
        href="/pricing"
        className="accent-fill mt-4 inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold"
      >
        {t("plan.upgrade")}
      </Link>
    </section>
  );
}
