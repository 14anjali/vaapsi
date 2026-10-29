'use client'

import { Check } from 'lucide-react'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { shop } from '@/content/shop'
import { conditionCopy } from '@/content/product'
import { formatInr } from '@/lib/format/currency'
import type { ProductFacets } from '@/lib/data'
import type { PlpState } from '@/lib/plp/search-params'
import type { Condition, ListingType } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * The filter controls themselves, shared by the desktop rail and the mobile
 * sheet.
 *
 * Both surfaces render exactly these components against exactly the same state
 * shape. The only difference between them is the container and when the state is
 * committed — desktop navigates on every change, mobile holds a pending draft
 * and commits on "Show N". Building them as one set of controls is what stops
 * the two from drifting, which is the usual failure here.
 *
 * Checkboxes are native inputs, restyled. A div with `role="checkbox"` would
 * need keyboard handling, indeterminate state and form semantics reimplemented,
 * and it would be worse at all three.
 */

export type FilterDraft = Pick<
  PlpState,
  | 'brands'
  | 'conditions'
  | 'genders'
  | 'materials'
  | 'types'
  | 'sizes'
  | 'minRupees'
  | 'maxRupees'
  | 'sizeSystem'
>

export type FilterControlsProps = {
  facets: ProductFacets
  draft: FilterDraft
  onChange: (next: FilterDraft) => void
  /**
   * Which half of the catalogue is being filtered.
   *
   * `new` gets For / Type / Size / Material / Price. `pre_loved` gets Condition
   * as well, because a grade is the first question about a second-hand garment
   * and meaningless on unworn stock.
   */
  listingType: ListingType
  /**
   * True when the route already fixes the category (`/shop/outerwear`), so the
   * Type group is hidden rather than offering a choice that contradicts the URL.
   */
  categoryLocked?: boolean
}

function toggle<T>(list: readonly T[], value: T): readonly T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function FilterControls({
  facets,
  draft,
  onChange,
  listingType,
  categoryLocked = false,
}: FilterControlsProps) {
  return (
    <Stack gap={8}>
      {/*
        No passport filter and no brand filter.

        Every garment has a record, so filtering on the passport sorted the
        catalogue by how complete our data is rather than by anything a shopper
        chooses between — and every garment is Vaapsi, so a brand group was one
        checkbox that matched everything.

        Condition is pre-loved only. It is the first question about a second-hand
        garment and has no meaning on unworn stock, which is why the facets are
        scoped to a listing type rather than computed across the catalogue.
      */}
      {listingType === 'pre_loved' && facets.conditions.length > 0 && (
        <FilterGroup label={shop.filters.groups.condition}>
          <Stack gap={2}>
            {facets.conditions.map((facet) => (
              <CheckboxRow
                key={facet.value}
                label={conditionCopy[facet.value as Condition].label}
                hint={conditionCopy[facet.value as Condition].short}
                count={facet.count}
                checked={draft.conditions.includes(facet.value)}
                onChange={() =>
                  onChange({
                    ...draft,
                    conditions: toggle(draft.conditions, facet.value) as readonly Condition[],
                  })
                }
              />
            ))}
          </Stack>
        </FilterGroup>
      )}

      {/* Who it is cut for. `unisex` is not offered as a choice — it would read
          as a third department when it actually means "appears under both". */}
      {facets.genders.length > 1 && (
        <FilterGroup label={shop.filters.groups.gender}>
          <Stack gap={2}>
            {facets.genders
              .filter((facet) => facet.value !== 'unisex')
              .map((facet) => (
                <CheckboxRow
                  key={facet.value}
                  label={shop.filters.genderLabels[facet.value]}
                  count={facet.count}
                  checked={draft.genders.includes(facet.value)}
                  onChange={() =>
                    onChange({ ...draft, genders: toggle(draft.genders, facet.value) })
                  }
                />
              ))}
          </Stack>
        </FilterGroup>
      )}

      {!categoryLocked && facets.categories.length > 1 && (
        <FilterGroup label={shop.filters.groups.type}>
          <Stack gap={2}>
            {facets.categories.map((facet) => (
              <CheckboxRow
                key={facet.value}
                label={shop.filters.typeLabels[facet.value]}
                count={facet.count}
                checked={draft.types.includes(facet.value)}
                onChange={() => onChange({ ...draft, types: toggle(draft.types, facet.value) })}
              />
            ))}
          </Stack>
        </FilterGroup>
      )}

      {/* Indian sizes only. The IN/UK/EU toggle is gone: the labels collide —
          an "M" exists on all three scales and means three different garments —
          so the list repeated the same letter and a shopper could not tell which
          one matched their own clothes. The conversions live in the size guide,
          which has room to show them side by side. */}
      <FilterGroup label={shop.filters.groups.size}>
        <Stack gap={2}>
          {facets.sizes.map((facet) => (
            <CheckboxRow
              key={facet.value}
              label={facet.label}
              count={facet.count}
              checked={draft.sizes.includes(facet.value)}
              onChange={() => onChange({ ...draft, sizes: toggle(draft.sizes, facet.value) })}
            />
          ))}
        </Stack>
      </FilterGroup>

      {facets.materials.length > 1 && (
        <FilterGroup label={shop.filters.groups.material}>
          <Stack gap={2}>
            {facets.materials.map((facet) => (
              <CheckboxRow
                key={facet.value}
                label={facet.label}
                count={facet.count}
                checked={draft.materials.includes(facet.value)}
                onChange={() =>
                  onChange({ ...draft, materials: toggle(draft.materials, facet.value) })
                }
              />
            ))}
          </Stack>
        </FilterGroup>
      )}

      <FilterGroup
        label={shop.filters.groups.price}
        hint={`${formatInr(facets.priceRangeInr.min, { paise: 'never' })} – ${formatInr(
          facets.priceRangeInr.max,
          { paise: 'never' },
        )}`}
      >
        <Row gap={3} wrap={false}>
          <PriceInput
            label={shop.filters.priceMin}
            value={draft.minRupees}
            onChange={(minRupees) => onChange({ ...draft, minRupees })}
          />
          <PriceInput
            label={shop.filters.priceMax}
            value={draft.maxRupees}
            onChange={(maxRupees) => onChange({ ...draft, maxRupees })}
          />
        </Row>
      </FilterGroup>
    </Stack>
  )
}

