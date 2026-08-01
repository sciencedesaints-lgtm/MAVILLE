import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'livraisons'

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

      table.uuid('livreur_id')
        .references('id')
        .inTable('utilisateurs')
        .onDelete('SET NULL')

      table.string('statut', 30).defaultTo('EN_PREPARATION')

      table.timestamp('date_depart')

      table.timestamp('date_livraison')

      table.timestamps(true, true)

      table.index(['commande_id'])
      table.index(['livreur_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}