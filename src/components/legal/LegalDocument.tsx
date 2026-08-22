"use client";

import Link from "next/link";
import { KronosLogo } from "@/components/brand/KronosLogo";
import type { LegalDoc } from "@/lib/legal/documents";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LegalDocument({
  doc,
  otherHref,
  otherLabel,
}: {
  doc: LegalDoc;
  otherHref: string;
  otherLabel: string;
}) {
  const { t } = useLocale();

  return (
    <article className="mx-auto max-w-2xl space-y-8 pb-12">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" aria-label="Kronos">
          <KronosLogo variant="header" className="max-h-12 w-auto" />
        </Link>
        <Link
          href={otherHref}
          className="text-sm font-medium underline decoration-[var(--line)] underline-offset-4"
        >
          {otherLabel}
        </Link>
      </div>

      <header>
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-tight">
          {doc.title}
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          {t("legal.updated", { date: doc.updated })}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          {doc.intro}
        </p>
      </header>

      {doc.sections.map((section) => (
        <section key={section.heading} className="space-y-2">
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
            {section.heading}
          </h2>
          {section.body.map((para) => (
            <p key={para} className="text-sm leading-relaxed text-[var(--ink)]">
              {para}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
