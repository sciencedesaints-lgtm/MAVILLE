import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'commandes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('client_id')
        .notNullable()
        .references('id')
        .inTable('utilisateurs')
        .onDelete('RESTRICT')

      table.uuid('etablissement_id')
        .notNullable()
        .references('id')
        .inTable('etablissements')
        .onDelete('RESTRICT')

      table.string('numero', 50).notNullable().unique()

      table.decimal('montant_total', 15, 2).notNullable()

      table.string('devise', 10).defaultTo('USD')

      table.string('statut', 30).defaultTo('EN_ATTENTE')

      table.string('mode_livraison', 30)

      table.string('mode_paiement', 30)

      table.text('adresse_livraison')

      table.decimal('latitude', 10, 8)

      table.decimal('longitude', 11, 8)

      table.specificType('position', 'GEOGRAPHY(POINT,4326)')

      table.timestamps(true, true)

      table.index(['client_id'])
      table.index(['etablissement_id'])
      table.index(['statut'])
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_commandes_position
        ON commandes
        USING GIST(position)
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}