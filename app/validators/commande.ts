import vine from '@vinejs/vine'

/**
 * Création d'une commande panier
 */
export const createCommandeValidator = vine.compile(
  vine.object({
    etablissementId: vine.string().uuid(),
    devise: vine.string().maxLength(10).optional(),
    modeLivraison: vine.enum(['livraison', 'emporter', 'sur_place']).optional(),
    modePaiement: vine.enum(['cash', 'mobile_money', 'carte', 'escrow']).optional(),
    adresseLivraison: vine.string().trim().optional(),
    latitude: vine.number().min(-90).max(90).optional(),
    longitude: vine.number().min(-180).max(180).optional(),
    articles: vine.array(
      vine.object({
        produitId: vine.string().uuid(),
        quantite: vine.number().min(1),
        prixUnitaire: vine.number().min(0),
      })
    ).minLength(1),
  })
)

/**
 * Changement de statut d'une commande
 */
export const updateCommandeStatusValidator = vine.compile(
  vine.object({
    statut: vine.enum(['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee']),
  })
)