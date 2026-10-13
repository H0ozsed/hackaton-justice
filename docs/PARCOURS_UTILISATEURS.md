# Parcours utilisateurs

### `/`

* **Choix parcours utilisateurs (sim, mes, app)**
* **Navbar**
* **Footer**
* **Infos pratiques**
* **FAQ**
* **Chatbot : IRIS** (Identifier, Rechercher, Informer, Suggérer)
  * Bouton flottant → panneau accessible (focus, Échap, réponses annoncées aux lecteurs d'écran)
  * Répond uniquement à partir du contenu du site (FAQ, infos pratiques, lexique, types de conflit, interlocuteurs, quiz), avec ses sources
  * Rien de pertinent → « Je n'ai pas cette information », sans appeler le modèle
  * Informe et oriente, ne garantit rien, pas de conseil juridique personnalisé
  * Étapes affichées en direct (recherche, lecture des extraits, rédaction), réponse courte et mise en forme (listes, gras), jamais le raisonnement du modèle
  * Arrêter une réponse, la copier, réessayer après une erreur, compteur de caractères
  * Questions suggérées, relances comprises (historique), termes du lexique cliquables
  * Conversation gardée dans l'onglet uniquement (sessionStorage), rien stocké côté serveur
  * Modèle local (Ollama dans Docker) ; site utilisable si IRIS est indisponible

### `/`simulation

* **Formulaires adaptatifs**
  * Type de conflit
  * Estimation des pertes/fréquences
  * Ouverture à la discussion
  * Redirection communication

### `/`mise-en-situation

* Pokemon like
  * Autonomie pendant la demo
    * Intro (personnages) → scènes : dialogues en texte progressif (passable, instantané si `prefers-reduced-motion`) → choix → scène suivante → fin
    * Ouverture animée sans spoiler : écran titre (la rue la nuit, titre en pixel art), puis plans enchaînés avec légendes (« Suivant », « Commencer » à tout moment) ; les personnages ne sont pas présentés d'avance, leur rôle s'affiche la première fois qu'ils parlent
    * Répliques en bulles de BD sur la scène (pointe vers celui qui parle, narration en encadré), en vrai texte
    * Chaque choix est animé (Camille agit : parler, balai, téléphone, courrier, attendre, accord, menace, tribunal, rendez-vous, déménagement) avant la scène suivante, passable avec « Suivant »
    * Mini-jeu en pixel art (#76) : chaque scène jouée sur une scène illustrée (chambre, palier, escalier, hall, mairie, tribunal, nouvel appartement) avec l'éclairage du moment (matin, journée, soir, nuit), personnages animés (visage selon l'émotion, bouche qui parle, clignement), effets (batterie, porte, papier, sommeil…), carton de titre de scène
    * Jauges de vie en haut de la scène : santé, relation (sur 10), argent dépensé, temps perdu ; ce que coûte chaque choix s'affiche et est annoncé aux lecteurs d'écran
    * Son 8 bits optionnel (bouton « Son », coupé par défaut, mémorisé sur l'appareil)
    * Tout le décor est décoratif (masqué aux lecteurs d'écran) : l'information est dans le titre, les répliques et les jauges en texte ; animations coupées avec `prefers-reduced-motion`
    * Jouable entièrement au clavier, focus déplacé sur chaque nouvelle scène, répliques annoncées aux lecteurs d'écran
    * Tout reste dans le navigateur : aucun choix envoyé ni stocké
  * Bilan (%age, correction, pertes, ...)
    * Calculé à partir de l'historique des choix : score en % (bon choix = 2 pts, moyen = 1, mauvais = 0), nombre de bons choix
    * Corrections : chaque choix non optimal, son explication et le meilleur choix
    * Pertes cumulées : argent (€), temps (h), santé et relations (niveau aucune / faible / moyenne / forte)
    * Bouton « Rejouer »
  * \* définition mot pas facile
    * Termes liés au lexique dans les répliques (`<Definition>`, popover au clic / clavier)

### `/`apprendre

* Chatbot : IRIS, comme sur `/` (questions suggérées tirées de la FAQ de cette page)
* Questionnaires évaluatif
* FAQ
* Infos pratiques
* Lexique
  * Page dédiée `/apprendre/lexique` (lien depuis `/apprendre`, « Apprendre » reste la page courante dans la navbar)
  * Recherche sans tenir compte des accents ni des majuscules (terme et variantes), nombre de résultats annoncé
  * Index alphabétique, termes groupés par lettre, ancre par terme (`/apprendre/lexique#mediation`), liens « Voir aussi » vers les termes liés
* Sommaire en haut de page : liens vers chaque section (Questionnaires, Lexique, Questions fréquentes, Infos pratiques)

