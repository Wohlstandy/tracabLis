# Lot & Date

Application statique de traçabilité alimentaire, en français, compatible GitHub Pages. Aucun compte ni clé API. Les photos sont lues localement avec Tesseract.js 5.1.1 (français + anglais), chargé depuis un CDN à la demande.

## Fonctionnement

Photos multiples (8 maximum, 10 Mo par photo), lecture OCR, proposition d’intitulé/lot/date lorsque le texte est identifiable, classification par mots-clés, vérification humaine obligatoire, fiches modifiables, suivi d’ouverture, utilisation, blocage/retrait, historique, dossiers virtuels par mois et catégorie, recherche, filtres, alertes à l’ouverture, sauvegarde JSON avec photos et export CSV.

Les informations que le programme ne peut pas identifier restent à remplir. La marque et la quantité peuvent être proposées par lecture ou via Open Food Facts ; le fournisseur est extrait uniquement si son libellé est présent. Les échéances après ouverture sont définies par l’utilisateur. Les alertes distinguent DLC et DDM dans la fiche mais le compteur inclut toutes les échéances. Les rappels locaux sont générés dès J−3 (délai configurable 3 à 30 jours), avec historique consultable et sauvegardé. Aucun push en arrière-plan ni contrôle sanitaire automatisé. Voir FIREBASE.md pour le raccordement ultérieur.

## Données

IndexedDB conserve les fiches et les photos originales dans le navigateur, pour l’origine du site. Elles ne sont ni publiées dans le dépôt, ni envoyées à un serveur. Il n’y a pas de synchronisation entre appareils. Effacer les données du navigateur, changer de domaine ou utiliser un autre navigateur rend ces fiches inaccessibles. Exporter régulièrement une sauvegarde JSON. Le CSV n’inclut pas les photos et ne peut pas être réimporté.

Le service worker conserve l’interface après une première visite réussie. La saisie et la consultation sont utilisables hors connexion, mais le chargement de l’OCR peut nécessiter Internet. Les polices ont un repli système.

## GitHub Pages

Publier le contenu de ce dossier dans un dossier dédié du dépôt, par exemple `tracabilite/`, et activer GitHub Pages depuis la branche concernée. Les chemins sont relatifs et fonctionnent sous un sous-dossier. Ne pas remplacer un site existant sans l’examiner. Pour une publication via Actions, le workflow doit embarquer ce dossier dans son artefact.

## Vérification locale

Servir ce dossier avec un serveur HTTP (pas en ouvrant directement index.html). Exemple : `npx serve .`. Pour les tests de logique : `node --test tests/*.test.mjs` depuis le dépôt.

## Limites

L’historique est informatif et modifiable avec la sauvegarde ou les outils du navigateur ; ce n’est pas un journal audité. Pour le travail en équipe, un historique attribué à chaque utilisateur et des sauvegardes centralisées, prévoir une base de données et une authentification. Ne jamais insérer une clé secrète dans les fichiers GitHub Pages.

## Identification par code-barres

Scanner le gencode EAN/UPC/GTIN avec la caméra, le lire dans une photo (avec recadrage si besoin) ou saisir ses chiffres. La clé de contrôle est vérifiée. Open Food Facts propose nom, marque et quantité sans jamais importer un lot ou une date d’expiration issus de sa fiche générique. Le code est conservé dans la fiche et les exports. La recherche nécessite Internet et transmet uniquement le code à Open Food Facts, pas les photos. Données Open Food Facts sous ODbL : https://world.openfoodfacts.org/terms-of-use

Le décodeur natif BarcodeDetector est utilisé si disponible, avec lecture ZXing-C++ WebAssembly 3.1.4 et repli ZXing Browser 0.1.5 sur les autres navigateurs. Un code flou, minuscule ou fortement déformé peut nécessiter une photo plus proche ou une saisie des chiffres.

## Lecture des étiquettes

Deux lectures : textes dispersés en couleur, puis bloc avec contraste renforcé. Le recadrage au doigt ou à la souris et la rotation ne modifient pas la photo originale. Les champs existants sont conservés sauf si l’utilisateur coche le remplacement. Le texte reconnu peut être corrigé puis reporté dans la fiche. Les numéros de lot sont proposés uniquement si un libellé lot/batch est reconnu ; les dates uniquement à proximité d’un libellé DLC/DDM/consommation. Une date isolée non qualifiée n’est pas attribuée automatiquement à la DLC.

La qualité dépend du cliché. Les tests sur les captures d’emballages réels reconnaissent partiellement produit/marque ; ils ne démontrent pas une extraction complète du lot et de la date sur des zones minuscules. Photographier la zone lot/date de près, sans reflet.

## Import et capture automatiques

Après ajout d’une photo, le site recherche automatiquement un code-barres, interroge Open Food Facts si un code est détecté, puis lit le produit, le lot et les dates. Aucun clic supplémentaire de lecture n’est nécessaire. Les champs existants sont conservés sauf remplacement explicitement demandé. Le statut d’analyse signale les champs encore manquants. Le recadrage relance la lecture automatiquement. Les boutons restent disponibles pour relancer une lecture, mais sont désactivés pendant l’analyse. Vérifier et enregistrer reste une action humaine.

## Régression sur une photographie réelle

Le test navigateur avec IMG_5048.jpg (2160 × 2880) vérifie après import seul : gencode 3661112059798, produit blanc de dinde, marque Tradilège, poids 180 g, numéro imprimé 63561177 et date 30/09/2026. La photo n’est pas ajoutée au dépôt.

La lecture conserve la résolution originale pour le code-barres. Les impressions en points sont traitées séparément : contraste local, liaison des points et essais de correction d’inclinaison sur des bandes de l’image. La région du poids est recherchée au-dessus du code-barres détecté. Aucune donnée de cet exemple n’est inscrite dans le code de lecture.

Un numéro voisin d’une date imprimée est une proposition de lot, à confirmer. Une date sans libellé n’est pas automatiquement qualifiée en DLC ou DDM ; choisir son type est obligatoire avant enregistrement. Les champs structurés sont nettoyés des caractères parasites, les unités normalisées et les numéros de lot mis en majuscules, sans substitution arbitraire O/0 ou I/1. Le texte OCR brut reste consultable.

Les erreurs et confirmations sont présentées dans des fenêtres accessibles, avec retour au champ à corriger. La fiche propose trois étapes, un indicateur d’analyse et des champs invalides visuellement signalés.

Stock : nombre entier de paquets par lot (0 à 99 999), indépendant du poids unitaire, boutons +/− et historique des mouvements. À zéro, un lot en stock passe à Utilisé ; un ajout le remet En stock, sans lever un blocage/retrait. Les anciennes fiches sans compteur affichent 1 paquet (0 si Utilisé), à vérifier. Listes habituelles nommées : modèles de produit sans lot, dates ni photo, inclus dans les sauvegardes JSON.

Le nombre de paquets est modifiable directement sur chaque ligne (validation à la sortie du champ ou avec Entrée). Le cadenas à gauche verrouille les modifications, mouvements et suppression via la fiche ; son état est conservé et inclus dans les sauvegardes. Un déverrouillage demande confirmation.
