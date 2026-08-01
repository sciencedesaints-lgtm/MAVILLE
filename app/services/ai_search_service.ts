import Etablissement from '#models/etablissement'
import Produit from '#models/produit'
import { GeoService } from '#services/geo_service'

export interface AiSearchOptions {
  query: string
  latitude?: number
  longitude?: number
  rayonKm?: number
}

export class AiSearchService {
  /**
   * Effectue une recherche sémantique / par mots-clés intelligente
   * sur les établissements et leurs produits
   */
  public static async search({ query, latitude, longitude, rayonKm = 10 }: AiSearchOptions) {
    const cleanQuery = query.trim().toLowerCase()
    const terms = cleanQuery.split(' ').filter((t) => t.length > 2)

    // 1. Recherche au niveau des établissements
    const etablissementsQuery = Etablissement.query()
      .where('visible', true)
      .preload('categorie')
      .preload('ville')

    if (latitude && longitude) {
      GeoService.filterByRadius(etablissementsQuery, latitude, longitude, rayonKm)
      GeoService.selectDistance(etablissementsQuery, latitude, longitude)
    }

    etablissementsQuery.where((builder) => {
      builder.where('nom', 'ILIAS', `%${cleanQuery}%`)
        .orWhere('description', 'ILIAS', `%${cleanQuery}%`)

      for (const term of terms) {
        builder.orWhere('nom', 'ILIAS', `%${term}%`)
          .orWhere('description', 'ILIAS', `%${term}%`)
      }
    })

    const etablissements = await etablissementsQuery.limit(10)

    // 2. Recherche au niveau des produits / services
    const produitsQuery = Produit.query()
      .where('disponible', true)
      .preload('etablissement', (eQuery) => {
        eQuery.preload('ville')
      })

    produitsQuery.where((builder) => {
      builder.where('nom', 'ILIAS', `%${cleanQuery}%`)
        .orWhere('description', 'ILIAS', `%${cleanQuery}%`)

      for (const term of terms) {
        builder.orWhere('nom', 'ILIAS', `%${term}%`)
      }
    })

    const produits = await produitsQuery.limit(10)

    return {
      query,
      resultats: {
        etablissements,
        produits,
      },
      suggestions: [
        'Voir les commerces ouverts à proximité',
        'Filtrer par meilleure note',
      ],
    }
  }
}