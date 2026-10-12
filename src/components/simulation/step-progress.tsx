// Progress indicator: bar + "Étape X sur N" text. N counts the ACTIVE steps, so it can change
// depending on the answers. The bar is exposed as a `progressbar` (RGAA 7.5.3); the text is a
// polite `aria-live` region: a change of N while typing is announced, whereas a change of step is
// not (the panel is recreated and its title receives the focus).
export function StepProgress({ position, total }: { position: number; total: number }) {
  return (
    <div className="space-y-2">
      <div
        role="progressbar"
        aria-label="Progression de la simulation"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={position}
        aria-valuetext={`Étape ${position} sur ${total}`}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary motion-safe:transition-[width]"
          style={{ width: `${(position / total) * 100}%` }}
        />
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Étape {position} sur {total}
      </p>
    </div>
  )
}
