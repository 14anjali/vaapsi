import { mockAdapter } from './mock'
import type { DataAdapter } from './adapter'

export * from './adapter'

/**
 * The active data adapter.
 *
 * **This is the single-file change.** To go live, write an adapter that
 * satisfies `DataAdapter` against the real endpoints and swap the assignment
 * below. Nothing else in the app moves, because nothing else in the app knows
 * which implementation it is talking to.
 *
 *   const httpAdapter: DataAdapter = { ... }
 *   export const data: DataAdapter = httpAdapter
 *
 * Server components can call these methods directly. Client components should
 * wrap them in TanStack Query rather than calling them in an effect, so caching
 * and revalidation are consistent across the app.
 */
export const data: DataAdapter = mockAdapter

/**
 * Named re-exports, so call sites read as `getProduct(slug)` rather than
 * `data.getProduct(slug)`. Bound to `data` so swapping the adapter above
 * changes these too.
 */
export const listProducts: DataAdapter['listProducts'] = (...args) => data.listProducts(...args)
export const getProduct: DataAdapter['getProduct'] = (...args) => data.getProduct(...args)
export const getProductFacets: DataAdapter['getProductFacets'] = () => data.getProductFacets()
export const listFeaturedProducts: DataAdapter['listFeaturedProducts'] = (...args) =>
  data.listFeaturedProducts(...args)
export const listRelatedProducts: DataAdapter['listRelatedProducts'] = (...args) =>
  data.listRelatedProducts(...args)
export const listPreLovedAlternatives: DataAdapter['listPreLovedAlternatives'] = (...args) =>
  data.listPreLovedAlternatives(...args)
export const getPassport: DataAdapter['getPassport'] = (...args) => data.getPassport(...args)
export const getPassportByProduct: DataAdapter['getPassportByProduct'] = (...args) =>
  data.getPassportByProduct(...args)
export const getSeller: DataAdapter['getSeller'] = (...args) => data.getSeller(...args)
export const resolveCart: DataAdapter['resolveCart'] = (...args) => data.resolveCart(...args)
/**
 * The one method already wired to the real backend.
 *
 * Identity comes from the session now, not the fixture — see `./account` for
 * which fields are real and which are still fixture.
 *
 * **The import is dynamic on purpose.** `./account` reaches `next/headers`,
 * which does not exist in a client bundle. Every client-side import of this
 * module is currently `import type` and therefore erased, but a value import
 * added later would otherwise turn this into a confusing build failure in an
 * unrelated file. Deferring it keeps `next/headers` out of the static graph.
 */
export const getAccount: DataAdapter['getAccount'] = async () => {
  const { getSessionAccount } = await import('./account')
  return getSessionAccount()
}
export const listOrders: DataAdapter['listOrders'] = () => data.listOrders()
export const listResaleShots: DataAdapter['listResaleShots'] = () => data.listResaleShots()
export const getOrderLine: DataAdapter['getOrderLine'] = (...args) => data.getOrderLine(...args)
export const assessResale: DataAdapter['assessResale'] = (...args) => data.assessResale(...args)
export const createResaleRequest: DataAdapter['createResaleRequest'] = (...args) =>
  data.createResaleRequest(...args)
