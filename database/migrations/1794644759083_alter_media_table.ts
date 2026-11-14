import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'medias'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // nouveaute | publicite
      table.string('categorie', 20).notNullable().defaultTo('nouveaute')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('categorie')
    })
  }
}