// Landing banner: explains the service in one sentence.
// Holds the only h1 of the home page (RGAA 9.1).
export function Hero() {
  return (
    <section aria-labelledby="accueil-titre" className="rounded-lg bg-france-blue-4 px-6 py-10">
      <h1 id="accueil-titre" className="max-w-3xl text-3xl font-bold text-france-blue md:text-4xl">
        Comprendre et gérer votre conflit
      </h1>
      <p className="mt-4 max-w-3xl text-lg">
        Un différend avec un voisin, un propriétaire, un employeur ou un commerçant ? Avant d’aller
        devant le juge, découvrez les solutions amiables comme la conciliation et la médiation.
      </p>
    </section>
  )
}
