# Activation ultérieure des notifications push

La version actuelle fonctionne sans Firebase. Les alertes et leur historique sont locaux. Elles sont créées à l’ouverture du site, après une modification de fiche, au retour sur l’onglet et chaque minute tant que la page est visible. Elles ne sont pas envoyées au téléphone lorsque le site est fermé. Les journées où le site n’est pas utilisé ne génèrent pas de fausses entrées d’historique.

Le délai est configurable de 3 à 30 jours, avec un rappel par lot, échéance et jour. Les lots utilisés, bloqués ou retirés ne génèrent plus de nouveaux rappels. L’historique conserve les alertes déjà créées, y compris si la fiche est supprimée. Les copies de sauvegarde JSON contiennent désormais cet historique et le délai configuré ; les anciennes sauvegardes restent compatibles.

## Éléments à configurer pour Firebase

1. Créer un projet Firebase et une application Web. Ajouter `wohlstandy.github.io` dans les domaines autorisés de Firebase Authentication.
2. Activer une méthode de connexion (par exemple Google), Firestore et Firebase Cloud Messaging. Générer une paire de clés VAPID Web Push.
3. Ajouter les paramètres publics de l’application Web et la clé VAPID dans une configuration publique. Aucun compte de service ou clé privée dans le dépôt GitHub.
4. Ajouter au site la connexion et un bouton explicite « Activer les notifications ». Après un clic, demander l’autorisation et enregistrer un jeton FCM lié à l’utilisateur et à l’appareil. Utiliser le service worker existant, via `getToken({vapidKey,serviceWorkerRegistration})`, plutôt que créer deux service workers concurrents.
5. Synchroniser les seuls champs utiles aux rappels : identifiant de fiche, produit, lot, catégorie, dates, état, délai et fuseau horaire. Les photos peuvent rester locales. Les règles Firestore doivent limiter les accès au propriétaire de chaque espace ; ne pas ouvrir la base à tout le monde.
6. Déployer une fonction planifiée authentifiée (facturation Blaze nécessaire pour les fonctions), exécutée chaque matin, avec fuseau `Europe/Paris`. Elle crée une entrée d’historique par lot / échéance / jour et transmet une notification FCM. Prévoir les reprises d’envoi, les jetons expirés et la suppression d’abonnement. La planification ne peut pas fonctionner uniquement en ajoutant les paramètres Firebase au HTML.
7. Distinguer « créée », « envoi accepté », « échec » et « lue dans l’application ». Un succès de l’API FCM ne prouve pas qu’une notification a été affichée ou lue. Ne pas enregistrer « envoyée » pour une simple alerte locale.
8. À la réception, afficher la notification en arrière-plan ; au clic, ouvrir la fiche correspondante et mettre à jour son statut de lecture. Synchroniser l’historique dans Firestore pour le retrouver sur plusieurs appareils.

Sur iPhone compatible, installer le site sur l’écran d’accueil avant de demander l’autorisation Web Push. Le manifeste est déjà ajouté, mais l’envoi push et le SDK Firebase restent volontairement désactivés jusqu’à leur configuration complète.

Références officielles :
- https://firebase.google.com/docs/cloud-messaging/web/get-started
- https://firebase.google.com/docs/cloud-messaging/web/receive-messages
- https://firebase.google.com/docs/functions/schedule-functions
