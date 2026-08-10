import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Lazy loading des contrôleurs
const SessionController = () => import('#controllers/session_controller')
const NewAccountController = () => import('#controllers/new_account_controller')
const EtablissementsController = () => import('#controllers/etablissements_controller')
const ProduitsController = () => import('#controllers/produits_controller')
const CommandesController = () => import('#controllers/commandes_controller')
const DemandesServicesController = () => import('#controllers/demandes_services_controller')
const UploadsController = () => import('#controllers/uploads_controller')
const AiController = () => import('#controllers/ai_controller')
const MediasController = () => import('#controllers/medias_controller')

/* 
========================================================================== 
1. VUES ET AFFICHAGE WEB (PAGE PAR PAGE)
========================================================================== 
*/

router.on('/').render('pages/bienvenue').as('web.bienvenue')
router.on('/authentification').render('pages/authentification').as('web.authentification')
router.on('/connexion').render('pages/connexion').as('web.connexion')
router.on('/inscription').render('pages/inscription').as('web.inscription')
router.on('/accueil').render('pages/accueil').as('web.accueil')

// Gestion des actualités
router.get('/actualite', [MediasController, 'index']).as('web.actualite')
router.get('/actualite/creer', [MediasController, 'create']).as('web.actualite.create')
router.post('/actualite', [MediasController, 'store']).as('web.actualite.store')

// Route pour la page de recherche interactive (Sidebar)
router.get('/recherche', [AiController, 'index']).as('web.recherche')

// Route pour afficher la page des notifications et demandes (Sidebar)
router.get('/profil/demandes', [AiController, 'notifications']).as('notifications.index').use(middleware.auth())

// Route pour afficher le profil de l'utilisateur connecté
router.get('/profil', [MediasController, 'profil']).as('web.profil')

router.on('/profil/personnel').render('profils/personnel').as('profil.personnel')
router.on('/profil/entreprise').render('profils/entreprise').as('profil.entreprise')
router.on('/profil/administration').render('profils/administration').as('profil.administration')


/* 
========================================================================== 
2. ACTIONS WEB (FORMULAIRES POST / LOGOUT)
========================================================================== 
*/

router.group(() => {
  router.post('/login', async ({ response }) => {
    return response.ok({ message: 'Connexion réussie !' })
  }).as('web.session.store')

  router.post('/register', async ({ request, response }) => {
    const typeCompte = request.input('type_compte')

    if (typeCompte === 'personnel') {
      return response.redirect().toRoute('profil.personnel')
    } else if (typeCompte === 'entreprise_agence') {
      return response.redirect().toRoute('profil.entreprise')
    } else if (typeCompte === 'administration_publique') {
      return response.redirect().toRoute('profil.administration')
    }

    return response.redirect().toRoute('web.accueil')
  }).as('web.new_account.store')

  router.post('/logout', async ({ response }) => {
    return response.redirect().toRoute('web.connexion')
  }).as('auth.logout')
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