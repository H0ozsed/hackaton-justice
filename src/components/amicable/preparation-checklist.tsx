import { PrinterIcon } from 'lucide-react'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { checklist, type ChecklistItem } from '@/shared/amicable'

/**
 * "Prepare my appointment" checklist. The ticks stay in the page only (nothing stored); the
 * count is announced politely. Printable.
 */
export function PreparationChecklist({
  items = checklist.all,
}: {
  items?: readonly ChecklistItem[]
}) {
  const id = useId()
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())
  const toggle = (slug: string, checked: boolean) =>
    setDone((current) => {
      const next = new Set(current)
      if (checked) next.add(slug)
      else next.delete(slug)
      return next
    })

  // Prints the list alone (see the print rules of globals.css).
  const printList = () => {
    document.body.dataset.print = 'checklist'
    window.addEventListener('afterprint', () => delete document.body.dataset.print, { once: true })
    window.print()
  }

  return (
    <div className="space-y-4">
      <ul data-print-area className="space-y-3">
        {items.map((item) => (
          <li key={item.slug} className="flex items-start gap-3">
            <Checkbox
              id={`${id}-${item.slug}`}
              checked={done.has(item.slug)}
              onCheckedChange={(checked) => toggle(item.slug, checked === true)}
              aria-describedby={item.help ? `${id}-${item.slug}-help` : undefined}
              className="mt-1"
            />
            <div>
              <Label htmlFor={`${id}-${item.slug}`} className="text-base font-medium">
                {item.label}
              </Label>
              {item.help && (
                <p id={`${id}-${item.slug}-help`} className="text-sm text-muted-foreground">
                  {item.help}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="font-medium">
        {done.size} sur {items.length} prêt{done.size > 1 ? 's' : ''}
        {done.size === items.length && ' : vous êtes prêt(e) pour votre rendez-vous.'}
      </p>
      <Button
        type="button"
        variant="outline"
        className="h-auto self-start py-2 whitespace-normal"
        onClick={printList}
      >
        <PrinterIcon aria-hidden />
        Imprimer la liste
      </Button>
    </div>
  )
}
