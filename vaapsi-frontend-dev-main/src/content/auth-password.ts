/**
 * ============================================================================
 * FORGOT AND RESET PASSWORD — COPY
 * ============================================================================
 *
 * A separate file from `auth.ts` so it can be dropped in without merging. If
 * you would rather have one auth copy module, move `passwordCopy` into
 * `auth.ts` and update the two imports — nothing else refers to it.
 *
 * Two rules the strings here follow, both of them security rather than tone:
 *
 * 1. **"We have sent a code" never confirms the address exists.** The wording
 *    is "if there is an account with that email", because a page that says
 *    "sent" for real addresses and "not found" for the rest is a way to test an
 *    email list against the customer table.
 * 2. **One message for every bad code.** Wrong, expired, already used and never
 *    issued all read the same, for the same reason.
 */

export const passwordCopy = {
    forgot: {
      eyebrow: 'Your account',
      title: 'Forgot your password',
      lede: 'Give us the email on your account and we will send a six-digit code to reset it.',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      submit: 'Send the code',
      submitting: 'Sending…',
      /** Deliberately non-committal about whether the address is registered. */
      sent: 'If there is an account with that email, a six-digit code is on its way. It expires in 10 minutes.',
      sentAction: 'Enter the code',
      backToLogin: 'Back to sign in',
      rateLimited: 'Too many requests. Wait a few minutes and try again.',
      sendFailed: 'We could not send that email just now. Try again in a moment.',
    },
  
    reset: {
      eyebrow: 'Your account',
      title: 'Set a new password',
      lede: 'Enter the code we emailed you, then choose a new password.',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      codeLabel: 'Six-digit code',
      codePlaceholder: '000000',
      codeHint: 'From the email we just sent. It expires 10 minutes after it was sent.',
      passwordLabel: 'New password',
      passwordPlaceholder: 'At least 8 characters',
      passwordHint: 'At least 8 characters, with an uppercase letter, a lowercase letter and a number.',
      confirmLabel: 'Confirm new password',
      confirmPlaceholder: 'Type it again',
      submit: 'Change my password',
      submitting: 'Changing your password…',
      /** Says the session consequence, because it is surprising if unannounced. */
      success: 'Password changed. You have been signed out everywhere else — sign in with your new password.',
      successAction: 'Sign in',
      noCode: 'Did not get a code?',
      resendAction: 'Send another',
      /** The one message for every way a code can be unusable. */
      invalidCode: 'That code is not valid. Ask for a new one.',
      rateLimited: 'Too many attempts. Wait a few minutes and try again.',
    },
  
    /** On the sign-in form. */
    loginLink: 'Forgot your password?',
  
    validation: {
      emailRequired: 'Enter your email',
      emailInvalid: 'That does not look like an email address',
      codeRequired: 'Enter the code from your email',
      codeFormat: 'The code is six digits',
      passwordRequired: 'Choose a new password',
      passwordTooShort: 'At least 8 characters',
      passwordTooLong: 'That password is too long',
      passwordNeedsLower: 'Include a lowercase letter',
      passwordNeedsUpper: 'Include an uppercase letter',
      passwordNeedsNumber: 'Include a number',
      confirmRequired: 'Type your new password again',
      confirmMismatch: 'Those two passwords do not match',
    },
  
    unexpected: 'Something went wrong at our end. Try again in a moment.',
    offline: 'We could not reach the server. Check your connection and try again.',
  } as const
  