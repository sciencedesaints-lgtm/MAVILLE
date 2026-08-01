import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

/**
 * Validator pour l'inscription d'un utilisateur
 */
export const signupValidator = vine.compile(
  vine.object({
    nom: vine.string().trim().minLength(2).maxLength(100),

    prenom: vine.string().trim().minLength(2).maxLength(100),

    pseudo: vine
      .string()
      .trim()
      .minLength(3)
      .maxLength(80)
      .optional(),

    // Rend l'email obligatoire + vérification d'unicité en BDD
    email: vine
      .string()
      .trim()
      .email()
      .maxLength(255)
      .unique(async (db, value) => {
        const user = await db.from('utilisateurs').where('email', value).first()
        return !user
      }),

    telephone: vine
      .string()
      .trim()
      .maxLength(30)
      .optional(),

    password: vine
      .string()
      .minLength(8)
      .maxLength(100)
      .confirmed(),

    sexe: vine
      .enum(['homme', 'femme', 'autre'])
      .optional(),

    // Transforme la chaîne de date reçue (ex: "1998-05-14") directement en objet Luxon DateTime
    dateNaissance: vine
      .string()
      .transform((val) => DateTime.fromISO(val))
      .optional(),

    languePreferee: vine
      .string()
      .maxLength(20)
      .optional(),

    adresse: vine
      .string()
      .maxLength(500)
      .optional(),

    quartier: vine
      .string()
      .maxLength(120)
      .optional(),

    commune: vine
      .string()
      .maxLength(120)
      .optional(),

    villeId: vine
      .string()
      .uuid()
      .optional(),
  })
)

/**
 * Validator pour la connexion (session)
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(6),
  })
)