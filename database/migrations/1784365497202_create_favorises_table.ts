import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'favoris'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('utilisateur_id')
        .notNullable()
        .references('id')
        .inTable('utilisateurs')
        .onDelete('CASCADE')

      table.string('type_element', 30).notNullable()

      table.uuid('element_id').notNullable()

      table.timestamps(true, true)

      table.index(['utilisateur_id'])
      table.index(['type_element'])
      table.index(['element_id'])

      table.unique([
        'utilisateur_id',
        'type_element',
        'element_id'
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}