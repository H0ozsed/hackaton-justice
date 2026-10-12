# Parcours utilisateurs

### `/`

* **Choix parcours utilisateurs (sim, mes, app)**
* **Navbar**
* **Footer**
* **Infos pratiques**
* **FAQ**
* **Chatbot**

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

* Chatbot
* Questionnaires évaluatif
* FAQ
* Infos pratiques
* Lexique

