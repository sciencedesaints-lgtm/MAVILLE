import type { HttpContext } from '@adonisjs/core/http'
import Utilisateur from '#models/utilisateur'
import { loginValidator } from '#validators/utilisateur' 
import { OtpService } from '#services/otp_service'
import hash from '@adonisjs/core/services/hash' // <- Correction 1 : Import de hash ajouté

export default class SessionController {
  public async store({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(loginValidator)
      console.log('>>> PAYLOAD VALIDÉ :', payload)

      const user = await Utilisateur.query()
        .where('email', payload.login)
        .orWhere('telephone', payload.login)
        .preload('roles')
        .first()

      console.log('>>> UTILISATEUR TROUVÉ EN DB :', user ? user.email : 'AUCUN UTILISATEUR')

      if (!user || !(await hash.verify(user.password, payload.password))) {
        console.log('>>> ÉCHEC : Mot de passe incorrect ou utilisateur introuvable')
        if (request.header('accept')?.includes('text/html')) {
          return response.redirect().back()
        }
        return response.badRequest({ message: 'Identifiants invalides' })
      }

      console.log('>>> SUCCÈS : Connexion de l utilisateur')
      if (request.header('accept')?.includes('text/html')) {
        await auth.use('web').login(user)
        return response.redirect().toRoute('web.accueil')
      }

      // ... le reste
    } catch (error) {
      console.log('>>> ERREUR CRITIQUE DANS LOGIN :', error)
      throw error
    }
  }
  
  public async requestOtp({ request, response }: HttpContext) {
    const { telephone } = request.only(['telephone'])

    if (!telephone) {
      return response.badRequest({ message: 'Numéro de téléphone requis' })
    }

    await OtpService.createOtp(telephone)

    return response.ok({ message: 'Code OTP envoyé avec succès' })
  }

  public async verifyOtp({ request, response, auth }: HttpContext) {
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
    }

    await user.load('roles')

    if (request.header('accept')?.includes('text/html')) {
      await auth.use('web').login(user)
    }

    const token = await Utilisateur.accessTokens.create(user, ['*'], {
      expiresIn: '30 days',
    })

    return response.ok({
      type: 'bearer',
      token: token.value!.release(),
      user,
    })
  }

  public async destroy({ auth, response, request }: HttpContext) { // <- Correction 3 : Ajout de request dans le contexte
    if (await auth.use('web').check()) { // <- Correction 4 : Utilisation plus robuste de check()
      await auth.use('web').logout()
    }

    const user = auth.user as (Utilisateur & { currentAccessToken?: any }) | undefined
    if (user && user.currentAccessToken) {
      await Utilisateur.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    if (request.header('accept')?.includes('text/html')) {
      return response.redirect().toRoute('web.connexion')
    }

    return response.ok({ message: 'Déconnexion réussie' })
  }
}
