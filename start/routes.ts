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

/* 
========================================================================== 
1. VUES ET AFFICHAGE WEB (PAGE PAR PAGE)
========================================================================== 
*/

// Page de Bienvenue (Racine du site)
router.on('/').render('pages/bienvenue').as('web.bienvenue')

// Page de Sélection d'Authentification
router.on('/authentification').render('pages/authentification').as('web.authentification')

// Page de Connexion
router.on('/connexion').render('pages/connexion').as('web.connexion')

// Page d'Inscription
router.on('/inscription').render('pages/inscription').as('web.inscription')

// Page d'Accueil Dashboard
router.on('/accueil').render('pages/accueil').as('web.accueil')


/* 
========================================================================== 
2. ACTIONS WEB (FORMULAIRES POST / LOGOUT)
========================================================================== 
*/

router.group(() => {
  // Connexion Web
  router.post('/login', async ({ response }) => {
    return response.ok({
      message: 'Connexion réussie !',
    })
  }).as('web.session.store')

  // Inscription Web
  router.post('/register', async ({ request, response }) => {
    const data = request.all()
    
    return response.ok({
      success: true,
      message: 'Compte créé avec succès',
    })
  }).as('web.new_account.store')

  // Déconnexion Web
  router.post('/logout', async ({ response }) => {
    return response.redirect().toRoute('web.connexion')
  }).as('auth.logout')
})


/* 
========================================================================== 
3. API BACKEND MAVILLE (/api/v1)
========================================================================== 
*/

router.group(() => {

  /* --- API PUBLIQUE --- */
  
  // Auth API
  router.post('/auth/register', [NewAccountController, 'store'])
  router.post('/auth/login', [SessionController, 'store'])

  // Établissements
  router.get('/etablissements', [EtablissementsController, 'index'])
  router.get('/etablissements/:id', [EtablissementsController, 'show'])

  // Produits & Catalogue
  router.get('/produits', [ProduitsController, 'index'])
  router.get('/produits/:id', [ProduitsController, 'show'])

  // Recherche IA & Conversationnelle
  router.post('/ai/search', [AiController, 'search'])


  /* --- API PROTÉGÉE (JWT / Auth requise) --- */
  
  router.group(() => {
    // Déconnexion API
    router.delete('/auth/logout', [SessionController, 'destroy'])

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