'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { delivery } from '@/content/delivery'
import { cn } from '@/lib/utils'

/**
 * PIN-code serviceability check.
 *
 * **Stubbed.** There is no logistics partner yet (PRD open question #8), so this
 * cannot give a real answer and does not pretend to. What it does give is the
 * real shape of the interaction — validation, states, and the copy — so that
 * wiring it to a courier API later is a change to one function.
 *
 * The validation is real, and it is the part worth getting right now: an Indian
 * PIN code is exactly six digits and never starts with zero. Catching a typo
 * locally is better than a round trip that comes back "not serviceable" when the
 * shopper simply mistyped.
 *
 * The estimate is explicitly labelled as an estimate and the copy says the
 * courier is not confirmed. A fabricated "Delivery by Tuesday" is a promise the
 * business has not made and cannot keep.
 */

const PIN_CODE = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, delivery.pin.invalid)

type FormValues = { pincode: string }

type CheckResult = { status: 'serviceable'; days: [number, number] } | { status: 'unserviceable' }

/**
 * Stub. Deterministic from the PIN so the same code always gives the same
 * answer during review — a random result makes the UI impossible to demo.
 *
 * REPLACE THIS with the courier's serviceability call. It is the only thing in
 * this file that is not real.
 */
async function checkServiceability(pincode: string): Promise<CheckResult> {
  const region = Number.parseInt(pincode.slice(0, 1), 10)
  // Metro-ish first digits get the faster window; a couple of ranges are
  // treated as unserviceable so the negative state is exercised in review.
  if (region === 9) return { status: 'unserviceable' }
  return { status: 'serviceable', days: region <= 4 ? [2, 4] : [4, 7] }
}

export function PincodeCheck() {
  const [result, setResult] = useState<CheckResult | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ defaultValues: { pincode: '' } })

  const onSubmit = handleSubmit(async ({ pincode }) => {
    const parsed = PIN_CODE.safeParse(pincode)
    if (!parsed.success) {
      setError('pincode', { message: parsed.error.issues[0]?.message ?? delivery.pin.invalid })
      setResult(null)
      return
    }
    setResult(await checkServiceability(parsed.data))
  })

  return (
    <Stack gap={3}>
      <form onSubmit={onSubmit} noValidate>
        <Stack gap={2}>
          <label htmlFor="pincode">
            <Type as="span" size="xs" tone="subtle" tracking="caps">
              {delivery.pin.label}
            </Type>
          </label>
          <Row gap={2} wrap={false}>
            <input
              id="pincode"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              placeholder={delivery.pin.placeholder}
              aria-invalid={errors.pincode !== undefined}
              aria-describedby={errors.pincode !== undefined ? 'pincode-error' : undefined}
              {...register('pincode')}
              className={cn(
                'min-w-0 flex-1 border bg-transparent px-3 py-2 text-sm tabular-nums outline-none focus:border-ink',
                errors.pincode !== undefined ? 'border-accent' : 'border-line',
              )}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="ease shrink-0 border border-line-strong px-4 py-2 text-sm transition-colors duration-fast hover:border-ink disabled:opacity-50"
            >
              {delivery.pin.action}
            </button>
          </Row>

          {errors.pincode !== undefined && (
            <Type as="p" size="xs" tone="accent" id="pincode-error">
              {errors.pincode.message}
            </Type>
          )}
        </Stack>
      </form>

      {result !== null && (
        <div aria-live="polite">
          {result.status === 'serviceable' ? (
            <Stack gap={1}>
              <Type size="sm">{delivery.pin.serviceable(result.days[0], result.days[1])}</Type>
              <Type size="xs" tone="subtle">
                {delivery.pin.estimateCaveat}
              </Type>
            </Stack>
          ) : (
            <Stack gap={1}>
              <Type size="sm">{delivery.pin.unserviceable}</Type>
              <Type size="xs" tone="subtle">
                {delivery.pin.unserviceableHelp}
              </Type>
            </Stack>
          )}
        </div>
      )}
    </Stack>
  )
}
