import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'commande_articles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('commande_id')
        .notNullable()
        .references('id')
        .inTable('commandes')
        .onDelete('CASCADE')

      table.uuid('produit_id')
        .notNullable()
        .references('id')
        .inTable('produits')
        .onDelete('RESTRICT')

      table.integer('quantite').notNullable()

      table.decimal('prix_unitaire', 15, 2).notNullable()

      table.decimal('montant', 15, 2).notNullable()

      table.timestamps(true, true)

      table.index(['commande_id'])
      table.index(['produit_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}