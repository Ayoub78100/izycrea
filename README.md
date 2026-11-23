# IzyCréa

La boîte à outils des consultants qui accompagnent des créateurs d'entreprise.

C'est un site statique : du HTML, du CSS et du JavaScript, sans serveur ni base de données. Tous les calculs se font dans le navigateur.

## Contenu

- `index.html` : la page unique du site, qui navigue par `#/…`.
- `style.css` : le design (thème clair et animations).
- `app.js` : la navigation, la recherche et les pages de contenu.
- `tools.js` : les outils (prévisionnel micro, prévisionnel complet, business model canvas, dossier de présentation), avec les exports Excel et PDF.
- `fiches.js` : la base de connaissances. **Pour ajouter ou mettre à jour une fiche, c'est ce fichier qu'on modifie.**
- `ressources.js` : l'annuaire des dossiers métiers et les liens utiles.
- `xlsx.full.min.js` : la bibliothèque SheetJS qui sert aux exports Excel.

## Mettre en ligne sur Vercel

1. Sur GitHub, créer un dépôt vide, par exemple `izycrea`.
2. Sur la page du dépôt, cliquer sur **uploading an existing file**. Glisser tous les fichiers du dossier, puis cliquer sur **Commit changes**.
3. Sur vercel.com : **Add New… → Project**, choisir le dépôt `izycrea`, puis **Deploy**. Il n'y a rien à configurer : pas de framework, pas de commande de build.
4. Ensuite, chaque modification poussée sur GitHub est déployée automatiquement.

## Mettre à jour les chiffres

Les taux et seuils 2026 se trouvent :
- dans `fiches.js`, pour les fiches ;
- dans `tools.js`, objet `ACT`, pour les taux de cotisations, abattements, versement libératoire et seuils micro et TVA du prévisionnel micro.

Après chaque mise à jour, changer la date `maj` de la fiche concernée.
