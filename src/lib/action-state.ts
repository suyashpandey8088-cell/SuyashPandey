/** Shared result shape for every admin server action. */
export interface ActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export const IDLE_STATE: ActionState = { ok: false };

/** The signature every admin server action shares with useActionState. */
export type AdminAction = (
  state: ActionState | null,
  formData: FormData,
) => Promise<ActionState | null>;
