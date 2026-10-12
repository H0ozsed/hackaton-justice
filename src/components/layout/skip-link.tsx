// Skip link (RGAA 12.7): first focusable element of the page, hidden until
// reached with the keyboard (Tab). Lets keyboard users jump straight to the
// content without going through the whole navigation.
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only rounded-md bg-primary font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2"
    >
      Aller au contenu
    </a>
  )
}
