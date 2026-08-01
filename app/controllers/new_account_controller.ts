import type { HttpContext } from '@adonisjs/core/http'
import Utilisateur from '#models/utilisateur'

export default class NewAccountController {
  public async store({ request, response }: HttpContext) {
    // Récupération des données d'inscription
    const data = request.only([
      'nom',
      'prenom',
      'email',
      'password',
      'telephone',
    ])

    // Création de l'utilisateur
    const user = await Utilisateur.create({
      ...data,
      actif: true,
      statutCompte: 'actif',
    })

    // Génération du token d'accès (API auth)
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