import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

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

      table.string('type', 50).notNullable()

      table.string('titre', 255).notNullable()

      table.text('message').notNullable()

      table.string('lien', 500)

      table.boolean('lu').defaultTo(false)

      table.timestamp('date_lecture')

      table.timestamps(true, true)

      table.index(['utilisateur_id'])
      table.index(['type'])
      table.index(['lu'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}