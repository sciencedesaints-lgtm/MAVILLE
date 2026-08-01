import vine from '@vinejs/vine'

/**
 * Publication d'un événement
 */
export const createEvenementValidator = vine.compile(
  vine.object({
    titre: vine.string().trim().maxLength(150),
    description: vine.string().trim().optional(),
    dateDebut: vine.string().transform((val) => new Date(val)),
    dateFin: vine.string().transform((val) => new Date(val)).optional(),
    lieu: vine.string().trim().optional(),
    public: vine.boolean().optional(),
  })
)