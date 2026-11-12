import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

const GENRES = ['service', 'commerce', 'annonce', 'entreprise', 'administration', 'professionnel']
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class CorbeilleController {
  async index({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const elements = await db.from('resultats_masques')
      .where('utilisateur_id', user.id)
      .orderBy('created_at', 'desc')
    return view.render('pages/corbeille', { elements })
  }

  // Mettre un résultat à la corbeille
  async masquer({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const genre = String(request.input('genre') ?? '')
    const offreId = String(request.input('offre_id') ?? '')
    const titre = String(request.input('titre') ?? '').trim().slice(0, 255)

    if (!GENRES.includes(genre) || !UUID.test(offreId) || !titre) {
      return response.badRequest('Requête invalide')
    }

    await db.table('resultats_masques')
      .insert({
        utilisateur_id: user.id,
        genre,
        offre_id: offreId,
        titre,
        categorie: String(request.input('categorie') ?? '').trim().slice(0, 150) || null,
      })
      .onConflict(['utilisateur_id', 'genre', 'offre_id'])
      .ignore()

    return response.redirect().back()
  }

  // Sortir un résultat de la corbeille
  async restaurer({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!UUID.test(params.id)) return response.notFound('Introuvable')
    await db.from('resultats_masques')
      .where('id', params.id).where('utilisateur_id', user.id).delete()
    return response.redirect().back()
  }
}