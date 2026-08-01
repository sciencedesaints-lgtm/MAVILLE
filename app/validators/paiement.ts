import vine from '@vinejs/vine'

/**
 * Initialisation d'un paiement
 */
export const initiatePaiementValidator = vine.compile(
  vine.object({
    commandeId: vine.string().uuid(),
    montant: vine.number().positive(),
    devise: vine.string().maxLength(10).optional(),
    moyenPaiement: vine.enum(['mpesa', 'orange_money', 'airtel_money', 'carte', 'cash', 'escrow']),
    telephonePaiement: vine.string().trim().maxLength(20).optional(),
  })
)

/**
 * Release de fonds Escrow
 */
export const escrowReleaseValidator = vine.compile(
  vine.object({
    paiementId: vine.string().uuid(),
    statut: vine.enum(['libere', 'litige', 'rembourse']),
  })
)