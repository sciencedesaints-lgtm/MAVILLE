import vine from '@vinejs/vine'

/**
 * Demande de service par un client
 */
export const createDemandeServiceValidator = vine.compile(
  vine.object({
    categorieServiceId: vine.number(),
    description: vine.string().trim().optional(),
    typeRecherche: vine.enum(['immediat', 'programme']),
    tempsMaxMinutes: vine.number().min(1).optional(),
    urgence: vine.boolean().optional(),
    latitude: vine.number().min(-90).max(90).optional(),
    longitude: vine.number().min(-180).max(180).optional(),
  })
)

/**
 * Changement de statut d'une demande de service
 */
export const updateDemandeServiceStatusValidator = vine.compile(
  vine.object({
    statut: vine.enum(['en_attente', 'acceptee', 'en_cours', 'terminee', 'annulee']),
  })
)