import type { HttpContext } from '@adonisjs/core/http'
import Media from '#models/media'
import app from '@adonisjs/core/services/app'
import string from '@adonisjs/core/helpers/string'

export default class MediasController {

  // 1. Afficher le fil d'actualité avec les médias postés par les utilisateurs
  async index({ view }: HttpContext) {
    const posts = await Media.query()
      .preload('utilisateur')
      .orderBy('createdAt', 'desc')

    const formattedPosts = posts.map(media => ({
      id: media.id,
      user: {
        prenom: media.utilisateur?.prenom || 'Utilisateur',
        nom: media.utilisateur?.nom || 'MAVILLE'
      },
      type: media.typeMedia.toLowerCase() === 'video' ? 'video' : 'image',
      mediaUrl: media.url,
      legend: media.nomFichier || '',
      createdAt: media.createdAt.toRelative()
    }))

    return view.render('pages/actualite', { posts: formattedPosts })
  }

  // 2. Afficher le formulaire de création
  async create({ view }: HttpContext) {
    return view.render('pages/creer_post')
  }

  // 3. Traiter l'enregistrement d'une publication avec le modèle Media
  async store({ request, response, auth }: HttpContext) {
    const legend = request.input('legend')
    const file = request.file('media', {
      size: '50mb',
      extnames: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi']
    })

    let url = ''
    let typeMedia = 'IMAGE'

    if (file) {
      if (!file.isValid) {
        return response.badRequest({ errors: file.errors })
      }

      // Génération d'un nom de fichier unique et sécurisé
      const uniqueSuffix = string.generateRandom(32)
      const fileName = `${uniqueSuffix}.${file.extname}`

      if (['mp4', 'mov', 'avi'].includes(file.extname!)) {
        typeMedia = 'VIDEO'
        await file.move(app.makePath('public/uploads/videos'), { name: fileName })
        url = `/uploads/videos/${fileName}`
      } else {
        typeMedia = 'IMAGE'
        await file.move(app.makePath('public/uploads/images'), { name: fileName })
        url = `/uploads/images/${fileName}`
      }
    }

    // Enregistrement dans la table "medias" (conversion de l'ID en string)
    await Media.create({
      utilisateurId: auth.user?.id ? String(auth.user.id) : null,
      typeMedia: typeMedia,
      nomFichier: legend,
      url: url,
      mimeType: file ? `${file.type}/${file.extname}` : null,
      taille: file ? file.size : null
    })

    return response.redirect().toRoute('web.actualite')
  }

  // 4. Afficher le profil dynamique selon le type d'utilisateur connecté
  async profil({ view, auth }: HttpContext) {
    const user = auth.user

    // Si l'utilisateur n'est pas authentifié, on le redirige proprement vers la page de connexion
    if (!user) {
      return view.render('pages/connexion')
    }

    // Charger les rôles de l'utilisateur pour la gestion dynamique du profil
    await user.load('roles')

    // Récupérer les publications spécifiques de cet utilisateur
    const posts = await Media.query()
      .where('utilisateurId', String(user.id))
      .preload('utilisateur')
      .orderBy('createdAt', 'desc')

    const formattedPosts = posts.map(media => ({
      id: media.id,
      user: {
        prenom: media.utilisateur?.prenom || user.prenom,
        nom: media.utilisateur?.nom || user.nom
      },
      type: media.typeMedia.toLowerCase() === 'video' ? 'video' : 'image',
      mediaUrl: media.url,
      legend: media.nomFichier || '',
      createdAt: media.createdAt.toRelative()
    }))

    // Déterminer le type de profil basé sur les rôles associés
    const premierRole = user.roles?.[0]?.nom?.toLowerCase() || 'personnel'

    if (premierRole.includes('entreprise') || premierRole.includes('agence')) {
      return view.render('profils/entreprise', { user, posts: formattedPosts })
    } 

    if (premierRole.includes('administration') || premierRole.includes('public')) {
      return view.render('profils/administration', { user, posts: formattedPosts })
    }

    // Par défaut, affichage du profil personnel
    return view.render('profils/personnel', { user, posts: formattedPosts })
  }
}