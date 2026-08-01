import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'abonnements_etablissements'

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

      table.uuid('etablissement_id')
        .notNullable()
        .references('id')
        .inTable('etablissements')
        .onDelete('CASCADE')

      table.boolean('notifications').defaultTo(true)

      table.timestamp('date_abonnement').defaultTo(this.now())

      table.timestamps(true, true)

      table.unique(['utilisateur_id', 'etablissement_id'])

      table.index(['utilisateur_id'])
      table.index(['etablissement_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}