import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'categories_etablissements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('nom', 100).notNullable().unique()

      table.text('description')

      table.text('icone')

      table.boolean('active').defaultTo(true)

      table.timestamps(true, true)

      table.string('slug', 150).notNullable().unique()

table.integer('ordre_affichage').defaultTo(0)

table.string('couleur', 20)

table.boolean('est_populaire').defaultTo(false)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}