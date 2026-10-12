// Lien d'évitement (RGAA 12.7) : premier élément focusable de la page,
// invisible jusqu'à ce qu'on y arrive au clavier (Tab), il permet de sauter
// directement au contenu sans traverser toute la navigation.
export function SkipLink() {
  return (
    <a
      href="#contenu"
      className="sr-only rounded-md bg-primary font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2"
    >
      Aller au contenu
    </a>
  )
}
