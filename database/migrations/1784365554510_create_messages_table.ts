import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

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

      table.uuid('expediteur_id')
        .notNullable()
        .references('id')
        .inTable('utilisateurs')
        .onDelete('CASCADE')

      table.uuid('media_id')
        .references('id')
        .inTable('medias')
        .onDelete('SET NULL')

      table.text('contenu')

      table.boolean('lu').defaultTo(false)

      table.boolean('modifie').defaultTo(false)

      table.boolean('supprime').defaultTo(false)

      table.timestamps(true, true)

      table.index(['conversation_id'])
      table.index(['expediteur_id'])
      table.index(['media_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}