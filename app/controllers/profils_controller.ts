import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import string from '@adonisjs/core/helpers/string'
import User from '#models/user'

export default class ProfilsController {
  
  public async personnel({ view, auth }: HttpContext) {
    const user = auth.user
    if (user) {
      await user.refresh()
      // Charger les relations associées si elles existent (ex: signalements)
      await user.load('signalements').catch(() => {})
    }

    // Structuration des données pour s'assurer que la vue y accède sans erreur
    const userData = user ? {
      fullName: user.fullName || user.nom || 'Nom Utilisateur',
      username: user.username || 'username',
      email: user.email,
      bio: user.bio || 'Citoyen actif de MAVILLE, engagé pour le développement de notre communauté.',
      balance: user.balance || '0.00',
      avatarUrl: user.avatar || user.avatarUrl || '/images/avatar.jpg',
      bannerUrl: user.bannerUrl || null,
      stats: {
        signalementsCount: user.signalements ? user.signalements.length : 0,
        servicesCount: 3,
        postsCount: 5,
        pointsCount: 140
      },
      activities: user.signalements ? user.signalements.map((s: any) => ({
        title: s.description ? s.description.substring(0, 40) + '...' : 'Signalement',
        date: s.createdAt ? s.createdAt.toFormat('dd/MM/yyyy HH:mm') : '',
        status: s.status || 'En cours'
      })) : []
    } : null

    return view.render('profils/personnel', { user: userData })
  }

  public async entreprise({ view, auth }: HttpContext) {
    const user = auth.user
    if (user) {
      await user.refresh()
    }
    return view.render('profils/entreprise', { user })
  }

  public async administration({ view, auth }: HttpContext) {
    const user = auth.user
    if (user) {
      await user.refresh()
    }
    return view.render('profils/administration', { user })
  }

  public async updateAvatar({ request, response, auth }: HttpContext) {
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