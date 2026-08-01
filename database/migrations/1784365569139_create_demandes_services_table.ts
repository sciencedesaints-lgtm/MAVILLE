import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'demandes_services'

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

      table.integer('categorie_service_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('categories_services')
        .onDelete('RESTRICT')

      table.text('description')

      table.string('type_recherche', 20).defaultTo('TEXTE')
      // TEXTE | AUDIO | IMAGE

      table.string('audio_url', 500)

      table.string('image_url', 500)

      table.integer('temps_max_minutes').defaultTo(30)

      table.boolean('urgence').defaultTo(false)

      table.string('statut', 30).defaultTo('EN_ATTENTE')
      // EN_ATTENTE | EN_COURS | TERMINEE | ANNULEE | EXPIREE

      table.decimal('latitude', 10, 8)

      table.decimal('longitude', 11, 8)

      table.specificType('position', 'GEOGRAPHY(POINT,4326)')

      table.timestamps(true, true)

      table.index(['utilisateur_id'])
      table.index(['categorie_service_id'])
      table.index(['statut'])
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_demandes_services_position
        ON demandes_services
        USING GIST(position)
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}