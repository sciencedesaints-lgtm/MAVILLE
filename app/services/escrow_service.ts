import Commande from '#models/commande'
import db from '@adonisjs/lucid/services/db'

export class EscrowService {
  /**
   * Bloque les fonds de la commande lors du paiement (Escrow)
   */
  public static async holdFunds(commande: Commande): Promise<void> {
    commande.statut = 'EN_PREPARATION'
    await commande.save()
  }

  /**
   * Libère les fonds au vendeur une fois la livraison confirmée
   */
  public static async releaseFunds(commande: Commande): Promise<void> {
    await db.transaction(async (trx) => {
      commande.useTransaction(trx)
      commande.statut = 'LIVREE'
      await commande.save()

      // Logique de transfert vers le portefeuille du vendeur
    })
  }

  /**
   * Rembourse l'acheteur en cas d'annulation ou de litige
   */
  public static async refundBuyer(commande: Commande): Promise<void> {
    await db.transaction(async (trx) => {
      commande.useTransaction(trx)
      commande.statut = 'ANNULEE'
      await commande.save()

      // Ré-incrémentation des stocks de produits
      if (commande.articles) {
        for (const article of commande.articles) {
          await db
            .from('produits')
            .where('id', article.produitId)
            .increment('stock', article.quantite)
        }
      }
    })
  }
}