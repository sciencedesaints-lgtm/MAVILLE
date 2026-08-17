import type { HttpContext } from '@adonisjs/core/http'
import Utilisateur from '#models/utilisateur'

export default class NewAccountController {
  public async store({ request, response }: HttpContext) {
    const data = request.only([
      'nom',
      'prenom',
      'email',
      'password',
      'telephone',
      'type_compte',
    ])

    const user = await Utilisateur.create({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      password: data.password,
      telephone: data.telephone,
      actif: true,
      statutCompte: 'actif',
    })

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