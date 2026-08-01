import Utilisateur from '#models/utilisateur'
import { loginValidator } from '#validators/utilisateur' 
import { OtpService } from '#services/otp_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  /**
   * Connexion Standard API (Email + Mot de passe)
   */
  public async store({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await Utilisateur.verifyCredentials(email, password)

    // Vérification de sécurité pour éviter que TS considère 'user' comme 'null'
    if (!user) {
      return response.badRequest({ message: 'Identifiants invalides' })
    }

    await user.load('roles')

    const token = await Utilisateur.accessTokens.create(user, ['*'], {
      expiresIn: '30 days',
    })

    return response.ok({
      type: 'bearer',
      token: token.value!.release(),
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        roles: user.roles.map((r: any) => r.nom),
      },
    })
  }

  /**
   * Demande OTP
   */
  public async requestOtp({ request, response }: HttpContext) {
    const { telephone } = request.only(['telephone'])

    if (!telephone) {
      return response.badRequest({ message: 'Numéro de téléphone requis' })
    }

    await OtpService.createOtp(telephone)

    return response.ok({ message: 'Code OTP envoyé avec succès' })
  }

  /**
   * Vérification OTP
   */
  public async verifyOtp({ request, response }: HttpContext) {
    const { telephone, code } = request.only(['telephone', 'code'])

    const isValid = await OtpService.verifyOtp(telephone, code)

    if (!isValid) {
      return response.badRequest({ message: 'Code OTP invalide ou expiré' })
    }

    let user = await Utilisateur.findBy('telephone', telephone)

    if (!user) {
      user = await Utilisateur.create({
        telephone,
        actif: true,
      })
      // Assigne le rôle CITOYEN par défaut si nécessaire
    }

    await user.load('roles')

    const token = await Utilisateur.accessTokens.create(user, ['*'], {
      expiresIn: '30 days',
    })

    return response.ok({
      type: 'bearer',
      token: token.value!.release(),
      user,
    })
  }

  /**
   * Déconnexion
   */
  public async destroy({ auth, response }: HttpContext) {
    const user = auth.user as (Utilisateur & { currentAccessToken?: any }) | undefined
    
    if (user && user.currentAccessToken) {
      await Utilisateur.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return response.ok({ message: 'Déconnexion réussie' })
  }
}