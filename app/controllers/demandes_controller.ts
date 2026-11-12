import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class DemandesController {
  async index({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const lignes = await db
      .from('reponses_recherche as rr')
      .join('recherches as r', 'r.id', 'rr.recherche_id')
      .where('rr.vendeur_id', user.id)
      .select('rr.*', 'r.texte', 'r.created_at as recherche_at')
      .orderBy('r.created_at', 'desc')
      .limit(100)

    const demandes = lignes.map((d: any) => ({
      ...d,
      quand: new Date(d.recherche_at).toLocaleString('fr-FR'),
    }))

    // Les notifications de demandes sont marquées comme lues à l'ouverture de la page
    await db
      .from('notifications')
      .where('utilisateur_id', user.id)
      .where('type', 'DEMANDE_RECHERCHE')
      .where('lu', false)
      .update({ lu: true, date_lecture: new Date() })

    const moi = await db.from('utilisateurs').where('id', user.id).first()

    return view.render('pages/demandes', { demandes, reponseAuto: !!moi?.reponse_auto })
  }

  // Réponse manuelle : disponible ou indisponible
  async repondre({ params, request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const statut = String(request.input('statut') ?? '')
    if (!UUID.test(params.id) || !['disponible', 'indisponible'].includes(statut)) {
      return response.badRequest('Requête invalide')
    }

    // Seul le vendeur concerné peut répondre
    await db
      .from('reponses_recherche')
      .where('id', params.id)
      .where('vendeur_id', user.id)
      .update({ statut, mode: 'manuel', repondu_at: new Date(), updated_at: new Date() })

    return response.redirect().back()
  }

  // Active ou désactive la réponse automatique du compte
  async basculerAuto({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const moi = await db.from('utilisateurs').where('id', user.id).first()
    await db.from('utilisateurs').where('id', user.id).update({ reponse_auto: !moi?.reponse_auto })
    return response.redirect().back()
  }
}