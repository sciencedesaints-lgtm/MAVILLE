import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'escrow_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('paiement_id')
        .notNullable()
        .references('id')
        .inTable('paiements')
        .onDelete('CASCADE')

      table.decimal('montant', 15, 2).notNullable()

      table.string('statut', 30).defaultTo('BLOQUE')

      table.timestamp('date_liberation')

      table.timestamps(true, true)

      table.index(['paiement_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}