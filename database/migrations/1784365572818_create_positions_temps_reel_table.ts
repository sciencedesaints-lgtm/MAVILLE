import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'positions_temps_reel'

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

      table.uuid('demande_id')
        .references('id')
        .inTable('demandes_services')
        .onDelete('SET NULL')

      table.decimal('latitude', 10, 8).notNullable()

      table.decimal('longitude', 11, 8).notNullable()

      table.specificType('position', 'GEOGRAPHY(POINT,4326)')

      table.decimal('vitesse', 8, 2)

      table.decimal('precision', 8, 2)

      table.decimal('cap', 8, 2)

      table.timestamp('date_position').defaultTo(this.now())

      table.timestamps(true, true)

      table.index(['utilisateur_id'])
      table.index(['demande_id'])
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_positions_temps_reel
        ON positions_temps_reel
        USING GIST(position)
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}