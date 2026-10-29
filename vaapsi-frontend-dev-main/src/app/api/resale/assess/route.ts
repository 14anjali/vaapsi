import { NextResponse } from 'next/server'
import { assessResale } from '@/lib/data'

/**
 * Read a set of uploaded frames and return provenance, condition and a price.
 *
 * Server-side for the same reason cart pricing is: what a garment is worth, and
 * whether it is genuinely one of ours, are not decisions a client should be
 * making. Today the answer comes from a deterministic function; when a real
 * assessment service exists it will need credentials, and those cannot live in
 * a browser. Putting the boundary here now means that swap touches one file.
 *
 * The payload is validated rather than trusted — it arrives from a page anyone
 * can open the console on.
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

  const { orderLineId, shotIds, declaredFlaws, hasCustomisations } = body as {
    orderLineId?: unknown
    shotIds?: unknown
    declaredFlaws?: unknown
    hasCustomisations?: unknown
  }

  if (typeof orderLineId !== 'string' || orderLineId === '') {
    return NextResponse.json({ error: 'orderLineId is required' }, { status: 400 })
  }

  const strings = (value: unknown): readonly string[] =>
    Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []

  try {
    const assessment = await assessResale({
      orderLineId,
      shotIds: strings(shotIds),
      declaredFlaws: strings(declaredFlaws).slice(0, 20),
      hasCustomisations: hasCustomisations === true,
    })
    return NextResponse.json(assessment, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    // A line id that resolves to nothing is a 404, not a 500 — the most likely
    // cause is a stale link rather than a broken server.
    return NextResponse.json({ error: 'No such purchase' }, { status: 404 })
  }
}
