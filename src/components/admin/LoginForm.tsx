"use client";

import { useActionState } from "react";

import { signInAction } from "@/app/admin/actions";
import SubmitButton from "@/components/admin/SubmitButton";
import { Banner } from "@/components/admin/ui";

export default function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction] = useActionState(signInAction, null);

  return (
    <form action={formAction} className="grid gap-5">
      {notice ? <Banner tone="info">{notice}</Banner> : null}
      {state?.message && !state.ok ? (
        <Banner tone="error">{state.message}</Banner>
      ) : null}

      <div>
        <label className="field-label" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="you@example.com"
          className="field-input"
        />
        {state?.errors?.email ? <p className="field-error">{state.errors.email}</p> : null}
      </div>

      <div>
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••••••"
          className="field-input"
        />
        {state?.errors?.password ? (
          <p className="field-error">{state.errors.password}</p>
        ) : null}
      </div>

      <SubmitButton pendingLabel="Signing in…" className="w-full justify-center">
        Sign in to the campaign
      </SubmitButton>

      <p className="text-xs leading-relaxed text-admin-muted">
        Only the authorised campaign owner can sign in. Access is checked against an
        allow-list in the database, and all content is protected by row level security
        policies.
      </p>
    </form>
  );
}
