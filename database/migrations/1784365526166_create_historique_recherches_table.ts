import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'historique_recherche'

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

      table.uuid('recherche_id')
        .notNullable()
        .references('id')
        .inTable('recherches')
        .onDelete('CASCADE')

      table.timestamp('date_recherche').defaultTo(this.now())

      table.integer('nombre_resultats').defaultTo(0)

      table.boolean('a_donne_suite').defaultTo(false)

      table.timestamps(true, true)

      table.index(['utilisateur_id'])
      table.index(['recherche_id'])
      table.index(['date_recherche'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}