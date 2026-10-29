import type { UseFormRegisterReturn } from 'react-hook-form'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { cn } from '@/lib/utils'

/**
 * A labelled text input with its error and hint wired up.
 *
 * Exists because the sign-up form has six of these and getting the
 * accessibility right once is better than getting it nearly right six times.
 * What it guarantees at every call site:
 *
 * - the label is a real `<label htmlFor>`, not a styled div next to an input
 * - `aria-invalid` flips with the error
 * - `aria-describedby` points at the hint *and* the error when both exist, so a
 *   screen reader hears the rule as well as the complaint
 *
 * The visual treatment is lifted from `PincodeCheck` rather than invented:
 * hairline border, transparent fill, border darkens on focus and turns accent
 * on error. One input style across the site.
 */

export type AuthFieldProps = {
  id: string
  label: string
  type?: 'text' | 'email' | 'password' | 'tel'
  placeholder?: string
  autoComplete?: string
  /** Shown beside the label. For "Optional". */
  labelNote?: string
  /** Persistent help text — the password rule, for instance. */
  hint?: string
  error?: string
  /** Set on the first field of a form only. */
  autoFocus?: boolean
  disabled?: boolean
  /**
   * The spread from react-hook-form's `register`.
   *
   * Typed with the library's own return type rather than a hand-written shape:
   * `register` returns handlers with a narrower event parameter than a generic
   * one, and re-declaring it here just produced a variance error at every call
   * site. `string` as the field-name parameter is what lets one component serve
   * two forms with different field unions.
   */
  registration: UseFormRegisterReturn<string>
}

export function AuthField({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  labelNote,
  hint,
  error,
  autoFocus,
  disabled,
  registration,
}: AuthFieldProps) {
  const hintId = hint === undefined ? undefined : `${id}-hint`
  const errorId = error === undefined ? undefined : `${id}-error`
  const describedBy = [hintId, errorId].filter((value) => value !== undefined).join(' ')

  return (
    <Stack gap={2}>
      <Row gap={2} justify="between" align="baseline" wrap={false}>
        <label htmlFor={id}>
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {label}
          </Type>
        </label>
        {labelNote !== undefined && (
          <Type as="span" size="xs" tone="subtle">
            {labelNote}
          </Type>
        )}
      </Row>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-invalid={error !== undefined}
        aria-describedby={describedBy === '' ? undefined : describedBy}
        {...registration}
        className={cn(
          'w-full border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-ink disabled:opacity-50',
          error !== undefined ? 'border-accent' : 'border-line',
        )}
      />

      {hint !== undefined && (
        <Type as="p" size="xs" tone="subtle" id={hintId}>
          {hint}
        </Type>
      )}

      {/*
        Not aria-live. The error is announced by the field's own
        aria-describedby when focus lands on it after a failed submit, and a
        live region on top of that reads every message twice.
      */}
      {error !== undefined && (
        <Type as="p" size="xs" tone="accent" id={errorId}>
          {error}
        </Type>
      )}
    </Stack>
  )
}
