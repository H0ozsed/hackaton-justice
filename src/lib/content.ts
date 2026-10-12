import { z } from 'zod'

// Stable identifier of a content entry, used to reference it from elsewhere
// (e.g. a quiz question pointing to a glossary term). Lowercase kebab-case.
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case: "conciliateur-de-justice"')

export type Collection<T extends { slug: string }> = {
  /** Every entry, in file order. */
  all: readonly T[]
  /** Entry for this slug, or undefined. */
  find: (slug: string) => T | undefined
  /** Entry for this slug; throws if it does not exist (use for references already checked). */
  get: (slug: string) => T
  has: (slug: string) => boolean
}

/**
 * Validates a content file against its schema and indexes it by slug.
 * Runs when the module is loaded: invalid content fails `npm run content:check`,
 * the build and the dev server, with the collection name and the faulty entry.
 */
export function defineCollection<S extends z.ZodType<{ slug: string }>>(
  name: string,
  schema: S,
  entries: readonly z.input<S>[],
): Collection<z.output<S>> {
  const result = z.array(schema).safeParse(entries)
  if (!result.success) {
    // Name the entry by its slug (more useful to content writers than its position).
    const lines = result.error.issues.map(({ path, message }) => {
      const [index, ...rest] = path
      const raw = typeof index === 'number' ? entries[index] : undefined
      const slug = raw && typeof raw === 'object' && 'slug' in raw ? String(raw.slug) : undefined
      const entry = slug ? `"${slug}"` : `entry #${String(index)}`
      const field = rest.length > 0 ? ` > ${rest.join('.')}` : ''
      return `  - ${entry}${field}: ${message}`
    })
    throw new Error(`Invalid content in "${name}":\n${lines.join('\n')}`)
  }

  const bySlug = new Map<string, z.output<S>>()
  for (const entry of result.data) {
    if (bySlug.has(entry.slug)) {
      throw new Error(`Invalid content in "${name}": duplicate slug "${entry.slug}"`)
    }
    bySlug.set(entry.slug, entry)
  }

  return {
    all: result.data,
    find: (slug) => bySlug.get(slug),
    get: (slug) => {
      const entry = bySlug.get(slug)
      if (!entry) throw new Error(`Unknown slug "${slug}" in "${name}"`)
      return entry
    },
    has: (slug) => bySlug.has(slug),
  }
}

/**
 * Checks that every slug referenced by a collection exists in the target one.
 * `refs` lists [where the reference is, referenced slug] pairs.
 */
export function assertReferences(
  from: string,
  to: Pick<Collection<{ slug: string }>, 'has'> & { name: string },
  refs: Iterable<readonly [location: string, slug: string]>,
) {
  for (const [location, slug] of refs) {
    if (!to.has(slug)) {
      throw new Error(
        `Invalid content in "${from}": ${location} references unknown ${to.name} "${slug}"`,
      )
    }
  }
}

/** True when no value appears twice. For zod `.refine()` on ids inside one entry. */
export function isUnique(values: readonly string[]) {
  return new Set(values).size === values.length
}
