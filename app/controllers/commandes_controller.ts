import Commande from '#models/commande'
import Utilisateur from '#models/utilisateur'
import Produit from '#models/produit'
import { EscrowService } from '#services/escrow_service'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class CommandesController {
  /**
   * Mes commandes (en tant qu'acheteur ou commerçant)
   * GET /api/v1/commandes
   */
  public async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const commandes = await Commande.query()
      .where('client_id', user.id)
      .preload('etablissement')
      .preload('articles', (query) => query.preload('produit'))
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.ok(commandes)
  }

  /**
   * Passer une nouvelle commande avec déduction de stock
   * POST /api/v1/commandes
   */
  public async store({ auth, request, response }: HttpContext) {
    
const user = auth.user! as Utilisateur
    const { etablissementId, articles, adresseLivraison } = request.only([
      'etablissementId',
      'articles',
      'adresseLivraison',
    ])

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return response.badRequest({ message: 'Le panier ne peut pas être vide' })
    }

    // Calcul du total et vérification des stocks dans une transaction
    const result = await db.transaction(async (trx) => {
      let totalGlobal = 0
      const articlesAInserer = []

      for (const item of articles) {
        const produit = await Produit.find(item.produitId, { client: trx })

        if (!produit || !produit.disponible) {
          throw new Error(`Produit indisponible (ID: ${item.produitId})`)
        }

        if (produit.stock < item.quantite) {
          throw new Error(`Stock insuffisant pour ${produit.nom}`)
        }

        // Déduction du stock
        produit.stock -= item.quantite
        await produit.save()

        const prixUnitaire = produit.prix
        const sousTotal = prixUnitaire * item.quantite
        totalGlobal += sousTotal

        articlesAInserer.push({
          produitId: produit.id,
          quantite: item.quantite,
          prixUnitaire,
          sousTotal,
        })
      }

      const commande = await Commande.create(
        {
          clientId: String(user.id),
          etablissementId,
          montantTotal: totalGlobal,
          adresseLivraison,
          statut: 'EN_ATTENTE',
        },
        { client: trx }
      )

      // Attachement des articles
      for (const article of articlesAInserer) {
        await commande.related('articles').create(article, { client: trx })
      }

      return commande
    })

    return response.created(result)
  }

  /**
   * Mettre à jour le statut d'une commande (Livraison, Escrow Release, Annulation)
   * PATCH /api/v1/commandes/:id/statut
   */
  public async updateStatus({ params, request, response }: HttpContext) {
    const { statut } = request.only(['statut'])

    const commande = await Commande.query()
      .where('id', params.id)
      .preload('articles')
      .first()

    if (!commande) {
      return response.notFound({ message: 'Commande introuvable' })
    }

    // Gestion du cycle Escrow selon le changement de statut
    if (statut === 'LIVREE') {
      await EscrowService.releaseFunds(commande)
    } else if (statut === 'ANNULEE') {
      await EscrowService.refundBuyer(commande)
    } else {
      commande.statut = statut
      await commande.save()
    }

    return response.ok(commande)
  }
}