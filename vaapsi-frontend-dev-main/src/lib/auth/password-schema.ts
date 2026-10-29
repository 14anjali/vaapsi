import { z } from 'zod'
import { passwordCopy } from '@/content/auth-password'

/**
 * Forgot/reset validation, shared by the forms and the route handlers.
 *
 * Same arrangement as `./schema.ts`: the form parses these for immediate
 * feedback, the route handler parses the same objects at the boundary, and the
 * API validates a third time and stays the authority.
 *
 * The password rules match signup, because a reset is a password being set.
 */

const { validation } = passwordCopy

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, validation.emailRequired)
  .email(validation.emailInvalid)

const newPassword = z
  .string()
  .min(1, validation.passwordRequired)
  .min(8, validation.passwordTooShort)
  .max(128, validation.passwordTooLong)
  .regex(/[a-z]/, validation.passwordNeedsLower)
  .regex(/[A-Z]/, validation.passwordNeedsUpper)
  .regex(/[0-9]/, validation.passwordNeedsNumber)

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({
    email,
    /**
     * Spaces stripped before the format check — a code read off a phone gets
     * typed as "426 873" often enough, and rejecting that as malformed would
     * spend one of five attempts on a formatting quibble.
     */
    code: z
      .string()
      .trim()
      .transform((value) => value.replace(/\s/g, ''))
      .pipe(
        z
          .string()
          .min(1, validation.codeRequired)
          .regex(/^\d{6}$/, validation.codeFormat),
      ),
    password: newPassword,
    confirmPassword: z.string().min(1, validation.confirmRequired),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: validation.confirmMismatch,
    path: ['confirmPassword'],
  })

/** Form shapes — every field a string the input can bind to. */
export type ForgotPasswordFormValues = { email: string }

export type ResetPasswordFormValues = {
  email: string
  code: string
  password: string
  confirmPassword: string
}
