"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthMutations } from "@/hooks/use-deploywatch";
import type { AuthMode } from "@/types";

export function AuthPanel({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { login, signup } = useAuthMutations();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "login") {
      login.mutate(
        { email, password },
        {
          onSuccess: () => router.replace("/projects"),
        },
      );
      return;
    }

    signup.mutate(
      { name, email, password },
      {
        onSuccess: () => router.replace("/projects"),
      },
    );
  };

  return (
    <div className="surface-glow w-full max-w-[540px] rounded-[34px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,252,0.93)_100%)] p-8 md:p-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">DeployWatch Access</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.35rem]">
        {mode === "login" ? "Sign in to your workspace" : "Create your DeployWatch account"}
      </h1>
      <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
        {mode === "login"
          ? "Access project health, latency trends, and incident timelines from one operator-focused workspace."
          : "Set up your account and start with seeded operational data that mirrors a real API monitoring environment."}
      </p>

      <div className="mt-7 rounded-[24px] border border-[var(--border)] bg-white/75 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Uptime", "99.96%"],
            ["Latency", "184 ms"],
            ["Incidents", "2 open"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        {mode === "signup" ? (
          <Field label="Full name">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" required />
          </Field>
        ) : null}
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === "login" ? "Enter your password" : "Choose a password"}
            minLength={8}
            required
          />
        </Field>

        {(mode === "login" ? login.error : signup.error) instanceof Error ? (
          <ErrorState message={(mode === "login" ? login.error : signup.error)!.message} />
        ) : null}

        <Button type="submit" className="w-full" disabled={mode === "login" ? login.isPending : signup.isPending}>
          {(mode === "login" ? login.isPending : signup.isPending) ? "Processing..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--text-muted)]">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link href={mode === "login" ? "/signup" : "/login"} className="font-medium text-slate-950 underline decoration-[var(--border-strong)] underline-offset-4">
          {mode === "login" ? "Create one" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
