"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { KronosLogo } from "@/components/brand/KronosLogo";
import { PricingTable } from "@/components/billing/PricingTable";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PricingPage() {
  const { t } = useLocale();
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      <div className="flex items-center justify-between gap-4">
        <Link href={signedIn ? "/" : "/login"} aria-label="Kronos">
          <KronosLogo variant="header" className="max-h-12 w-auto" />
        </Link>
        <div className="flex gap-2">
          {signedIn ? (
            <Link
              href="/"
              className="inline-flex min-h-10 items-center rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-4 text-sm font-medium"
            >
              {t("nav.pulse")}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-10 items-center rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-4 text-sm font-medium"
              >
                {t("auth.login.cta")}
              </Link>
              <Link
                href="/register"
                className="accent-fill inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold"
              >
                {t("auth.register.cta")}
              </Link>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("pricing.kicker")}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-tight">
          {t("pricing.title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          {t("pricing.subtitle")}
        </p>
      </div>

      <PricingTable signedIn={signedIn} />

      <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>{t("pricing.toolsLead")}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <a
            href="https://arsitech.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4"
          >
            Arsitech.io
          </a>
          <a
            href="https://survivebackpacking.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4"
          >
            Survive Backpacking
          </a>
        </p>
      </section>
    </div>
  );
}
