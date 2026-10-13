# Parcours utilisateurs

### `/`

* **Bandeau** : à quoi sert le site en une phrase (aussi meta description), lien « Par où commencer ? »
* **L'amiable en 1 minute** : 4 cartes (régler à l'amiable, voies possibles, pourquoi essayer d'abord, qui peut aider), termes du lexique cliquables ; contenu à valider (#120)
* **Par où commencer ?** : seule entrée vers les 3 parcours sur l'accueil ; la phrase qui correspond au visiteur mène en un clic au bon parcours (description et bouton du parcours)
  * Conflit en cours → Ma situation ?
  * Comprendre avant d'agir → Mise en situation
  * Apprendre, seul ou en groupe (classe, atelier) → Apprendre
* **À propos** : pour qui, ce qui rend le site différent, ce qu'il n'est pas (ni avocat, ni démarche officielle, aucune décision)
* **Navbar**
* **Footer**
* **Infos pratiques**
* **FAQ**
* **Chatbot : IRIS** (Identifier, Rechercher, Informer, Suggérer), « votre assistante »
  * Bouton flottant → panneau accessible (focus, Échap, réponses annoncées aux lecteurs d'écran)
  * Répond uniquement à partir du contenu du site (accueil : l'amiable en 1 minute, par où commencer, à propos ; FAQ, infos pratiques, lexique, types de conflit, interlocuteurs, quiz), avec ses sources
  * Rien de pertinent → « Je n'ai pas cette information », sans appeler le modèle
  * Informe et oriente, ne garantit rien, pas de conseil juridique personnalisé
  * Étapes affichées en direct (recherche, lecture des extraits, rédaction), réponse courte et mise en forme (listes, gras), jamais le raisonnement du modèle
  * Arrêter une réponse, la copier, réessayer après une erreur, compteur de caractères
  * Questions suggérées (accueil : alignées sur « L'amiable en 1 minute », puis FAQ), relances comprises (historique), termes du lexique cliquables
  * Conversation gardée dans l'onglet uniquement (sessionStorage), rien stocké côté serveur
  * Modèle local (Ollama dans Docker) ; site utilisable si IRIS est indisponible

### `/`simulation : « Ma situation ? »

* Nom du parcours choisi après le retour des coachs du 13 oct. (#101) ; l'URL reste `/simulation`
* **Écran d'introduction** « Comment ça marche ? » : les 4 étapes, environ 3 minutes, rien envoyé ni enregistré, orientation indicative ; bouton « Commencer » qui place le focus sur la première question
* **Formulaires adaptatifs** (progression « Étape X sur N », bouton « Précédent », aide sous chaque question : ce qui est demandé et pourquoi)
  * Type de conflit : voisinage, professionnel (consommation), logement, argent entre particuliers, famille (séparation, enfants, pension, succession, grands-parents, parent âgé), travail, administration, école
  * Estimation des pertes/fréquences
  * Ouverture à la discussion
  * Résultat : **la personne choisit sa solution**, rien n'est choisi pour elle (retour des coachs du 13 oct.)
    * « À savoir d'abord » selon le conflit : violences (17, 112, 3919, 119), harcèlement scolaire (3018), délais (12 mois pour une rupture du contrat de travail, 2 mois devant le juge administratif)
    * Tentative amiable obligatoire (art. 750-1 CPC) quand elle s'applique ; une simple discussion ne suffit pas
    * « Qui peut vous aider ? » : les solutions du type de conflit, par catégorie (Se parler, Conciliation, Médiation, Autres recours amiables, Le juge), chacune avec « C'est pour vous si… » et son coût
    * Une fois choisie : d'abord **ce que dit la loi** (statut, conditions, diplôme, textes cités), puis litiges traités et exclus, comment y accéder, coût, valeur de l'accord, contact et sources officielles
  * Encadré « Besoin d'en parler avant de choisir ? » : points-justice et CDAD, information gratuite (#94)

### `/`mise-en-situation

* Liste des mises en situation par niveau (nuit #80) : niveau 1 découvrir, 2 approfondir, 3 maîtriser ; chaque carte donne le point de vue (vous subissez le trouble / on vous reproche le trouble / vous êtes le médiateur), un résumé sans spoiler, une vignette en pixel art et le meilleur score gardé sur l'appareil (localStorage)
  * Le voisin du dessus (niveau 1, vous subissez) ; Le batteur du dessus (niveau 1, on vous reproche le bruit) ; Le colis fantôme (niveau 2, litige de consommation, médiateur de la consommation) ; Les vacances de Léo (niveau 2, parents séparés, médiation familiale, l'enfant hors du conflit) ; La médiation du dépôt de garantie (niveau 3, vous êtes le médiateur : cadre, reformulation, besoins, accord écrit)
* Chaque mise en situation a sa page : `/mise-en-situation/[slug]`
* Pokemon like
  * Autonomie pendant la demo
    * Intro (personnages) → scènes : dialogues en texte progressif (passable, instantané si `prefers-reduced-motion`) → choix → scène suivante → fin
    * Ouverture animée sans spoiler : écran titre (la rue la nuit, titre en pixel art), puis plans enchaînés avec légendes (« Suivant », « Commencer » à tout moment) ; les personnages ne sont pas présentés d'avance, leur rôle s'affiche la première fois qu'ils parlent
    * Répliques en bulles de BD sur la scène (pointe vers celui qui parle, narration en encadré), en vrai texte
    * Chaque choix est animé (Camille agit : parler, balai, téléphone, courrier, attendre, accord, menace, tribunal, rendez-vous, déménagement) avant la scène suivante, passable avec « Suivant »
    * Mini-jeu en pixel art (#76) : chaque scène jouée sur une scène illustrée (chambre, palier, escalier, hall, point-justice, tribunal, nouvel appartement) avec l'éclairage du moment (matin, journée, soir, nuit), personnages animés (visage selon l'émotion, bouche qui parle, clignement), effets (batterie, porte, papier, sommeil…), carton de titre de scène
    * Jauges de vie en haut de la scène : bien-être (stress, sommeil, fatigue), relation (sur 10), argent dépensé, temps perdu ; ce que coûte chaque choix s'affiche et est annoncé aux lecteurs d'écran
    * Son 8 bits optionnel (bouton « Son », coupé par défaut, mémorisé sur l'appareil)
    * Tout le décor est décoratif (masqué aux lecteurs d'écran) : l'information est dans le titre, les répliques et les jauges en texte ; animations coupées avec `prefers-reduced-motion`
    * Jouable entièrement au clavier, focus déplacé sur chaque nouvelle scène, répliques annoncées aux lecteurs d'écran
    * Tout reste dans le navigateur : aucun choix envoyé ni stocké
  * Bilan (%age, correction, pertes, ...)
    * Calculé à partir de l'historique des choix : score en % (bon choix = 2 pts, moyen = 1, mauvais = 0), nombre de bons choix
    * Corrections : chaque choix non optimal, son explication et le meilleur choix
    * Pertes cumulées : argent (€), temps (h), bien-être et relations (niveau aucune / faible / moyenne / forte), chacune avec une phrase qui dit ce qu'elle mesure (#97)
    * Bouton « Rejouer »
  * \* définition mot pas facile
    * Termes liés au lexique dans les répliques (`<Definition>`, popover au clic / clavier)

### `/`demarches

* Régler un litige à l'amiable (nuit #80)
  * Chiffres clés sourcés (Infostat Justice) : demandes aux conciliateurs, taux d'accord, nombre de conciliateurs, gratuité
  * Est-ce obligatoire ? Tentative amiable préalable (art. 750-1 CPC) : sommes ≤ 5 000 €, troubles de voisinage, exceptions, garder une preuve
  * Comparer les solutions : discussion, conciliation, médiation, médiation de la consommation, juge (qui aide, comment y accéder, coût, qui décide, durée, valeur de l'issue, point fort, limite)
  * Pas à pas : conciliateur, médiateur de la consommation, médiation, médiation familiale (étapes numérotées, bon à savoir, sources)
  * Liste « Préparer son rendez-vous » à cocher (rien enregistré), imprimable
  * Écrire un courrier amiable : formulaire (noms, objet, faits, demande, délai, proposer un conciliateur) → courrier courtois daté à copier ou imprimer, rien envoyé ni enregistré
  * Liens vers « Ma situation ? », « Qui peut vous aider ? » sur `/apprendre`, la mise en situation et le lexique

### `/`apprendre

* Mini-jeux (nuit #80) : « Désamorcer » (`/apprendre/desamorcer`), 8 situations du quotidien, choisir la phrase qui dit les choses sans attaquer (fait, ressenti, besoin, demande) ; jauge de tension de la discussion en texte, réaction du personnage, explication, bilan ; sans chrono
* Mini-jeu « Qui fait quoi ? » (`/apprendre/qui-fait-quoi`) : 10 phrases à attribuer au conciliateur, au médiateur et/ou au juge (cases à cocher), vérification d'un coup, score, explication par carte

* Qui peut vous aider ? : tous les tiers par catégorie, en accordéon, ce que dit la loi d'abord (conciliateur de justice, commission départementale de conciliation, conciliation aux prud'hommes, audience de règlement amiable, médiateur civil, médiateur familial et son diplôme d'État, médiateur de la consommation, médiateurs de secteur, médiateurs des administrations, médiateur de l'éducation nationale, médiation administrative, Défenseur des droits, le juge) ; mêmes données que « Ma situation ? » et IRIS
* Conciliateur ou médiateur ? (#108) : les deux comparés côte à côte (qui, accès, coût, qui décide, durée, valeur de l'accord, point fort, limite), lien vers la comparaison complète de `/demarches`
* Sensibiliser en groupe (#94) : le CDAD fait connaître l'amiable dans les écoles et lors d'événements ; questionnaires, mini-jeux et mises en situation utilisables à plusieurs
* Chatbot : IRIS, comme sur `/` (questions suggérées tirées de la FAQ de cette page)
* Questionnaires évaluatif
* FAQ
* Infos pratiques
* Lexique
  * Page dédiée `/apprendre/lexique` (lien depuis `/apprendre`, « Apprendre » reste la page courante dans la navbar)
  * Recherche sans tenir compte des accents ni des majuscules (terme et variantes), nombre de résultats annoncé
  * Index alphabétique, termes groupés par lettre, ancre par terme (`/apprendre/lexique#mediation`), liens « Voir aussi » vers les termes liés
* Sommaire en haut de page : liens vers chaque section (Conciliateur ou médiateur ?, Qui peut vous aider ?, Questionnaires, Mini-jeux, Lexique, Questions fréquentes, Infos pratiques, Sensibiliser en groupe)

