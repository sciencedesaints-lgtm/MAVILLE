import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'langues'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('code', 10).notNullable().unique()

      table.string('nom', 100).notNullable()

      table.string('native_name', 100)

      table.boolean('active').defaultTo(true)

      table.timestamp('created_at').defaultTo(this.now())

      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}