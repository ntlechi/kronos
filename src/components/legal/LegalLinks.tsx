"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

export function LegalLinks({ className }: { className?: string }) {
  const { t } = useLocale();

  return (
    <p className={cn("text-center text-xs text-[var(--muted)]", className)}>
      <Link href="/privacy" className="underline underline-offset-4">
        {t("legal.privacy")}
      </Link>
      <span aria-hidden className="px-2">
        ·
      </span>
      <Link href="/terms" className="underline underline-offset-4">
        {t("legal.terms")}
      </Link>
    </p>
  );
}
