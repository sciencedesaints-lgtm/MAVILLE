import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { NotificationRechercheService } from '#services/notification_recherche_service'

export default class RecherchesController {
  async lancer({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const q = String(request.input('q') ?? '').trim().slice(0, 300)
    if (!q) return response.redirect().toRoute('web.accueil')

    // Même phrase relancée dans les 10 minutes : on réutilise la recherche, sans renotifier
    const doublon = await db
      .from('recherches')
      .where('utilisateur_id', user.id)
      .where('texte', q)
      .whereRaw("created_at > now() - interval '10 minutes'")
      .first()

    let rechercheId: string

    if (doublon) {
      rechercheId = doublon.id
    } else {
      const ville = await db.from('villes').where('nom', user.ville ?? '').first()
      const [ligne] = await db
        .table('recherches')
        .insert({
          utilisateur_id: user.id,
          type_recherche: 'TEXTE',
          texte: q,
          scope_recherche: 'VILLE',
          ville_id: ville?.id ?? null,
        })
        .returning('id')
      rechercheId = typeof ligne === 'object' ? ligne.id : ligne

      await NotificationRechercheService.notifier(user, q, rechercheId)
    }

    return response.redirect(`/resultats?q=${encodeURIComponent(q)}&r=${rechercheId}`)
  }
}