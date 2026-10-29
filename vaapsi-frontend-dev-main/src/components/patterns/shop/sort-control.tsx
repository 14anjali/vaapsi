'use client'

import { usePlpUrl } from './use-plp-url'
import { Type } from '@/components/primitives/type'
import { shop } from '@/content/shop'
import { SORTS, type PlpSort } from '@/lib/plp/search-params'

/**
 * Sort.
 *
 * A native `<select>`. It is one of the few controls where the platform widget
 * is better than anything we would build: it is a wheel on iOS, a proper
 * dropdown on Android, keyboard-operable everywhere, and it never opens off the
 * edge of the screen. A custom listbox here would be work spent making something
 * slightly worse.
 *
 * Styled to look like the rest of the page — hairline border, no chevron soup —
 * with the native arrow left in place, because removing it makes a select look
 * like a text field.
 */
export function SortControl() {
  const { state, setSort } = usePlpUrl()

  return (
    <label className="flex items-center gap-2">
      <Type as="span" size="xs" tone="subtle" className="whitespace-nowrap">
        {shop.sort.label}
      </Type>
      <select
        value={state.sort}
        onChange={(event) => setSort(event.target.value as PlpSort)}
        className="cursor-pointer border border-line bg-transparent py-1.5 pl-2 pr-1 text-sm outline-none focus:border-ink"
      >
        {SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {shop.sort.options[sort]}
          </option>
        ))}
      </select>
    </label>
  )
}
