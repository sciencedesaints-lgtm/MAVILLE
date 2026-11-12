import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'utilisateurs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('profession', 150).nullable()
      table.string('qualification', 255).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('profession')
      table.dropColumn('qualification')
    })
  }
}