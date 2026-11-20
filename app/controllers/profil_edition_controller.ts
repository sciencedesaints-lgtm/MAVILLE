import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { MediaService } from '#services/media_service'

const texte = (v: unknown) => String(v ?? '').trim() || null
const IMAGES = ['jpg', 'jpeg', 'png', 'webp']
const TYPES_AVEC_ACTIVITES = ['entreprise_agence', 'administration_publique']

function routeProfil(typeCompte?: string | null) {
  if (typeCompte === 'entreprise_agence') return 'profil.entreprise'
  if (typeCompte === 'administration_publique') return 'profil.administration'
  return 'profil.personnel'
}

export default class ProfilEditionController {
  async edit({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const moi = await db.from('utilisateurs').where('id', user.id).first()

    let activites: { id: number; nom: string; coche: boolean }[] = []
    if (moi && TYPES_AVEC_ACTIVITES.includes(moi.type_compte)) {
      const liste = await db
        .from('activites')
        .where('type_compte', moi.type_compte)
        .orderBy('ordre')
        .orderBy('nom')
      const cochees = await db
        .from('utilisateur_activites')
        .where('utilisateur_id', user.id)
        .select('activite_id')
      const ids = new Set(cochees.map((c) => c.activite_id))
      activites = liste.map((a) => ({ id: a.id, nom: a.nom, coche: ids.has(a.id) }))
    }

    const retourRoute = routeProfil(moi?.type_compte)
    return view.render('pages/profil_modifier', { moi, activites, retourRoute })
  }

  async update({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const moi = await db.from('utilisateurs').where('id', user.id).first()

    const nom = texte(request.input('nom'))
    if (!nom || nom.length < 2) {
      session.flash('erreur', 'Le nom est obligatoire (2 caractères minimum).')
      return response.redirect().back()
    }

    // Activités : seulement pour entreprise et administration
    const avecActivites = !!moi && TYPES_AVEC_ACTIVITES.includes(moi.type_compte)
    let activitesValides: number[] = []
    if (avecActivites) {
      const recues = ([] as unknown[])
        .concat(request.input('activites', []))
        .map((v) => Number(v))
        .filter((n) => Number.isInteger(n) && n > 0)

      if (recues.length > 0) {
        const lignes = await db
          .from('activites')
          .whereIn('id', recues)
          .where('type_compte', moi!.type_compte)
          .select('id')
        activitesValides = lignes.map((l) => l.id)
      }

      if (activitesValides.length === 0) {
        session.flash('erreur', 'Choisissez au moins une activité.')
        return response.redirect().back()
      }
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

    const photo = request.file('photo', { size: '5mb', extnames: IMAGES })
    if (photo && photo.clientName) {
      if (!photo.isValid) {
        session.flash('erreur', 'Photo de profil refusée : jpg, png ou webp, 5 Mo maximum.')
        return response.redirect().back()
      }
      donnees.photo_profil = await MediaService.uploadImage(photo, 'avatars')
    }

    const banniere = request.file('banniere', { size: '8mb', extnames: IMAGES })
    if (banniere && banniere.clientName) {
      if (!banniere.isValid) {
        session.flash('erreur', 'Bannière refusée : jpg, png ou webp, 8 Mo maximum.')
        return response.redirect().back()
      }
      donnees.photo_banniere = await MediaService.uploadImage(banniere, 'bannieres')
    }

    await db.transaction(async (trx) => {
      await trx.from('utilisateurs').where('id', user.id).update(donnees)

      if (avecActivites) {
        await trx.from('utilisateur_activites').where('utilisateur_id', user.id).delete()
        await trx
          .table('utilisateur_activites')
          .multiInsert(activitesValides.map((id) => ({ utilisateur_id: user.id, activite_id: id })))
      }
    })

    return response.redirect().toRoute(routeProfil(moi?.type_compte))
  }
}