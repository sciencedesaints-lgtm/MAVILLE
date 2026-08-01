import vine from '@vinejs/vine'

/**
 * Assignation ou création d'une livraison
 */
export const createLivraisonValidator = vine.compile(
  vine.object({
    commandeId: vine.string().uuid(),
    livreurId: vine.string().uuid().optional(),
  })
)

/**
 * Mise à jour du statut de livraison
 */
export const updateLivraisonStatusValidator = vine.compile(
  vine.object({
    statut: vine.enum(['assignee', 'en_cours', 'livree', 'echouee']),
  })
)