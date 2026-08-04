import type { HttpContext } from '@adonisjs/core/http'
import Utilisateur from '#models/utilisateur'

export default class NewAccountController {
  public async store({ request, response }: HttpContext) {
    // Récupération correcte des données incluant le type de compte
const data = request.only([
  'nom',
  'prenom',
  'email',
  'password',
  'telephone',
  'type_compte', // <-- Vérifiez que ce champ est bien récupéré
])

// Création de l'utilisateur
const user = await Utilisateur.create({
  ...data,
  typeCompte: data.type_compte, // <-- Assurez-vous que la colonne en BD s'associe bien
  actif: true,
  statutCompte: 'actif',
})

// TRÈS IMPORTANT pour le Web : Connecter l'utilisateur à la session
await auth.use('web').login(user)

return response.redirect().toRoute('web.accueil')

    // Si la requête provient d'un formulaire Web classique (HTML)
    if (request.header('accept')?.includes('text/html')) {
      // Optionnel : Connecter l'utilisateur automatiquement à sa session web ici

      if (typeCompte === 'personnel') {
        return response.redirect().toRoute('profil.personnel')
      } else if (typeCompte === 'entreprise_agence') {
        return response.redirect().toRoute('profil.entreprise')
      } else if (typeCompte === 'administration_publique') {
        return response.redirect().toRoute('profil.administration')
      }
      return response.redirect().toRoute('web.accueil')
    }

    // Génération du token d'accès (API auth / JSON)
    const token = await Utilisateur.accessTokens.create(user, ['*'], {
      expiresIn: '30 days',
    })

    return response.created({
      type: 'bearer',
      token: token.value!.release(),
      user,
    })
  }
}