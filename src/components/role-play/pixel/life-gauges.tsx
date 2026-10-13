import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import { GAUGE_LABELS, GAUGE_MAX, type Gauges } from '@/shared/role-play'

type Key = keyof Gauges

/** Change of each gauge since the previous choice ("−2", "+150 €"). */
function deltasOf(before: Gauges | undefined, after: Gauges): Partial<Record<Key, string>> {
  if (!before) return {}
  const values: Partial<Record<Key, string>> = {}
  if (after.health < before.health) values.health = `−${before.health - after.health}`
  if (after.relationship < before.relationship)
    values.relationship = `−${before.relationship - after.relationship}`
  if (after.money > before.money) values.money = `+${after.money - before.money} €`
  if (after.time > before.time) values.time = `+${after.time - before.time} h`
  return values
}

/**
 * Life gauges of the player (HUD of the stage, #76). The values are real text (read by
 * screen readers); the segment bars and the floating deltas are only decorative. Changes
 * are announced by the game through its live region (describeGaugeChange).
 */
export function LifeGauges({
  gauges,
  previous,
  reduceMotion,
}: {
  gauges: Gauges
  /** Gauges before the last choice: the difference floats next to the values for a moment. */
  previous?: Gauges
  reduceMotion: boolean
}) {
  const deltas = deltasOf(previous, gauges)
  // Mounted again with each scene: the deltas show, then fade out.
  const [showDeltas, setShowDeltas] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setShowDeltas(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  const items: { key: Key; visible: string; spoken: string; points?: number }[] = [
    {
      key: 'health',
      visible: `${gauges.health}/${GAUGE_MAX}`,
      spoken: `${gauges.health} sur ${GAUGE_MAX}`,
      points: gauges.health,
    },
    {
      key: 'relationship',
      visible: `${gauges.relationship}/${GAUGE_MAX}`,
      spoken: `${gauges.relationship} sur ${GAUGE_MAX}`,
      points: gauges.relationship,
    },
    { key: 'money', visible: `${gauges.money} €`, spoken: `${gauges.money} euros` },
    {
      key: 'time',
      visible: `${gauges.time} h`,
      spoken: `${gauges.time} heure${gauges.time > 1 ? 's' : ''}`,
    },
  ]

  return (
    <ul
      aria-label="Vos jauges"
      className="grid grid-cols-2 gap-x-4 gap-y-2 bg-[#1e1f33] px-3 py-2 text-sm text-white sm:grid-cols-4"
    >
      {items.map(({ key, visible, spoken, points }) => (
        <li key={key} className="relative flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="text-[#d5dbef]">{GAUGE_LABELS[key]}</span>
            <span className="relative font-bold tabular-nums">
              <span aria-hidden>{visible}</span>
              <span className="sr-only">{spoken}</span>
              <AnimatePresence>
                {showDeltas && deltas[key] && (
                  <motion.span
                    key={key}
                    aria-hidden
                    data-testid={`delta-${key}`}
                    className="pointer-events-none absolute top-full right-0 z-10 rounded-sm bg-[#1e1f33] px-1 font-bold whitespace-nowrap text-[#ff8d7e]"
                    initial={reduceMotion ? false : { y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.6 }}
                  >
                    {deltas[key]}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </span>
          {points !== undefined && <Segments points={points} />}
        </li>
      ))}
    </ul>
  )
}

/** Ten pixel blocks, filled for the points left. */
function Segments({ points }: { points: number }) {
  const low = points <= GAUGE_MAX * 0.3
  return (
    <span aria-hidden className="flex gap-px">
      {Array.from({ length: GAUGE_MAX }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 flex-1 transition-colors duration-500 motion-reduce:transition-none',
            i < points ? (low ? 'bg-[#ff8d7e]' : 'bg-[#00ac8c]') : 'bg-[#484d7a]',
          )}
        />
      ))}
    </span>
  )
}
