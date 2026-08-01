import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'etablissements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('proprietaire_id')
        .notNullable()
        .references('id')
        .inTable('utilisateurs')
        .onDelete('CASCADE')

      table.integer('categorie_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('categories_etablissements')
        .onDelete('RESTRICT')

      table.uuid('ville_id')
        .notNullable()
        .references('id')
        .inTable('villes')
        .onDelete('RESTRICT')

      table.string('nom', 200).notNullable()

      table.string('slug', 220).notNullable().unique()

      table.text('description')

      table.string('telephone', 30)

      table.string('email', 255)

      table.string('site_web', 255)

      table.string('adresse', 255).notNullable()

      table.string('quartier', 120)

      table.string('commune', 120)

      table.decimal('latitude', 10, 8)

      table.decimal('longitude', 11, 8)

      table.specificType('position', 'GEOGRAPHY(POINT,4326)')

      table.boolean('ouvert').defaultTo(true)

      table.boolean('verifie').defaultTo(false)

      table.boolean('livraison').defaultTo(false)

      table.boolean('retrait_sur_place').defaultTo(true)

      table.boolean('visible').defaultTo(true)

      table.decimal('note_moyenne', 3, 2).defaultTo(0)

      table.integer('nombre_avis').defaultTo(0)

      table.timestamps(true, true)

      table.index(['proprietaire_id'])
      table.index(['categorie_id'])
      table.index(['ville_id'])
      table.index(['nom'])
      table.index(['slug'])
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_etablissements_position
        ON etablissements
        USING GIST(position)
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}