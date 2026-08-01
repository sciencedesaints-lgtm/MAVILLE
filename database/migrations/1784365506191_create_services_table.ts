import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      // Prestataire du service
      table.uuid('prestataire_id')
        .notNullable()
        .references('id')
        .inTable('utilisateurs')
        .onDelete('CASCADE')

      // Catégorie du service
      table.integer('categorie_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('categories_services')
        .onDelete('RESTRICT')

      // Ville
      table.uuid('ville_id')
        .notNullable()
        .references('id')
        .inTable('villes')
        .onDelete('RESTRICT')

      table.string('nom', 255).notNullable()

      table.string('slug', 255).notNullable().unique()

      table.text('description')

      table.decimal('prix_min', 15, 2)

      table.decimal('prix_max', 15, 2)

      table.string('devise', 10).defaultTo('USD')

      table.boolean('prix_negociable').defaultTo(true)

      table.boolean('intervention_domicile').defaultTo(true)

      table.boolean('sur_rendez_vous').defaultTo(false)

      table.boolean('urgence').defaultTo(false)

      table.boolean('disponible').defaultTo(true)

      table.boolean('visible').defaultTo(true)

      table.string('telephone', 30)

      table.string('email', 255)

      table.string('site_web', 255)

      table.string('adresse', 255)

      table.string('quartier', 120)

      table.string('commune', 120)

      table.decimal('latitude', 10, 8)

      table.decimal('longitude', 11, 8)

      table.specificType('position', 'GEOGRAPHY(POINT,4326)')

      table.decimal('note_moyenne', 3, 2).defaultTo(0)

      table.integer('nombre_avis').defaultTo(0)

      table.integer('nombre_vues').defaultTo(0)

      table.integer('ordre_affichage').defaultTo(0)

      table.timestamps(true, true)

      table.index(['prestataire_id'])
      table.index(['categorie_id'])
      table.index(['ville_id'])
      table.index(['nom'])
      table.index(['slug'])
      table.index(['disponible'])
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_services_position
        ON services
        USING GIST(position)
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}