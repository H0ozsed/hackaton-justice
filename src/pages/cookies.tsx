import Link from 'next/link'

import { InfoList, LegalArticle } from '@/components/layout/legal-page'
import { PageTitle } from '@/components/layout/page-title'
import { ClearBrowserStorage } from '@/components/privacy/clear-browser-storage'
import { SITE_NAME } from '@/lib/site'
import { browserStorage, type BrowserStorage } from '@/shared/privacy'

// Cookie policy (#126, #25): what the site writes in the browser, rendered from the data inventory of
// src/shared/privacy. No cookie and no tracker needing consent (art. 82 of the French data
// protection act, CNIL guidelines), hence no consent banner. Page text is site content: French.

const STORAGE_LABELS: Record<BrowserStorage['storage'], string> = {
  sessionStorage: 'Stockage de session du navigateur',
  localStorage: 'Stockage local du navigateur',
}

export default function CookiesPage() {
  return (
    <LegalArticle>
      <PageTitle
        title="Cookies"
        description={`${SITE_NAME} ne dépose aucun cookie : ce que le site garde dans votre navigateur et comment l’effacer.`}
      />
      <h1 className="text-3xl font-bold">Cookies</h1>

      <section aria-labelledby="essentiel">
        <h2 id="essentiel">L’essentiel</h2>
        <ul>
          <li>Le site ne dépose aucun cookie.</li>
          <li>
            Aucun traceur de mesure d’audience, de publicité ou de réseau social : pas de Google
            Analytics, pas de bouton de partage, pas de vidéo intégrée. Les polices de caractères
            sont hébergées sur le site.
          </li>
          <li>
            Quelques informations sont gardées dans votre navigateur pour vous rendre service. Elles
            ne quittent pas votre appareil et ne servent pas à vous suivre.
          </li>
        </ul>
        <p>
          C’est pourquoi le site ne vous demande pas votre consentement : la loi en dispense les
          informations strictement nécessaires au service que vous demandez ou qui gardent vos
          préférences (article 82 de la loi Informatique et Libertés,{' '}
          <a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies">
            règles de la CNIL sur les cookies et autres traceurs
          </a>
          ).
        </p>
      </section>

      <section aria-labelledby="liste">
        <h2 id="liste">Ce que le site garde dans votre navigateur</h2>
        {browserStorage.all.map(({ slug, key, storage, purpose, retention }) => (
          <section key={slug} aria-labelledby={slug} className="rounded-md border p-4">
            <h3 id={slug} className="mb-3">
              {purpose}
            </h3>
            <InfoList
              items={[
                ['Nom', <code key="nom">{key}</code>],
                ['Où', STORAGE_LABELS[storage]],
                ['Combien de temps', retention],
              ]}
            />
          </section>
        ))}
      </section>

      <section aria-labelledby="effacer">
        <h2 id="effacer">Effacer ces informations</h2>
        <p>
          Ce bouton efface toutes les informations ci-dessus de ce navigateur. Votre conversation
          avec IRIS et vos scores de mise en situation seront perdus.
        </p>
        <ClearBrowserStorage />
        <p>
          Vous pouvez aussi les effacer depuis les réglages de votre navigateur, en supprimant les
          données de ce site, ou naviguer en navigation privée : rien n’est alors gardé après la
          fermeture de la fenêtre.
        </p>
      </section>

      <section aria-labelledby="autres-sites">
        <h2 id="autres-sites">Sites vers lesquels nous renvoyons</h2>
        <p>
          Les sites publics vers lesquels le site renvoie (justice.fr, service-public.fr…) ont leur
          propre politique de cookies, que nous ne contrôlons pas.
        </p>
      </section>

      <p>
        Pour en savoir plus sur les données traitées et vos droits, consultez la page{' '}
        <Link href="/confidentialite">Données personnelles</Link>.
      </p>
      <p className="text-sm text-muted-foreground">Dernière mise à jour : 13 octobre 2026.</p>
    </LegalArticle>
  )
}
