import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'abonnements_premium'

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
      // BASIC
      // PREMIUM
      // BUSINESS
      // GOLD

      table.decimal('montant', 15, 2).notNullable()

      table.string('devise', 10).defaultTo('USD')

      table.date('date_debut').notNullable()

      table.date('date_fin').notNullable()

      table.boolean('renouvellement_auto')
        .defaultTo(false)

      table.string('statut', 30)
        .defaultTo('ACTIF')
      // ACTIF
      // EXPIRE
      // SUSPENDU

      table.timestamps(true, true)

      table.index(['utilisateur_id'])
      table.index(['statut'])
      table.index(['type'])

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}