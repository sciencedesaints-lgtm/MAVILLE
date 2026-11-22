import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PRECISION_MAX = 500 // mètres

export default class EnServiceController {
  async index({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const services = await db
      .from('services')
      .where('prestataire_id', user.id)
      .select('id', 'nom', 'itinerant', 'disponible')
      .orderBy('created_at', 'desc')
    return view.render('pages/en_service', { services })
  }

  // Marque un service comme itinérant (ou non)
  async basculer({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!UUID.test(params.id)) return response.notFound('Introuvable')
    const s = await db.from('services').where('id', params.id).where('prestataire_id', user.id).first()
    if (!s) return response.notFound('Introuvable')

    await db
      .from('services')
      .where('id', s.id)
      .update(
        s.itinerant
          ? { itinerant: false, latitude: null, longitude: null, position_maj_at: null }
          : { itinerant: true }
      )
    return response.redirect().back()
  }

  // Reçoit la position en direct (appelé par le navigateur toutes les 20 s)
  async position({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const lat = Number(request.input('lat'))
    const lng = Number(request.input('lng'))
    const precision = Number(request.input('precision'))

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return response.badRequest({ ok: false, message: 'Position invalide' })
    }
    if (Number.isFinite(precision) && precision > PRECISION_MAX) {
      return response.ok({ ok: false, message: `Position trop imprécise (${Math.round(precision)} m)` })
    }

    const n = await db
      .from('services')
      .where('prestataire_id', user.id)
      .where('itinerant', true)
      .update({ latitude: lat, longitude: lng, position_maj_at: new Date() })

    return response.ok({ ok: true, services: n })
  }

  // Fin de service : la position est effacée
  async arreter({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await db
      .from('services')
      .where('prestataire_id', user.id)
      .where('itinerant', true)
      .update({ latitude: null, longitude: null, position_maj_at: null })
    return response.ok({ ok: true })
  }
}