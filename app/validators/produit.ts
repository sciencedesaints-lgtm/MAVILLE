import vine from '@vinejs/vine'

/**
 * Création d'un produit (catalogue / agricole)
 */
export const createProduitValidator = vine.compile(
  vine.object({
    etablissementId: vine.string().uuid(),
    categorieId: vine.number(),
    nom: vine.string().trim().maxLength(150),
    description: vine.string().trim().optional(),
    prix: vine.number().min(0),
    devise: vine.string().maxLength(10).fixedLength(3).optional(),
    stock: vine.number().min(0).optional(),
    uniteMesure: vine.string().maxLength(20).optional(),
    enStock: vine.boolean().optional(),
    agricole: vine.boolean().optional(),
  })
)

/**
 * Modification d'un produit
 */
export const updateProduitValidator = vine.compile(
  vine.object({
    categorieId: vine.number().optional(),
    nom: vine.string().trim().maxLength(150).optional(),
    description: vine.string().trim().optional(),
    prix: vine.number().min(0).optional(),
    devise: vine.string().maxLength(10).optional(),
    stock: vine.number().min(0).optional(),
    uniteMesure: vine.string().maxLength(20).optional(),
    enStock: vine.boolean().optional(),
    agricole: vine.boolean().optional(),
  })
)

/**
 * Recherche & Filtrage des produits
 */
export const produitFilterValidator = vine.compile(
  vine.object({
    categorieId: vine.number().optional(),
    etablissementId: vine.string().uuid().optional(),
    prixMin: vine.number().min(0).optional(),
    prixMax: vine.number().min(0).optional(),
    agricole: vine.boolean().optional(),
    search: vine.string().trim().optional(),
  })
)