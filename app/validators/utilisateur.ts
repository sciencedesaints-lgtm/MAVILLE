import vine from '@vinejs/vine'

/**
 * 1. Validator pour le formulaire "Personnel"
 */
export const personnelSignupValidator = vine.compile(
  vine.object({
    type_compte: vine.string().in(['personnel']),
    nom: vine.string().trim().minLength(2).maxLength(100),
    prenom: vine.string().trim().minLength(2).maxLength(100),
    contact: vine
      .string()
      .trim()
      .minLength(3)
      .maxLength(255)
      .unique(async (db, value) => {
        // Email ou téléphone : on vérifie la bonne colonne
        const colonne = value.includes('@') ? 'email' : 'telephone'
        const row = await db.from('utilisateurs').where(colonne, value).first()
        return !row
      }),
    pays: vine.string().trim().minLength(2),
    ville: vine.string().trim().minLength(2),
    password: vine.string().minLength(8).maxLength(100),
  })
)

/**
 * 2. Validator pour le formulaire "Entreprise / Agence"
 */
export const entrepriseSignupValidator = vine.compile(
  vine.object({
    type_compte: vine.string().in(['entreprise_agence']),
    type_structure: vine.string().trim(),
    nom_entreprise: vine.string().trim().minLength(2).maxLength(150),
    domaine: vine.string().trim().minLength(2).maxLength(100),
    pays: vine.string().trim().minLength(2),
    ville: vine.string().trim().minLength(2),
    commune: vine.string().trim().minLength(2),
    avenue: vine.string().trim().minLength(2),
    numero: vine.string().trim().optional(),
    indicatif_pays: vine.string().trim(),
    telephone: vine.string().trim().minLength(5).maxLength(30),
    email: vine
      .string()
      .trim()
      .email()
      .maxLength(255)
      .unique(async (db, value) => {
        const row = await db.from('utilisateurs').where('email', value).first()
        return !row
      }),
    password: vine.string().minLength(8).maxLength(100),
  })
)

/**
 * 3. Validator pour le formulaire "Administration publique"
 */
export const administrationSignupValidator = vine.compile(
  vine.object({
    type_compte: vine.string().in(['administration_publique']),
    type_institution: vine.string().trim(),
    nom_institution: vine.string().trim().minLength(2).maxLength(150),
    tutelle: vine.string().trim().optional(),
    pays: vine.string().trim().minLength(2),
    ville: vine.string().trim().minLength(2),
    commune: vine.string().trim().minLength(2),
    avenue: vine.string().trim().minLength(2),
    numero: vine.string().trim().optional(),
    indicatif_pays: vine.string().trim(),
    telephone: vine.string().trim().minLength(5).maxLength(30),
    email: vine
      .string()
      .trim()
      .email()
      .maxLength(255)
      .unique(async (db, value) => {
        const row = await db.from('utilisateurs').where('email', value).first()
        return !row
      }),
    password: vine.string().minLength(8).maxLength(100),
  })
)

/**
 * Validator pour la connexion (inchangé)
 */
export const loginValidator = vine.compile(
  vine.object({
    login: vine.string().trim().minLength(3).maxLength(255),
    password: vine.string().minLength(6).maxLength(100),
  })
)