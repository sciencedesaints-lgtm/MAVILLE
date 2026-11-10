import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Lazy loading des contrôleurs
const SessionController = () => import('#controllers/session_controller')
const NewAccountController = () => import('#controllers/new_account_controller')
const ConditionsController = () => import('#controllers/conditions_controller')
const MembresController = () => import('#controllers/membres_controller')
const OffresController = () => import('#controllers/offres_controller')
const EtablissementsController = () => import('#controllers/etablissements_controller')
const AnnoncesController = () => import('#controllers/annonces_controller')
const PublicationsController = () => import('#controllers/publications_controller')
const CorbeilleController = () => import('#controllers/corbeille_controller')
const CommercesController = () => import('#controllers/commerces_controller')
const ProduitsController = () => import('#controllers/produits_controller')
const CommandesController = () => import('#controllers/commandes_controller')
const DemandesServicesController = () => import('#controllers/demandes_services_controller')
const ResultatsController = () => import('#controllers/resultats_controller')
const UploadsController = () => import('#controllers/uploads_controller')
const AiController = () => import('#controllers/ai_controller')
const MediasController = () => import('#controllers/medias_controller')
const ProfilsController = () => import('#controllers/profils_controller')

/* 
========================================================================== 
1. VUES ET AFFICHAGE WEB (PAGE PAR PAGE)
========================================================================== 
*/

router.on('/').render('pages/bienvenue').as('web.bienvenue')
router.on('/authentification').render('pages/authentification').as('web.authentification')
router.get('/connexion', async ({ view }) => {
  return view.render('pages/connexion')
}).as('web.connexion')
router.on('/inscription').render('pages/inscription').as('web.inscription')
router.on('/accueil').render('pages/accueil').as('web.accueil').use(middleware.auth())
router.on('/login').render('pages/connexion').as('web.login.form')

// Gestion des actualités
router.get('/actualite', [MediasController, 'index']).as('web.actualite')
router.get('/actualite/creer', [MediasController, 'create']).as('web.actualite.create')
router.post('/actualite', [MediasController, 'store']).as('web.actualite.store')

// Route pour la page de recherche interactive (Sidebar)
router.get('/recherche', [AiController, 'index']).as('web.recherche')

// Route pour afficher la page des notifications et demandes (Sidebar)
router.get('/profil/demandes', [AiController, 'notifications']).as('notifications.index').use(middleware.auth())

// Route principale pour afficher le profil de l'utilisateur connecté (redirection intelligente selon le rôle)
router.get('/profil', [MediasController, 'profil']).as('web.profil')

// Routes spécifiques gérées par le ProfilsController (protégées par l'auth)
router.group(() => {
  router.get('/profil/personnel', [ProfilsController, 'personnel']).as('profil.personnel')
  router.get('/profil/entreprise', [ProfilsController, 'entreprise']).as('profil.entreprise')
  router.get('/profil/administration', [ProfilsController, 'administration']).as('profil.administration')
}).use(middleware.auth())

router.group(() => {
  router.get('/offres', [OffresController, 'choisir']).as('offres.choisir')
  router.get('/offres/creer', [OffresController, 'create']).as('offres.create')
  router.post('/offres', [OffresController, 'store']).as('offres.store')
  router.get('/commerces/creer', [CommercesController, 'create']).as('commerces.create')
  router.post('/commerces', [CommercesController, 'store']).as('commerces.store')
  router.get('/annonces/creer', [AnnoncesController, 'create']).as('annonces.create')
  router.post('/annonces', [AnnoncesController, 'store']).as('annonces.store')
  router.get('/resultats', [ResultatsController, 'index']).as('resultats.index')
  router.get('/mes-publications', [PublicationsController, 'index']).as('publications.index')
  router.post('/publications/:type/:id/basculer', [PublicationsController, 'basculer']).as('publications.basculer')
  router.post('/publications/:type/:id/supprimer', [PublicationsController, 'supprimer']).as('publications.supprimer')
  router.get('/membre/:id', [MembresController, 'show']).as('membre.show')
  router.get('/corbeille', [CorbeilleController, 'index']).as('corbeille.index')
  router.post('/resultats/masquer', [CorbeilleController, 'masquer']).as('resultats.masquer')
  router.post('/corbeille/:id/restaurer', [CorbeilleController, 'restaurer']).as('corbeille.restaurer')
}).use(middleware.auth())

