import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'conversations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.string('type', 20).notNullable().defaultTo('PRIVEE')
      // PRIVEE | GROUPE | SUPPORT

      table.string('nom', 255)

      table.text('description')

      table.uuid('createur_id')
        .notNullable()
        .references('id')
        .inTable('utilisateurs')
        .onDelete('CASCADE')

      table.boolean('active').defaultTo(true)

      table.timestamps(true, true)

      table.index(['createur_id'])
      table.index(['type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}