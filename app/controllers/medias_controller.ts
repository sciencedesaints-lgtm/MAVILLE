import type { HttpContext } from '@adonisjs/core/http'
import Media from '#models/media'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import string from '@adonisjs/core/helpers/string'
import { unlink } from 'node:fs/promises'
import { DateTime } from 'luxon'

const MAX_PAR_JOUR = 10
const ID_VALIDE = /^[0-9a-zA-Z-]{1,64}$/

export default class MediasController {
  // 1. Fil d'actualité de la ville de l'utilisateur
  async index({ view, request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const filtre = ['nouveaute', 'publicite'].includes(String(request.input('categorie')))
      ? String(request.input('categorie'))
      : 'tout'

    const requete = db
      .from('medias as m')
      .join('utilisateurs as u', 'u.id', 'm.utilisateur_id')
      .where('u.ville', user.ville ?? '')
      .select(
        'm.id',
        'm.url',
        'm.type_media',
        'm.nom_fichier',
        'm.categorie',
        'm.created_at',
        'u.id as auteur_id',
        'u.prenom',
        'u.nom',
        'u.photo_profil',
        'u.type_compte'
      )
      .orderBy('m.created_at', 'desc')
      .limit(50)
    if (filtre !== 'tout') requete.where('m.categorie', filtre)

    const lignes = await requete

    const posts = lignes.map((m: any) => ({
      id: m.id,
      auteurId: m.auteur_id,
      auteur: [m.prenom, m.nom].filter(Boolean).join(' ') || 'Utilisateur MAVILLE',
      initiale: String(m.prenom || m.nom || 'M').charAt(0).toUpperCase(),
      photo: m.photo_profil,
      estEntreprise: m.type_compte !== 'personnel',
      type: String(m.type_media).toLowerCase() === 'video' ? 'video' : 'image',
      mediaUrl: m.url,
      legend: m.nom_fichier || '',
      categorie: m.categorie,
      mien: String(m.auteur_id) === String(user.id),
      quand: DateTime.fromJSDate(new Date(m.created_at)).setLocale('fr').toRelative(),
    }))

    return view.render('pages/actualite', { posts, filtre })
  }

  // 2. Formulaire de création (page dédiée, conservée)
  async create({ response }: HttpContext) {
    return response.redirect().toRoute('web.actualite')
  }

  // 3. Publier
  async store({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const legend = String(request.input('legend') ?? '').trim().slice(0, 1000)
    const categorie = request.input('categorie') === 'publicite' ? 'publicite' : 'nouveaute'

    const file = request.file('media', {
      size: '50mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'webm'],
    })
    const aFichier = !!(file && file.clientName)

    if (!legend && !aFichier) {
      session.flash('erreur', 'Écrivez un texte ou ajoutez une photo ou une vidéo.')
      return response.redirect().back()
    }
    if (aFichier && !file!.isValid) {
      session.flash('erreur', 'Fichier refusé : jpg, png, webp, mp4, mov ou webm, 50 Mo maximum.')
      return response.redirect().back()
    }

    // Anti-spam : limite par 24 heures
    const [{ total }] = await db
      .from('medias')
      .where('utilisateur_id', user.id)
      .whereRaw("created_at > now() - interval '1 day'")
      .count('* as total')
    if (Number(total) >= MAX_PAR_JOUR) {
      session.flash('erreur', `Limite atteinte : ${MAX_PAR_JOUR} publications par 24 heures.`)
      return response.redirect().back()
    }

    let url = ''
    let typeMedia = 'IMAGE'

    if (aFichier) {
      const nomFichier = `${string.generateRandom(32)}.${file!.extname}`
      const estVideo = ['mp4', 'mov', 'webm'].includes(String(file!.extname))
      const dossier = estVideo ? 'videos' : 'images'
      typeMedia = estVideo ? 'VIDEO' : 'IMAGE'
      await file!.move(app.makePath(`public/uploads/${dossier}`), { name: nomFichier })
      url = `/uploads/${dossier}/${nomFichier}`
    }

    const media = await Media.create({
      utilisateurId: String(user.id),
      typeMedia,
      nomFichier: legend,
      url,
      mimeType: aFichier ? `${file!.type}/${file!.extname}` : null,
      taille: aFichier ? file!.size : null,
    })

    await db.from('medias').where('id', media.id).update({ categorie })

    return response.redirect().toRoute('web.actualite')
  }

  // 4. Supprimer sa propre publication
  async supprimer({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!ID_VALIDE.test(String(params.id))) return response.notFound('Introuvable')

    const ligne = await db
      .from('medias')
      .where('id', params.id)
      .where('utilisateur_id', user.id)
      .first()
    if (!ligne) return response.notFound('Introuvable')

    if (ligne.url) {
      try {
        await unlink(app.makePath('public' + ligne.url))
      } catch {
        // fichier déjà absent
      }
    }
    await db.from('medias').where('id', params.id).delete()
    return response.redirect().back()
  }

  // 5. Afficher le profil dynamique selon le type d'utilisateur connecté
  async profil({ view, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return view.render('pages/connexion')
    }

    await user.load('roles')

    const posts = await Media.query()
      .where('utilisateurId', String(user.id))
      .preload('utilisateur')
      .orderBy('createdAt', 'desc')

    const formattedPosts = posts.map((media) => ({
      id: media.id,
      user: {
        prenom: media.utilisateur?.prenom || user.prenom,
        nom: media.utilisateur?.nom || user.nom,
      },
      type: media.typeMedia.toLowerCase() === 'video' ? 'video' : 'image',
      mediaUrl: media.url,
      legend: media.nomFichier || '',
      createdAt: media.createdAt.toRelative(),
    }))

    const premierRole = user.roles?.[0]?.nom?.toLowerCase() || 'personnel'

    if (premierRole.includes('entreprise') || premierRole.includes('agence')) {
      return view.render('profils/entreprise', { user, posts: formattedPosts })
    }

    if (premierRole.includes('administration') || premierRole.includes('public')) {
      return view.render('profils/administration', { user, posts: formattedPosts })
    }

    return view.render('profils/personnel', { user, posts: formattedPosts })
  }
}