import Etablissement from '#models/etablissement'
import Utilisateur from '#models/utilisateur'
import { GeoService } from '#services/geo_service'
import {
  createEtablissementValidator,
  updateEtablissementValidator,
} from '#validators/etablissement'
import type { HttpContext } from '@adonisjs/core/http'

export default class EtablissementsController {
  /**
   * Liste les établissements avec filtres (Catégorie, Ville, Recherche, Géolocalisation PostGIS)
   * GET /api/v1/etablissements
   */
  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const categorieId = request.input('categorie_id')
    const villeId = request.input('ville_id')
    const search = request.input('search')

    // Paramètres géographiques "Autour de moi"
    const latitude = request.input('latitude')
    const longitude = request.input('longitude')
    const rayonKm = request.input('rayon_km', 5)

    const query = Etablissement.query()
      .where('visible', true)
      .preload('categorie')
      .preload('ville')

    // 📍 Filtrage spatial PostGIS "Autour de moi"
    if (latitude && longitude) {
      const latNum = Number.parseFloat(latitude)
      const lngNum = Number.parseFloat(longitude)

      if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
        GeoService.filterByRadius(query, latNum, lngNum, Number(rayonKm))
        GeoService.selectDistance(query, latNum, lngNum)
      }
    }

    if (categorieId) {
      query.where('categorieId', categorieId)
    }

    if (villeId) {
      query.where('villeId', villeId)
    }

    if (search) {
      query.where('nom', 'ILIAS', `%${search}%`)
    }

    const etablissements = await query.paginate(page, limit)
    return response.ok(etablissements)
  }

  /**
   * Afficher un établissement par ID
   * GET /api/v1/etablissements/:id
   */
  public async show({ params, response }: HttpContext) {
    const etablissement = await Etablissement.query()
      .where('id', params.id)
      .preload('categorie')
      .preload('ville')
      .preload('produits', (pQuery) => pQuery.where('stock', '>', 0))
      .first()

    if (!etablissement) {
      return response.notFound({ message: 'Établissement introuvable' })
    }

    return response.ok(etablissement)
  }

  /**
   * Créer un nouvel établissement
   * POST /api/v1/etablissements
   */
  public async store({ request, response, auth }: HttpContext) {
    const user = auth.user! as Utilisateur
    const payload = await request.validateUsing(createEtablissementValidator)

    const slugBase = payload.nom
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const etablissement = await Etablissement.create({
      ...payload,
      proprietaireId: String(user.id),
      slug: `${slugBase}-${Date.now()}`,
      visible: true,
      ouvert: true,
    })

    return response.created(etablissement)
  }

  /**
   * Mettre à jour un établissement
   * PUT /api/v1/etablissements/:id
   */
  public async update({ params, request, response, auth }: HttpContext) {
    const user = auth.user!
    const etablissement = await Etablissement.find(params.id)

    if (!etablissement) {
      return response.notFound({ message: 'Établissement introuvable' })
    }

    if (String(etablissement.proprietaireId) !== String(user.id)) {
      return response.forbidden({ message: 'Accès non autorisé à cet établissement' })
    }

    const payload = await request.validateUsing(updateEtablissementValidator)
    etablissement.merge(payload)
    await etablissement.save()

    return response.ok(etablissement)
  }
}