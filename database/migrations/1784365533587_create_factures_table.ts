import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'factures'

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

      table.string('numero', 100).unique().notNullable()

      table.decimal('montant', 15, 2).notNullable()

      table.string('devise', 10)

      table.text('pdf_url')

      table.timestamps(true, true)

      table.index(['commande_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}