function FilterGroup({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <fieldset>
      <legend className="w-full">
        <Row gap={2} justify="between" className="pb-3">
          <Eyebrow as="span">{label}</Eyebrow>
          {hint !== undefined && (
            <Type as="span" size="xs" tone="subtle" numeric>
              {hint}
            </Type>
          )}
        </Row>
      </legend>
      {children}
    </fieldset>
  )
}

function CheckboxRow({
  label,
  hint,
  count,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="group/check flex cursor-pointer items-center gap-3">
      <span className="relative flex size-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer absolute size-4 cursor-pointer appearance-none border border-line checked:border-ink checked:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent group-hover/check:border-line-strong"
        />
        <Check
          className="pointer-events-none relative size-3 text-background opacity-0 peer-checked:opacity-100"
          strokeWidth={2.5}
          aria-hidden
        />
      </span>

      <Type as="span" size="sm" tone={checked ? 'default' : 'muted'} truncate>
        {label}
      </Type>

      {hint !== undefined && (
        <Type as="span" size="xs" tone="subtle" truncate>
          {hint}
        </Type>
      )}

      {count !== undefined && (
        <Type as="span" size="xs" tone="subtle" numeric className="ml-auto shrink-0">
          {count}
        </Type>
      )}
    </label>
  )
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <label className="min-w-0 flex-1">
      <Type as="span" size="xs" tone="subtle" className="block pb-1">
        {label}
      </Type>
      <span className="flex items-center gap-1 border border-line px-2 py-1.5 focus-within:border-ink">
        <Type as="span" size="sm" tone="subtle">
          {shop.filters.priceUnit}
        </Type>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value ?? ''}
          onChange={(event) => {
            const raw = event.target.value
            if (raw === '') {
              onChange(null)
              return
            }
            const parsed = Number.parseInt(raw, 10)
            onChange(Number.isFinite(parsed) && parsed >= 0 ? parsed : null)
          }}
          className="w-full min-w-0 bg-transparent text-sm tabular-nums outline-none"
        />
      </span>
    </label>
  )
}
