# Lot & Date

Application statique de traçabilité alimentaire, en français, compatible GitHub Pages. Aucun compte ni clé API. Les photos sont lues localement avec Tesseract.js 5.1.1 (français + anglais), chargé depuis un CDN à la demande.

## Fonctionnement

Photos multiples (8 maximum, 10 Mo par photo), lecture OCR, proposition d’intitulé/lot/date lorsque le texte est identifiable, classification par mots-clés, vérification humaine obligatoire, fiches modifiables, suivi d’ouverture, utilisation, blocage/retrait, historique, dossiers virtuels par mois et catégorie, recherche, filtres, alertes à l’ouverture, sauvegarde JSON avec photos et export CSV.

Les informations que le programme ne peut pas identifier restent à remplir. Marque, fournisseur et quantité sont saisis manuellement. Les échéances après ouverture sont définies par l’utilisateur. Les alertes distinguent DLC et DDM dans la fiche mais le compteur inclut toutes les échéances. Aucun rappel en arrière-plan ni contrôle sanitaire automatisé.

## Données

IndexedDB conserve les fiches et les photos originales dans le navigateur, pour l’origine du site. Elles ne sont ni publiées dans le dépôt, ni envoyées à un serveur. Il n’y a pas de synchronisation entre appareils. Effacer les données du navigateur, changer de domaine ou utiliser un autre navigateur rend ces fiches inaccessibles. Exporter régulièrement une sauvegarde JSON. Le CSV n’inclut pas les photos et ne peut pas être réimporté.

Le service worker conserve l’interface après une première visite réussie. La saisie et la consultation sont utilisables hors connexion, mais le chargement de l’OCR peut nécessiter Internet. Les polices ont un repli système.

## GitHub Pages

Publier le contenu de ce dossier dans un dossier dédié du dépôt, par exemple `tracabilite/`, et activer GitHub Pages depuis la branche concernée. Les chemins sont relatifs et fonctionnent sous un sous-dossier. Ne pas remplacer un site existant sans l’examiner. Pour une publication via Actions, le workflow doit embarquer ce dossier dans son artefact.

## Vérification locale

Servir ce dossier avec un serveur HTTP (pas en ouvrant directement index.html). Exemple : `npx serve .`. Pour les tests de logique : `node --test ../../work/logic.test.mjs` depuis ce dossier dans le workspace initial.

## Limites

L’historique est informatif et modifiable avec la sauvegarde ou les outils du navigateur ; ce n’est pas un journal audité. Pour le travail en équipe, un historique attribué à chaque utilisateur et des sauvegardes centralisées, prévoir une base de données et une authentification. Ne jamais insérer une clé secrète dans les fichiers GitHub Pages.
