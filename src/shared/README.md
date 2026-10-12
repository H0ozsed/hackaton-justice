# Contenus du site

Ce dossier contient tout le contenu « figé » du site : lexique, FAQ, infos pratiques,
types de conflit, canaux d'orientation, quiz. **Tu ne modifies que les fichiers `data.ts`.**

| Contenu                                          | Fichier                                    |
| ------------------------------------------------ | ------------------------------------------ |
| Lexique                                          | `glossary/data.ts`                         |
| FAQ                                              | `faq/data.ts`                              |
| Infos pratiques                                  | `practical-info/data.ts`                   |
| Types de conflit (simulation)                    | `simulation/data.ts` → `conflictTypesData` |
| Canaux d'orientation (résultat de la simulation) | `simulation/data.ts` → `channelsData`      |
| Quiz                                             | `quiz/data.ts`                             |

Les entrées actuelles sont des **EXEMPLES** à remplacer.

## Ajouter une entrée

1. Copie une entrée existante du fichier et modifie-la.
2. Donne-lui un `slug` unique : minuscules, mots séparés par des tirets, sans accent
   (`conciliateur-de-justice`). Il sert à faire référence à l'entrée ailleurs ; ne le change
   plus une fois utilisé.
3. Dans VS Code, l'autocomplétion propose les champs possibles et souligne en rouge ce qui
   manque ou est mal écrit (survole le soulignement pour lire l'erreur).
4. Vérifie avec `npm run content:check`. Ce contrôle tourne aussi automatiquement au commit
   et au build : un contenu invalide les bloque, avec un message qui dit quelle entrée et
   quel champ corriger.

## Points d'attention

- **Références** : dans le lexique (`related`) et les quiz (`glossary`), on cite des termes
  du lexique par leur `slug`. Le terme cité doit exister.
- **Types de conflit** : `lossKinds` liste les pertes à demander (`money`, `time`, `health`,
  `relationship`) ; `followUpQuestions` ajoute des questions propres à ce type
  (`kind: 'choice'`, `'number'` ou `'yesNo'`). Le formulaire s'adapte tout seul.
- **Quiz** : une seule bonne réponse dans `correctChoiceIds` → boutons radio ; plusieurs →
  cases à cocher.
- **FAQ** : `pages` indique où la question s'affiche (`home` = accueil, `learn` = Apprendre).

Structure technique du dossier : [`docs/STRUCTURE.md`](../../docs/STRUCTURE.md).
