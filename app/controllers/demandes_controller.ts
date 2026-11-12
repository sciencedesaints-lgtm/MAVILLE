import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class DemandesController {
  async index({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    // Demandes reçues en tant que vendeur
    const lignes = await db
      .from('reponses_recherche as rr')
      .join('recherches as r', 'r.id', 'rr.recherche_id')
      .join('utilisateurs as u', 'u.id', 'r.utilisateur_id')
      .where('rr.vendeur_id', user.id)
      .select(
        'rr.*',
        'r.texte',
        'r.created_at as recherche_at',
        'r.utilisateur_id as chercheur_id',
        'u.prenom as c_prenom',
        'u.nom as c_nom'
      )
      .orderBy('r.created_at', 'desc')
      .limit(100)

    const demandes = lignes.map((d: any) => ({
      ...d,
      chercheur: [d.c_prenom, d.c_nom].filter(Boolean).join(' ') || 'Un habitant',
      quand: new Date(d.recherche_at).toLocaleString('fr-FR'),
    }))

    // Réponses reçues en tant que chercheur
    const reponses = await db
      .from('notifications')
      .where('utilisateur_id', user.id)
      .where('type', 'REPONSE_VENDEUR')
      .orderBy('created_at', 'desc')
      .limit(30)

    const reponsesAffichees = reponses.map((n: any) => ({
      ...n,
      quand: new Date(n.created_at).toLocaleString('fr-FR'),
    }))

    // Toutes les notifications sont marquées comme lues à l'ouverture de la page
    await db
      .from('notifications')
      .where('utilisateur_id', user.id)
      .where('lu', false)
      .update({ lu: true, date_lecture: new Date() })

    const moi = await db.from('utilisateurs').where('id', user.id).first()

    return view.render('pages/demandes', {
      demandes,
      reponses: reponsesAffichees,
      reponseAuto: !!moi?.reponse_auto,
    })
  }

  // Nombre de notifications non lues (appelé par la cloche)
  async compte({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const [ligne] = await db
      .from('notifications')
      .where('utilisateur_id', user.id)
      .where('lu', false)
      .count('* as total')
    return response.ok({ count: Number(ligne.total) })
  }

  // Réponse manuelle : disponible ou indisponible
  async repondre({ params, request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const statut = String(request.input('statut') ?? '')
    if (!UUID.test(params.id) || !['disponible', 'indisponible'].includes(statut)) {
      return response.badRequest('Requête invalide')
    }

    // Seul le vendeur concerné peut répondre
    const rep = await db
      .from('reponses_recherche as rr')
      .join('recherches as r', 'r.id', 'rr.recherche_id')
      .where('rr.id', params.id)
      .where('rr.vendeur_id', user.id)
      .select('rr.*', 'r.utilisateur_id as chercheur_id', 'r.texte')
      .first()
    if (!rep) return response.notFound('Introuvable')

    await db
      .from('reponses_recherche')
      .where('id', params.id)
      .update({ statut, mode: 'manuel', repondu_at: new Date(), updated_at: new Date() })

    // Le chercheur est prévenu quand un vendeur confirme (une seule fois par réponse)
    if (statut === 'disponible' && rep.statut !== 'disponible' && rep.chercheur_id) {
      const nom = [user.prenom, user.nom].filter(Boolean).join(' ') || 'Un vendeur'
      await db.table('notifications').insert({
        utilisateur_id: rep.chercheur_id,
        type: 'REPONSE_VENDEUR',
        titre: '✅ Un vendeur a confirmé sa disponibilité',
        message: `${nom} peut répondre à votre recherche « ${rep.texte} » : « ${rep.offre_titre} » est disponible.`,
        lien: `/resultats?q=${encodeURIComponent(rep.texte)}&r=${rep.recherche_id}`,
      })
    }

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