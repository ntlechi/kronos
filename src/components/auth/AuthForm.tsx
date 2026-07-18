"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LoginForm() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError(t("auth.error.invalid"));
        return;
      }

      router.refresh();
      window.location.assign(callbackUrl);
    } catch {
      setError(t("auth.error.invalid"));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <>
          {t("auth.login.noAccount")}{" "}
          <Link href="/register" className="font-medium text-[var(--accent)]">
            {t("auth.register.cta")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label={t("auth.email")}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label={t("auth.password")}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
        />
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="accent-fill flex min-h-12 w-full items-center justify-center rounded-full font-semibold disabled:opacity-50"
        >
          {pending ? t("auth.working") : t("auth.login.submit")}
        </button>
      </form>
    </AuthCard>
  );
}

export function RegisterForm() {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: normalizedEmail,
          password,
          marketingOptIn,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(
          data.error === "Email already registered"
            ? t("auth.error.exists")
            : t("auth.error.register"),
        );
        return;
      }

      const signed = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (!signed || signed.error) {
        setError(t("auth.error.signInAfterRegister"));
        return;
      }

      window.location.assign("/");
    } catch {
      setError(t("auth.error.register"));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
      footer={
        <>
          {t("auth.register.hasAccount")}{" "}
          <Link href="/login" className="font-medium text-[var(--accent)]">
            {t("auth.login.cta")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label={t("auth.name")}
          type="text"
          value={name}
          onChange={setName}
          autoComplete="name"
          required
        />
        <Field
          label={t("auth.email")}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label={t("auth.password")}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <label className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="font-medium text-[var(--ink)]">
              {t("auth.marketing.title")}
            </span>
            <span className="mt-1 block text-[var(--muted)]">
              {t("auth.marketing.help")}
            </span>
          </span>
        </label>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="accent-fill flex min-h-12 w-full items-center justify-center rounded-full font-semibold disabled:opacity-50"
        >
          {pending ? t("auth.working") : t("auth.register.submit")}
        </button>
      </form>
    </AuthCard>
  );
}

function AuthCard({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center py-8">
      <div className="mb-8 text-center">
        <p className="font-[family-name:var(--font-syne)] text-4xl font-semibold">
          Kronos
        </p>
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      </div>
      <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] p-5">
        {children}
      </div>
      <p className="mt-5 text-center text-sm text-[var(--muted)]">{footer}</p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 outline-none focus:border-[var(--accent)]"
      />
    </label>
  );
}
