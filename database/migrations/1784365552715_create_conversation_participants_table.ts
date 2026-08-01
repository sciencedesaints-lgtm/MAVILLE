import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'conversation_participants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('conversation_id')
        .notNullable()
        .references('id')
        .inTable('conversations')
        .onDelete('CASCADE')

      table.uuid('utilisateur_id')
        .notNullable()
        .references('id')
        .inTable('utilisateurs')
        .onDelete('CASCADE')

      table.boolean('admin').defaultTo(false)

      table.timestamp('dernier_message_lu')

      table.timestamps(true, true)

      table.unique(['conversation_id', 'utilisateur_id'])

      table.index(['conversation_id'])
      table.index(['utilisateur_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}