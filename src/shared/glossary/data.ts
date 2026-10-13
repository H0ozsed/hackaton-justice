import type { GlossaryTermInput } from './schema'

// Field names in English, content in French (shown to users). See src/shared/README.md.
// Facts checked against justice.fr, service-public.gouv.fr and the DGCCRF (October 2026);
// to be proofread by the legal / content team before the demo.
export const glossaryData: GlossaryTermInput[] = [
  {
    slug: 'conciliation',
    term: 'Conciliation',
    definition:
      'Façon amiable de régler un litige : un conciliateur de justice, bénévole et neutre, aide gratuitement les parties à trouver un accord. Il peut proposer des solutions, que chacun reste libre d’accepter.',
    related: ['mediation', 'conciliateur-de-justice', 'constat-d-accord'],
  },
  {
    slug: 'mediation',
    term: 'Médiation',
    definition:
      'Façon amiable de régler un litige : un médiateur, neutre, impartial et tenu à la confidentialité, aide les parties à renouer le dialogue et à construire elles-mêmes leur accord. Il ne tranche pas. La médiation est en général payante, partagée entre les parties.',
    aliases: ['médiateur', 'médiatrice'],
    related: [
      'conciliation',
      'homologation',
      'mediateur-de-la-consommation',
      'mediation-familiale',
    ],
  },
  {
    slug: 'mise-en-demeure',
    term: 'Mise en demeure',
    definition:
      'Courrier officiel, souvent envoyé en recommandé avec accusé de réception, qui demande à une personne de respecter ses obligations dans un délai précis. Il prouve que vous l’avez prévenue avant d’aller plus loin.',
  },

  // ---- Neighbourhood conflict (role-play scenario "voisin-du-dessus") ----
  {
    slug: 'tapage-nocturne',
    term: 'Tapage nocturne',
    definition:
      'Bruit qui trouble le voisinage la nuit, en général entre 22 h et 7 h. C’est une infraction : la police ou la gendarmerie peut infliger une amende forfaitaire de 68 €.',
    related: ['trouble-anormal-de-voisinage'],
  },
  {
    slug: 'trouble-anormal-de-voisinage',
    term: 'Trouble anormal de voisinage',
    definition:
      'Gêne qui dépasse ce que l’on doit normalement supporter entre voisins : bruit répété, odeurs, lumière… La personne qui la cause doit réparer le préjudice, même sans avoir commis de faute (article 1253 du code civil).',
    aliases: ['troubles anormaux de voisinage'],
    related: ['tapage-nocturne', 'conciliateur-de-justice'],
  },
  {
    slug: 'conciliateur-de-justice',
    term: 'Conciliateur de justice',
    definition:
      'Bénévole nommé par la justice qui aide gratuitement deux personnes en conflit à trouver un accord. On le rencontre sur rendez-vous, souvent en mairie. Pour un conflit de voisinage, tenter une solution amiable est en principe obligatoire avant de saisir le juge.',
    aliases: ['conciliatrice de justice', 'conciliatrice', 'conciliateur'],
    related: ['conciliation', 'constat-d-accord'],
  },
  {
    slug: 'constat-d-accord',
    term: 'Constat d’accord',
    definition:
      'Document signé par les deux parties à la fin d’une conciliation réussie. Il écrit noir sur blanc ce que chacun s’engage à faire. Un juge peut lui donner la même force qu’un jugement (homologation).',
    related: ['conciliateur-de-justice'],
  },
  {
    slug: 'commissaire-de-justice',
    term: 'Commissaire de justice',
    definition:
      'Professionnel du droit (anciennement huissier de justice). Il peut notamment constater des faits par écrit, avec une forte valeur de preuve. Ses constats sont payants.',
    aliases: ['huissier', 'huissier de justice'],
  },
  {
    slug: 'tribunal-judiciaire',
    term: 'Tribunal judiciaire',
    definition:
      'Tribunal qui juge la plupart des litiges entre particuliers, dont les conflits de voisinage.',
    related: ['irrecevable'],
  },
  {
    slug: 'irrecevable',
    term: 'Irrecevable',
    definition:
      'Se dit d’une demande que le juge refuse d’examiner parce qu’une condition n’est pas remplie, par exemple l’absence de tentative de solution amiable avant de saisir le tribunal.',
    related: ['tribunal-judiciaire', 'conciliateur-de-justice'],
  },

  // ---- Amicable settlement ----
  {
    slug: 'tentative-amiable-prealable',
    term: 'Tentative amiable préalable',
    definition:
      'Pour certains litiges (sommes de 5 000 € ou moins, troubles de voisinage), la loi impose de tenter une conciliation, une médiation ou une procédure participative avant de saisir le juge. Sans cette tentative, la demande peut être déclarée irrecevable (article 750-1 du code de procédure civile).',
    aliases: ['tentative amiable', 'tentative de résolution amiable'],
    related: ['irrecevable', 'conciliation', 'mediation', 'procedure-participative'],
  },
  {
    slug: 'homologation',
    term: 'Homologation',
    definition:
      'Validation d’un accord par un juge, à la demande des parties. L’accord homologué a la même force qu’un jugement : s’il n’est pas respecté, il peut être exécuté de force.',
    aliases: ['homologuer', 'homologué'],
    related: ['constat-d-accord', 'mediation'],
  },
  {
    slug: 'mediateur-de-la-consommation',
    term: 'Médiateur de la consommation',
    definition:
      'Médiateur que tout professionnel doit proposer à ses clients. Gratuit pour le consommateur, il se saisit après une réclamation écrite restée sans succès, et propose une solution dans les 90 jours, que chacun reste libre d’accepter.',
    aliases: ['médiation de la consommation'],
    related: ['mediation'],
  },
  {
    slug: 'mediation-familiale',
    term: 'Médiation familiale',
    definition:
      'Médiation menée par un médiateur familial diplômé pour une séparation, l’organisation pour les enfants, une succession ou des relations familiales difficiles. Son coût dépend des revenus (barème de la Caf). Elle n’est pas proposée en cas de violences.',
    related: ['mediation', 'homologation'],
  },
  {
    slug: 'procedure-participative',
    term: 'Procédure participative',
    definition:
      'Démarche amiable où chaque partie, assistée de son avocat, signe une convention pour chercher ensemble une solution dans un délai fixé.',
    related: ['tentative-amiable-prealable'],
  },
  {
    slug: 'aide-juridictionnelle',
    term: 'Aide juridictionnelle',
    definition:
      'Prise en charge par l’État de tout ou partie des frais de justice (avocat, commissaire de justice, médiation ordonnée par le juge) pour les personnes aux revenus modestes.',
    related: ['mediation'],
  },
  {
    slug: 'depot-de-garantie',
    term: 'Dépôt de garantie',
    definition:
      'Somme versée par le locataire en entrant dans le logement. Le propriétaire doit la rendre dans un délai d’un mois si l’état des lieux de sortie correspond à celui d’entrée, de deux mois sinon, en retenant seulement les sommes justifiées.',
    related: ['etat-des-lieux', 'vetuste'],
  },
  {
    slug: 'etat-des-lieux',
    term: 'État des lieux',
    definition:
      'Document qui décrit l’état du logement à l’entrée puis à la sortie du locataire. La comparaison des deux sert à savoir si des réparations peuvent lui être demandées.',
    related: ['depot-de-garantie', 'vetuste'],
  },
  {
    slug: 'vetuste',
    term: 'Vétusté',
    definition:
      'Usure normale d’un logement ou d’un objet avec le temps. Elle n’est pas à la charge du locataire.',
    aliases: ['usure normale'],
    related: ['etat-des-lieux', 'depot-de-garantie'],
  },
  {
    slug: 'prescription',
    term: 'Prescription',
    definition:
      'Délai au-delà duquel on ne peut plus agir en justice : en général 5 ans pour un litige civil (article 2224 du code civil). Une conciliation ou une médiation suspend ce délai pendant sa durée.',
    related: ['conciliation', 'mediation'],
  },
]
