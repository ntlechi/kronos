"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ChartPie,
  Flame,
  Layers3,
  LogOut,
  Moon,
  Plus,
  Sparkles,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { KronosLogo } from "@/components/brand/KronosLogo";
import { usePlan } from "@/lib/billing/PlanProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/dictionaries";
import { useTheme } from "@/lib/theme/ThemeProvider";

const sideNav = [
  { href: "/", labelKey: "nav.pulse", icon: ChartPie },
  { href: "/pomodoro", labelKey: "nav.focus", icon: Flame },
  { href: "/activities", labelKey: "nav.activities", icon: Layers3 },
  { href: "/skills", labelKey: "nav.skills", icon: Sparkles },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const { snapshot } = usePlan();
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/pricing");
  const logActive = pathname.startsWith("/log");

  if (isAuthRoute) {
    return (
      <div className="relative z-10 mx-auto min-h-dvh w-full max-w-5xl px-4 pt-5 sm:px-6">
        <div className="mb-2 flex justify-end gap-2">
          <ThemeLocaleControls
            locale={locale}
            setLocale={setLocale}
            theme={theme}
            toggleTheme={toggleTheme}
            t={t}
          />
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-[calc(6.25rem+var(--safe-bottom))] pt-5 sm:px-6">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <KronosLogo variant="header" className="max-h-14 w-auto sm:max-h-16" />
          <p className="mt-2 text-sm text-[var(--muted)]">{t("brand.tagline")}</p>
          {session?.user?.email && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {session.user.email}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/pricing"
            className="inline-flex min-h-9 items-center rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-3 text-xs font-semibold"
          >
            {snapshot.isPro ? t("plan.badge.pro") : t("plan.badge.free")}
          </Link>
          <ThemeLocaleControls
            locale={locale}
            setLocale={setLocale}
            theme={theme}
            toggleTheme={toggleTheme}
            t={t}
          />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-3 text-xs font-medium text-[var(--ink)]"
            aria-label={t("auth.signOut")}
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">{t("auth.signOut")}</span>
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <p className="mt-8 pb-2 text-center text-[11px] tracking-wide text-[var(--muted)]">
        {t("brand.powered")}{" "}
        <a
          href="https://arsitech.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--ink)]"
        >
          Arsitech.io
        </a>
      </p>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] backdrop-blur-xl"
        style={{
          paddingBottom: "var(--safe-bottom)",
          background: "var(--nav-bg)",
        }}
      >
        <ul className="mx-auto grid max-w-5xl grid-cols-5 items-end gap-0.5 px-1 py-2 sm:px-2">
          {sideNav.slice(0, 2).map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} t={t} />
          ))}

          <li className="relative flex justify-center">
            <Link
              href="/log"
              prefetch={false}
              aria-label={t("nav.log")}
              className={cn(
                "absolute -top-5 flex h-14 w-14 flex-col items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 accent-fill ring-4 ring-[var(--bg)]",
                logActive && "scale-105",
              )}
            >
              <Plus size={22} strokeWidth={2.4} />
            </Link>
            <span className="mt-10 text-[10px] text-[var(--muted)] sm:text-[11px]">
              {t("nav.log")}
            </span>
          </li>

          {sideNav.slice(2).map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} t={t} />
          ))}
        </ul>
      </nav>
    </div>
  );
}

function NavItem({
  item,
  pathname,
  t,
}: {
  item: (typeof sideNav)[number];
  pathname: string;
  t: (key: string) => string;
}) {
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href) ||
        (item.href === "/activities" && pathname.startsWith("/projects"));
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        prefetch={false}
        className={cn(
          "flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] transition-colors sm:text-[11px]",
          active
            ? "bg-[var(--bg-soft)] font-medium text-[var(--ink)]"
            : "text-[var(--muted)] hover:text-[var(--ink)]",
        )}
      >
        <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
        <span>{t(item.labelKey)}</span>
      </Link>
    </li>
  );
}

function ThemeLocaleControls({
  locale,
  setLocale,
  theme,
  toggleTheme,
  t,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  t: (key: string) => string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={toggleTheme}
        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] text-[var(--ink)]"
        aria-label={t("theme.toggle")}
        title={t("theme.toggle")}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div
        className="inline-flex rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] p-0.5"
        role="group"
        aria-label={t("locale.switch")}
      >
        {(["en", "fr"] as Locale[]).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={cn(
              "min-h-9 min-w-10 rounded-full px-2 text-xs font-semibold tracking-wide transition-colors",
              locale === code
                ? "bg-[var(--bg-soft)] text-[var(--ink)]"
                : "text-[var(--muted)]",
            )}
          >
            {t(`locale.${code}`)}
          </button>
        ))}
      </div>
    </>
  );
}
