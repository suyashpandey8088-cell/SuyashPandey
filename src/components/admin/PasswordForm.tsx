"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/app/admin/actions";
import SubmitButton from "@/components/admin/SubmitButton";
import { Banner } from "@/components/admin/ui";

/**
 * Password rotation. Available to any administrator after signing in, which is
 * how the temporary credential handed over at launch gets replaced.
 */
export default function PasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, null);

  return (
    <form action={formAction} className="grid gap-5">
      {state?.message ? (
        <Banner tone={state.ok ? "success" : "error"}>{state.message}</Banner>
      ) : null}

      <div>
        <label className="field-label" htmlFor="new-password">
          New password
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          placeholder="At least 10 characters"
          className="field-input"
        />
        {state?.errors?.password ? (
          <p className="field-error">{state.errors.password}</p>
        ) : null}
      </div>

      <div>
        <label className="field-label" htmlFor="confirm-password">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          name="confirm"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          placeholder="Repeat the password"
          className="field-input"
        />
        {state?.errors?.confirm ? (
          <p className="field-error">{state.errors.confirm}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
        <p className="text-xs leading-relaxed text-admin-muted">
          You stay signed in on this device. Other sessions keep their own tokens
          until they expire.
        </p>
      </div>
    </form>
  );
}
