import vine from '@vinejs/vine'

/**
 * Création d'un établissement
 */
export const createEtablissementValidator = vine.compile(
  vine.object({
    categorieId: vine.number(),
    villeId: vine.string().uuid(),
    nom: vine.string().trim().maxLength(150),
    description: vine.string().trim().optional(),
    telephone: vine.string().trim().maxLength(30).optional(),
    email: vine.string().email().optional(),
    siteWeb: vine.string().url().optional(),
    adresse: vine.string().trim(),
    quartier: vine.string().trim().maxLength(120).optional(),
    commune: vine.string().trim().maxLength(120).optional(),
    latitude: vine.number().min(-90).max(90).optional(),
    longitude: vine.number().min(-180).max(180).optional(),
    livraison: vine.boolean().optional(),
    retraitSurPlace: vine.boolean().optional(),
  })
)

/**
 * Mise à jour d'un établissement
 */
export const updateEtablissementValidator = vine.compile(
  vine.object({
    categorieId: vine.number().optional(),
    villeId: vine.string().uuid().optional(),
    nom: vine.string().trim().maxLength(150).optional(),
    description: vine.string().trim().optional(),
    telephone: vine.string().trim().maxLength(30).optional(),
    email: vine.string().email().optional(),
    siteWeb: vine.string().url().optional(),
    adresse: vine.string().trim().optional(),
    quartier: vine.string().trim().maxLength(120).optional(),
    commune: vine.string().trim().maxLength(120).optional(),
    latitude: vine.number().min(-90).max(90).optional(),
    longitude: vine.number().min(-180).max(180).optional(),
    ouvert: vine.boolean().optional(),
    livraison: vine.boolean().optional(),
    retraitSurPlace: vine.boolean().optional(),
    visible: vine.boolean().optional(),
  })
)