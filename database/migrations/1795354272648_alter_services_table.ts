import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('itinerant').notNullable().defaultTo(false)
      table.timestamp('position_maj_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('itinerant')
      table.dropColumn('position_maj_at')
    })
  }
}