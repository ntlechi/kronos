"use client";

import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { PRO_PRICE } from "@/lib/billing/plan";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

const FREE_FEATURES = [
  "pricing.feat.pulse",
  "pricing.feat.log",
  "pricing.feat.focus",
  "pricing.feat.burnout",
  "pricing.feat.activities6",
  "pricing.feat.skills8",
  "pricing.feat.history30",
  "pricing.feat.reviewWeek",
] as const;

const PRO_FEATURES = [
  "pricing.feat.unlimited",
  "pricing.feat.year",
  "pricing.feat.seasons",
  "pricing.feat.capital",
  "pricing.feat.rate",
  "pricing.feat.exportSoon",
] as const;

export function PricingTable({ signedIn }: { signedIn: boolean }) {
  const { t, locale } = useLocale();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("pricing.freeName")}
        </p>
        <p className="metric mt-3 text-4xl font-semibold">{t("pricing.freePrice")}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("pricing.freeHint")}</p>
        <ul className="mt-5 space-y-2">
          {FREE_FEATURES.map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm">
              <Check size={16} className="mt-0.5 shrink-0 text-[var(--ok)]" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        <Link
          href={signedIn ? "/" : "/register"}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg)] text-sm font-semibold"
        >
          {signedIn ? t("pricing.ctaStayFree") : t("pricing.ctaFree")}
        </Link>
      </article>

      <article className="rounded-[var(--radius)] border border-[var(--accent)] bg-[var(--bg-elevated)] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("pricing.proName")}
        </p>
        <p className="metric mt-3 text-4xl font-semibold">
          {locale === "fr" ? PRO_PRICE.displayFr : PRO_PRICE.displayEn}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("pricing.proHint")}</p>
        <ul className="mt-5 space-y-2">
          {PRO_FEATURES.map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm">
              <Check size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <span>{t(key)}</span>
            </li>
          ))}
          <li className="flex items-start gap-2 text-sm text-[var(--muted)]">
            <Minus size={16} className="mt-0.5 shrink-0" />
            <span>{t("pricing.feat.stripeSoon")}</span>
          </li>
        </ul>
        <button
          type="button"
          disabled
          className={cn(
            "accent-fill mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full text-sm font-semibold opacity-70",
          )}
        >
          {t("pricing.ctaSoon")}
        </button>
        <p className="mt-3 text-center text-xs text-[var(--muted)]">
          {t("pricing.stripeSoon")}
        </p>
      </article>
    </div>
  );
}
