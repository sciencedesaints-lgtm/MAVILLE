import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'images_produits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('produit_id')
        .notNullable()
        .references('id')
        .inTable('produits')
        .onDelete('CASCADE')

      table.string('url', 500).notNullable()

      table.string('miniature', 500)

      table.boolean('principale').defaultTo(false)

      table.integer('ordre').defaultTo(0)

      table.string('texte_alternatif', 255)

      table.timestamps(true, true)

      table.index(['produit_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}