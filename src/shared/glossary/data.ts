import type { GlossaryTermInput } from './schema'

// Field names in English, content in French (shown to users). See src/shared/README.md.
// Facts checked against justice.fr, service-public.gouv.fr and the DGCCRF (October 2026);
// to be proofread by the legal / content team before the demo (#120). Coaching feedback of
// 13 Oct 2026: conciliation is for two people or more (#107), the conciliator is met in a
// point-justice (#96), mediation on an equal footing with conciliation (#93, #113), CDAD (#94),
// value of the agreement (#123).
export const glossaryData: GlossaryTermInput[] = [
  {
    slug: 'conciliation',
    term: 'Conciliation',
    definition:
      'Façon amiable de régler un litige entre deux personnes ou plus : un conciliateur de justice, bénévole et neutre, aide gratuitement les parties à trouver un accord. Il peut proposer des solutions, que chacun reste libre d’accepter.',
    related: ['mediation', 'conciliateur-de-justice', 'constat-d-accord', 'homologation'],
  },
  {
    slug: 'mediation',
    term: 'Médiation',
    definition:
      'Façon amiable de régler un litige entre deux personnes ou plus : un médiateur, neutre, impartial et tenu à la confidentialité, aide les parties à renouer le dialogue et à construire elles-mêmes leur accord. Il ne tranche pas. La médiation est en général payante, partagée entre les parties. L’accord trouvé peut être homologué par le juge si les parties le demandent.',
    related: [
      'mediateur',
      'conciliation',
      'homologation',
      'mediation-judiciaire',
      'mediateur-de-la-consommation',
      'mediation-familiale',
    ],
  },
  {
    slug: 'mediateur',
    term: 'Médiateur',
    definition:
      'Professionnel formé, neutre et impartial, tenu à la confidentialité, qui aide les parties à se parler et à trouver elles-mêmes leur solution. On peut le choisir soi-même (médiation conventionnelle) ou le juge peut le désigner avec l’accord des parties (médiation judiciaire). Il est en général payant, partagé entre les parties. Il existe aussi des médiateurs spécialisés : consommation, famille…',
    aliases: ['médiatrice', 'médiateurs', 'médiation conventionnelle'],
    related: [
      'mediation',
      'conciliateur-de-justice',
      'mediation-judiciaire',
      'mediateur-de-la-consommation',
      'mediation-familiale',
    ],
  },
  {
    slug: 'mediation-judiciaire',
    term: 'Médiation judiciaire',
    definition:
      'Médiation décidée par le juge pendant un procès, avec l’accord des parties. Le juge fixe la somme à verser au médiateur, en général partagée entre les parties ; l’aide juridictionnelle peut la prendre en charge pour les revenus modestes. Les médiateurs inscrits sur la liste de la cour d’appel peuvent être désignés.',
    related: ['mediateur', 'aide-juridictionnelle', 'homologation'],
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
      'Bénévole nommé par la justice qui aide gratuitement deux personnes ou plus en conflit à trouver un accord. On le contacte directement et on le rencontre sur rendez-vous, par exemple dans un point-justice ou au tribunal. Avec l’accord des parties, il peut se rendre sur les lieux et entendre toute personne utile, si elle l’accepte. Pour un conflit de voisinage, tenter une solution amiable est en principe obligatoire avant de saisir le juge.',
    aliases: ['conciliatrice de justice', 'conciliatrice', 'conciliateur', 'conciliateurs'],
    related: ['conciliation', 'constat-d-accord', 'mediateur', 'point-justice'],
  },
  {
    slug: 'constat-d-accord',
    term: 'Constat d’accord',
    definition:
      'Document signé par les parties à la fin d’une conciliation réussie. Il écrit noir sur blanc ce que chacun s’engage à faire. Un juge peut lui donner force exécutoire, c’est-à-dire la même force qu’un jugement (homologation).',
    related: ['conciliateur-de-justice', 'homologation', 'force-executoire'],
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
      'Validation d’un accord par un juge, à la demande des parties. C’est possible pour un accord de conciliation comme de médiation. L’accord homologué a force exécutoire : s’il n’est pas respecté, il peut être exécuté de force, comme un jugement.',
    aliases: ['homologuer', 'homologué', 'homologuée'],
    related: ['force-executoire', 'constat-d-accord', 'mediation'],
  },
  {
    slug: 'force-executoire',
    term: 'Force exécutoire',
    definition:
      'Force d’un jugement ou d’un accord homologué : s’il n’est pas respecté, on peut le faire exécuter de force, par exemple par un commissaire de justice. Un accord simplement signé engage les parties, mais n’a pas cette force sans homologation.',
    aliases: ['exécutoire'],
    related: ['homologation', 'commissaire-de-justice'],
  },
  {
    slug: 'point-justice',
    term: 'Point-justice',
    definition:
      'Lieu d’accueil gratuit où l’on reçoit une information juridique et où l’on est orienté vers la bonne démarche. Selon les lieux, on y rencontre des juristes, des avocats, des conciliateurs de justice ou des médiateurs. Les points-justice sont coordonnés par le CDAD de chaque département.',
    aliases: ['points-justice', 'point justice'],
    related: ['cdad', 'conciliateur-de-justice'],
  },
  {
    slug: 'cdad',
    term: 'CDAD',
    definition:
      'Conseil départemental de l’accès au droit. Dans chaque département, il organise l’information juridique gratuite : il coordonne les points-justice et mène des actions pour faire connaître ses droits, par exemple dans les écoles ou lors d’événements.',
    aliases: ['conseil départemental de l’accès au droit'],
    related: ['point-justice'],
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
