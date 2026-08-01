import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recherches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('utilisateur_id')
        .references('id')
        .inTable('utilisateurs')
        .onDelete('SET NULL')

      table.string('type_recherche', 20).notNullable()
      // TEXTE | AUDIO | IMAGE

      table.text('texte')

      table.string('audio_url', 500)

      table.string('image_url', 500)

      table.string('scope_recherche', 30).notNullable()
      // AUTOUR_DE_MOI
      // QUARTIER
      // VILLE
      // PAYS
      // CONTINENT
      // MONDE

      table.uuid('ville_id')
        .references('id')
        .inTable('villes')
        .onDelete('SET NULL')

      table.uuid('pays_id')
        .references('id')
        .inTable('pays')
        .onDelete('SET NULL')

      table.decimal('latitude', 10, 8)

      table.decimal('longitude', 11, 8)

      table.specificType('position', 'GEOGRAPHY(POINT,4326)')

      table.integer('rayon_km')

      table.integer('nombre_resultats').defaultTo(0)

      table.integer('temps_execution_ms')

      table.timestamps(true, true)

      table.index(['utilisateur_id'])
      table.index(['type_recherche'])
      table.index(['scope_recherche'])
      table.index(['ville_id'])
      table.index(['pays_id'])
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_recherches_position
        ON recherches
        USING GIST(position)
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}