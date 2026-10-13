import type { ScenarioInput } from '../schema'

// Level 1, respondent: the same building, seen from upstairs. The player is M. Martin, the
// drummer, and receives the complaint.
// Legal references: bruits de voisinage, art. R. 1336-5 du code de la santé publique (no noise
// may disturb the neighbours by its duration, repetition or intensity, day or night); tentative
// amiable obligatoire, art. 750-1 CPC. To be proofread by the content team before the demo.
export const batteurDuDessus: ScenarioInput = {
  slug: 'batteur-du-dessus',
  title: 'Le batteur du dessus',
  summary:
    'Cette fois, c’est vous qui faites du bruit. Comment réagir quand une voisine vient se plaindre ?',
  level: 1,
  perspective: 'respondent',
  playerId: 'martin',
  intro:
    'Vous êtes M. Martin et la batterie est votre passion. Un soir, votre voisine du dessous frappe à votre porte. Saurez-vous écouter un reproche et trouver un terrain d’entente ?',
  opening: [
    {
      shot: 'street',
      text: 'Un soir, dans un immeuble tranquille. Vous êtes M. Martin, au troisième étage, et la batterie, c’est votre façon de décompresser.',
    },
    {
      shot: 'cutaway',
      text: 'Ce que vous ne savez pas : sous vos pieds, chaque coup de grosse caisse traverse le plancher.',
    },
  ],
  characters: [
    { id: 'martin', name: 'M. Martin', role: 'Vous, batteur amateur', avatar: 'neighbor' },
    { id: 'camille', name: 'Camille', role: 'Votre voisine du dessous', avatar: 'player' },
    { id: 'diallo', name: 'Mme Diallo', role: 'La gardienne', avatar: 'relative' },
    { id: 'roche', name: 'Mme Roche', role: 'Conciliatrice de justice', avatar: 'official' },
  ],
  startSceneId: 'repetition',
  scenes: [
    // ---- Scene 1 -----------------------------------------------------------------
    {
      id: 'repetition',
      setting: 'Chez vous, un mardi, 22 h 30',
      location: 'music-room',
      period: 'night',
      lines: [
        {
          text: 'Vous répétez pour le concert de samedi. Le morceau commence enfin à sonner.',
          effect: 'drums',
        },
        { text: 'On frappe à la porte.', effect: 'knock' },
        {
          speaker: 'camille',
          text: 'Bonsoir… Je suis votre voisine du dessous. Depuis des semaines, j’entends la batterie tous les soirs, parfois jusqu’à minuit. Je n’arrive plus à dormir.',
          emotion: 'tired',
        },
        {
          speaker: 'martin',
          text: 'Ah… Je ne pensais pas que ça s’entendait autant.',
          emotion: 'surprised',
        },
      ],
      choices: [
        {
          id: 'ecouter',
          label: 'L’écouter, puis lui proposer de trouver ensemble des horaires',
          next: 'horaires',
          quality: 'good',
          action: 'talk',
          feedback:
            'Écouter sans se justifier tout de suite désamorce le conflit. Votre voisine se sent prise au sérieux, et vous gardez la main sur la solution.',
        },
        {
          id: 'chez-moi',
          label: 'Répondre que vous êtes chez vous et que vous jouez quand vous voulez',
          next: 'lettre',
          quality: 'bad',
          action: 'threaten',
          feedback:
            'Être chez soi ne donne pas le droit de gêner ses voisins : aucun bruit ne doit, par sa durée, sa répétition ou son intensité, troubler leur tranquillité, de jour comme de nuit (article R. 1336-5 du code de la santé publique). Le [[trouble-anormal-de-voisinage|trouble anormal de voisinage]] engage votre responsabilité même sans faute.',
          losses: { relationship: 4 },
        },
        {
          id: 'promettre',
          label: 'Promettre de faire attention, sans rien changer',
          next: 'ca-continue',
          quality: 'bad',
          action: 'wait',
          feedback:
            'Une promesse vague rassure un soir, puis déçoit. Quand le bruit revient, la confiance est perdue et votre voisine se tourne vers des démarches plus formelles.',
          losses: { relationship: 2 },
        },
      ],
    },

    // ---- Scene 2 -----------------------------------------------------------------
    {
      id: 'horaires',
      setting: 'Sur le palier, le lendemain soir',
      location: 'landing',
      period: 'evening',
      lines: [
        {
          speaker: 'camille',
          text: 'Merci de m’avoir écoutée hier. Je ne veux pas vous empêcher de jouer, juste dormir.',
          emotion: 'happy',
        },
        {
          speaker: 'martin',
          text: 'Je comprends. Qu’est-ce qui vous irait ?',
        },
        {
          speaker: 'camille',
          text: 'Je me couche vers 22 h en semaine. Le week-end, c’est plus souple.',
        },
      ],
      choices: [
        {
          id: 'planning',
          label:
            'Proposer un accord précis : pas de batterie après 21 h en semaine, un tapis anti-vibrations, et vous en reparlez dans un mois',
          next: 'fin-entente',
          quality: 'good',
          action: 'agree',
          feedback:
            'Un accord précis (des horaires, un geste concret, un point d’étape) évite les malentendus. Écrivez-le dans un court message que vous gardez tous les deux.',
          losses: { money: 60 },
        },
        {
          id: 'electronique',
          label: 'Proposer de jouer le soir sur une batterie électronique, au casque',
          next: 'fin-entente',
          quality: 'ok',
          action: 'agree',
          feedback:
            'C’est une vraie solution, mais plus coûteuse, et une batterie électronique transmet encore des vibrations par le sol : prévoyez aussi des horaires.',
          losses: { money: 400 },
        },
      ],
    },

    // ---- Scene 3 -----------------------------------------------------------------
    {
      id: 'lettre',
      setting: 'Dans le hall, deux semaines plus tard',
      location: 'lobby',
      period: 'day',
      lines: [
        {
          speaker: 'diallo',
          text: 'Monsieur Martin, une lettre recommandée pour vous. Votre voisine du dessous est passée me voir, elle était à bout.',
        },
        {
          text: 'Dans la lettre, votre voisine vous propose de rencontrer un [[conciliateur-de-justice|conciliateur de justice]], gratuitement, au [[point-justice|point-justice]] du quartier.',
          effect: 'paper',
        },
      ],
      choices: [
        {
          id: 'accepter-conciliation',
          label: 'Accepter le rendez-vous chez la conciliatrice',
          next: 'conciliation',
          quality: 'good',
          action: 'appointment',
          feedback:
            'Accepter la [[conciliation]], c’est garder la possibilité de décider vous-même de la solution, gratuitement. Refuser ne fait que repousser le problème devant un juge.',
          losses: { time: 2 },
        },
        {
          id: 'ignorer',
          label: 'Ignorer la lettre',
          next: 'fin-tribunal',
          quality: 'bad',
          action: 'wait',
          feedback:
            'Ignorer une proposition amiable ne l’annule pas : votre voisine pourra montrer au juge qu’elle a tenté l’amiable. C’est à vous que le refus sera reproché.',
          losses: { relationship: 3, money: 1500, time: 20 },
        },
      ],
    },

    // ---- Scene 4 -----------------------------------------------------------------
    {
      id: 'ca-continue',
      setting: 'Chez vous, un mois plus tard',
      location: 'music-room',
      period: 'night',
      lines: [
        {
          text: 'Vous jouez un peu moins fort… mais toujours tard. Un soir, une lettre est glissée sous votre porte.',
          effect: 'paper',
        },
        {
          text: 'Votre voisine vous propose de rencontrer une conciliatrice de justice pour trouver un accord.',
        },
      ],
      choices: [
        {
          id: 'accepter',
          label: 'Accepter la conciliation',
          next: 'conciliation',
          quality: 'good',
          action: 'appointment',
          feedback:
            'Mieux vaut tard que jamais : la conciliation permet de repartir sur de bonnes bases, sans frais.',
          losses: { time: 2 },
        },
        {
          id: 'menacer',
          label: 'Lui répondre que si elle insiste, vous porterez plainte pour harcèlement',
          next: 'fin-tribunal',
          quality: 'bad',
          action: 'threaten',
          feedback:
            'Une demande polie de trouver un accord n’est pas du harcèlement. Menacer ferme la porte au dialogue et pousse votre voisine vers le tribunal.',
          losses: { relationship: 4, money: 1500, time: 20 },
        },
      ],
    },

    // ---- Scene 5 -----------------------------------------------------------------
    {
      id: 'conciliation',
      setting: 'Au point-justice, permanence de la conciliatrice',
      location: 'point-justice',
      period: 'day',
      lines: [
        {
          speaker: 'roche',
          text: 'Je ne suis pas là pour juger, mais pour vous aider à trouver un accord. Chacun va pouvoir s’exprimer.',
        },
        {
          speaker: 'camille',
          text: 'Je n’ai rien contre la musique. Mais je travaille tôt, et je ne dors plus.',
          emotion: 'sad',
        },
        {
          speaker: 'roche',
          text: 'Monsieur Martin, qu’est-ce que vous pourriez proposer ?',
        },
      ],
      choices: [
        {
          id: 'compromis',
          label: 'Proposer des horaires et isoler votre pièce de répétition',
          next: 'fin-accord',
          quality: 'good',
          action: 'agree',
          feedback:
            'Proposer vous-même une solution montre votre bonne foi. La conciliatrice peut l’écrire dans un [[constat-d-accord|constat d’accord]] que vous signez tous les deux.',
          losses: { money: 300 },
        },
        {
          id: 'rien',
          label: 'Refuser de changer quoi que ce soit',
          next: 'fin-tribunal',
          quality: 'bad',
          action: 'threaten',
          feedback:
            'Sans accord, votre voisine peut saisir le juge, preuve de la tentative de conciliation à l’appui. C’est alors le juge qui fixe les règles, et pas vous.',
          losses: { relationship: 3, money: 1500, time: 20 },
        },
      ],
    },

    // ---- Endings -------------------------------------------------------------------
    {
      id: 'fin-entente',
      setting: 'Le samedi suivant',
      location: 'landing',
      period: 'evening',
      lines: [
        {
          text: 'Vous jouez avant 21 h, sur votre tapis. Votre voisine dort. Samedi, elle est même venue à votre concert.',
        },
        { speaker: 'camille', text: 'Vous jouez vraiment bien, finalement !', emotion: 'happy' },
      ],
      ending: { title: 'Entente entre voisins' },
    },
    {
      id: 'fin-accord',
      lines: [
        {
          text: 'Vous signez un constat d’accord : pas de batterie après 21 h en semaine et une pièce mieux isolée. Personne n’a perdu la face.',
          effect: 'paper',
        },
        { speaker: 'roche', text: 'Chacun repart avec un exemplaire. Bonne continuation !' },
      ],
      location: 'point-justice',
      period: 'day',
      ending: { title: 'Accord chez la conciliatrice' },
    },
    {
      id: 'fin-tribunal',
      location: 'courthouse',
      period: 'day',
      lines: [
        {
          text: 'Votre voisine saisit le tribunal, avec un constat de [[commissaire-de-justice|commissaire de justice]] et la preuve de sa tentative amiable.',
          effect: 'paper',
        },
        {
          text: 'Si le juge reconnaît un trouble anormal de voisinage, il peut vous ordonner de cesser le bruit et vous condamner à verser des dommages et intérêts, en plus des frais de procédure.',
        },
      ],
      ending: { title: 'Devant le juge' },
    },
  ],
}
