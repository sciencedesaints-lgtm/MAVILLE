import { AiSearchService } from '#services/ai_search_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class AiController {
  /**
   * POST /api/v1/ai/search
   * Endpoint de recherche conversationnelle intelligente
   */
  public async search({ request, response }: HttpContext) {
    const { query, latitude, longitude, rayonKm } = request.only([
      'query',
      'latitude',
      'longitude',
      'rayonKm',
    ])

    if (!query || typeof query !== 'string') {
      return response.badRequest({ message: 'Veuillez fournir une requête de recherche textuelle.' })
    }

    const latNum = latitude ? Number.parseFloat(latitude) : undefined
    const lngNum = longitude ? Number.parseFloat(longitude) : undefined

    const searchResults = await AiSearchService.search({
      query,
      latitude: Number.isNaN(latNum) ? undefined : latNum,
      longitude: Number.isNaN(lngNum) ? undefined : lngNum,
      rayonKm: rayonKm ? Number(rayonKm) : 10,
    })

    return response.ok({
      reponseIa: `Voici les établissements et produits trouvés pour "${query}" :`,
      data: searchResults,
    })
  }
}