// Conditions d'utilisation (après l'inscription, utilisateur connecté)
router.group(() => {
  router.get('/conditions', [ConditionsController, 'show']).as('web.conditions')
  router.post('/conditions', [ConditionsController, 'accept']).as('web.conditions.accept')
}).use(middleware.auth())

/* 
========================================================================== 
2. ACTIONS WEB (FORMULAIRES POST / LOGOUT)
========================================================================== 
*/

router.group(() => {
  router.post('/login', [SessionController, 'store']).as('web.session.store')

  // Inscription Web déléguée à NewAccountController (nettoyée et centralisée)
  router.post('/register', [NewAccountController, 'store']).as('web.new_account.store')

  router.post('/logout', [SessionController, 'destroy']).as('auth.logout')
})

/* ========================================== */
/* ROUTES AUTHENTIFICATION GOOGLE (ALLY)     */
/* ========================================== */

router.get('/auth/google', async ({ ally }) => {
  return ally.use('google').redirect()
}).as('auth.google')

router.get('/auth/google/callback', async ({ ally, response }) => {
  const google = ally.use('google')

  if (google.accessDenied()) {
    return response.redirect().toRoute('web.connexion')
  }

  if (google.hasError()) {
    return response.badRequest("Erreur lors de l'authentification avec Google")
  }

  return response.redirect().toRoute('web.accueil')
}).as('auth.google.callback')

/* 
========================================================================== 
3. API BACKEND MAVILLE (/api/v1)
========================================================================== 
*/

router.group(() => {

  /* --- API PUBLIQUE --- */
  router.post('/auth/register', [NewAccountController, 'store'])
  router.post('/auth/login', [SessionController, 'store'])

  router.get('/etablissements', [EtablissementsController, 'index'])
  router.get('/etablissements/:id', [EtablissementsController, 'show'])

  router.get('/produits', [ProduitsController, 'index'])
  router.get('/produits/:id', [ProduitsController, 'show'])

  // Recherche IA Publique (Nom explicite unique)
  router.post('/ai/search', [AiController, 'search']).as('api.ai.search')

  /* --- API PROTÉGÉE (JWT / Auth requise) --- */
  router.group(() => {
    router.delete('/auth/logout', [SessionController, 'destroy'])

    // --- MISE À JOUR AVATAR PROFIL ---
    router.post('/profil/avatar', [ProfilsController, 'updateAvatar']).as('api.profil.avatar')

    // --- RECHERCHE MULTICRITÈRE & GÉOLOCALISATION ---
    router.post('/recherches', [AiController, 'search']).as('api.recherches.store')

    // Gestion des réponses aux notifications (Approuver / Décliner)
    router.patch('/notifications/:id/repondre', [AiController, 'repondreDemande']).as('api.notifications.repondre')

    // Uploads
    router.post('/uploads/image', [UploadsController, 'uploadImage'])
    router.post('/uploads/video', [UploadsController, 'uploadVideo'])

    // Gestion Établissements
    router.post('/etablissements', [EtablissementsController, 'store'])
    router.put('/etablissements/:id', [EtablissementsController, 'update'])

    // Gestion Produits
    router.post('/produits', [ProduitsController, 'store'])
    router.put('/produits/:id', [ProduitsController, 'update'])

    // Commandes & Ventes
    router.get('/commandes', [CommandesController, 'index'])
    router.post('/commandes', [CommandesController, 'store'])
    router.patch('/commandes/:id/statut', [CommandesController, 'updateStatus'])

    // Services & Prestataires
    router.get('/demandes-services', [DemandesServicesController, 'index'])
    router.post('/demandes-services', [DemandesServicesController, 'store'])
    router.patch('/demandes-services/:id/statut', [DemandesServicesController, 'updateStatus'])
  }).use(middleware.auth())

}).prefix('/api/v1')