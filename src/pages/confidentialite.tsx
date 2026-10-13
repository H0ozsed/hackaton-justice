import Link from 'next/link'

import { InfoList, LegalArticle } from '@/components/layout/legal-page'
import { PageTitle } from '@/components/layout/page-title'
import { PUBLISHER, SITE_NAME } from '@/lib/site'
import { processings, type Processing } from '@/shared/privacy'

// Privacy policy (#25, docs/RGPD.pdf): GDPR art. 13 information, rendered from the data
// inventory of src/shared/privacy; publisher and host from PUBLISHER in src/lib/site.ts.
// Page text is site content: French.

const LOCATION_LABELS: Record<Processing['location'], string> = {
  device: 'Sur votre appareil uniquement, rien n’est envoyé',
  server: 'Envoyé au serveur du site',
}

export default function PrivacyPage() {
  return (
    <LegalArticle>
      <PageTitle
        title="Données personnelles"
        description={`Les données traitées par ${SITE_NAME}, pourquoi, combien de temps, et vos droits.`}
      />
      <h1 className="text-3xl font-bold">Données personnelles</h1>

      <section aria-labelledby="essentiel">
        <h2 id="essentiel">L’essentiel</h2>
        <p>
          {SITE_NAME} ne collecte que les données strictement nécessaires au service que vous
          utilisez, et n’en conserve aucune sur son serveur.
        </p>
        <ul>
          <li>Pas de compte, pas d’inscription, pas de formulaire de contact.</li>
          <li>Pas de cookie, pas de mesure d’audience, pas de publicité.</li>
          <li>Aucune donnée vendue, partagée ou transmise à un tiers.</li>
          <li>
            Ce que vous saisissez dans la simulation et le courrier amiable reste sur votre
            appareil.
          </li>
        </ul>
      </section>

      <section aria-labelledby="flux">
        <h2 id="flux">Où transitent vos données</h2>
        <ul>
          <li>
            <strong>Simulation, courrier amiable, quiz, jeux et mise en situation</strong> : tout se
            passe dans votre navigateur. Rien n’est envoyé au serveur.
          </li>
          <li>
            <strong>Questions à IRIS</strong> : votre navigateur envoie la question au serveur du
            site, qui la transmet au modèle de langage installé sur ce même serveur. La réponse vous
            revient, puis la question est oubliée. Elle ne quitte jamais notre serveur.
          </li>
          <li>
            <strong>Vers l’extérieur</strong> : rien. Aucun service tiers (mesure d’audience,
            publicité, réseau social, intelligence artificielle extérieure) ne reçoit vos données.
          </li>
        </ul>
      </section>

      <section aria-labelledby="responsable">
        <h2 id="responsable">Responsable du traitement</h2>
        <p>
          {PUBLISHER.name}, {PUBLISHER.address}. Délégué à la protection des données :{' '}
          <a href={`mailto:${PUBLISHER.dpo.email}`}>{PUBLISHER.dpo.email}</a> ou{' '}
          {PUBLISHER.dpo.address}.
        </p>
      </section>

      <section aria-labelledby="traitements">
        <h2 id="traitements">Données traitées</h2>
        <p>Voici la liste complète des données personnelles que le site traite.</p>
        {processings.all.map(({ slug, title, data, purpose, legalBasis, location, retention }) => (
          <section key={slug} aria-labelledby={slug} className="rounded-md border p-4">
            <h3 id={slug} className="mb-3">
              {title}
            </h3>
            <InfoList
              items={[
                ['Données', data],
                ['Pourquoi', purpose],
                ['Base légale', legalBasis],
                ['Où', LOCATION_LABELS[location]],
                ['Combien de temps', retention],
              ]}
            />
          </section>
        ))}
        <p>
          N’indiquez pas d’informations qui permettent de vous identifier (nom, adresse, numéro de
          dossier…) dans vos questions à IRIS : elles ne sont pas nécessaires pour vous répondre.
        </p>
      </section>

      <section aria-labelledby="navigateur">
        <h2 id="navigateur">Ce que le site garde dans votre navigateur</h2>
        <p>
          Pour vous éviter de perdre votre conversation avec IRIS ou votre progression dans la mise
          en situation, quelques informations sont gardées dans votre navigateur, jamais sur notre
          serveur. Leur liste, leur durée et le moyen de les effacer sont sur la page{' '}
          <Link href="/cookies">Cookies</Link>.
        </p>
      </section>

      <section aria-labelledby="destinataires">
        <h2 id="destinataires">Destinataires et hébergement</h2>
        <p>
          Aucune donnée n’est transmise à un tiers. L’assistante IRIS utilise un modèle de langage
          installé sur le serveur du site : vos questions ne sont envoyées à aucun service extérieur
          d’intelligence artificielle.
        </p>
        <p>
          Le site est hébergé en {PUBLISHER.host.location} par le {PUBLISHER.host.name}. Ses
          journaux techniques (adresse IP, date, page demandée) sont conservés un an au plus pour
          assurer la sécurité du service.
        </p>
      </section>

      <section aria-labelledby="droits">
        <h2 id="droits">Vos droits</h2>
        <p>
          Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et
          d’opposition sur vos données (articles 15 à 21 du RGPD). Comme le site ne conserve aucune
          donnée sur son serveur, il ne peut pas vous identifier : les informations gardées dans
          votre navigateur peuvent être effacées par vous-même à tout moment, depuis la page{' '}
          <Link href="/cookies">Cookies</Link>.
        </p>
        <p>
          Pour toute question sur vos données, écrivez au délégué à la protection des données (
          <a href={`mailto:${PUBLISHER.dpo.email}`}>{PUBLISHER.dpo.email}</a>) ou utilisez le{' '}
          <a href={PUBLISHER.contact.href}>{PUBLISHER.contact.label}</a>. Si vous estimez que vos
          droits ne sont pas respectés, vous pouvez adresser une réclamation à la{' '}
          <a href="https://www.cnil.fr/fr/plaintes">CNIL</a>.
        </p>
      </section>

      <p className="text-sm text-muted-foreground">Dernière mise à jour : 13 octobre 2026.</p>
    </LegalArticle>
  )
}
