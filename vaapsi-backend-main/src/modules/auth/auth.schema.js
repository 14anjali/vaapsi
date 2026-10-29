const { z } = require('zod');

const PASSWORD = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number');

/** E.164-ish phone number. */
const PHONE = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number');

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: PASSWORD,
  fullName: z.string().trim().min(1).max(120).optional(),
  phone: PHONE.optional(),
  marketingOptIn: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const requestOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number'),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/),
  code: z.string().length(6),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required').max(120).optional(),
  email: z.string().trim().toLowerCase().email('Invalid email address').optional(),
  phone: PHONE.nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one profile field must be provided' },
);

module.exports = {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  refreshSchema,
  updateProfileSchema,
};