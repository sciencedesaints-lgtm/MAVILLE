import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { MediaService } from '#services/media_service'

const texte = (v: unknown) => String(v ?? '').trim() || null

export default class ProfilEditionController {
  async edit({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const moi = await db.from('utilisateurs').where('id', user.id).first()
    return view.render('pages/profil_modifier', { moi })
  }

  async update({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const moi = await db.from('utilisateurs').where('id', user.id).first()

    const nom = texte(request.input('nom'))
    if (!nom || nom.length < 2) {
      session.flash('erreur', 'Le nom est obligatoire (2 caractères minimum).')
      return response.redirect().back()
    }

    const donnees: Record<string, any> = {
      nom: nom.slice(0, 150),
      pseudo: texte(request.input('pseudo'))?.slice(0, 100) ?? null,
      profession: texte(request.input('profession'))?.slice(0, 150) ?? null,
      qualification: texte(request.input('qualification'))?.slice(0, 255) ?? null,
      quartier: texte(request.input('quartier'))?.slice(0, 120) ?? null,
      commune: texte(request.input('commune'))?.slice(0, 120) ?? null,
      updated_at: new Date(),
    }
    if (moi?.type_compte === 'personnel') {
      donnees.prenom = texte(request.input('prenom'))?.slice(0, 100) ?? null
    }

    const photo = request.file('photo', { size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] })
    if (photo && photo.clientName) {
      if (!photo.isValid) {
        session.flash('erreur', 'Photo refusée : jpg, png ou webp, 5 Mo maximum.')
        return response.redirect().back()
      }
      donnees.photo_profil = await MediaService.uploadImage(photo, 'avatars')
    }

    await db.from('utilisateurs').where('id', user.id).update(donnees)
    return response.redirect().toRoute('profil.personnel')
  }
}