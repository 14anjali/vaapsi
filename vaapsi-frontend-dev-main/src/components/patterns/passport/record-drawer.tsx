'use client'

import { useState } from 'react'
import { DrawerShell, DrawerTrigger } from '../product/product-drawer'
import { Overlay } from '@/components/primitives/overlay'
import { passportCopy } from '@/content/passport'

/**
 * The passport's record, in a drawer.
 *
 * ## Why this replaced the two-sided flip
 *
 * The passport was built as a document that turns over — story on the front,
 * record on the back, a radio control switching between them. That was the right
 * instinct against a tab bar, but it treated the two halves as **equals**, and
 * they are not.
 *
 * The story is narrative: where the garment has been, what it saved. A shopper
 * reads it. The record is clerical: signatures, identifiers, a frozen
 * declaration, a QR. A shopper *checks* it, occasionally, and mostly does not.
 * Giving them equal billing meant half the passport was always the wrong half,
 * and the control asked every reader to make a choice they had no basis for.
 *
 * Story on the page, record behind a click, is a truer description of how the
 * two are used — and it is the same distinction the Product details drawer
 * already makes between deciding and consulting. One pattern, applied
 * consistently.
 *
 * **The standalone `/passport/[id]` route renders both inline**, with no drawer.
 * That route is what a QR printed on a garment resolves to, so it has to print
 * complete — and a printed record with half of it behind a button would be a
 * broken artefact. It also means print no longer needs the `print:block`
 * overrides the flip required.
 */
export function PassportRecordDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <DrawerTrigger onClick={() => setOpen(true)}>{passportCopy.sections.back}</DrawerTrigger>

      <Overlay
        open={open}
        onClose={() => setOpen(false)}
        label={passportCopy.sections.back}
        side="right"
        className="desktop:max-w-[52rem]"
      >
        <DrawerShell heading={passportCopy.sections.back} onClose={() => setOpen(false)}>
          {children}
        </DrawerShell>
      </Overlay>
    </>
  )
}
