import Produit from '#models/produit'
import {
  createProduitValidator,
  updateProduitValidator,
  produitFilterValidator,
} from '#validators/produit'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProduitsController {
  /**
   * Liste et filtre les produits
   * GET /api/produits
   */
  public async index({ request, response }: HttpContext) {
    const filters = await request.validateUsing(produitFilterValidator)
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const query = Produit.query().preload('categorie').preload('etablissement')

    if (filters.categorieId) {
      query.where('categorieId', filters.categorieId)
    }

    if (filters.etablissementId) {
      query.where('etablissementId', filters.etablissementId)
    }

    if (filters.agricole !== undefined) {
      query.where('agricole', filters.agricole)
    }

    if (filters.prixMin) {
      query.where('prix', '>=', filters.prixMin)
    }

    if (filters.prixMax) {
      query.where('prix', '<=', filters.prixMax)
    }

    if (filters.search) {
      query.where('nom', 'ILIAS', `%${filters.search}%`)
    }

    const produits = await query.paginate(page, limit)
    return response.ok(produits)
  }

  /**
   * Détails d'un produit
   * GET /api/produits/:id
   */
  public async show({ params, response }: HttpContext) {
    const produit = await Produit.query()
      .where('id', params.id)
      .preload('categorie')
      .preload('etablissement')
      .first()

    if (!produit) {
      return response.notFound({ message: 'Produit introuvable' })
    }

    return response.ok(produit)
  }

  /**
   * Ajouter un produit
   * POST /api/produits
   */
  public async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProduitValidator)

    const { enStock, ...produitData } = payload

    const produit = await Produit.create({
      ...produitData,
      stock: payload.stock ?? (enStock ? 1 : 0),
      devise: payload.devise ?? 'CDF',
    })

    return response.created(produit)
  }

  /**
   * Mettre à jour un produit
   * PUT /api/produits/:id
   */
  public async update({ params, request, response }: HttpContext) {
    const produit = await Produit.find(params.id)

    if (!produit) {
      return response.notFound({ message: 'Produit introuvable' })
    }

    const payload = await request.validateUsing(updateProduitValidator)
    const { enStock, ...produitData } = payload

    produit.merge({
      ...produitData,
      ...(payload.stock !== undefined ? { stock: payload.stock } : {}),
    })
    await produit.save()

    return response.ok(produit)
  }
}