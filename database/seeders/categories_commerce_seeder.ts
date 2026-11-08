import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // [nom, slug, icône, populaire]
    const categories: [string, string, string, boolean][] = [
      // Marchés et étals
      ['Légumes et fruits', 'legumes-fruits', '🥬', true],
      ['Poisson et fruits de mer', 'poisson', '🐟', true],
      ['Viande et volaille', 'viande-volaille', '🍖', true],
      ['Produits vivriers (manioc, farine, riz)', 'produits-vivriers', '🌾', true],
      ['Condiments et épices', 'condiments-epices', '🌶️', false],
      ['Friperie et vêtements', 'friperie-vetements', '👕', true],
      ['Chaussures et sacs', 'chaussures-sacs', '👟', false],
      ['Cosmétiques et produits de beauté', 'cosmetiques', '🧴', false],
      ['Quincaillerie et matériaux', 'quincaillerie', '🔨', false],
      ['Charbon, bois et gaz', 'charbon-bois-gaz', '🔥', false],

      // Petits commerces de quartier
      ['Kiosque alimentaire', 'kiosque-alimentaire', '🏪', true],
      ['Boutique de quartier', 'boutique-quartier', '🛒', true],
      ['Boulangerie et pâtisserie', 'boulangerie-patisserie', '🥖', false],
      ['Buvette et bar', 'buvette-bar', '🍺', false],
      ['Restaurant et gargote', 'restaurant-gargote', '🍴', true],
      ['Salon de coiffure', 'salon-coiffure', '💇', false],
      ['Pharmacie', 'pharmacie-commerce', '💊', false],

      // Cabines, télécoms et mobile money
      ['Cabine publique', 'cabine-publique', '📞', true],
      ['Vente de forfaits et crédit', 'forfaits-credit', '📶', true],
      ['Mobile Money (dépôt et retrait)', 'mobile-money', '💸', true],
      ['Cybercafé et photocopie', 'cybercafe-photocopie', '🖨️', false],
      ['Recharge et réparation de téléphones', 'recharge-telephones', '🔋', false],

      // Divers
      ['Supermarché et grande surface', 'supermarche', '🏬', false],
      ['Autre commerce', 'autre-commerce', '➕', false],
    ]

    let ordre = 1
    for (const [nom, slug, icone, populaire] of categories) {
      const existe = await db.from('categories_etablissements').where('slug', slug).first()
      if (!existe) {
        await db.table('categories_etablissements').insert({
          nom,
          slug,
          icone,
          active: true,
          ordre_affichage: ordre,
          est_populaire: populaire,
        })
      }
      ordre++
    }
  }
}