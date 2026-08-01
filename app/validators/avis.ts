import vine from '@vinejs/vine'

/**
 * Dépôt d'un avis
 */
export const createAvisValidator = vine.compile(
  vine.object({
    typeElement: vine.enum(['etablissement', 'produit', 'service', 'livreur']),
    elementId: vine.string().uuid(),
    note: vine.number().min(1).max(5),
    commentaire: vine.string().trim().optional(),
  })
)