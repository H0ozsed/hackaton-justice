import { about, type About } from '@/shared/home'

// « À propos de ce site » (#104): for whom, what makes it different, what it is not.
export function AboutSection({ content = about }: { content?: About }) {
  const lists = [
    { id: 'a-propos-public', title: 'Pour qui ?', items: content.audiences },
    { id: 'a-propos-difference', title: 'Ce qui le rend différent', items: content.differences },
    { id: 'a-propos-limites', title: 'Ce que ce site n’est pas', items: content.limits },
  ]
  return (
    <section id="a-propos" aria-labelledby="a-propos-titre" className="mt-12 scroll-mt-24">
      <h2 id="a-propos-titre" className="text-2xl font-bold">
        À propos de ce site
      </h2>
      <p className="mt-2 text-muted-foreground">
        Pour qui est ce site, ce qui le rend différent et ses limites.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {lists.map(({ id, title, items }) => (
          <section
            key={id}
            aria-labelledby={id}
            className="rounded-lg border-2 border-border bg-card p-6"
          >
            <h3 id={id} className="text-xl font-bold">
              {title}
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}
