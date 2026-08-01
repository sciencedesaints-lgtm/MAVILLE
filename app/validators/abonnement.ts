import vine from '@vinejs/vine'

/**
 * Souscription Premium / Visibilité
 */
export const subscribePremiumValidator = vine.compile(
  vine.object({
    type: vine.enum(['mensuel', 'annuel', 'pass_pro']),
    montant: vine.number().positive(),
    devise: vine.string().maxLength(10).optional(),
    renouvellementAuto: vine.boolean().optional(),
  })
)

/**
 * Ajout/Retrait des Favoris
 */
export const toggleFavoriValidator = vine.compile(
  vine.object({
    typeElement: vine.enum(['etablissement', 'produit', 'service', 'emploi', 'evenement']),
    elementId: vine.string().uuid(),
  })
)