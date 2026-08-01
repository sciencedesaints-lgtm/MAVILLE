import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'paiements'

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

      table.decimal('montant', 15, 2).notNullable()

      table.string('devise', 10)

      table.string('mode', 30)

      table.string('reference_transaction', 150)

      table.string('statut', 30).defaultTo('EN_ATTENTE')

      table.timestamps(true, true)

      table.index(['commande_id'])
      table.index(['reference_transaction'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}