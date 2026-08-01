import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {

  protected tableName = 'signalements_citoyens'

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

      table.integer('categorie_id')
        .unsigned()
        .references('id')
        .inTable('categories_services')
        .onDelete('SET NULL')

      table.string('titre', 255)
        .notNullable()

      table.text('description')
        .notNullable()

      table.string('photo_url', 500)

      table.string('video_url', 500)

      table.string('audio_url', 500)

      table.decimal('latitude', 10, 8)

      table.decimal('longitude', 11, 8)

      table.specificType(
        'position',
        'GEOGRAPHY(POINT,4326)'
      )

      table.string('statut', 30)
        .defaultTo('EN_ATTENTE')
      // EN_ATTENTE
      // EN_COURS
      // RESOLU
      // REJETE

      table.string('priorite', 20)
        .defaultTo('NORMALE')
      // BASSE
      // NORMALE
      // HAUTE
      // URGENTE

      table.timestamps(true, true)

      table.index(['utilisateur_id'])
      table.index(['categorie_id'])
      table.index(['statut'])
      table.index(['priorite'])

    })

    this.defer(async (db) => {

      await db.rawQuery(`
        CREATE INDEX idx_signalements_position
        ON signalements_citoyens
        USING GIST(position)
      `)

    })

  }

  async down() {
    this.schema.dropTable(this.tableName)
  }

}