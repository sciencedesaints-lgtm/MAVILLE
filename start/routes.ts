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
1. ACCUEIL ET VUES COMPOSANTS (HTML / WEB)
========================================================================== 
*/

// Route d'accueil
router.get('/', async ({ view }) => {
  return view.render('pages/app')
}).as('home')

// Authentification Web (Affichage des vues et formulaires web)
router.group(() => {
 // Connexion Web / API
 router.post('/login', async ({ request, response }) => {
  // Traitement de la connexion...

  return response.ok({
    message: 'Connexion réussie !',
    // token: '...'
  })
}).as('web.session.store')

router.post('/register', async ({ request, response }) => {
  const data = request.all()
  
  // 1. Logique de création de l'utilisateur en BDD ici...
  // const user = await User.create(data)

  // 2. Répondre en JSON au JavaScript
  return response.ok({
    success: true,
    message: 'Compte créé avec succès',
    // token: tokenGeneré
  })
}).as('web.new_account.store')

  router.post('/logout', async ({ response }) => {
    return response.redirect().toRoute('session.create')
  }).as('auth.logout') // 👈 Nom attribué ici
})

/* 
========================================================================== 
2. API BACKEND MAVILLE (/api/v1)
========================================================================== 
*/

router.group(() => {

  /* --- API PUBLIQUE --- */
  
  // Auth API (Utilise automatiquement les contrôleurs)
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