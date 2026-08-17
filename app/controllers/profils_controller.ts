import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import string from '@adonisjs/core/helpers/string'

export default class ProfilsController {
  async personnel({ view, auth }: HttpContext) {
    const user = auth.user
    if (user) {
      await user.refresh()
    }
    return view.render('profils/personnel', { user })
  } // <-- Une seule accolade fermante pour la méthode personnel

  async entreprise({ view, auth }: HttpContext) {
    const user = auth.user
    if (user) {
      await user.refresh()
    }
    return view.render('profils/entreprise', { user })
  } // <-- Une seule accolade fermante pour la méthode entreprise

  async administration({ view, auth }: HttpContext) {
    const user = auth.user
    if (user) {
      await user.refresh()
    }
    return view.render('profils/administration', { user })
  }
 // <-- Accolade finale de la classe
  async updateAvatar({ request, response, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Non autorisé' })
    }

    const avatarFile = request.file('avatar', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp']
    })

    if (avatarFile && avatarFile.isValid) {
      const uniqueSuffix = string.generateRandom(32)
      const fileName = `avatar_${user.id}_${uniqueSuffix}.${avatarFile.extname}`
      
      await avatarFile.move(app.makePath('public/uploads/avatars'), { name: fileName })
      
      user.avatar = `/uploads/avatars/${fileName}`
      await user.save()

      return response.json({ success: true, avatarUrl: user.avatar })
    }

    return response.badRequest({ success: false, message: 'Fichier invalide' })
  }
}