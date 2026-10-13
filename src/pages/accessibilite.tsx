import type { ReactNode } from 'react'

import { PageTitle } from '@/components/layout/page-title'
import { SITE_NAME } from '@/lib/site'

// Accessibility statement (#24), following the official RGAA structure.
// Status stays "non conforme" until a full RGAA audit (106 criteria) is done: see
// docs/RGAA_AUDIT.md for what was tested. Values marked <ToFill> must be completed
// before going live (same information as the legal notice, #25).
// Page text is site content: French.

/** Visible placeholder for information the team still has to provide. */
function ToFill({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-sm bg-marianne-red-4 px-1 font-semibold text-marianne-red-0">
      [À compléter : {children}]
    </mark>
  )
}

const TESTED_PAGES = [
  ['Accueil', '/'],
  ['Simulation', '/simulation'],
  ['Mise en situation', '/mise-en-situation'],
  ['Apprendre', '/apprendre'],
  ['Lexique', '/apprendre/lexique'],
  ['Mentions légales', '/mentions-legales'],
  ['Données personnelles', '/confidentialite'],
  ['Déclaration d’accessibilité', '/accessibilite'],
] as const

export default function AccessibilityPage() {
  return (
    <article className="max-w-3xl space-y-8 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_section]:space-y-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
      <PageTitle title="Accessibilité" />
      <h1 className="text-3xl font-bold">Déclaration d’accessibilité</h1>

      <p>
        <ToFill>nom de l’entité qui édite le site</ToFill> s’engage à rendre son site internet
        accessible conformément à l’article 47 de la loi n° 2005-102 du 11 février 2005.
      </p>
      <p>
        Cette déclaration d’accessibilité s’applique au site {SITE_NAME} (
        <ToFill>adresse du site</ToFill>).
      </p>

      <section aria-labelledby="etat">
        <h2 id="etat">État de conformité</h2>
        <p>
          Le site {SITE_NAME} est <strong>non conforme</strong> avec le référentiel général
          d’amélioration de l’accessibilité (RGAA), version 4.1 : aucun audit complet des 106
          critères n’a encore été réalisé.
        </p>
      </section>

      <section aria-labelledby="tests">
        <h2 id="tests">Résultats des tests</h2>
        <p>
          Une auto-évaluation a été menée pendant le développement. Elle ne remplace pas un audit de
          conformité et ne permet pas de calculer un taux de conformité.
        </p>
        <ul>
          <li>
            Tests automatiques (axe-core, règles WCAG 2.1 niveaux A et AA) sur toutes les pages et à
            chaque étape des parcours : simulation, mise en situation, questionnaires, lexique,
            foire aux questions, assistante IRIS, menu mobile. Aucune erreur détectée.
          </li>
          <li>
            Affichage vérifié de 320 à 1280 pixels de large, et avec le texte agrandi à 200 %, sans
            défilement horizontal.
          </li>
          <li>
            Navigation au clavier, visibilité du focus, structure des titres, zones de la page,
            libellés et messages d’erreur des formulaires vérifiés.
          </li>
        </ul>
      </section>

      <section aria-labelledby="non-accessibles">
        <h2 id="non-accessibles">Contenus non accessibles et limites connues</h2>
        <ul>
          <li>
            Le site ne propose qu’un seul système de navigation (le menu principal) : il manque un
            plan du site (critère 12.1).
          </li>
          <li>
            Les réponses de l’assistante IRIS sont générées automatiquement : leur clarté et leur
            structure ne peuvent pas être garanties.
          </li>
          <li>
            Le site n’a pas encore été testé avec des lecteurs d’écran (NVDA, JAWS, VoiceOver) ni
            par des personnes en situation de handicap.
          </li>
        </ul>
      </section>

      <section aria-labelledby="etablissement">
        <h2 id="etablissement">Établissement de cette déclaration d’accessibilité</h2>
        <p>
          Cette déclaration a été établie le <ToFill>date</ToFill>.
        </p>
        <h3>Technologies utilisées pour la réalisation du site</h3>
        <ul>
          <li>HTML5</li>
          <li>CSS</li>
          <li>JavaScript (React, Next.js)</li>
          <li>WAI-ARIA</li>
        </ul>
        <h3>Environnement de test</h3>
        <ul>
          <li>Chromium, en affichage ordinateur et mobile</li>
        </ul>
        <h3>Outils pour évaluer l’accessibilité</h3>
        <ul>
          <li>axe-core (tests automatiques)</li>
          <li>Playwright (parcours automatisés, navigation au clavier, affichage)</li>
        </ul>
        <h3>Pages du site ayant fait l’objet de la vérification</h3>
        <ul>
          {TESTED_PAGES.map(([label, href]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="contact">
        <h2 id="contact">Retour d’information et contact</h2>
        <p>
          Si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez nous contacter
          pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre
          forme : <ToFill>adresse e-mail de contact</ToFill>.
        </p>
      </section>

      <section aria-labelledby="recours">
        <h2 id="recours">Voies de recours</h2>
        <p>
          Si vous constatez un défaut d’accessibilité vous empêchant d’accéder à un contenu ou à une
          fonctionnalité du site, que vous nous le signalez et que vous ne parvenez pas à obtenir
          une réponse de notre part, vous êtes en droit de faire parvenir vos doléances ou une
          demande de saisine au Défenseur des droits :
        </p>
        <ul>
          <li>
            écrire un message au Défenseur des droits, depuis son site{' '}
            <a href="https://www.defenseurdesdroits.fr">www.defenseurdesdroits.fr</a>&nbsp;;
          </li>
          <li>contacter le délégué du Défenseur des droits dans votre région&nbsp;;</li>
          <li>
            envoyer un courrier par la poste (gratuit, ne pas mettre de timbre) : Défenseur des
            droits, Libre réponse 71120, 75342 Paris CEDEX 07.
          </li>
        </ul>
      </section>
    </article>
  )
}
