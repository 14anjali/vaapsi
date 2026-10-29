import { NextResponse } from 'next/server'
import { createResaleRequest } from '@/lib/data'
import type { ResaleAssessment } from '@/lib/types'

/**
 * Submit a listing request.
 *
 * The assessment is sent back up rather than recomputed, so the seller is held
 * to the quote they actually saw — recomputing here could hand them a different
 * number than the one they agreed to, which is the kind of surprise that makes
 * a marketplace feel dishonest.
 *
 * The adapter still refuses a request whose verification is `no_match`, so a
 * hand-crafted payload cannot list an unidentified garment. That check belongs
 * there rather than here, because it is a rule about the catalogue and not about
 * this transport.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body === null || typeof body !== 'object') {
    return NextResponse.json({ error: 'Expected an object' }, { status: 400 })
  }

  const { orderLineId, askingInr, assessment } = body as {
    orderLineId?: unknown
    askingInr?: unknown
    assessment?: unknown
  }

  if (typeof orderLineId !== 'string' || orderLineId === '') {
    return NextResponse.json({ error: 'orderLineId is required' }, { status: 400 })
  }
  if (typeof askingInr !== 'number' || !Number.isInteger(askingInr) || askingInr <= 0) {
    // Integer paise. A float here would be money arithmetic going wrong at the
    // boundary, which is exactly where it is hardest to notice.
    return NextResponse.json({ error: 'askingInr must be positive integer paise' }, { status: 400 })
  }
  if (assessment === null || typeof assessment !== 'object') {
    return NextResponse.json({ error: 'assessment is required' }, { status: 400 })
  }

  try {
    const created = await createResaleRequest({
      orderLineId,
      askingInr,
      assessment: assessment as ResaleAssessment,
    })
    return NextResponse.json(created, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Could not create the listing request' }, { status: 422 })
  }
}
