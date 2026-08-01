import vine from '@vinejs/vine'

/**
 * Publication d'une offre d'emploi
 */
export const createEmploiValidator = vine.compile(
  vine.object({
    etablissementId: vine.string().uuid(),
    titre: vine.string().trim().maxLength(150),
    description: vine.string().trim(),
    typeContrat: vine.enum(['CDI', 'CDD', 'Freelance', 'Stage', 'Temps partiel']).optional(),
    salaireMin: vine.number().min(0).optional(),
    salaireMax: vine.number().min(0).optional(),
    devise: vine.string().maxLength(10).optional(),
    dateLimite: vine.string().transform((val) => new Date(val)).optional(),
  })
)

/**
 * Candidature à une offre d'emploi
 */
export const candidatureEmploiValidator = vine.compile(
  vine.object({
    emploiId: vine.string().uuid(),
    cvUrl: vine.string().url().optional(),
    lettreMotivationUrl: vine.string().url().optional(),
  })
)