import vine from '@vinejs/vine'

/**
 * Signalement citoyen
 */
export const createSignalementValidator = vine.compile(
  vine.object({
    titre: vine.string().trim().maxLength(150),
    description: vine.string().trim(),
    type: vine.enum(['voirie', 'eclairage', 'eau', 'dechets', 'securite', 'autre']),
    latitude: vine.number().min(-90).max(90),
    longitude: vine.number().min(-180).max(180),
    imageUrl: vine.string().url().optional(),
  })
)