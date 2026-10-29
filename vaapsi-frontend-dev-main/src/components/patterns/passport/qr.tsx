import QRCode from 'qrcode'
import { Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'

/**
 * The QR code.
 *
 * Rendered to SVG **on the server**, at build or request time, so there is no
 * client JavaScript, no canvas, and no layout shift while a code draws itself.
 *
 * Sized for two jobs at once: readable on a phone screen from about 20cm, and
 * still scannable when printed at 2cm square on a care label. That second
 * constraint is why the margin is 2 modules rather than the default 4 (wasted
 * space at small print sizes) and why error correction is level M rather than L —
 * a code printed on fabric that has been through a wash needs the redundancy.
 *
 * `currentColor` is not an option here: a QR needs genuine black-on-white
 * contrast to scan reliably, so it stays literal even under the inverse theme,
 * sitting on its own white plate. That is the one place on the site where a
 * colour does not come from a token, and it is a scanning requirement rather
 * than a design decision.
 */
export async function PassportQr({
  value,
  caption,
  size = 128,
}: {
  /** What the code encodes. The resolvable passport URL. */
  value: string
  caption?: string
  size?: number
}) {
  const svg = await QRCode.toString(value, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: size,
    color: { dark: '#000000', light: '#ffffff' },
  })

  return (
    <Stack gap={3} className="print:break-inside-avoid">
      <div
        // The white plate. Keeps the code scannable under the inverse preset.
        className="inline-block bg-white p-2"
        style={{ width: size + 16 }}
        // Server-generated from a URL we constructed; no user input reaches it.
        dangerouslySetInnerHTML={{ __html: svg }}
        role="img"
        aria-label={caption ?? 'QR code linking to this passport'}
      />
      {caption !== undefined && (
        <Type size="xs" tone="subtle" measure="narrow">
          {caption}
        </Type>
      )}
    </Stack>
  )
}
