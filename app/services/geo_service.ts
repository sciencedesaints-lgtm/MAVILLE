import db from '@adonisjs/lucid/services/db'

export class GeoService {
  /**
   * Génère une clause SQL PostGIS pour filtrer un modèle possédant 'latitude' et 'longitude'
   * dans un rayon donné (en kilomètres).
   * 
   * @param userLat Latitude de l'utilisateur
   * @param userLng Longitude de l'utilisateur
   * @param radiusKm Rayon de recherche en km
   */
  public static filterByRadius(
    query: any,
    userLat: number,
    userLng: number,
    radiusKm: number = 5
  ) {
    const radiusInMeters = radiusKm * 1000

    // ST_DistanceSphere calcule la distance exacte en mètres sur la sphère terrestre
    return query.whereRaw(
      `ST_DistanceSphere(
        ST_MakePoint(longitude::numeric, latitude::numeric),
        ST_MakePoint(?, ?)
      ) <= ?`,
      [userLng, userLat, radiusInMeters]
    )
  }

  /**
   * Calcule et ajoute la colonne virtuelle 'distance_km' aux résultats SQL
   */
  public static selectDistance(
    query: any,
    userLat: number,
    userLng: number
  ) {
    return query.select('*').select(
      db.raw(
        `ROUND((ST_DistanceSphere(
          ST_MakePoint(longitude::numeric, latitude::numeric),
          ST_MakePoint(?, ?)
        ) / 1000)::numeric, 2) as distance_km`,
        [userLng, userLat]
      )
    )
  }
}