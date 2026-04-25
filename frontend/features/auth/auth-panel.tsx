"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Activity, Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthMutations } from "@/hooks/use-deploywatch";
import type { AuthMode } from "@/types";

const features = [
  { label: "Uptime SLA", value: "99.97%" },
  { label: "Avg latency", value: "142 ms" },
  { label: "Open incidents", value: "0" },
];

export function AuthPanel({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { login, signup } = useAuthMutations();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "login") {
      login.mutate({ email, password }, { onSuccess: () => router.replace("/projects") });
      return;
    }
    signup.mutate({ name, email, password }, { onSuccess: () => router.replace("/projects") });
  };

  const isPending = mode === "login" ? login.isPending : signup.isPending;
  const error = (mode === "login" ? login.error : signup.error) as Error | null;

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left panel ── */}
      <div className="hidden w-[420px] shrink-0 flex-col bg-[var(--sidebar)] p-10 lg:flex">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <circle cx="10" cy="10" r="3" fill="white" />
              <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
              <circle cx="10" cy="10" r="9.5" stroke="white" strokeWidth="1" strokeOpacity="0.15" />
            </svg>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">DeployWatch</p>
        </div>

        {/* Hero copy */}
        <div className="mt-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">Operational visibility</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white">
            Know when your external dependencies fail. Before your users do.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            High-frequency polling, smart incident detection, and automated alert dispatch — engineered for teams that can't afford blind spots.
          </p>

          {/* Live stats */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {features.map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-1.5 text-lg font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Live badge */}
          <div className="mt-6 flex items-center gap-2.5">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-500">Monitoring engine running · all workers healthy</p>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px]">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <circle cx="10" cy="10" r="3" fill="#0f172a" />
              <circle cx="10" cy="10" r="7" stroke="#0f172a" strokeWidth="1.5" strokeOpacity="0.3" />
            </svg>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">DeployWatch</p>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {mode === "login"
              ? "Sign in to your workspace to access project health and incidents."
              : "Set up your DeployWatch account and start monitoring in minutes."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <Field label="Full name">
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="pl-10"
                    required
                  />
                </div>
              </Field>
            )}

            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="pl-10"
                  required
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "Your password" : "Min. 8 characters"}
                  className="pl-10"
                  minLength={8}
                  required
                />
              </div>
            </Field>

            {error && <ErrorState message={error.message} />}

            <Button type="submit" className="mt-2 w-full" disabled={isPending}>
              {isPending
                ? "Processing..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              className="font-medium text-slate-900 underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-slate-600"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
