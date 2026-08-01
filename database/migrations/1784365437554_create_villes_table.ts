import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'villes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table
        .uuid('pays_id')
        .notNullable()
        .references('id')
        .inTable('pays')
        .onDelete('CASCADE')

      table.string('nom', 150).notNullable()

      table.string('province_etat', 150)

      table.string('code_postal', 30)

      table.bigInteger('population')

      table.decimal('superficie', 12, 2)

      table.decimal('latitude', 10, 8)

      table.decimal('longitude', 11, 8)

      // Colonne PostGIS
      table.specificType('position', 'GEOGRAPHY(POINT,4326)')

      table.timestamp('created_at').defaultTo(this.now())

      table.timestamp('updated_at').defaultTo(this.now())

      table.index(['pays_id'])
      table.index(['nom'])
    })

    // Index spatial PostGIS
    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_villes_position
        ON villes
        USING GIST(position)
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}