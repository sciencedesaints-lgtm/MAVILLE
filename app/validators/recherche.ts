import vine from '@vinejs/vine'

/**
 * Recherche avec filtres PostGIS / géographique
 */
export const searchQueryValidator = vine.compile(
  vine.object({
    q: vine.string().trim().minLength(2),
    type: vine.enum(['etablissement', 'produit', 'service', 'tout']).optional(),
    latitude: vine.number().min(-90).max(90).optional(),
    longitude: vine.number().min(-180).max(180).optional(),
    rayonKm: vine.number().min(1).max(100).optional(),
  })
)