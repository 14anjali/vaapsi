/**
 * ============================================================================
 * SIGN IN AND SIGN UP — COPY
 * ============================================================================
 *
 * Email and password only. There is deliberately no "continue with Google",
 * no phone OTP and no magic link in this copy, because offering a method the
 * backend does not implement is a dead end a shopper discovers after they have
 * already decided to trust it.
 *
 * Two rules the error strings follow:
 *
 * 1. **A failed sign-in never says which half was wrong.** "No account with
 *    that email" is an account-existence oracle: it lets anyone test an email
 *    list against our user table. One message for both cases.
 * 2. **Sign-up does say when an email is taken**, because it has to — the
 *    shopper cannot proceed otherwise, and the sign-in page offers the same
 *    information to anyone who tries. The mitigation there is rate limiting,
 *    not vagueness.
 */

export const authCopy = {
    login: {
      eyebrow: 'Your account',
      title: 'Sign in',
      lede: 'Your purchases, your saved pieces, and anything you have sent back to be sold.',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Your password',
      submit: 'Sign in',
      submitting: 'Signing in…',
      noAccount: 'No account yet?',
      createAction: 'Create one',
      /** One message for a wrong email and a wrong password. See the note above. */
      invalid: 'That email and password do not match an account.',
      suspended: 'This account is not active. Get in touch and we will sort it out.',
      rateLimited: 'Too many attempts. Wait a few minutes and try again.',
      /** Shown when a protected page sent them here. */
      redirectedNote: 'Sign in to see that page.',
    },
  
    signup: {
      eyebrow: 'Your account',
      title: 'Create an account',
      lede: 'You need one to buy, and to sell a piece back to us later.',
      nameLabel: 'Full name',
      namePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      phoneLabel: 'Phone',
      phoneOptional: 'Optional',
      phonePlaceholder: '+91 98765 43210',
      phoneNote: 'Only used for delivery updates and a resale label.',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 8 characters',
      passwordHint: 'At least 8 characters, with an uppercase letter, a lowercase letter and a number.',
      confirmLabel: 'Confirm password',
      confirmPlaceholder: 'Type it again',
      marketingLabel: 'Email me occasionally about new pieces',
      submit: 'Create account',
      submitting: 'Creating your account…',
      haveAccount: 'Already have an account?',
      loginAction: 'Sign in',
      /** Said plainly, with the way out. */
      emailTaken: 'There is already an account with that email.',
      emailTakenAction: 'Sign in instead',
      phoneTaken: 'There is already an account with that phone number.',
      rateLimited: 'Too many attempts. Wait a few minutes and try again.',
      success: 'Account created. Taking you to your account…',
    },
  
    /** Field-level validation. Shared by the form and the route handler. */
    validation: {
      nameRequired: 'Tell us your name',
      nameTooLong: 'That name is too long',
      emailRequired: 'Enter your email',
      emailInvalid: 'That does not look like an email address',
      phoneInvalid: 'Enter a phone number like +91 98765 43210',
      passwordRequired: 'Choose a password',
      passwordTooShort: 'At least 8 characters',
      passwordTooLong: 'That password is too long',
      passwordNeedsLower: 'Include a lowercase letter',
      passwordNeedsUpper: 'Include an uppercase letter',
      passwordNeedsNumber: 'Include a number',
      confirmRequired: 'Type your password again',
      confirmMismatch: 'Those two passwords do not match',
    },
  
    /** The header menu and the account hub, once sign-in is real. */
    session: {
      signedInAs: 'Signed in as',
      /** On the account hub, so the signed-in state is visible on the page itself. */
      hubGreeting: (name: string) => `Signed in as ${name}`,
      signIn: 'Sign in',
      signUp: 'Create an account',
      signOut: 'Sign out',
      signingOut: 'Signing out…',
      guestNote: 'Sign in to see your purchases',
    },
  
    /** When something goes wrong that is nobody's fault in particular. */
    unexpected: 'Something went wrong at our end. Try again in a moment.',
    offline: 'We could not reach the server. Check your connection and try again.',
  } as const
  