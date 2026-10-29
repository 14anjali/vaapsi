import { z } from 'zod'
import { authCopy } from '@/content/auth'

/**
 * Credential validation, shared by the browser form and the route handler.
 *
 * **One definition, validated twice.** The form imports these for immediate
 * feedback; the route handler imports the same objects and parses again before
 * anything reaches the API. That second parse is the one that matters — a form
 * can be bypassed with curl — and sharing the schema is what stops the two
 * copies drifting into disagreeing about what a valid password is.
 *
 * These mirror the rules the backend enforces in
 * `src/modules/auth/auth.schema.js`. The backend remains the final authority:
 * if these ever disagree, the backend wins and its message is surfaced.
 */

const { validation } = authCopy

/** Lower-cased and trimmed, so one person cannot become two accounts. */
const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, validation.emailRequired)
  .email(validation.emailInvalid)

const password = z
  .string()
  .min(1, validation.passwordRequired)
  .min(8, validation.passwordTooShort)
  .max(128, validation.passwordTooLong)
  .regex(/[a-z]/, validation.passwordNeedsLower)
  .regex(/[A-Z]/, validation.passwordNeedsUpper)
  .regex(/[0-9]/, validation.passwordNeedsNumber)

/**
 * Optional, and normalised before it is validated: a shopper typing
 * "+91 98765 43210" with the spaces they read it in should not be told it is
 * malformed. Spaces, hyphens and brackets are stripped, then the remainder has
 * to look like E.164.
 */
const phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ''))
  .refine((value) => value === '' || /^\+?[1-9]\d{6,14}$/.test(value), validation.phoneInvalid)
  .transform((value) => (value === '' ? undefined : value))

export const loginSchema = z.object({
  email,
  // Deliberately not the strength-checked `password`. Strength rules belong
  // where a password is set; applying them at sign-in would reject a valid
  // existing password and advertise which passwords cannot exist.
  password: z.string().min(1, validation.passwordRequired),
})

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(1, validation.nameRequired).max(120, validation.nameTooLong),
    email,
    phone: phone.optional(),
    password,
    confirmPassword: z.string().min(1, validation.confirmRequired),
    marketingOptIn: z.boolean().optional(),
  })
  // Attached to `confirmPassword` so the message lands on the field the shopper
  // has to change, not at the top of the form.
  .refine((values) => values.password === values.confirmPassword, {
    message: validation.confirmMismatch,
    path: ['confirmPassword'],
  })

/** What the form holds. Pre-transform, so every field is a string the input can bind to. */
export type LoginFormValues = {
  email: string
  password: string
}

export type SignupFormValues = {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  marketingOptIn: boolean
}

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
