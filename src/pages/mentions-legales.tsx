import Link from 'next/link'

import { InfoList, LegalArticle } from '@/components/layout/legal-page'
import { PageTitle } from '@/components/layout/page-title'
import { PUBLISHER, SITE_NAME } from '@/lib/site'

// Legal notice (#25): mandatory information on the publisher and the host (French law
// n° 2004-575 "LCEN", art. 6 III and 6 I), from PUBLISHER in src/lib/site.ts.
// Page text is site content: French.

export default function LegalNoticePage() {
  return (
    <LegalArticle>
      <PageTitle
        title="Mentions légales"
        description={`Éditeur, hébergeur et conditions d’utilisation du site ${SITE_NAME}.`}
      />
      <h1 className="text-3xl font-bold">Mentions légales</h1>

      <p>
        Le site {SITE_NAME} aide à comprendre les modes amiables de règlement des conflits du
        quotidien. Il a été réalisé dans le cadre d’un hackathon.
      </p>

      <section aria-labelledby="editeur">
        <h2 id="editeur">Éditeur du site</h2>
        <InfoList
          items={[
            ['Nom', PUBLISHER.name],
            ['Adresse', PUBLISHER.address],
            [
              'Contact',
              <a key="contact" href={PUBLISHER.contact.href}>
                {PUBLISHER.contact.label}
              </a>,
            ],
            ['Directeur ou directrice de la publication', PUBLISHER.publicationDirector],
          ]}
        />
      </section>

      <section aria-labelledby="hebergeur">
        <h2 id="hebergeur">Hébergement</h2>
        <InfoList
          items={[
            ['Hébergeur', PUBLISHER.host.name],
            ['Adresse', PUBLISHER.host.address],
            ['Lieu d’hébergement', PUBLISHER.host.location],
          ]}
        />
      </section>

      <section aria-labelledby="information">
        <h2 id="information">Nature des informations</h2>
        <p>
          Les informations du site sont générales et données à titre indicatif. Elles ne remplacent
          pas un conseil juridique personnalisé : le site n’est ni un avocat, ni un service officiel
          de la justice, et ne prend aucune décision à votre place. Les réponses de l’assistante
          IRIS sont générées automatiquement et peuvent contenir des erreurs.
        </p>
        <p>
          Pour une démarche officielle, consultez <a href="https://www.justice.fr">justice.fr</a> ou{' '}
          <a href="https://www.service-public.fr">service-public.fr</a>.
        </p>
      </section>

      <section aria-labelledby="donnees">
        <h2 id="donnees">Données personnelles et cookies</h2>
        <p>
          Le site ne demande pas de créer de compte et ne dépose aucun cookie. Le détail des données
          traitées et de vos droits figure sur les pages{' '}
          <Link href="/confidentialite">Données personnelles</Link> et{' '}
          <Link href="/cookies">Cookies</Link>.
        </p>
      </section>

      <section aria-labelledby="propriete">
        <h2 id="propriete">Propriété intellectuelle</h2>
        <p>
          Les textes, illustrations et le code du site sont la propriété de leurs auteurs, sauf
          mention contraire. Les polices Marianne et Spectral proviennent du système de design de
          l’État (DSFR) ; la police Marianne est réservée aux services de l’État.
        </p>
      </section>

      <section aria-labelledby="liens">
        <h2 id="liens">Liens vers d’autres sites</h2>
        <p>
          Le site propose des liens vers des sites publics (justice.fr, service-public.fr…). Nous ne
          sommes pas responsables de leur contenu. Ces sites ont leurs propres règles en matière de
          données personnelles et de cookies.
        </p>
      </section>

      <section aria-labelledby="accessibilite">
        <h2 id="accessibilite">Accessibilité</h2>
        <p>
          Le site est non conforme au référentiel général d’amélioration de l’accessibilité (RGAA).
          Voir la <Link href="/accessibilite">déclaration d’accessibilité</Link>.
        </p>
      </section>
    </LegalArticle>
  )
}
